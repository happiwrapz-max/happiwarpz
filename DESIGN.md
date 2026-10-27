---
version: 3.0-master-redesign
name: happiwrapz-warm-editorial-luxury-design-system
description: "A centralized design system for Happiwrapz Gift & Floral Atelier. Implements Warm Editorial Luxury, Premium Minimalism, and Cinematic Product Storytelling using the reference palette: Cosmic Latte (#B7A89A), Mocha Cream (#EBDCC6), Deep Burgundy (#722F37), Espresso Brown (#38251F), and Warm Ivory (#F8F3EB). Synthesizes Taste Skill, Awesome DESIGN.md, Impeccable, Playwright CLI, and img2threejs."

palette:
  cosmic-latte:
    hex: "#B7A89A"
    rgb: "183, 168, 154"
    role: "Refined borders, orbit rings, metadata tags, secondary accents (12% distribution)"
  mocha-cream:
    hex: "#EBDCC6"
    rgb: "235, 220, 198"
    role: "Hero background, textured pedestal, secondary surfaces, pill backgrounds (25% distribution)"
  deep-burgundy:
    hex: "#722F37"
    rgb: "114, 47, 55"
    role: "Primary action pill buttons, brand wordmark, botanical vectors, headline accents (8% distribution)"
  espresso-brown:
    hex: "#38251F"
    rgb: "56, 37, 31"
    role: "Primary typography, high-contrast readable titles, footer base"
  warm-ivory:
    hex: "#F8F3EB"
    rgb: "248, 243, 235"
    role: "Primary canvas background, card surfaces, clean breathable negative space (55% distribution)"

semantic-tokens:
  background-primary: "#F8F3EB"
  background-secondary: "#EBDCC6"
  text-primary: "#38251F"
  text-secondary: "#66554C"
  brand-primary: "#722F37"
  button-primary: "#722F37"
  button-primary-hover: "#532228"
  border-subtle: "#D8C7B3"
  border-strong: "#B7A89A"
  card-surface: "#FFFFFF"
  card-surface-warm: "#F8F3EB"
  input-background: "#FFFFFF"
  focus-ring: "2px solid #722F37"

typography:
  font-heading: "Playfair Display, Georgia, serif"
  font-body: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
  font-mono: "JetBrains Mono, monospace"
  heading-display:
    size: "clamp(2.5rem, 6vw, 4.5rem)"
    lineHeight: "1.06"
    letterSpacing: "-0.02em"
  heading-section:
    size: "clamp(1.75rem, 3.5vw, 2.5rem)"
    lineHeight: "1.2"
  body-regular:
    size: "0.9375rem"
    lineHeight: "1.65"
  label-kicker:
    size: "0.75rem"
    letterSpacing: "0.25em"
    textTransform: "uppercase"

components:
  primary-pill:
    minHeight: "48px"
    padding: "14px 32px"
    borderRadius: "9999px"
    background: "#722F37"
    color: "#F8F3EB"
    hoverBackground: "#532228"
    focus: "2px solid #722F37"
  secondary-pill:
    minHeight: "48px"
    padding: "12px 28px"
    borderRadius: "9999px"
    border: "1.5px solid #722F37"
    background: "transparent"
    color: "#722F37"
    hoverBackground: "#EBDCC6"
  stone-pedestal:
    background: "#EBDCC6"
    border: "1.5px solid #D8C7B3"
    dropShadow: "0 20px 30px rgba(114, 47, 55, 0.15)"
---

# Happiwrapz Master Design System & Architectural Specification

## Visual Direction
**WARM EDITORIAL LUXURY + PREMIUM MINIMALISM + CINEMATIC PRODUCT STORYTELLING**
- Inspired by the Lumière editorial reference layout: warm cream canvas, deep burgundy botanical sketches, delicate orbital rings, stone pedestal centerpiece staging, and numbered vertical index navigation tracks.
- Preserves Happiwrapz core business model: handcrafted luxury bouquets and curated celebration hampers with zero upfront online payment taken (all orders confirmed directly by store owner via WhatsApp/phone).

