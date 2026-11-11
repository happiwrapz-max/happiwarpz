import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Configure Cloudinary with user credentials
cloudinary.config({
  cloud_name: "w8fw2mbb",
  api_key: "619559161937966",
  api_secret: "SmhljsDRrHBL8PE6BP1scfZ_wIo",
  secure: true,
});

console.log("========================================================");
console.log("    HAPPIWRAPZ - CLOUDINARY BULK CLOUD MIGRATION        ");
console.log("========================================================");
console.log("Cloud Name:", "w8fw2mbb");

// Track url mappings
const urlMap = new Map();

async function uploadLocalFile(relPath) {
  const cleanRel = relPath.startsWith("/") ? relPath.slice(1) : relPath;
  const fullPath = path.join(projectRoot, "public", cleanRel);

  if (!fs.existsSync(fullPath)) {
    console.warn(`[SKIP] Local file not found: ${fullPath}`);
    return null;
  }

  const baseName = path.basename(cleanRel, path.extname(cleanRel));
  const subFolder = cleanRel.includes("products") ? "products" : "assets";
  const publicId = `happiwrapz/${subFolder}/${baseName}`;

  try {
    console.log(`Uploading ${cleanRel} -> Cloudinary (${publicId})...`);
    const result = await cloudinary.uploader.upload(fullPath, {
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
    });

    console.log(`  ✔ Uploaded: ${result.secure_url}`);
    urlMap.set(relPath, result.secure_url);
    urlMap.set(`/${cleanRel}`, result.secure_url);
    return result.secure_url;
  } catch (err) {
    console.error(`  ✖ Failed uploading ${cleanRel}:`, err.message);
    return null;
  }
}

async function run() {
  // Test connection
  try {
    const ping = await cloudinary.api.ping();
    console.log("Cloudinary API Connected Successfully! Status:", ping.status);
  } catch (err) {
    console.error("FATAL: Could not connect to Cloudinary:", err.message);
    process.exit(1);
  }

  // 1. Collect all local image files in public/images
  const publicImagesDir = path.join(projectRoot, "public", "images");
  function collectImages(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        results.push(...collectImages(full));
      } else if (/\.(jpg|jpeg|png|webp|svg)$/i.test(item.name)) {
        const rel = path.relative(path.join(projectRoot, "public"), full).replace(/\\/g, "/");
        results.push(`/${rel}`);
      }
    }
    return results;
  }

  const allImages = collectImages(publicImagesDir);
  console.log(`Found ${allImages.length} image files to upload to Cloudinary.`);

  // Upload all images
  for (const imgPath of allImages) {
    await uploadLocalFile(imgPath);
  }

  console.log("\n--- Updating .data/db.json to store Cloudinary Cloud URLs only ---");
  const dbPath = path.join(projectRoot, ".data", "db.json");
  if (fs.existsSync(dbPath)) {
    const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

    // Update Products
    let productUpdates = 0;
    if (Array.isArray(db.products)) {
      db.products.forEach((p) => {
        if (p.image && urlMap.has(p.image)) {
          p.image = urlMap.get(p.image);
          productUpdates++;
        }
        if (Array.isArray(p.images)) {
          p.images = p.images.map((img) => {
            if (urlMap.has(img)) {
              productUpdates++;
              return urlMap.get(img);
            }
            return img;
          });
        }
      });
    }

    // Update Categories
    if (Array.isArray(db.categories)) {
      db.categories.forEach((c) => {
        if (c.image && urlMap.has(c.image)) {
          c.image = urlMap.get(c.image);
        }
      });
    }

    // Update Occasions
    if (Array.isArray(db.occasions)) {
      db.occasions.forEach((o) => {
        if (o.bannerImage && urlMap.has(o.bannerImage)) {
          o.bannerImage = urlMap.get(o.bannerImage);
        }
      });
    }

    // Update Settings
    if (db.settings) {
      if (db.settings.heroImage && urlMap.has(db.settings.heroImage)) {
        db.settings.heroImage = urlMap.get(db.settings.heroImage);
      }
    }

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
    console.log(`✔ db.json successfully updated! ${productUpdates} product image fields transformed to Cloudinary URLs.`);
  }

  // Generate a URL map file for reference
  const mapFile = path.join(projectRoot, "scripts", "cloudinary-url-map.json");
  const obj = Object.fromEntries(urlMap);
  fs.writeFileSync(mapFile, JSON.stringify(obj, null, 2), "utf8");
  console.log(`✔ URL mapping saved to ${mapFile}`);

  console.log("\n========================================================");
  console.log("   ALL IMAGES STORED IN CLOUDINARY CLOUD SPACE ONLY     ");
  console.log("========================================================");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

