import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import { StringDecoder } from "node:string_decoder";
import postgres from "postgres";

function loadLocalEnvironment() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || match[1] in process.env) continue;

    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function ask(question) {
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  return prompt.question(question).finally(() => prompt.close());
}

function askHidden(question) {
  const input = process.stdin;
  if (!input.isTTY || typeof input.setRawMode !== "function") {
    return Promise.reject(new Error("Run this command in an interactive terminal."));
  }

  return new Promise((resolve, reject) => {
    const decoder = new StringDecoder("utf8");
    let value = "";
    process.stdout.write(question);

    const finish = (error) => {
      input.off("data", onData);
      input.setRawMode(false);
      input.pause();
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };

    const onData = (chunk) => {
      for (const character of decoder.write(chunk)) {
        if (character === "\u0003" || character === "\u0004") {
          finish(new Error("Password entry cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish();
          return;
        }
        if (character === "\u007f" || character === "\b") {
          value = Array.from(value).slice(0, -1).join("");
        } else if (character >= " ") {
          value += character;
        }
      }
    };

    input.setRawMode(true);
    input.resume();
    input.on("data", onData);
  });
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

async function main() {
  loadLocalEnvironment();

  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!connectionString || !connectionString.startsWith("postgres")) {
    throw new Error("Set DATABASE_URL or DIRECT_URL in .env.local before running this command.");
  }

  const email = (await ask("Admin account email: ")).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid account email.");
  }

  const sql = postgres(connectionString, {
    ssl: "require",
    max: 1,
    connect_timeout: 10,
    prepare: false,
  });

  try {
    const accounts = await sql`
      SELECT id, email, name, role
      FROM users
      WHERE lower(email) = ${email}
      LIMIT 1
    `;
    const account = accounts[0];
    if (!account || !["owner", "admin", "super_admin"].includes(account.role)) {
      throw new Error("No matching owner/admin account was found in the connected database.");
    }

    console.log(`Account selected: ${account.email} (${account.role})`);
    const password = await askHidden("New password (at least 12 characters; input hidden): ");
    const confirmation = await askHidden("Confirm new password: ");
    if (Array.from(password).length < 12) {
      throw new Error("Use a password with at least 12 characters.");
    }
    if (password !== confirmation) {
      throw new Error("The passwords did not match.");
    }

    const confirmationWord = await ask('Type RESET to update this account: ');
    if (confirmationWord.trim() !== "RESET") {
      throw new Error("Password reset cancelled.");
    }

    const passwordHash = hashPassword(password);
    const updated = await sql.begin(async (transaction) => {
      await transaction`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`;
      await transaction`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMPTZ`;
      await transaction`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_set_by TEXT`;
      return transaction`
        UPDATE users
        SET password_hash = ${passwordHash},
            password_updated_at = NOW(),
            password_set_by = 'CLI account recovery'
        WHERE id = ${account.id}
          AND role IN ('owner', 'admin', 'super_admin')
        RETURNING id
      `;
    });

    if (updated.length !== 1) {
      throw new Error("The admin account changed before the reset completed; no password was updated.");
    }
    console.log("Admin password updated. Sign in with the new password.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Admin password reset failed.");
  process.exitCode = 1;
});
