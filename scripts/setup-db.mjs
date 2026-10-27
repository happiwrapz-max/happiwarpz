import fs from "fs";
import path from "path";
import postgres from "postgres";

// Load .env.local manually if not in Next.js environment
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

console.log("=================================================");
console.log("  HAPPIWRAPZ DATABASE CONNECTION INITIALIZER");
console.log("=================================================");

if (!connectionString) {
  console.error("❌ Error: No DATABASE_URL or DIRECT_URL found in .env.local");
  process.exit(1);
}

if (connectionString.includes("[YOUR-PASSWORD]") || connectionString.includes("your-password")) {
  console.log("⚠️  Notice: Connection string still contains placeholder '[YOUR-PASSWORD]'.");
  console.log("    To connect directly to live Supabase Postgres, replace [YOUR-PASSWORD]");
  console.log("    in .env.local with your Supabase database password.");
  console.log("");
  console.log("    Target Host: aws-0-ap-south-1.pooler.supabase.com:6543");
  console.log("    Project: tppstfufdoidztaipobg");
  console.log("=================================================");
  process.exit(0);
}

console.log("Connecting to PostgreSQL...");
const sql = postgres(connectionString, {
  ssl: "require",
  max: 5,
  connect_timeout: 10,
  prepare: false, // Required for Supabase pgbouncer transaction pooler
});

async function run() {
  try {
    const ping = await sql`SELECT NOW() as now, current_database() as db_name, version()`;
    console.log(`✅ Connected successfully!`);
    console.log(`   Database: ${ping[0].db_name}`);
    console.log(`   Time: ${ping[0].now}`);

    console.log("Creating database tables and indexes if not present...");
    const schemaSql = fs.readFileSync(path.join(process.cwd(), "src/lib/supabase/schema.sql"), "utf-8");
    await sql.unsafe(schemaSql);
    console.log("✅ All tables created / verified!");

    // Check products
    const prodCount = await sql`SELECT COUNT(*)::int as count FROM products`;
    console.log(`   Products in DB: ${prodCount[0].count}`);

    if (prodCount[0].count === 0) {
      console.log("Seeding initial catalog (preserving image paths, ZERO copying)...");
      const dbJsonPath = path.join(process.cwd(), ".data", "db.json");
      if (fs.existsSync(dbJsonPath)) {
        const localDb = JSON.parse(fs.readFileSync(dbJsonPath, "utf-8"));
        for (const p of localDb.products || []) {
          await sql`
            INSERT INTO products (
              id, slug, name, category, description, price, images,
              in_stock, featured, options, stock_quantity, low_stock_threshold,
              sku, care_instructions, lead_time_days, metadata
            ) VALUES (
              ${p.id}, ${p.slug}, ${p.name}, ${p.category}, ${p.description}, ${p.price},
              ${JSON.stringify(p.images || [])}, ${p.inStock ?? true}, ${p.featured ?? false},
              ${JSON.stringify(p.options || [])}, ${p.stockQuantity ?? 50}, ${p.lowStockThreshold ?? 10},
              ${p.sku || null}, ${p.careInstructions || null}, ${p.leadTimeDays || 1},
              ${JSON.stringify(p.metadata || {})}
            ) ON CONFLICT (id) DO NOTHING
          `;
        }
        console.log(`✅ Seeded ${localDb.products?.length || 0} products into Postgres without copying images!`);
      }
    }

    console.log("=================================================");
    console.log("  DATABASE SETUP COMPLETE AND FULLY CONNECTED");
    console.log("=================================================");
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
  } finally {
    await sql.end();
  }
}

run();
