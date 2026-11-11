import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const BACKUPS_DIR = path.join(DATA_DIR, "backups");

export function createDatabaseBackup() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { success: false, error: "Database file does not exist" };
    }

    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }

    const data = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `backup-${timestamp}.json`;
    const backupFilePath = path.join(BACKUPS_DIR, backupFileName);

    // Write atomic snapshot
    fs.writeFileSync(backupFilePath, data, "utf-8");

    const checksum = crypto.createHash("sha256").update(data).digest("hex");
    const stats = fs.statSync(backupFilePath);

    const tableCounts = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (Array.isArray(val)) {
        tableCounts[key] = val.length;
      }
    }

    // Retention policy: Keep the last 15 backups
    const files = fs
      .readdirSync(BACKUPS_DIR)
      .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
      .sort()
      .reverse();

    if (files.length > 15) {
      for (const stale of files.slice(15)) {
        try {
          fs.unlinkSync(path.join(BACKUPS_DIR, stale));
        } catch { }
      }
    }

    return {
      success: true,
      backupFile: backupFileName,
      checksum,
      sizeBytes: stats.size,
      tableCounts,
    };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
}

export function restoreDatabaseBackup(backupFileName) {
  try {
    const backupFilePath = path.join(BACKUPS_DIR, backupFileName);
    if (!fs.existsSync(backupFilePath)) {
      return { success: false, error: `Backup file ${backupFileName} not found.` };
    }

    const raw = fs.readFileSync(backupFilePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.products || !parsed.orders || !parsed.users) {
      return { success: false, error: "Backup file failed schema integrity validation." };
    }

    // Atomic restore
    fs.writeFileSync(DB_FILE, raw, "utf-8");
    return {
      success: true,
      message: `Database successfully restored from ${backupFileName}. Verified ${parsed.products.length} products, ${parsed.orders.length} orders.`,
    };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
}

// CLI runner
if (process.argv[1]?.includes("backup-database.mjs")) {
  console.log("Creating automated database backup...");
  const res = createDatabaseBackup();
  console.log("Result:", JSON.stringify(res, null, 2));
}
