import http from 'http';

const endpoints = [
  { path: '/', expected: 200 },
  { path: '/catalog', expected: 200 },
  { path: '/shop', expected: 200 },
  { path: '/product/red-rose-bouquet', expected: 200 },
  { path: '/bag', expected: 200 },
  { path: '/login', expected: 307 },
  { path: '/signup', expected: 307 },
  { path: '/contact', expected: 200 },
  { path: '/order/lookup', expected: 200 },
  { path: '/api/products', expected: 200 },
  { path: '/api/auth/me', expected: 200, checkJson: (data) => data.authenticated === false && data.user === null },
];

async function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${endpoint.path}`, (res) => {
      let raw = '';
      res.on('data', (c) => raw += c);
      res.on('end', () => {
        let jsonCheck = true;
        if (endpoint.checkJson) {
          try {
            const parsed = JSON.parse(raw);
            jsonCheck = endpoint.checkJson(parsed);
          } catch {
            jsonCheck = false;
          }
        }
        resolve({
          path: endpoint.path,
          status: res.statusCode,
          pass: res.statusCode === endpoint.expected && jsonCheck,
          expected: endpoint.expected
        });
      });
    });
    req.on('error', (err) => {
      resolve({
        path: endpoint.path,
        status: 'CONN_ERR',
        error: err.message,
        pass: false,
        expected: endpoint.expected
      });
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        path: endpoint.path,
        status: 'TIMEOUT',
        pass: false,
        expected: endpoint.expected
      });
    });
  });
}

async function run() {
  console.log('Running Happiwrapz Smoke Test Suite...');
  let passed = 0;
  for (const ep of endpoints) {
    const res = await checkEndpoint(ep);
    if (res.pass) {
      console.log(`  ✔ [PASS] ${res.path} -> ${res.status}`);
      passed++;
    } else {
      console.log(`  ✖ [FAIL] ${res.path} -> got ${res.status}, expected ${res.expected}`);
    }
  }
  console.log(`\nResults: ${passed}/${endpoints.length} endpoints responding correctly.`);
  if (passed !== endpoints.length) {
    process.exit(1);
  }
}

run();
