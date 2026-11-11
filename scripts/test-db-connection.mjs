import postgres from "postgres";

const conn1 = "postgresql://postgres.tppstfufdoidztaipobg:Happiwrapz2026!DbSecret@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const conn2 = "postgresql://postgres:Happiwrapz2026!DbSecret@db.tppstfufdoidztaipobg.supabase.co:5432/postgres";
const conn3 = "postgresql://postgres.tppstfufdoidztaipobg:Happiwrapz2026!DbSecret@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

async function test(name, url, isPooler = false) {
  console.log(`Testing ${name}...`);
  const sql = postgres(url, { ssl: "require", connect_timeout: 8, prepare: !isPooler });
  try {
    const res = await sql`SELECT 1 as test`;
    console.log(`✅ ${name} succeeded!`, res);
  } catch (err) {
    console.log(`❌ ${name} failed:`, err.message);
  } finally {
    await sql.end();
  }
}

async function run() {
  await test("Pooler (Transaction Mode 6543)", conn1, true);
  await test("Direct Connection (5432)", conn2, false);
  await test("Pooler (Session Mode 5432)", conn3, true);
}

run();
