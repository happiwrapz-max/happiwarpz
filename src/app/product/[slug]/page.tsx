import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductReviewEngine from "@/components/product/ProductReviewEngine";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { CATALOG, getProductBySlug } from "@/lib/data/catalog";
import { getProductReviews, getProductById } from "@/lib/server/db";
import { formatPrice } from "@/lib/utils";
import {
  ChevronRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Package,
  Award,
} from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";
import { buildCloudinaryUrl } from "@/lib/cloudinary";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getProductById(slug)) || getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const title = `${product.name} — Handcrafted Ribbon Flowers Coimbatore`;
  const description = `${product.description} Handcrafted in Coimbatore, Tamil Nadu with zero online payment. Guaranteed never to wilt.`;
  const url = `https://happiwrapz.in/product/${product.slug}`;
  const rawImage = product.images[0] || "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793882676/happiwrapz/assets/hero-desktop-luxury.jpg";
  const ogImage = buildCloudinaryUrl(rawImage, { preset: "social-og" });

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export async function generateStaticParams() {
  return CATALOG.map((p) => ({
    slug: p.slug,
  }));
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = (await getProductById(slug)) || getProductBySlug(slug) || CATALOG[0];

  if (!product) {
    notFound();
  }

  // Fetch verified authentic reviews for this product
  const reviews = await getProductReviews(product.id || product.slug);

  // Recommended companion items
  const recommendations = CATALOG.filter((p) => p.id !== product.id).slice(0, 4);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) =>
      buildCloudinaryUrl(img.startsWith("http") ? img : `https://happiwrapz.in${img}`, { preset: "detail" })
    ),
    description: product.description,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Happiwrapz",
    },
    offers: {
      "@type": "Offer",
      url: `https://happiwrapz.in/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Happiwrapz",
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://happiwrapz.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop Collection",
        item: "https://happiwrapz.in/catalog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://happiwrapz.in/product/${product.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1E1E1E] selection:bg-[#E10600]/15 selection:text-[#E10600]">
      {/* Product & Breadcrumb Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      <main className="flex-1">
        {/* Compact Breadcrumb Navigation */}
        <div className="container-main pt-20 sm:pt-24 pb-2">
          <nav className="flex items-center gap-1.5 text-xs font-serif uppercase tracking-wider text-[#888]">
            <Link href="/" className="hover:text-[#E10600] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-[#CCC]" />
            <Link href="/catalog" className="hover:text-[#E10600] transition-colors">
              Collection
            </Link>
            <ChevronRight className="w-3 h-3 text-[#CCC]" />
            <span className="text-[#E10600] font-semibold truncate max-w-[240px]">
              {product.name}
            </span>
          </nav>
        </div>

        {/* ── Main Product Visual Showcase & Details Grid ── */}
        <section className="container-main py-2 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* ── Left Column: Showcase Gallery + Studio Craftsmanship Highlights ── */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-6">
              {/* Image Gallery */}
              <ProductGallery
                images={product.images}
                productName={product.name}
              />

              {/* Craftsmanship & Guarantee Highlights (Fills lower left space beautifully) */}
              <div className="hidden lg:grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFEAE2] flex flex-col items-center text-center">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#EFEAE2] flex items-center justify-center mb-2 text-[#E10600] shadow-2xs">
                    <RibbonEmblem className="w-5 h-5 text-[#E10600]" />
                  </div>
                  <h4 className="font-serif text-xs font-bold text-[#1E1E1E]">100% Everlasting</h4>
                  <p className="text-[10px] text-[#666] mt-0.5 leading-snug">
                    Satin ribbon roses that never wilt, dry, or fade.
                  </p>
                </div>

                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFEAE2] flex flex-col items-center text-center">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#EFEAE2] flex items-center justify-center mb-2 text-[#059669] shadow-2xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-xs font-bold text-[#1E1E1E]">₹0 Upfront Pay</h4>
                  <p className="text-[10px] text-[#666] mt-0.5 leading-snug">
                    Inspect at doorstep in Coimbatore before paying.
                  </p>
                </div>

                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFEAE2] flex flex-col items-center text-center">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#EFEAE2] flex items-center justify-center mb-2 text-[#E10600] shadow-2xs">
                    <Package className="w-5 h-5 text-[#E10600]" />
                  </div>
                  <h4 className="font-serif text-xs font-bold text-[#1E1E1E]">Keepsake Box</h4>
                  <p className="text-[10px] text-[#666] mt-0.5 leading-snug">
                    Rigid presentation box protects every delicate petal.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right Column: Product Customization & Ordering Engine ── */}
            <div className="lg:col-span-6 xl:col-span-6">
              <ProductInfo product={product} />
            </div>
          </div>
        </section>

        {/* ── Original Customer Reviews & Ratings Section ── */}
        <ErrorBoundary
          fallbackTitle="Customer Reviews Temporarily Unavailable"
          fallbackMessage="We are currently refreshing our verified review threads. You can still order this handcrafted bouquet with zero upfront payment."
        >
          <ProductReviewEngine
            productId={product.id || product.slug}
            productName={product.name}
            initialReviews={reviews}
          />
        </ErrorBoundary>

        {/* ── Companion Arrangements ("You may also like") ── */}
        <section className="py-12 sm:py-16 bg-[#FAF8F5] border-t border-[#EFEAE2]">
          <div className="container-main">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block mb-1">
                  ATELIER PAIRINGS
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1E1E1E] font-normal">
                  You May Also Love
                </h2>
              </div>
              <Link
                href="/catalog"
                className="text-xs font-serif uppercase tracking-wider text-[#E10600] hover:text-[#C20500] font-semibold transition-colors"
              >
                View Full Collection →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recommendations.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.slug}`}
                  className="group bg-white rounded-3xl p-3.5 border border-[#EFEAE2] hover:border-[#E10600]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FAF8F5] mb-3">
                      <Image
                        src={item.images[0] || "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg"}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className={`object-contain p-2 transition-all duration-500 ease-out ${
                          item.images[1] ? "group-hover:opacity-0 group-hover:scale-95" : "group-hover:scale-105"
                        }`}
                      />
                      {item.images[1] && (
                        <Image
                          src={item.images[1]}
                          alt={`${item.name} alternate view`}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-contain p-2 opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out"
                        />
                      )}
                    </div>
                    <span className="text-[10px] font-serif uppercase tracking-wider text-[#888] block mb-1">
                      {item.category || "Ribbon Bouquet"}
                    </span>
                    <h3 className="font-serif text-sm font-semibold text-[#1E1E1E] group-hover:text-[#E10600] transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#EFEAE2] flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-[#E10600]">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      Zero Upfront
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
