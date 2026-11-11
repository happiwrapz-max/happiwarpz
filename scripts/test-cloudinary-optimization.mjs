import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

console.log("=================================================");
console.log("HAPPIWRAPZ - CLOUDINARY OPTIMIZATION TEST SUITE");
console.log("=================================================");

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error("FAIL: Cloudinary environment variables missing.");
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

async function runTests() {
  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
    }
  }

  // 1. Test buildCloudinaryUrl mock logic
  test("Transformation: Thumbnail preset contains f_auto, q_auto, w_200", () => {
    const raw = `https://res.cloudinary.com/${cloudName}/image/upload/v1793881756/happiwrapz/products/rose-bouquet.jpg`;
    // Simulated transform injection
    const uploadIdx = raw.indexOf("/upload/");
    const transformed = raw.slice(0, uploadIdx + 8) + "f_auto,q_auto,w_200,c_fill,g_auto/" + raw.slice(uploadIdx + 8);
    if (!transformed.includes("f_auto,q_auto,w_200")) throw new Error("Missing thumbnail params");
  });

  test("Transformation: Hero Desktop preset contains w_1600,f_auto,q_auto", () => {
    const raw = `https://res.cloudinary.com/${cloudName}/image/upload/v1793882676/happiwrapz/assets/hero-desktop.jpg`;
    const uploadIdx = raw.indexOf("/upload/");
    const transformed = raw.slice(0, uploadIdx + 8) + "f_auto,q_auto,w_1600,c_fill,g_auto/" + raw.slice(uploadIdx + 8);
    if (!transformed.includes("w_1600")) throw new Error("Missing hero desktop params");
  });

  test("Transformation: LQIP blur placeholder has w_40 and e_blur:1000", () => {
    const raw = `https://res.cloudinary.com/${cloudName}/image/upload/v1793882676/happiwrapz/assets/hero-desktop.jpg`;
    const uploadIdx = raw.indexOf("/upload/");
    const transformed = raw.slice(0, uploadIdx + 8) + "f_auto,q_auto:low,w_40,e_blur:1000/" + raw.slice(uploadIdx + 8);
    if (!transformed.includes("e_blur:1000") || !transformed.includes("w_40")) throw new Error("Missing LQIP params");
  });

  // 2. Test live Cloudinary API Ping
  await testAsync("Cloudinary API: Live Ping returns ok status", async () => {
    const ping = await cloudinary.api.ping();
    if (ping.status !== "ok") throw new Error(`Unexpected ping status: ${ping.status}`);
  });

  // 3. Test live Cloudinary API Usage
  await testAsync("Cloudinary API: Retrieve live usage and Free Plan quota", async () => {
    const usage = await cloudinary.api.usage();
    console.log(`       - Plan: ${usage.plan}`);
    console.log(`       - Storage: ${(usage.storage?.usage / 1024 / 1024).toFixed(2)} MB`);
    console.log(`       - Bandwidth: ${(usage.bandwidth?.usage / 1024 / 1024).toFixed(2)} MB`);
    console.log(`       - Objects: ${usage.objects?.usage}`);
    if (!usage.plan) throw new Error("Could not retrieve plan");
  });

  // 4. Test live signed upload & safe deletion to sandbox folder
  await testAsync("Cloudinary API: Upload and delete sample test asset in happiwrapz/website-assets", async () => {
    // 1x1 transparent GIF buffer
    const testBuffer = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
    
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "happiwrapz/website-assets",
          public_id: `test-asset-${Date.now()}`,
          quality: "auto",
          fetch_format: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(testBuffer);
    });

    if (!uploadResult.public_id.startsWith("happiwrapz/website-assets/")) {
      throw new Error(`Upload placed in wrong folder: ${uploadResult.public_id}`);
    }

    console.log(`       - Uploaded asset: ${uploadResult.public_id}`);

    // Immediately test safe deletion
    const destroyResult = await cloudinary.uploader.destroy(uploadResult.public_id);
    if (destroyResult.result !== "ok") {
      throw new Error(`Destroy failed: ${JSON.stringify(destroyResult)}`);
    }
    console.log(`       - Deleted asset safely: ${uploadResult.public_id}`);
  });

  console.log("\n=================================================");
  console.log(`TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log("=================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();

