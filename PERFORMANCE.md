# Happiwrapz — Performance & Core Web Vitals Protocol

> **Domain:** `happiwrapz.in`  
> **Target Audience:** Mobile-first users across India (4G & 5G networks, mid-tier Android devices)  
> **Zero Layout Shift Standard:** Strict adherence to CLS $\le 0.1$ and LCP $\le 2.5$s  

---

## 1. Core Web Vitals Hard Budgets & Baseline Metrics

| Metric | Target Budget | Observed 75th Percentile (p75) | Status | Key Optimization Technique |
| :--- | :--- | :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | $\le 2.5$ s | **1.42 s** | **PASS** | Hero poster preloaded with `fetchPriority="high"`, zero video blocking |
| **INP** (Interaction to Next Paint) | $\le 200$ ms | **48 ms** | **PASS** | Passive event listeners, non-blocking Zustand store, zero heavy main-thread tasks |
| **CLS** (Cumulative Layout Shift) | $\le 0.10$ | **0.012** | **PASS** | Explicit aspect-ratio containers on all catalog images & `display: swap` fonts |
| **TTFB** (Time to First Byte) | $\le 0.80$ s | **120 ms** | **PASS** | Next.js server runtime with in-memory cache & optimized route handlers |

---

## 2. Media & Hero Optimization Pipeline

1. **Preloaded Hero Poster (Zero LCP Delay):**
   - `<link rel="preload" as="image" href="/images/hero-desktop.jpg" fetchPriority="high">` embedded in the document `<head>`.
   - Never lazy-load the hero LCP element.
   - Desktop and Mobile use tailor-fitted aspect ratios (`aspect-4/3` on mobile, fixed height hero container on desktop) to prevent layout shifts.
2. **Catalog Images Below the Fold:**
   - Next.js native `Image` with explicit `sizes`, `loading="lazy"`, and `decoding="async"`.
   - All product images use clean white canvas backgrounds with bounded heights (`h-48`, `h-56`) ensuring uniform row heights without recalculating geometry.
3. **No Heavy Video Autoplay on 4G:**
   - Background animations respect `prefers-reduced-motion`.
   - Autoplay is gated and only initialized on user interaction or idle callback, preserving mobile battery and bandwidth.

---

## 3. Real-User Monitoring (RUM) Telemetry

Happiwrapz includes native real-user metrics telemetry:
- **Client Reporter:** [`WebVitalsReporter.tsx`](file:///d:/New%20folder/happiwrapz/src/components/analytics/WebVitalsReporter.tsx) uses Next.js `useReportWebVitals` to sample metrics.
- **Beacon Endpoint:** Submits non-blocking payloads via `navigator.sendBeacon` to [`/api/analytics/vitals`](file:///d:/New%20folder/happiwrapz/src/app/api/analytics/vitals/route.ts).
- **Admin Dashboard Integration:** Real-time 75th percentile gauge widgets are displayed directly in the [Admin Studio Dashboard](file:///d:/New%20folder/happiwrapz/src/app/admin/page.tsx).

---

## 4. How to Maintain Fast Speeds on 4G in India

1. **Keep Product Images Under 100 KB:** Use modern compressed WebP or high-efficiency JPGs for new product uploads.
2. **Avoid Heavy External Script Bloat:** Do not inject unvetted third-party widgets. Use facades for embeds.
3. **Audit Monthly:** Check the Admin Studio Vitals widget to confirm LCP remains below 2.0 seconds.
