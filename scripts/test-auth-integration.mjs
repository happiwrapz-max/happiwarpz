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

async function runAuthTests() {
  console.log('========================================================');
  console.log('   HAPPIWRAPZ AUTHENTICATION COMPREHENSIVE TEST SUITE   ');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;
  let reqCounter = 1;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✔ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✖ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Correct email login / customer auto-provision
  await test('Scenario 1: Customer login with valid email returns session and customer role', async () => {
    const ip = `192.168.1.${reqCounter++}`;
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'test.customer@happiwrapz.com',
    }, { 'x-real-ip': ip });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.role, 'customer');
    assert.ok(extractCookie(res).includes('hw_session='));
  });

  // 2. Verified Owner login
  await test('Scenario 2: Real owner login returns owner role and signed cookie', async () => {
    const ip = `192.168.1.${reqCounter++}`;
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'owner@happiwrapz.com',
      password: 'Happiwrapz@2026',
    }, { 'x-real-ip': ip });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.role, 'owner');
    assert.ok(extractCookie(res).includes('hw_session='));
  });

  // 3. Verified Store Manager login
  await test('Scenario 3: Real manager login returns manager role', async () => {
    const ip = `192.168.1.${reqCounter++}`;
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'manager@happiwrapz.com',
      password: 'Happiwrapz@2026',
    }, { 'x-real-ip': ip });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.role, 'manager');
    assert.ok(extractCookie(res).includes('hw_session='));
  });

  // 4. Invalid email format
  await test('Scenario 4: Invalid email format is rejected with 400', async () => {
    const ip = `192.168.1.${reqCounter++}`;
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'not-an-email',
    }, { 'x-real-ip': ip });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  // 5. Empty email
  await test('Scenario 5: Empty email is rejected with 400', async () => {
    const ip = `192.168.1.${reqCounter++}`;
    const res = await makeRequest('POST', '/api/auth/login', {
      email: '',
    }, { 'x-real-ip': ip });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  // 6. Signup with existing email rejected (409 Conflict)
  await test('Scenario 6: Signup collision prevention rejects existing account with 409', async () => {
    const ip = `192.168.1.${reqCounter++}`;
    const email = `collision.test.${Date.now()}@happiwrapz.com`;
    const res1 = await makeRequest('POST', '/api/auth/signup', {
      email,
      name: 'Original Client',
    }, { 'x-real-ip': ip });
    assert.strictEqual(res1.status, 201);

    // Duplicate signup attempt
    const res2 = await makeRequest('POST', '/api/auth/signup', {
      email,
      name: 'Attacker Impersonator',
    }, { 'x-real-ip': ip });
    assert.strictEqual(res2.status, 409);
    assert.strictEqual(res2.body.success, false);
  });

  // 7. Signup with empty name
  await test('Scenario 7: Signup with empty name rejected with 400', async () => {
    const ip = `192.168.1.${reqCounter++}`;
    const res = await makeRequest('POST', '/api/auth/signup', {
      email: `valid.${Date.now()}@happiwrapz.com`,
      name: '',
    }, { 'x-real-ip': ip });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  // 8. Password reset generic success (enumeration defense)
  await test('Scenario 8: Password reset returns generic success to protect privacy', async () => {
    const ip = `192.168.1.${reqCounter++}`;
    const res = await makeRequest('POST', '/api/auth/forgot-password', {
      email: 'customer@happiwrapz.com',
    }, { 'x-real-ip': ip });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.message.includes('dispatched'));
  });

  // 9. Password reset invalid email format
  await test('Scenario 9: Password reset with invalid email format rejected with 400', async () => {
    const ip = `192.168.1.${reqCounter++}`;
    const res = await makeRequest('POST', '/api/auth/forgot-password', {
      email: 'invalid-email-address',
    }, { 'x-real-ip': ip });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  // 10. Logout clears session cookie
  await test('Scenario 10: Logout API clears session cookie', async () => {
    const ip = `192.168.1.${reqCounter++}`;
    const res = await makeRequest('POST', '/api/auth/logout', null, { 'x-real-ip': ip });
    assert.strictEqual(res.status, 200);
    const setCookie = res.headers['set-cookie'] || [];
    const cleared = setCookie.some((c) => c.includes('hw_session=') || c.includes('Max-Age=0'));
    assert.ok(cleared, 'Session cookie must be cleared on logout');
  });

  // 11. Unauthenticated /api/auth/me returns authenticated: false
  await test('Scenario 11: Unauthenticated session check returns authenticated: false', async () => {
    const ip = `192.168.1.${reqCounter++}`;
    const res = await makeRequest('GET', '/api/auth/me', null, { 'x-real-ip': ip });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.authenticated, false);
    assert.strictEqual(res.body.user, null);
  });

  // 12. Authenticated /api/auth/me returns user details with valid cookie
  await test('Scenario 12: Authenticated session check retrieves user from signed HMAC cookie', async () => {
    const ip = `192.168.1.${reqCounter++}`;
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'owner@happiwrapz.com',
      password: 'Happiwrapz@2026',
    }, { 'x-real-ip': ip });
    const cookie = extractCookie(loginRes);
    assert.ok(cookie.length > 0, 'Must have received session cookie');

    const meRes = await makeRequest('GET', '/api/auth/me', null, {
      Cookie: cookie,
      'x-real-ip': ip,
    });
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.body.authenticated, true);
    assert.strictEqual(meRes.body.user.role, 'owner');
  });

  // 13. Admin API protected from unauthenticated access (401 Unauthorized)
  await test('Scenario 13: Admin API blocks unauthenticated access with 401', async () => {
    const ip = `192.168.1.${reqCounter++}`;
    const res = await makeRequest('GET', '/api/admin/dashboard', null, { 'x-real-ip': ip });
    assert.ok(res.status === 401 || res.status === 403);
    assert.strictEqual(res.body.success, false);
  });

  // 14. Admin API blocks customer role from access (403 Forbidden)
  await test('Scenario 14: Customer account cannot access admin API (403 IDOR/RBAC defense)', async () => {
    const ip = `192.168.1.${reqCounter++}`;
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'standard.customer@happiwrapz.com',
    }, { 'x-real-ip': ip });
    const cookie = extractCookie(loginRes);
    assert.ok(cookie.length > 0);

    const adminRes = await makeRequest('GET', '/api/admin/dashboard', null, {
      Cookie: cookie,
      'x-real-ip': ip,
    });
    assert.strictEqual(adminRes.status, 403);
    assert.strictEqual(adminRes.body.success, false);
  });

  // 15. Admin API allows authorized staff/owner access (200 OK)
  await test('Scenario 15: Authorized Owner can access admin API', async () => {
    const ip = `192.168.1.${reqCounter++}`;
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'owner@happiwrapz.com',
      password: 'Happiwrapz@2026',
    }, { 'x-real-ip': ip });
    const cookie = extractCookie(loginRes);
    assert.ok(cookie.length > 0);

    const adminRes = await makeRequest('GET', '/api/admin/dashboard', null, {
      Cookie: cookie,
      'x-real-ip': ip,
    });
    assert.strictEqual(adminRes.status, 200);
    assert.strictEqual(adminRes.body.success, true);
  });

  console.log('\n--------------------------------------------------------');
  console.log(`TEST RUN RESULTS: ${passed + failed} Ran | ${passed} Passed | ${failed} Failed`);
  console.log('--------------------------------------------------------\n');

  if (failed > 0) process.exit(1);
}

runAuthTests().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
