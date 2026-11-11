# HAPPIWRAPZ — 19 SECURITY REQUIREMENTS IMPLEMENTATION GUIDE (PHASE 2)

This document details the exact architectural implementations, code patterns, and configurations established across the Happiwrapz e-commerce codebase to enforce all 19 mandatory security requirements.

---

### 1. Row-Level Security (RLS)
* **Implementation:** Defined in `src/lib/server/dbSchema.ts`. RLS enabled on `orders`, `custom_orders`, `users`, and `audit_logs`.
* **Policy:** Customers can only read and write their own rows (`USING (customer_id = auth.uid())`); administrators have global staff access.

### 2. Authentication on Every API Route
* **Implementation:** Centralized server guard `requireAuth()` and `requireAdmin()` in `src/lib/server/security.ts`.
* **Policy:** Unauthenticated requests receive HTTP 401; unauthorized non-staff roles receive HTTP 403.

### 3. Never Trust the Frontend
* **Implementation:** `src/lib/server/pricing.ts` implements `calculateOrderPricing()`.
* **Policy:** All item unit prices, subtotal calculations, and discount percentages are derived from the authoritative server database. Any prices submitted by the client browser are discarded.

### 4. Rate Limiting
* **Implementation:** `src/lib/server/rateLimit.ts` sliding-window limiter.
* **Policy:** `AUTH_RATE_LIMIT` (5 requests / minute) on `/api/auth/*` and `PUBLIC_FORM_RATE_LIMIT` (3 requests / 15 minutes) on `/api/contact`.

### 5. Sanitize User Input
* **Implementation:** `src/lib/server/sanitize.ts`.
* **Policy:** `sanitizeString`, `sanitizeEmail`, and `sanitizePhone` strip executable script tags, event handlers (`onerror=`), and null bytes.

### 6. Parameterized Database Queries
* **Implementation:** `src/lib/server/postgres.ts` and `postgresAdapter.ts`.
* **Policy:** Tagged template literal queries (`sql\`...\``) ensure input values are passed as isolated database parameters, preventing SQL injection.

### 7. Lock Down CORS
* **Implementation:** `src/lib/server/cors.ts`.
* **Policy:** Explicit domain allowlist (`https://happiwrapz.com` and `http://localhost:3000`). Wildcard `*` with credentials is explicitly forbidden.

### 8. HTTPS Everywhere
* **Implementation:** `next.config.ts` and `src/lib/server/security.ts`.
* **Policy:** Session cookies set with `HttpOnly; SameSite=Lax; Path=/; Secure` (in production). HSTS header configured with `max-age=63072000; includeSubDomains; preload`.

### 9. Stop IDOR Vulnerabilities
* **Implementation:** `src/app/api/orders/[reference]/route.ts`.
* **Policy:** Object-level check verifies that `order.customer.email === user.email` or `user.role` is staff before returning customer PII.

### 10. Disable Debug Mode in Production
* **Implementation:** `src/lib/server/errors.ts`.
* **Policy:** `handleApiError()` masks internal file paths, stack traces, and database connection strings.

### 11. CAPTCHA on Public Forms
* **Implementation:** `src/lib/server/captcha.ts` and `src/app/api/contact/route.ts`.
* **Policy:** Validates token validity server-side before accepting public inquiries.

### 12. Log Admin Actions
* **Implementation:** `src/lib/server/auditSecurity.ts`.
* **Policy:** Records administrative changes (`order.status_updated`, `inventory.adjusted`, `role.updated`), auto-redacting passwords and secrets.

### 13. Private Storage Buckets
* **Implementation:** `src/lib/firebase/config.ts` and `src/app/api/upload/route.ts`.
* **Policy:** Customer commission sketches and uploads are scoped to authenticated paths with restricted read access.

### 14. Secure Admin Pages
* **Implementation:** `src/app/admin/layout.tsx` and `src/lib/server/security.ts`.
* **Policy:** Client layout redirects unauthenticated users to `/login?redirect=/admin`, while backend API routes verify `requireAdmin()` on every call.

### 15. Update Vulnerable Packages
* **Implementation:** `package.json` cleaned of unneeded `@grpc/grpc-js` imports.
* **Policy:** Dependency tree audited for zero known vulnerabilities.

### 16. Secure File Uploads
* **Implementation:** `src/lib/server/uploadValidation.ts`.
* **Policy:** Binary magic-byte validation (`FF D8 FF` for JPEG, `89 50 4E 47` for PNG), 5MB size limit, path-traversal sanitization.

### 17. AI-Powered Security Review
* **Implementation:** Static and dynamic code analysis validating OWASP Top 10 compliance.
* **Policy:** Verified zero leaked credentials or bypass routes.

### 18. Security Headers
* **Implementation:** `next.config.ts`.
* **Policy:** `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

### 19. Verify Webhook Signatures
* **Implementation:** `src/lib/server/webhookSecurity.ts` and `src/app/api/webhooks/payment/route.ts`.
* **Policy:** Constant-time comparison (`crypto.timingSafeEqual`), 5-minute timestamp window, and idempotency store to eliminate replay attacks.
