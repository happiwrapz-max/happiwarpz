import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import WebVitalsReporter from "@/components/analytics/WebVitalsReporter";
import FirebaseAnalyticsReporter from "@/components/analytics/FirebaseAnalyticsReporter";

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
    default: "Happiwrapz — Handcrafted Ribbon Flowers & Luxury Gift Atelier",
    template: "%s | Happiwrapz Floral Atelier",
  },
  description:
    "Artisanal satin ribbon roses & golden sunflowers, glitter keepsake flowers, and luxury gift hampers that never wilt. Handcrafted gifts in Bangalore with zero online payment.",
  keywords: [
    "handcrafted ribbon flowers",
    "ribbon roses Bangalore",
    "ribbon sunflowers",
    "forever flower bouquet",
    "glitter roses luxury",
    "bespoke gift hampers Bangalore",
    "zero online payment florist",
    "wedding keepsake gifts",
  ],
  authors: [{ name: "Happiwrapz Floral Atelier" }],
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
    title: "Happiwrapz — Handcrafted Ribbon Flowers & Luxury Gift Atelier",
    description:
      "Artisanal satin ribbon roses & golden sunflowers, glitter keepsake flowers, and luxury gift hampers that never wilt. Handcrafted in Bangalore.",
    images: [
      {
        url: "/images/hero-desktop.jpg",
        width: 1200,
        height: 630,
        alt: "Happiwrapz Handcrafted Ribbon Flowers Atelier",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Happiwrapz — Handcrafted Ribbon Flowers & Luxury Gifts",
    description:
      "Artisanal satin ribbon roses & golden sunflowers that never wilt. Handcrafted in Bangalore.",
    images: ["/images/hero-desktop.jpg"],
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
      logo: "https://happiwrapz.in/images/hero-desktop.jpg",
      image: "https://happiwrapz.in/images/hero-desktop.jpg",
      description:
        "Artisanal atelier specializing in handcrafted satin ribbon roses, golden ribbon sunflowers, and bespoke luxury gift hampers in Bangalore.",
      telephone: "+91 80045678923",
      email: "concierge@happiwrapz.in",
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Cash, UPI on delivery",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Koramangala 4th Block",
        addressLocality: "Bangalore",
        addressRegion: "Karnataka",
        postalCode: "560034",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "12.9345",
        longitude: "77.6266",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "09:00",
          closes: "19:00",
        },
      ],
      areaServed: {
        "@type": "City",
        name: "Bangalore",
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
        {/* Preload critical hero LCP image */}
        <link
          rel="preload"
          as="image"
          href="/images/hero-desktop.jpg"
          fetchPriority="high"
        />
        {/* Structured Data Script for Google Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white text-[#1E1E1E]">
        <WebVitalsReporter />
        <FirebaseAnalyticsReporter />
        {children}
      </body>
    </html>
  );
}
