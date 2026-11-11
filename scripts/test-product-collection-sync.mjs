// Automated Verification: Admin Product Creation -> Collection Synchronization
const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

async function verifyProductSync() {
  console.log("=================================================");
  console.log("VERIFYING ADMIN PRODUCT CREATION & COLLECTION SYNC");
  console.log(`Target: ${BASE_URL}`);
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Check existing user-created product "brand logo" in /api/products
  console.log("--- 1. Checking Existing User Product 'brand logo' ---");
  try {
    const res = await fetch(`${BASE_URL}/api/products`);
    const data = await res.json();
    assert(res.status === 200, `GET /api/products returned HTTP 200`);
    assert(Array.isArray(data.products), `Returned ${data.products.length} products`);

    const brandLogo = data.products.find((p) => p.name === "brand logo" || p.slug === "brand-logo");
    assert(!!brandLogo, `Found user-added product "brand logo" in live catalog database`);
    console.log(`   Product ID: ${brandLogo?.id}, Slug: ${brandLogo?.slug}, Category: ${brandLogo?.category}`);

    // Verify detail page for brand logo
    const pageRes = await fetch(`${BASE_URL}/product/brand-logo`);
    assert(pageRes.status === 200, `Product detail page /product/brand-logo rendered with HTTP 200`);
  } catch (err) {
    assert(false, `Failed checking existing product: ${err.message}`);
  }

  // 2. Add a new product via POST /api/products (simulating Admin Studio)
  console.log("\n--- 2. Creating New Test Product via Admin Pipeline ---");
  const uniqueStamp = Date.now();
  const testProductPayload = {
    name: `Lavender Twilight Ribbon Bouquet ${uniqueStamp}`,
    slug: `lavender-twilight-ribbon-bouquet-${uniqueStamp}`,
    category: "Flower Bouquet",
    description: "Handcrafted lilac and violet satin ribbon petals with artisanal lace wrap.",
    price: 1899,
    compareAtPrice: 2299,
    images: [
      "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg",
    ],
    inStock: true,
    featured: true,
    flowerType: "Satin Ribbon Lavender",
    ribbonColor: "Lavender Mist",
    flowerTiers: [
      { id: "tier-3", count: 3, label: "3 Stems", price: 899 },
      { id: "tier-10", count: 10, label: "10 Stems", price: 1899, isDefault: true },
    ],
  };

  let createdId = null;
  try {
    const createRes = await fetch(`${BASE_URL}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testProductPayload),
    });
    const createData = await createRes.json();
    assert(createRes.status === 201, `POST /api/products returned HTTP 201 Created`);
    assert(createData.success === true, `Product created successfully`);
    createdId = createData.product.id;
    assert(!!createdId, `Assigned ID: ${createdId}`);
  } catch (err) {
    assert(false, `Failed creating test product: ${err.message}`);
  }

  // 3. Verify Newly Created Product immediately appears in Collection /api/products
  console.log("\n--- 3. Verifying Instant Appearance in Live Catalog ---");
  try {
    const listRes = await fetch(`${BASE_URL}/api/products?t=${Date.now()}`);
    const listData = await listRes.json();
    const found = listData.products.find((p) => p.id === createdId || p.slug === testProductPayload.slug);
    assert(!!found, `Newly created product instantly surfaced in live catalog API`);
    assert(found?.price === 1899, `Pricing verified at ₹1,899`);
    assert(found?.category === "Flower Bouquet", `Category matched "Flower Bouquet"`);

    // Verify detail page works immediately
    const detailRes = await fetch(`${BASE_URL}/product/${testProductPayload.slug}`);
    assert(detailRes.status === 200, `New product page /product/${testProductPayload.slug} accessible with HTTP 200`);
  } catch (err) {
    assert(false, `Verification of live catalog appearance failed: ${err.message}`);
  }

  // 4. Clean up test product
  if (createdId) {
    console.log("\n--- 4. Cleaning Up Ephemeral Test Product ---");
    try {
      const delRes = await fetch(`${BASE_URL}/api/products/${createdId}`, {
        method: "DELETE",
      });
      assert(delRes.status === 200, `DELETE /api/products/${createdId} returned HTTP 200 OK`);
    } catch (err) {
      console.warn("Cleanup warning:", err.message);
    }
  }

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

verifyProductSync().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

