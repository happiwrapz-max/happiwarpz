import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import WebVitalsReporter from "@/components/analytics/WebVitalsReporter";
import FirebaseAnalyticsReporter from "@/components/analytics/FirebaseAnalyticsReporter";
import FloatingRightCart from "@/components/bag/FloatingRightCart";
import BagDrawer from "@/components/bag/BagDrawer";
import AuthModal from "@/components/auth/AuthModal";
import AuthInitializer from "@/components/auth/AuthInitializer";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E10600",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://happiwrapz.in"),
  title: {
    default: "Happiwrapz — Handcrafted Ribbon Flowers & Luxury Gifts",
    template: "%s | Happiwrapz",
  },
  description:
    "Artisanal satin ribbon roses & golden sunflowers, glitter keepsake flowers, and luxury gift hampers that never wilt. Handcrafted gifts in Coimbatore, Tamil Nadu, India with zero online payment.",
  keywords: [
    "handcrafted ribbon flowers",
    "ribbon roses Coimbatore",
    "ribbon flowers Tamil Nadu",
    "ribbon sunflowers",
    "forever flower bouquet",
    "glitter roses luxury",
    "bespoke gift hampers Coimbatore",
    "zero online payment florist",
    "wedding keepsake gifts",
  ],
  authors: [{ name: "Happiwrapz" }],
  creator: "Happiwrapz",
  publisher: "Happiwrapz",
  alternates: {
    canonical: "https://happiwrapz.in",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://happiwrapz.in",
    siteName: "Happiwrapz",
    title: "Happiwrapz — Handcrafted Ribbon Flowers & Luxury Gifts",
    description:
      "Artisanal satin ribbon roses & golden sunflowers, glitter keepsake flowers, and luxury gift hampers that never wilt. Handcrafted in Coimbatore, Tamil Nadu, India.",
    images: [
      {
        url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881723/happiwrapz/assets/hero-desktop.jpg",
        width: 1200,
        height: 630,
        alt: "Happiwrapz Handcrafted Ribbon Flowers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Happiwrapz — Handcrafted Ribbon Flowers & Luxury Gifts",
    description:
      "Artisanal satin ribbon roses & golden sunflowers that never wilt. Handcrafted in Coimbatore, Tamil Nadu, India.",
    images: ["https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881723/happiwrapz/assets/hero-desktop.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Global Schema.org JSON-LD structured data for Google Search & LocalBusiness
const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Florist", "LocalBusiness", "Store"],
      "@id": "https://happiwrapz.in/#organization",
      name: "Happiwrapz",
      url: "https://happiwrapz.in",
      logo: "https://happiwrapz.inhttps://res.cloudinary.com/w8fw2mbb/image/upload/v1793881723/happiwrapz/assets/hero-desktop.jpg",
      image: "https://happiwrapz.inhttps://res.cloudinary.com/w8fw2mbb/image/upload/v1793881723/happiwrapz/assets/hero-desktop.jpg",
      description:
        "Specializing in handcrafted satin ribbon roses, golden ribbon sunflowers, and bespoke luxury gift hampers in Coimbatore, Tamil Nadu, India.",
      telephone: "+91 7708354636",
      email: "contact@happiwrapz.com",
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Cash, UPI on delivery",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Coimbatore",
        addressRegion: "Tamil Nadu",
        addressCountry: "IN",
      },
      areaServed: {
        "@type": "AdministrativeArea",
        name: "Coimbatore, Tamil Nadu, India",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://happiwrapz.in/#website",
      url: "https://happiwrapz.in",
      name: "Happiwrapz",
      description: "Handcrafted Ribbon Flowers & Luxury Keepsakes",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://happiwrapz.in/catalog?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      className={`${jakartaSans.variable} ${cormorant.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {/* Structured Data Script for Google Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Suppress adblocker/Brave Shields network rejections from third-party analytics */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== "undefined") {
                window.addEventListener("unhandledrejection", function(e) {
                  var reason = "" + (e && e.reason && (e.reason.message || e.reason.stack || e.reason));
                  if (
                    reason.indexOf("firebaseinstallations") !== -1 ||
                    reason.indexOf("@firebase") !== -1 ||
                    (reason.indexOf("Failed to fetch") !== -1 && reason.indexOf("firebase") !== -1)
                  ) {
                    e.preventDefault();
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white text-[#1E1E1E]">
        <AuthInitializer />
        <WebVitalsReporter />
        <FirebaseAnalyticsReporter />
        {children}
        <FloatingRightCart />
        <BagDrawer />
        <AuthModal />
      </body>
    </html>
  );
}
