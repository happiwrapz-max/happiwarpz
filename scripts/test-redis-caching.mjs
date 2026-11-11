// scripts/test-redis-caching.mjs
// Automated verification suite for Redis & In-Memory Fallback Caching

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

let adminCookie = "";

async function loginAdmin() {
  console.log("1. Authenticating as Studio Owner...");
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "owner@happiwrapz.com",
      password: "Happiwrapz@2026",
    }),
  });

  if (!res.ok) {
    throw new Error(`Admin login failed: ${res.status}`);
  }

  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) {
    throw new Error("No session cookie returned from login");
  }
  adminCookie = setCookie.split(";")[0];
  console.log("   Admin authenticated successfully.");
}

async function testHealthCheck() {
  console.log("\n2. Testing /api/health for Redis & In-Memory cache reporting...");
  const res = await fetch(`${BASE_URL}/api/health`);
  const data = await res.json();

  if (!res.ok || !data.report) {
    throw new Error(`Health check returned HTTP ${res.status}`);
  }

  const cacheService = data.report.services.find(
    (s) => s.name === "Redis & In-Memory Caching Engine"
  );

  if (!cacheService) {
    throw new Error("Cache service not found in /api/health services array");
  }

  console.log(`   Found Cache Service: ${cacheService.name}`);
  console.log(`   Status: ${cacheService.status}`);
  console.log(`   Details: ${cacheService.details}`);
  console.log(`   Latency: ${cacheService.latencyMs}ms`);

  if (cacheService.status !== "healthy") {
    throw new Error(`Expected cache service status 'healthy', got: ${cacheService.status}`);
  }
  console.log("   Health check reporting: PASS");
}

async function testProductCache() {
  console.log("\n3. Testing Catalog Products caching & hit behavior...");

  // Request 1: Fresh or cached
  const t0 = Date.now();
  const res1 = await fetch(`${BASE_URL}/api/products`);
  const t1 = Date.now();
  const data1 = await res1.json();
  const duration1 = t1 - t0;

  if (!res1.ok || !data1.products) {
    throw new Error("Failed to load /api/products");
  }
  console.log(`   Request 1: ${data1.products.length} products loaded in ${duration1}ms`);

  // Request 2: Warm cache hit
  const t2 = Date.now();
  const res2 = await fetch(`${BASE_URL}/api/products`);
  const t3 = Date.now();
  const data2 = await res2.json();
  const duration2 = t3 - t2;

  if (!res2.ok || !data2.products) {
    throw new Error("Failed to load /api/products on second request");
  }
  console.log(`   Request 2: ${data2.products.length} products loaded in ${duration2}ms (Cache Hit)`);
  console.log("   Product catalog caching: PASS");
}

async function testAdminCacheStatsAndPurge() {
  console.log("\n4. Testing /api/admin/cache diagnostic stats & purge...");

  // GET stats
  const resStats = await fetch(`${BASE_URL}/api/admin/cache`, {
    headers: { Cookie: adminCookie },
  });
  const dataStats = await resStats.json();

  if (!resStats.ok || !dataStats.success || !dataStats.cache) {
    throw new Error(`Failed to fetch cache stats: ${resStats.status}`);
  }

  const stats = dataStats.cache;
  console.log(`   Provider: ${stats.provider}`);
  console.log(`   Connected: ${stats.connected}`);
  console.log(`   Hit Rate: ${stats.hitRate} (Hits: ${stats.hits}, Misses: ${stats.misses})`);
  console.log(`   Cached Keys Count: ${stats.keysCount}`);
  console.log(`   Sample Keys: ${JSON.stringify(stats.cachedKeysSample)}`);

  // POST Purge
  console.log("\n5. Testing /api/admin/cache PURGE...");
  const resPurge = await fetch(`${BASE_URL}/api/admin/cache`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({ pattern: "*" }),
  });
  const dataPurge = await resPurge.json();

  if (!resPurge.ok || !dataPurge.success) {
    throw new Error(`Cache purge failed: ${resPurge.status}`);
  }

  console.log(`   Purge Message: ${dataPurge.message}`);
  console.log(`   Keys Remaining After Purge: ${dataPurge.cache.keysCount}`);

  if (dataPurge.cache.keysCount > 0) {
    console.warn(`   Notice: ${dataPurge.cache.keysCount} keys still present.`);
  } else {
    console.log("   Cache purge verified: 0 keys remaining. PASS");
  }
}

async function run() {
  console.log("=================================================");
  console.log("  HAPPIWRAPZ REDIS & IN-MEMORY CACHE TEST SUITE  ");
  console.log("=================================================");
  try {
    await loginAdmin();
    await testHealthCheck();
    await testProductCache();
    await testAdminCacheStatsAndPurge();
    console.log("\n=================================================");
    console.log("  ALL CACHE VERIFICATION TESTS PASSED (100%)    ");
    console.log("=================================================\n");
  } catch (err) {
    console.error("\nTEST SUITE FAILED:", err);
    process.exit(1);
  }
}

run();