## Tooling Integration Matrix
1. **Taste Skill (Leonxlnx/taste-skill)**:
   - Dials: `DESIGN_VARIANCE: 8` | `MOTION_INTENSITY: 7` | `VISUAL_DENSITY: 3`.
   - Editorial asymmetry, delicate celestial line art, handwritten cursive flourishes (*"Good Flowers, Better Days ♥"*).
2. **Awesome DESIGN.md (VoltAgent/awesome-design-md)**:
   - Centralized token documentation, color distribution formulas, and strict component contracts.
3. **Impeccable (pbakaus/impeccable)**:
   - High-contrast visual hierarchy, WCAG AA compliance (contrast ratio > 6.5:1), touch-target ergonomics (min 48px), responsive grid layouts.
4. **Playwright CLI (microsoft/playwright-cli)**:
   - End-to-end route inspection, visual regression checks, and headless validation.
5. **img2threejs (img2threejs/img2threejs)**:
   - Architectural evaluation for 3D procedural hero assets. Procedural SVG botanical vector art is chosen for instantaneous loading and zero render overhead while maintaining exact visual fidelity to the reference.

## Route Map & Redesign Coverage
- **Header & Navigation**: [`Navbar.tsx`](file:///d:/New%20folder/happiwrapz/src/components/layout/Navbar.tsx)
- **Homepage**: [`page.tsx`](file:///d:/New%20folder/happiwrapz/src/app/page.tsx)
- **Collection & Catalog**: [`catalog/page.tsx`](file:///d:/New%20folder/happiwrapz/src/app/catalog/page.tsx)
- **Product Details**: [`product/[slug]/page.tsx`](file:///d:/New%20folder/happiwrapz/src/app/product/[slug]/page.tsx)
- **Shopping Bag & Checkout Drawer**: [`bag/page.tsx`](file:///d:/New%20folder/happiwrapz/src/app/bag/page.tsx), [`BagDrawer.tsx`](file:///d:/New%20folder/happiwrapz/src/components/bag/BagDrawer.tsx), [`OrderRequestForm.tsx`](file:///d:/New%20folder/happiwrapz/src/components/bag/OrderRequestForm.tsx)
- **Order Tracking & Confirmation**: [`order/lookup/page.tsx`](file:///d:/New%20folder/happiwrapz/src/app/order/lookup/page.tsx), [`order/confirmation/page.tsx`](file:///d:/New%20folder/happiwrapz/src/app/order/confirmation/page.tsx)
- **Authentication**: [`login/page.tsx`](file:///d:/New%20folder/happiwrapz/src/app/login/page.tsx), [`signup/page.tsx`](file:///d:/New%20folder/happiwrapz/src/app/signup/page.tsx), [`LoginForm.tsx`](file:///d:/New%20folder/happiwrapz/src/components/auth/LoginForm.tsx)
- **Customer Dashboard**: [`dashboard/page.tsx`](file:///d:/New%20folder/happiwrapz/src/app/dashboard/page.tsx), [`dashboard/layout.tsx`](file:///d:/New%20folder/happiwrapz/src/app/dashboard/layout.tsx), [`dashboard/profile/page.tsx`](file:///d:/New%20folder/happiwrapz/src/app/dashboard/profile/page.tsx), [`dashboard/addresses/page.tsx`](file:///d:/New%20folder/happiwrapz/src/app/dashboard/addresses/page.tsx)
- **Admin Suite**: [`admin/page.tsx`](file:///d:/New%20folder/happiwrapz/src/app/admin/page.tsx), [`AdminSidebar.tsx`](file:///d:/New%20folder/happiwrapz/src/components/layout/AdminSidebar.tsx)
- **Footer**: [`Footer.tsx`](file:///d:/New%20folder/happiwrapz/src/components/layout/Footer.tsx)
