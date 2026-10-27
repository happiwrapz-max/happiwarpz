import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BagDrawer from "@/components/bag/BagDrawer";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import { CATALOG, getProductBySlug } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/utils";
import {
  ChevronRight,
  ShieldCheck,
  Heart,
  Star,
  Clock,
  Truck,
  CheckCircle2,
  Quote
} from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const title = `${product.name} — Handcrafted Ribbon Flowers`;
  const description = `${product.description} Handcrafted in Bangalore with zero online payment. Guaranteed never to wilt.`;
  const url = `https://happiwrapz.in/product/${product.slug}`;
  const image = product.images[0] || "/images/hero-desktop.jpg";

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
          url: image,
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
      images: [image],
    },
  };
}

export async function generateStaticParams() {
  return CATALOG.map((p) => ({
    slug: p.slug,
  }));
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug) || CATALOG[0];

  if (!product) {
    notFound();
  }

  // Recommended companion items
  const recommendations = CATALOG.filter((p) => p.id !== product.id).slice(0, 4);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => (img.startsWith("http") ? img : `https://happiwrapz.in${img}`)),
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
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
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
      <BagDrawer />

      <main className="flex-1">
        {/* Breadcrumb Navigation matching sample format */}
        <div className="container-main pt-24 sm:pt-28 pb-4">
          <nav className="flex items-center gap-2 text-xs font-serif uppercase tracking-wider text-[#777]">
            <Link href="/" className="hover:text-[#E10600] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#CCC]" />
            <Link href="/catalog" className="hover:text-[#E10600] transition-colors">
              Shop
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#CCC]" />
            <span className="text-[#E10600] font-semibold truncate max-w-[280px]">
              {product.name}
            </span>
          </nav>
        </div>

        {/* Product Visual Showcase & Details Grid */}
        <section className="container-main py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Left Gallery Column */}
            <div className="lg:col-span-7 flex justify-center">
              <ProductGallery
                images={product.images}
                productName={product.name}
              />
            </div>

            {/* Right Details Column */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <ProductInfo product={product} />
            </div>
          </div>
        </section>

        {/* Editorial Customer Reviews Section */}
        <section className="border-t border-[#EFEAE2] bg-[#FAF8F5] py-16 sm:py-20">
          <div className="container-main max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-[11px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block mb-1">
                  VERIFIED ATELIER EXPERIENCES
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1E1E1E] font-normal">
                  Loved by 124+ Bangalore Gift Givers
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center text-[#E5A83B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#E5A83B]" />
                  ))}
                </div>
                <span className="text-sm font-serif font-bold text-[#1E1E1E]">4.9 out of 5</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote:
                    "The roses were picked with dewdrops still glistening on the petals! The black velvet cylinder box felt extraordinarily luxurious on our anniversary table.",
                  author: "Dr. Ananya Murthy",
                  date: "2 days ago • Indiranagar, Bangalore",
                  rating: 5,
                },
                {
                  quote:
                    "Same-day dispatch delivered in 90 minutes sharp to my wife's office in Whitefield. The wax-sealed calligraphy card made her tear up with joy.",
                  author: "Rahul S. Nair",
                  date: "Last week • Whitefield, Bangalore",
                  rating: 5,
                },
                {
                  quote:
                    "Zero online upfront charge gave me so much peace of mind. The ribbon roses look absolutely stunning on my table and will stay beautiful forever without any watering!",
                  author: "Kavya R. Swaminathan",
                  date: "2 weeks ago • Koramangala, Bangalore",
                  rating: 5,
                },
              ].map((rev, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-[#E5A83B] mb-3">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#E5A83B]" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-[#555] leading-relaxed italic">
                      "{rev.quote}"
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-[#EFEAE2]">
                    <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#1E1E1E]">
                      <span>{rev.author}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                    </div>
                    <span className="text-[10px] text-[#888] font-sans block mt-0.5">
                      {rev.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Studio Craftsmanship & Quality Standards */}
        <section className="border-t border-[#EFEAE2] bg-white py-16 sm:py-20">
          <div className="container-main max-w-5xl">
            <div className="text-center mb-12">
              <span className="text-[11px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block mb-1">
                THE HAPPIWRAPZ ATELIER STANDARD
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal">
                Crafted with Botanical Precision
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#FAF8F5] p-7 rounded-3xl border border-[#EFEAE2] shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#EFEAE2] flex items-center justify-center mb-4 text-[#E10600]">
                  <RibbonEmblem className="w-6 h-6 text-[#E10600]" />
                </div>
                <h3 className="font-serif text-lg text-[#1E1E1E] mb-2 font-semibold">
                  Handcrafted Ribbon Roses
                </h3>
                <p className="text-xs text-[#666] leading-relaxed">
                  Sculpted by hand from premium satin ribbons in our Bangalore atelier. Guaranteed everlasting beauty that never wilts or fades.
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-7 rounded-3xl border border-[#EFEAE2] shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#EFEAE2] flex items-center justify-center mb-4 text-[#E10600]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg text-[#1E1E1E] mb-2 font-semibold">
                  Zero Online Payment
                </h3>
                <p className="text-xs text-[#666] leading-relaxed">
                  No advance payment required. Inspect your handcrafted ribbon flower arrangement at your doorstep before payment via cash or UPI.
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-7 rounded-3xl border border-[#EFEAE2] shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#EFEAE2] flex items-center justify-center mb-4 text-[#E10600]">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg text-[#1E1E1E] mb-2 font-semibold">
                  Keepsake Box Dispatch
                </h3>
                <p className="text-xs text-[#666] leading-relaxed">
                  Carefully transported in rigid protective presentation boxes so ribbon petals arrive crisp, pristine, and perfectly shaped.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* "You may also like" Section */}
        <section className="py-16 sm:py-20 bg-[#FAF8F5] border-t border-[#EFEAE2]">
          <div className="container-main">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block mb-1">
                  COMPANION ARRANGEMENTS
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1E1E1E] font-normal">
                  You may also like
                </h2>
              </div>
              <Link
                href="/catalog"
                className="text-xs font-serif uppercase tracking-wider text-[#E10600] hover:text-[#C20500] font-semibold"
              >
                View All Creations →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recommendations.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.slug}`}
                  className="group bg-white rounded-3xl p-3 border border-[#EFEAE2] hover:border-[#E10600]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FAF8F5] mb-3">
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 text-[9px] font-serif font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#E10600] border border-[#EFEAE2]">
                        {item.category}
                      </span>
                    </div>
                    <div className="px-1 py-1">
                      <h3 className="font-serif text-sm font-semibold text-[#1E1E1E] group-hover:text-[#E10600] transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="font-serif text-sm font-bold text-[#E10600]">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-[10px] text-[#999] line-through font-sans">
                          {formatPrice(item.price + 300)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-[#EFEAE2] text-[11px] text-[#888] font-sans flex items-center justify-between">
                    <span>★ 4.9 (98)</span>
                    <span className="text-[#E10600] font-medium group-hover:underline">
                      View Details →
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
