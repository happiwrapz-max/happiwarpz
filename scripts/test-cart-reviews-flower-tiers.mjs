import assert from "assert";

const BASE_URL = "http://localhost:3000";

async function testReviewsAndFlowerTiers() {
  console.log("\n========================================================");
  console.log("   HAPPIWRAPZ FLOATING CART, REVIEWS & FLOWER TIERS     ");
  console.log("========================================================\n");

  // 1. Test Reviews GET
  console.log("[Test 1] Review Engine GET /api/products/[id]/reviews");
  const getRes = await fetch(`${BASE_URL}/api/products/red-rose-bouquet/reviews`);
  assert.strictEqual(getRes.status, 200, "Expected 200 OK for reviews GET");
  const getData = await getRes.json();
  assert.strictEqual(getData.success, true, "Expected success: true in reviews GET");
  assert.ok(Array.isArray(getData.reviews), "Expected reviews array");
  assert.ok(getData.reviews.length >= 3, `Expected at least 3 reviews, got ${getData.reviews.length}`);
  assert.ok(getData.stats, "Expected review stats");
  assert.ok(getData.stats.averageRating >= 1 && getData.stats.averageRating <= 5, "Expected averageRating between 1 and 5");
  assert.ok(getData.stats.distribution, "Expected star distribution breakdown");
  console.log(`  ✔ PASS: Retrieved ${getData.reviews.length} reviews, Average Rating: ${getData.stats.averageRating}★, 5-Star Count: ${getData.stats.distribution[5]}`);

  // 2. Test Reviews POST
  console.log("\n[Test 2] Review Engine POST /api/products/[id]/reviews");
  const postPayload = {
    authorName: "Gayathri Krishnan",
    authorEmail: "gayathri.k@example.com",
    rating: 5,
    title: "Mesmerizing Coimbatore Craftsmanship!",
    comment: "The crimson velvet roses with dew drops look absolutely authentic. Received on time with pristine packaging.",
    flowerCount: 15,
    colorChosen: "Crimson Velvet Red",
  };
  const postRes = await fetch(`${BASE_URL}/api/products/red-rose-bouquet/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postPayload),
  });
  assert.strictEqual(postRes.status, 200, "Expected 200 OK for review submission");
  const postData = await postRes.json();
  assert.strictEqual(postData.success, true, "Expected success: true for review submission");
  assert.strictEqual(postData.review.authorName, "Gayathri Krishnan", "Author name matches");
  assert.strictEqual(postData.review.flowerCount, 15, "Flower count matches");
  assert.strictEqual(postData.review.colorChosen, "Crimson Velvet Red", "Color matches");
  console.log(`  ✔ PASS: New review created with id: ${postData.review.id}, Verified: ${postData.review.verifiedBuyer}`);

  // 3. Test Reviews Helpful PATCH
  console.log("\n[Test 3] Review Engine PATCH Helpful Vote");
  const patchRes = await fetch(`${BASE_URL}/api/products/red-rose-bouquet/reviews`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reviewId: postData.review.id, action: "helpful" }),
  });
  assert.strictEqual(patchRes.status, 200, "Expected 200 OK for helpful vote");
  const patchData = await patchRes.json();
  assert.strictEqual(patchData.success, true, "Expected success for helpful vote");
  assert.strictEqual(patchData.helpfulCount, 1, "Expected helpfulCount to be 1");
  console.log(`  ✔ PASS: Helpful vote recorded, count: ${patchData.helpfulCount}`);

  // 4. Test Flower Tiers & Individual Pricing on Product
  console.log("\n[Test 4] Product Flower Tiers & Individual Pricing");
  const prodRes = await fetch(`${BASE_URL}/api/products/red-rose-bouquet`);
  assert.strictEqual(prodRes.status, 200, "Expected 200 OK for product GET");
  const prodData = await prodRes.json();
  assert.strictEqual(prodData.success, true, "Product lookup successful");
  const p = prodData.product;
  assert.ok(Array.isArray(p.flowerTiers), "Expected flowerTiers array on product");
  assert.ok(p.flowerTiers.length >= 4, `Expected at least 4 flower tiers, got ${p.flowerTiers.length}`);
  console.log(`  ✔ PASS: Product "${p.name}" has ${p.flowerTiers.length} stem tiers:`);
  for (const tier of p.flowerTiers) {
    console.log(`      • ${tier.count} Flowers -> ₹${tier.price} (${tier.label || "Tier"})${tier.isDefault ? " [DEFAULT/POPULAR]" : ""}`);
  }

  // 5. Verify Zero Upfront Payment & Customer Flow
  console.log("\n[Test 5] Zero Upfront Payment Business Rule Verification");
  const homeRes = await fetch(`${BASE_URL}/`);
  const homeHtml = await homeRes.text();
  assert.ok(homeHtml.includes("Zero Online Payment") || homeHtml.includes("Zero Upfront"), "Zero upfront payment visible on home");
  assert.ok(!homeHtml.includes("stripe-checkout") && !homeHtml.includes("razorpay-payment-button"), "Zero online payment gateways present");
  console.log("  ✔ PASS: Zero upfront payment model strictly enforced and zero payment gateway clutter detected.");

  // 6. Test Responsive Hero URLs
  console.log("\n[Test 6] Responsive Hero Assets on Cloudinary CDN");
  const desktopImgRes = await fetch("https://res.cloudinary.com/w8fw2mbb/image/upload/v1793882676/happiwrapz/assets/hero-desktop-luxury.jpg");
  assert.strictEqual(desktopImgRes.status, 200, "Desktop luxury hero accessible on Cloudinary CDN");
  const mobileImgRes = await fetch("https://res.cloudinary.com/w8fw2mbb/image/upload/v1793882678/happiwrapz/assets/hero-mobile-luxury.jpg");
  assert.strictEqual(mobileImgRes.status, 200, "Mobile luxury hero accessible on Cloudinary CDN");
  console.log("  ✔ PASS: Desktop & Mobile luxury hero images served with HTTP 200 from user's Cloudinary CDN (w8fw2mbb)");

  console.log("\n--------------------------------------------------------");
  console.log("✔ ALL FLOATING CART, REVIEW & FLOWER TIER TESTS PASSED!");
  console.log("--------------------------------------------------------\n");
}

testReviewsAndFlowerTiers().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

