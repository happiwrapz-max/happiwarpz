import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'w8fw2mbb',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function main() {
  console.log('Testing Cloudinary Connection...');
  console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
  try {
    const ping = await cloudinary.api.ping();
    console.log('Cloudinary Ping Result:', ping);
    const usage = await cloudinary.api.usage();
    console.log('Cloudinary Usage:', {
      plan: usage.plan,
      credits: usage.credits,
      transformations: usage.transformations,
      objects: usage.objects,
      bandwidth: usage.bandwidth,
      storage: usage.storage,
    });
  } catch (err) {
    console.error('Cloudinary Error:', err.message);
  }
}

main();
