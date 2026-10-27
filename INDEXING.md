# Happiwrapz — Search Engine Crawling & Indexing Protocol

> **Domain:** `happiwrapz.in`  
> **Target Search Engines:** Google India (`google.co.in`), Bing, Yandex  
> **Key Conversion Channel:** WhatsApp Link Previews & Local Florist Search  

---

## 1. Crawl Architecture & URL Cleanliness

Happiwrapz is built on **Next.js 15 Server-Side Rendering (SSR & SSG)**, guaranteeing that every public page returns fully hydrated HTML to Googlebot without requiring client JavaScript execution.

### Clean Canonical URLs
- **Homepage:** `https://happiwrapz.in/`
- **Catalog Collection:** `https://happiwrapz.in/catalog`
- **Product Detail Pages:** `https://happiwrapz.in/product/{slug}`
- **Atelier Story:** `https://happiwrapz.in/about`
- **Contact & Concierge:** `https://happiwrapz.in/contact`
- **Legal Policies:** `https://happiwrapz.in/terms` & `https://happiwrapz.in/privacy`

---

## 2. Dynamic XML Sitemap & Robots.txt

### Dynamic Sitemap: [`/sitemap.xml`](file:///d:/New%20folder/happiwrapz/src/app/sitemap.ts)
Automatically generated on every build and request:
- All static pages with defined priorities (`1.0` for home, `0.9` for catalog, `0.7` for about/contact).
- Every product slug `/product/{slug}` with `priority: 0.85` and `changeFrequency: weekly`.
- Curated category filters `/catalog?category=...` with `priority: 0.75`.

### Robots.txt: [`/robots.txt`](file:///d:/New%20folder/happiwrapz/src/app/robots.ts)
- Public routes: **Allowed**.
- Private and authenticated areas (`/admin/*`, `/dashboard/*`, `/api/*`, `/login`, `/order/confirmation`): **Disallowed**.
- Sitemaps referenced directly for Googlebot.

---

## 3. Schema.org Structured Data (Rich Results Suite)

All pages include verified JSON-LD scripts:
1. **Florist / LocalBusiness Schema ([`layout.tsx`](file:///d:/New%20folder/happiwrapz/src/app/layout.tsx)):**
   - Atelier name, location (Koramangala 4th Block, Bangalore 560034), phone, geo coordinates, opening hours, and price range.
2. **WebSite Schema with SearchAction ([`layout.tsx`](file:///d:/New%20folder/happiwrapz/src/app/layout.tsx)):**
   - Connects the Google Sitelinks Search Box directly to `https://happiwrapz.in/catalog?q={search_term_string}`.
3. **Product & Offer Schema ([`src/app/product/[slug]/page.tsx`](file:///d:/New%20folder/happiwrapz/src/app/product/[slug]/page.tsx)):**
   - Full product name, image URLs, INR price, InStock status, brand, and validity.
4. **BreadcrumbList Schema ([`src/app/product/[slug]/page.tsx`](file:///d:/New%20folder/happiwrapz/src/app/product/[slug]/page.tsx)):**
   - Enables rich breadcrumb navigation snippets in Google SERPs (`Home > Shop Collection > Product Name`).

---

## 4. WhatsApp & Social Sharing Previews (Zero-JS Unfurl)

In India, WhatsApp is the primary medium for sharing anniversary and birthday gift links:
- Every product page generates `<meta property="og:image" content="...">` and `<meta property="og:title" content="...">` at server render time.
- Previews display instant high-resolution imagery and clear pricing when pasted into WhatsApp chats, Instagram DMs, or Facebook Messenger without requiring JavaScript.

---

## 5. Search Engine Launch Checklist

1. **Google Search Console Verification:**
   - Add property `https://happiwrapz.in`.
   - Submit sitemap URL: `https://happiwrapz.in/sitemap.xml`.
   - Set target geographic region to **India**.
2. **Bing Webmaster Tools:**
   - Import verification directly from Google Search Console.
3. **Google Business Profile:**
   - Claim or link "Happiwrapz Floral Atelier" at Koramangala 4th Block, Bangalore.
   - Link website to `https://happiwrapz.in`.
4. **Publishing New Products:**
   - Whenever a new ribbon flower bouquet is added in `src/lib/data/catalog.ts` or via `/api/products`, the dynamic sitemap `/sitemap.xml` updates automatically.
