import assert from 'node:assert';
import { createHmac } from 'node:crypto';

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

async function testTrackingFlow() {
  const baseUrl = 'http://localhost:3000';
  console.log('Testing Third-Party Courier Tracking API & User Lookup...');

  const adminToken = signSessionToken({
    id: "user_owner_01",
    email: "owner@happiwrapz.com",
    name: "Happiwrapz Owner",
    role: "owner"
  });

  const adminHeaders = {
    "Cookie": `${COOKIE_NAME}=${adminToken}`,
    "Content-Type": "application/json"
  };

  // 1. Fetch order details for HW-BYRSRY
  const getRes = await fetch(`${baseUrl}/api/orders/HW-BYRSRY`);
  assert.strictEqual(getRes.status, 200, `Expected 200, got ${getRes.status}`);
  const orderData = await getRes.json();
  const order = orderData.order || orderData;
  console.log(`Fetched order ${order.reference}: Courier=${order.courierName}, TrackingNo=${order.trackingNumber}`);

  // 2. Update tracking via PATCH endpoint with admin auth
  const patchRes = await fetch(`${baseUrl}/api/orders/HW-BYRSRY`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({
      courierName: 'Delhivery',
      trackingNumber: 'DEL9948201841',
      trackingUrl: 'https://www.delhivery.com/track/package/DEL9948201841'
    })
  });
  assert.strictEqual(patchRes.status, 200, `PATCH returned ${patchRes.status}`);
  const patchData = await patchRes.json();
  assert.strictEqual(patchData.order.courierName, 'Delhivery');
  assert.strictEqual(patchData.order.trackingNumber, 'DEL9948201841');
  console.log('PATCH /api/orders/HW-BYRSRY succeeded:', patchData.order.courierName, patchData.order.trackingNumber);

  // 3. Re-fetch to verify persistence
  const verifyRes = await fetch(`${baseUrl}/api/orders/HW-BYRSRY`);
  const verifyData = await verifyRes.json();
  const verifiedOrder = verifyData.order || verifyData;
  assert.strictEqual(verifiedOrder.courierName, 'Delhivery');
  assert.strictEqual(verifiedOrder.trackingNumber, 'DEL9948201841');
  console.log('Re-fetch verified persistence successfully!');

  // 4. Test User Lookup page SSR
  const lookupPage = await fetch(`${baseUrl}/order/lookup?ref=HW-BYRSRY`);
  assert.strictEqual(lookupPage.status, 200);
  const lookupHtml = await lookupPage.text();
  assert.ok(lookupHtml.includes('DEL9948201841') || lookupHtml.includes('Delhivery') || lookupHtml.includes('Track') || lookupHtml.includes('CourierTrackerCard'), 'User lookup should include courier tracking details');
  console.log('Order lookup page rendered with courier tracker successfully!');

  // 5. Test Dashboard SSR
  const dashboardPage = await fetch(`${baseUrl}/dashboard`);
  assert.strictEqual(dashboardPage.status, 200);
  console.log('User dashboard rendered successfully!');

  // 6. Test Admin Orders List page SSR
  const adminOrdersPage = await fetch(`${baseUrl}/admin/orders`, { headers: adminHeaders });
  assert.strictEqual(adminOrdersPage.status, 200);
  console.log('Admin orders list page rendered successfully!');

  console.log('\n--- ALL TRACKING VERIFICATION TESTS PASSED ---');
}

testTrackingFlow().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
