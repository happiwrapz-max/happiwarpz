// Live HTTP Test Suite for Happiwrapz Error Management, Auto-Recovery & Live Monitoring System
const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

async function runLiveTests() {
  console.log("=================================================");
  console.log("HAPPIWRAPZ SRE LIVE ENDPOINT VERIFICATION SUITE");
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

  // 1. Public Health Check Endpoint
  console.log("--- 1. Testing GET /api/health ---");
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    const report = data.report || data;
    assert(res.status === 200, `Health check returned HTTP 200 (Got ${res.status})`);
    assert(data.success === true, "Health check reported success: true");
    assert(report.overall === "healthy" || report.overall === "degraded", `System status is ${report.overall}`);
    const dbService = report.services?.find((s) => s.category === "database");
    const orderService = report.services?.find((s) => s.category === "orders");
    const cdnService = report.services?.find((s) => s.category === "storage");
    assert(dbService?.status === "healthy", "Database service probe is healthy");
    assert(orderService?.status === "healthy", "Zero Upfront Order Pipeline is healthy");
    assert(cdnService?.status === "healthy" || cdnService?.status === "degraded", `Cloudinary CDN probe is ${cdnService?.status}`);
  } catch (err) {
    assert(false, `Health check failed to execute: ${err.message}`);
  }

  // 2. Client Error Reporting Endpoint
  console.log("\n--- 2. Testing POST /api/monitoring/report ---");
  let testErrorId = null;
  try {
    const reportPayload = {
      message: "Test Client Error Boundary Triggered on /catalog",
      stack: "Error: Test Client Error\n    at CatalogGrid (CatalogGrid.tsx:42:15)",
      route: "/catalog",
      severity: "LOW",
    };

    const res = await fetch(`${BASE_URL}/api/monitoring/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportPayload),
    });
    const data = await res.json();
    assert(res.status === 200, `Client error report returned HTTP 200 (Got ${res.status})`);
    assert(data.success === true, "Report response indicated success");
    assert(typeof data.errorId === "string" && data.errorId.startsWith("err"), `Returned valid errorId: ${data.errorId}`);
    testErrorId = data.errorId;
  } catch (err) {
    assert(false, `Client error report failed: ${err.message}`);
  }

  // 3. Admin Error Telemetry API (Requires Staff / Admin Authorization)
  console.log("\n--- 3. Testing GET /api/admin/monitoring/errors ---");
  try {
    const adminRes = await fetch(`${BASE_URL}/api/admin/monitoring/errors`);
    const adminData = await adminRes.json();
    assert(adminRes.status === 200, `Authorized admin request returned HTTP 200 (Got ${adminRes.status})`);
    assert(Array.isArray(adminData.errors), "Returned array of logged errors");
    assert(adminData.kpi && typeof adminData.kpi.total === "number", "Returned executive error KPIs");
    console.log(`   Telemetry Summary: ${adminData.kpi.total} total errors, ${adminData.kpi.unresolved} unresolved.`);
  } catch (err) {
    assert(false, `Admin error telemetry API failed: ${err.message}`);
  }

  // 4. Admin Error Status Update API
  if (testErrorId) {
    console.log(`\n--- 4. Testing PATCH /api/admin/monitoring/errors/${testErrorId} ---`);
    try {
      const patchRes = await fetch(`${BASE_URL}/api/admin/monitoring/errors/${testErrorId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "owner",
          "x-staff-id": "usr_owner_01",
        },
        body: JSON.stringify({
          status: "RESOLVED",
          note: "Verified in test suite, marked resolved.",
        }),
      });
      const patchData = await patchRes.json();
      assert(patchRes.status === 200, `Error triage update returned HTTP 200 (Got ${patchRes.status})`);
      assert(patchData.error?.status === "RESOLVED", "Incident status correctly transitioned to RESOLVED");
      assert(patchData.error?.resolutionNotes?.length > 0, "Investigation note successfully persisted in resolutionNotes");
    } catch (err) {
      assert(false, `Error triage update failed: ${err.message}`);
    }
  }

  // 5. 404 Not Found Page Status
  console.log("\n--- 5. Testing 404 Handler & Asset Availability ---");
  try {
    const notFoundRes = await fetch(`${BASE_URL}/non-existent-flower-url-test-404`);
    assert(notFoundRes.status === 404, `Missing route returns HTTP 404 (Got ${notFoundRes.status})`);

    const catImgRes = await fetch(`${BASE_URL}/images/404-cat-illustration.jpg`);
    assert(catImgRes.status === 200, `404 Cat Illustration asset returned HTTP 200 (Got ${catImgRes.status})`);
  } catch (err) {
    assert(false, `404 handler check failed: ${err.message}`);
  }

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runLiveTests().catch((err) => {
  console.error("Live test suite crashed:", err);
  process.exit(1);
});
