import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: 'https://sharing-cheetah-87307.upstash.io',
  token: 'gQAAAAAAAVULAAIgcDJkZmE2Y2JhNDRmYzU0ZDBlODk5YmQ0OTk5MjNmODg2ZA',
});

async function main() {
  console.log("Connecting to live Upstash Redis instance...");
  
  // Set test key
  const setResult = await redis.set("foo", "bar");
  console.log("Set 'foo' result:", setResult);

  // Get test key
  const getResult = await redis.get("foo");
  console.log("Get 'foo' value:", getResult);

  // Test JSON serialization & TTL
  await redis.set("happiwrapz:test:atelier", { studio: "Happiwrapz", city: "Coimbatore" }, { ex: 60 });
  const objectVal = await redis.get("happiwrapz:test:atelier");
  console.log("Get object value:", objectVal);

  // Test scan / keys
  const keys = await redis.keys("happiwrapz:test:*");
  console.log("Matching keys:", keys);

  // Clean up test keys
  await redis.del("foo", "happiwrapz:test:atelier");
  console.log("Live Upstash test passed successfully!");
}

main().catch(err => {
  console.error("Upstash Error:", err);
  process.exit(1);
});

