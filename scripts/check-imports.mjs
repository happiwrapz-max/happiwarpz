import fs from "fs";
import path from "path";

function checkCase(filePath) {
  const parts = filePath.split(path.sep).filter(Boolean);
  let current = path.parse(filePath).root || "";
  for (const part of parts) {
    if (!current) {
      current = part + path.sep;
      continue;
    }
    const entries = fs.readdirSync(current);
    if (!entries.includes(part)) {
      const match = entries.find((e) => e.toLowerCase() === part.toLowerCase());
      if (match) {
        return { error: `Case mismatch: expected "${match}", got "${part}" in ${current}` };
      } else {
        return { error: `Missing "${part}" in ${current}` };
      }
    }
    current = path.join(current, part);
  }
  return { ok: true };
}

function scanDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (f.name !== "node_modules" && f.name !== ".next" && f.name !== ".git") {
        scanDir(full);
      }
    } else if (f.name.endsWith(".ts") || f.name.endsWith(".tsx")) {
      const content = fs.readFileSync(full, "utf-8");
      const regex = /(?:from|import)\s+["'](@\/[^"']+)["']/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const imp = match[1];
        const rel = imp.replace(/^@\//, "src/");
        const candidates = [
          path.join(process.cwd(), rel),
          path.join(process.cwd(), rel + ".ts"),
          path.join(process.cwd(), rel + ".tsx"),
          path.join(process.cwd(), rel, "index.ts"),
          path.join(process.cwd(), rel, "index.tsx"),
        ];
        const found = candidates.find((c) => fs.existsSync(c));
        if (!found) {
          console.error(`[ERROR] Missing import in ${full}: ${imp}`);
        } else {
          const res = checkCase(found);
          if (res.error) {
            console.error(`[CASE MISMATCH] In ${full} importing ${imp}: ${res.error}`);
          }
        }
      }
    }
  }
}

scanDir(path.join(process.cwd(), "src"));
console.log("Import verification complete.");
