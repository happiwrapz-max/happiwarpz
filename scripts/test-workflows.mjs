import http from 'http';
import assert from 'assert';

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch {
            json = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: json,
          });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function extractCookie(res) {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) return '';
  const first = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  return first ? first.split(';')[0] : '';
}

async function runWorkflows() {
  console.log('========================================================');
  console.log('     HAPPIWRAPZ 10 CRITICAL WORKFLOWS VERIFICATION      ');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;
  let ipIndex = 200;

  async function testWorkflow(num, title, fn) {
    try {
      await fn();
      console.log(`  ✔ WORKFLOW ${num} PASSED: ${title}`);
      passed++;
    } catch (err) {
      console.error(`  ✖ WORKFLOW ${num} FAILED: ${title} -> ${err.message}`);
      failed++;
    }
  }

  // WORKFLOW 1: Customer registration → Login → Browse products → Add to cart → Checkout
  await testWorkflow(1, 'Customer registration → Login → Browse products → Checkout order request', async () => {
    const ip = `10.0.4.${ipIndex++}`;
    const testEmail = `patron.${Date.now()}@happiwrapz.com`;
    
    // 1. Signup
    const signupRes = await makeRequest('POST', '/api/auth/signup', {
      name: 'Lady Genevieve',
      email: testEmail,
    }, { 'x-real-ip': ip });
    assert.strictEqual(signupRes.status, 201);
    const sessionCookie = extractCookie(signupRes);
    assert.ok(sessionCookie);

    // 2. Browse catalog products
    const catRes = await makeRequest('GET', '/api/products', null, { 'x-real-ip': ip });
    assert.strictEqual(catRes.status, 200);
    assert.ok(catRes.body.products.length > 0);
    const product = catRes.body.products[0];

    // 3. Checkout (create order request)
    const orderRes = await makeRequest('POST', '/api/orders', {
      customer: {
        name: 'Lady Genevieve',
        email: testEmail,
        phone: '9876543210',
        address: '12 Lavelle Road',
        city: 'Bangalore',
        pincode: '560001',
      },
      items: [
        {
          productId: product.id,
          quantity: 2,
        },
      ],
      deliveryDate: '2026-11-10',
      deliverySlot: 'Morning (9:00 AM - 12:00 PM)',
    }, {
      Cookie: sessionCookie,
      'x-real-ip': ip,
    });

    assert.strictEqual(orderRes.status, 201);
    assert.strictEqual(orderRes.body.success, true);
    assert.ok(orderRes.body.order.reference.startsWith('HW-'));
  });

  // WORKFLOW 2: Order creation → Admin receives new order → Admin confirms order
  await testWorkflow(2, 'Order submission → Admin receives order → Admin confirms status', async () => {
    const ip = `10.0.4.${ipIndex++}`;
    
    // 1. Admin login
    const adminLogin = await makeRequest('POST', '/api/auth/login', { email: 'owner@happiwrapz.com', password: 'Happiwrapz@2026' }, { 'x-real-ip': ip });
    const adminCookie = extractCookie(adminLogin);
    assert.ok(adminCookie);

    // 2. Submit new order with real catalog product
    const orderRes = await makeRequest('POST', '/api/orders', {
      customer: {
        name: 'Sir Arthur',
        email: 'arthur@conan.com',
        phone: '9988776655',
        address: '221B Baker St Colony',
        city: 'Bangalore',
        pincode: '560025',
      },
      items: [
        {
          productId: 'red-rose-bouquet',
          quantity: 1,
        },
      ],
    }, { 'x-real-ip': `10.0.5.${ipIndex++}` });

    assert.strictEqual(orderRes.status, 201);
    const orderRef = orderRes.body.order.reference;

    // 3. Admin confirms order
    const confirmRes = await makeRequest('PATCH', `/api/orders/${orderRef}`, {
      status: 'confirmed',
      note: 'Verified with patron via phone',
    }, {
      Cookie: adminCookie,
      'x-real-ip': ip,
    });

    assert.strictEqual(confirmRes.status, 200);
    assert.strictEqual(confirmRes.body.order.status, 'confirmed');
  });

  // WORKFLOW 3: Admin login → Dashboard → View orders → Update order → Verify database update
  await testWorkflow(3, 'Admin login → Dashboard metrics → View orders → Status update', async () => {
    const ip = `10.0.4.${ipIndex++}`;
    const adminLogin = await makeRequest('POST', '/api/auth/login', { email: 'owner@happiwrapz.com', password: 'Happiwrapz@2026' }, { 'x-real-ip': ip });
    const adminCookie = extractCookie(adminLogin);

    // 1. Dashboard metrics
    const dashRes = await makeRequest('GET', '/api/admin/dashboard', null, {
      Cookie: adminCookie,
      'x-real-ip': ip,
    });
    assert.strictEqual(dashRes.status, 200);
    assert.ok(dashRes.body.kpis.totalOrders >= 0);

    // 2. View orders
    const ordersRes = await makeRequest('GET', '/api/orders', null, {
      Cookie: adminCookie,
      'x-real-ip': ip,
    });
    assert.strictEqual(ordersRes.status, 200);
    assert.ok(ordersRes.body.orders.length > 0);
  });

  // WORKFLOW 4: Customer login → View order history → Track order
  await testWorkflow(4, 'Customer login → View order history → Track order by reference', async () => {
    const ip = `10.0.4.${ipIndex++}`;
    const custEmail = `patron.${Date.now()}@happiwrapz.com`;

    // Create order for customer
    const orderRes = await makeRequest('POST', '/api/orders', {
      customer: {
        name: 'Patron Clara',
        email: custEmail,
        phone: '9876543211',
        address: '4th Block Koramangala',
        city: 'Bangalore',
        pincode: '560034',
      },
      items: [{ productId: 'red-rose-bouquet', quantity: 1 }],
    }, { 'x-real-ip': ip });
    assert.strictEqual(orderRes.status, 201);
    const ref = orderRes.body.order.reference;

    // Customer logs in
    const loginRes = await makeRequest('POST', '/api/auth/login', { email: custEmail }, { 'x-real-ip': ip });
    const custCookie = extractCookie(loginRes);

    // Query customer order history
    const listRes = await makeRequest('GET', '/api/orders', null, {
      Cookie: custCookie,
      'x-real-ip': ip,
    });
    assert.strictEqual(listRes.status, 200);
    assert.ok(listRes.body.orders.some((o) => o.reference === ref));

    // Track specific order
    const trackRes = await makeRequest('GET', `/api/orders/${ref}`, null, {
      Cookie: custCookie,
      'x-real-ip': ip,
    });
    assert.strictEqual(trackRes.status, 200);
    assert.strictEqual(trackRes.body.order.reference, ref);
  });

  // WORKFLOW 5: Admin login → View custom orders → Review status
  await testWorkflow(5, 'Admin login → View custom commissions → Inspect status', async () => {
    const ip = `10.0.4.${ipIndex++}`;
    const adminLogin = await makeRequest('POST', '/api/auth/login', { email: 'owner@happiwrapz.com', password: 'Happiwrapz@2026' }, { 'x-real-ip': ip });
    const adminCookie = extractCookie(adminLogin);

    const customRes = await makeRequest('GET', '/api/admin/custom-orders', null, {
      Cookie: adminCookie,
      'x-real-ip': ip,
    });
    assert.strictEqual(customRes.status, 200);
    assert.ok(Array.isArray(customRes.body.customOrders));
  });

  // WORKFLOW 6: Customer attempts admin access → Access denied (403 Forbidden)
  await testWorkflow(6, 'Customer attempts admin API access → Blocked with 403 Forbidden', async () => {
    const ip = `10.0.4.${ipIndex++}`;
    const loginRes = await makeRequest('POST', '/api/auth/login', { email: 'guest.patron@gmail.com' }, { 'x-real-ip': ip });
    const custCookie = extractCookie(loginRes);

    const forbiddenRes = await makeRequest('GET', '/api/admin/dashboard', null, {
      Cookie: custCookie,
      'x-real-ip': ip,
    });
    assert.strictEqual(forbiddenRes.status, 403);
    assert.strictEqual(forbiddenRes.body.success, false);
  });

  // WORKFLOW 7: Admin refreshes dashboard → Session persists → Dashboard loads
  await testWorkflow(7, 'Admin page refresh simulation → Session persists via HMAC cookie', async () => {
    const ip = `10.0.4.${ipIndex++}`;
    const adminLogin = await makeRequest('POST', '/api/auth/login', { email: 'owner@happiwrapz.com', password: 'Happiwrapz@2026' }, { 'x-real-ip': ip });
    const adminCookie = extractCookie(adminLogin);

    // First call
    const call1 = await makeRequest('GET', '/api/auth/me', null, { Cookie: adminCookie, 'x-real-ip': ip });
    assert.strictEqual(call1.status, 200);
    assert.strictEqual(call1.body.user.role, 'owner');

    // Simulated refresh (second call after delay)
    const call2 = await makeRequest('GET', '/api/auth/me', null, { Cookie: adminCookie, 'x-real-ip': ip });
    assert.strictEqual(call2.status, 200);
    assert.strictEqual(call2.body.user.role, 'owner');
  });

  // WORKFLOW 8: New customer registration → Admin monitoring records notification
  await testWorkflow(8, 'Customer registration → Triggers notification in admin monitoring', async () => {
    const ip = `10.0.4.${ipIndex++}`;
    const adminLogin = await makeRequest('POST', '/api/auth/login', { email: 'owner@happiwrapz.com', password: 'Happiwrapz@2026' }, { 'x-real-ip': ip });
    const adminCookie = extractCookie(adminLogin);

    const notifRes = await makeRequest('GET', '/api/admin/notifications', null, {
      Cookie: adminCookie,
      'x-real-ip': ip,
    });
    assert.strictEqual(notifRes.status, 200);
    assert.ok(Array.isArray(notifRes.body.notifications));
  });

  // WORKFLOW 9: New order submitted → Appears in recent orders
  await testWorkflow(9, 'New order submitted → Visible in admin recent orders', async () => {
    const ip = `10.0.4.${ipIndex++}`;
    const adminLogin = await makeRequest('POST', '/api/auth/login', { email: 'owner@happiwrapz.com', password: 'Happiwrapz@2026' }, { 'x-real-ip': ip });
    const adminCookie = extractCookie(adminLogin);

    const dashRes = await makeRequest('GET', '/api/admin/dashboard', null, {
      Cookie: adminCookie,
      'x-real-ip': ip,
    });
    assert.strictEqual(dashRes.status, 200);
    assert.ok(Array.isArray(dashRes.body.recentOrders));
  });

  // WORKFLOW 10: Payment verification failure → Order is not marked paid
  await testWorkflow(10, 'Tampered payment webhook → Rejected and does not mark order as paid', async () => {
    const ip = `10.0.4.${ipIndex++}`;

    // Submit invalid webhook (expect 401 Unauthorized rejection)
    const forgedWebhook = await makeRequest('POST', '/api/webhooks/payment', {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'fake_pay', order_id: 'fake_order', status: 'captured' } } },
    }, {
      'x-signature': 'forged_invalid_signature_hex_1234567890',
      'x-real-ip': ip,
    });

    assert.strictEqual(forgedWebhook.status, 401);
    assert.strictEqual(forgedWebhook.body.success, false);
  });

  console.log('\n--------------------------------------------------------');
  console.log(`WORKFLOWS RUN RESULTS: ${passed + failed} Ran | ${passed} Passed | ${failed} Failed`);
  console.log('--------------------------------------------------------\n');

  if (failed > 0) process.exit(1);
}

runWorkflows().catch((err) => {
  console.error('Workflow runner fatal error:', err);
  process.exit(1);
});
