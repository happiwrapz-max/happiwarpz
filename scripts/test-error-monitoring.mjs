// Test suite for Happiwrapz Error Management, Auto-Recovery & Live Monitoring System
import {
  recordAppError,
  getAppErrors,
  updateAppErrorStatus,
  addAppErrorNote,
  clearResolvedAppErrors,
  getLiveSystemHealthReport,
  sanitizeLogContent,
  generateFingerprint,
} from "../src/lib/server/errorMonitoring.js";

async function runTests() {
  console.log("=================================================");
  console.log("HAPPIWRAPZ SRE & ERROR MONITORING TEST SUITE");
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

  // 1. Secret & PII Sanitization
  console.log("--- 1. Security & Sanitization ---");
  const rawLeak = "Connection failed to postgresql://postgres:SuperSecretP@ssword123@db.supabase.co:5432/db with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and card 4111 2222 3333 4444";
  const sanitized = sanitizeLogContent(rawLeak);
  assert(!sanitized.includes("SuperSecretP@ssword123"), "Database password redacted");
  assert(!sanitized.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"), "Bearer JWT redacted");
  assert(!sanitized.includes("4111 2222 3333 4444"), "Credit card redacted");
  assert(sanitized.includes("[REDACTED_SECRET]"), "Replaced with [REDACTED_SECRET]");

  // 2. Duplicate Fingerprint Generation
  console.log("\n--- 2. Duplicate Grouping & Fingerprint Engine ---");
  const fp1 = generateFingerprint("Database timeout on /api/orders", "DATABASE", "/api/orders");
  const fp2 = generateFingerprint("Database timeout on /api/orders", "DATABASE", "/api/orders");
  const fp3 = generateFingerprint("Image load error on /catalog", "EXTERNAL_SERVICE", "/catalog");
  assert(fp1 === fp2, "Identical errors produce matching deterministic SHA-256 fingerprint");
  assert(fp1 !== fp3, "Different errors produce distinct fingerprints");

  // 3. Centralized Error Recording & Classification
  console.log("\n--- 3. Centralized Error Recording & Severity Classification ---");
  const criticalErr = await recordAppError({
    message: "Fatal database connection drop during checkout",
    category: "DATABASE",
    severity: "CRITICAL",
    route: "/checkout",
    statusCode: 503,
  });
  assert(criticalErr.severity === "CRITICAL", "Critical database outage classified as CRITICAL");
  assert(criticalErr.occurrenceCount === 1, "First occurrence count is 1");
  assert(criticalErr.status === "UNRESOLVED", "Initial status is UNRESOLVED");
  assert(criticalErr.id.startsWith("err_"), "Unique Error ID assigned");

  // Record duplicate of the same error to test grouping and count increment
  const dupErr = await recordAppError({
    message: "Fatal database connection drop during checkout",
    category: "DATABASE",
    severity: "CRITICAL",
    route: "/checkout",
    statusCode: 503,
  });
  assert(dupErr.fingerprint === criticalErr.fingerprint, "Duplicate shares exact fingerprint");
  assert(dupErr.occurrenceCount === 2, "Occurrence count incremented to 2 without log flooding");

  // 4. Admin Error Status Management & Notes
  console.log("\n--- 4. Admin Resolution & Triage Engine ---");
  const updated = await updateAppErrorStatus(criticalErr.id, "INVESTIGATING", "Investigating cluster latency");
  assert(updated?.status === "INVESTIGATING", "Error status updated to INVESTIGATING");
  assert(updated?.notes?.length > 0, "Investigation note recorded");

  const noted = await addAppErrorNote(criticalErr.id, "Root cause verified. Reconnecting pool.");
  assert(noted?.notes?.length === 2, "Additional investigation note appended");

  const resolved = await updateAppErrorStatus(criticalErr.id, "RESOLVED", "Pool restarted and verified");
  assert(resolved?.status === "RESOLVED", "Error status marked RESOLVED");

  // 5. System Health Probes
  console.log("\n--- 5. Live Service Health Probes ---");
  const health = await getLiveSystemHealthReport();
  assert(health.systemStatus === "HEALTHY" || health.systemStatus === "DEGRADED", `System Health evaluated: ${health.systemStatus}`);
  assert(health.services?.database?.status !== undefined, "Database connectivity probed");
  assert(health.services?.cloudinary?.status !== undefined, "Cloudinary CDN probed");
  assert(health.services?.orderPipeline?.status !== undefined, "Zero Upfront Order Pipeline probed");
  assert(typeof health.summary?.totalErrorsRecorded === "number", "Error counter active");

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

