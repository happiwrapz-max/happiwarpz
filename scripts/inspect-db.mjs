import fs from "fs";

const raw = fs.readFileSync("d:/New folder/happiwrapz/.data/db.json", "utf-8");
const db = JSON.parse(raw);

console.log("=== HAPPIWRAPZ DATABASE TABLE METRICS ===");
for (const [key, value] of Object.entries(db)) {
  if (Array.isArray(value)) {
    console.log(`- ${key}: ${value.length} records`);
  } else if (typeof value === "object" && value !== null) {
    console.log(`- ${key}: object with ${Object.keys(value).length} keys`);
  } else {
    console.log(`- ${key}: ${typeof value}`);
  }
}

