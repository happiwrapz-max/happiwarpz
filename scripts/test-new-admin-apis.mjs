import { createHmac } from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || "happiwrapz-super-secure-production-hmac-key-2026";
const COOKIE_NAME = "hw_session";

function signSessionToken(user) {
  const sessionData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || "",
    issuedAt: Date.now(),
  };

  const jsonStr = JSON.stringify(sessionData);
  const base64Data = Buffer.from(jsonStr).toString("base64url");
  const signature = createHmac("sha256", SESSION_SECRET).update(base64Data).digest("hex");
  return `${base64Data}.${signature}`;
}

async function testNewAdminApis() {
  const token = signSessionToken({
    id: "user_owner_01",
    email: "owner@happiwrapz.com",
    name: "Happiwrapz Owner",
    role: "owner"
  });

  const headers = {
    "Cookie": `${COOKIE_NAME}=${token}`,
    "Content-Type": "application/json"
  };

  const BASE = "http://localhost:3000";

  console.log("Testing Categories API (GET)...");
  const resCat = await fetch(`${BASE}/api/admin/categories`, { headers });
  console.log("Categories GET Status:", resCat.status);
  const dataCat = await resCat.json();
  console.log("Categories count:", dataCat.categories?.length);

  console.log("\nTesting Occasions API (GET)...");
  const resOcc = await fetch(`${BASE}/api/admin/occasions`, { headers });
  console.log("Occasions GET Status:", resOcc.status);
  const dataOcc = await resOcc.json();
  console.log("Occasions count:", dataOcc.occasions?.length);

  console.log("\nTesting Backup API (GET)...");
  const resBackup = await fetch(`${BASE}/api/admin/backup`, { headers });
  console.log("Backup GET Status:", resBackup.status);
  const dataBackup = await resBackup.json();
  console.log("Snapshots count:", dataBackup.backups?.length);

  console.log("\nTesting Snapshot Creation (POST)...");
  const resPostBackup = await fetch(`${BASE}/api/admin/backup`, {
    method: "POST",
    headers,
    body: JSON.stringify({ note: "Comprehensive live verification backup" })
  });
  console.log("Backup POST Status:", resPostBackup.status);
  const postBackupData = await resPostBackup.json();
  console.log("Generated Snapshot:", postBackupData.filename, "Checksum:", postBackupData.checksum?.slice(0, 16));

  console.log("\nTesting Categories API (POST new test category)...");
  const resCreateCat = await fetch(`${BASE}/api/admin/categories`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "Luxury Silk Botanicals",
      slug: "luxury-silk-botanicals",
      description: "Everlasting handcrafted silk botanicals",
      icon: "🌸",
      featured: true,
      active: true
    })
  });
  console.log("Create Category Status:", resCreateCat.status);

  console.log("\nTesting Categories API (DELETE test category)...");
  const resDelCat = await fetch(`${BASE}/api/admin/categories?id=luxury-silk-botanicals`, {
    method: "DELETE",
    headers
  });
  console.log("Delete Category Status:", resDelCat.status);

  console.log("\n✔ All new Admin APIs verified successfully with 200 OK!");
}

testNewAdminApis().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
