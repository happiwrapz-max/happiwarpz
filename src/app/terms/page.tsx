import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ShieldCheck, Heart, Phone, MessageSquare } from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-[#1E1E1E]">
      <Navbar />

      <main className="container-main max-w-4xl pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 sm:px-6">
        <div className="mb-10 text-center sm:text-left border-b border-[#EFEAE2] pb-8">
          <span className="text-[11px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block mb-1">
            HAPPIWRAPZ POLICIES
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#1E1E1E] font-normal">
            Terms & Service Guidelines
          </h1>
          <p className="text-xs sm:text-sm text-[#666] mt-2">
            Effective October 2026 • Handcrafted Ribbon Flowers & Luxury Gift Wrapping Studio
          </p>
        </div>

        <div className="space-y-10 text-xs sm:text-sm text-[#444] leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-[#1E1E1E] font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#E10600]" />
              <span>1. Zero Online Payment Policy</span>
            </h2>
            <p>
              Happiwrapz operates exclusively on an artisanal request model. No payment information, credit cards, or net banking credentials are ever collected or stored on this website. All orders submitted through our web portal represent a formal order request.
            </p>
            <p>
              Our store concierge personally coordinates with you via WhatsApp or phone to confirm bloom color availability, ribbon fold options, and your preferred delivery window before any order is finalized.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-[#1E1E1E] font-semibold flex items-center gap-2">
              <RibbonEmblem className="w-5 h-5 text-[#E10600]" />
              <span>2. Artisanal Ribbon Flower Nature</span>
            </h2>
            <p>
              All our floral arrangements feature handcrafted satin ribbon roses, golden ribbon sunflowers, and keepsake glitter foliage. Because every flower petal is folded and sculpted by hand, subtle individual artistic variations in fold, drape, and glitter sheen are natural and celebrated signatures of artisanal craft.
            </p>
            <p>
              Unlike perishable fresh blooms, our ribbon flowers are everlasting keepsakes that do not require water and will never wilt.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-[#1E1E1E] font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#E10600]" />
              <span>3. Hand Delivery in Coimbatore</span>
            </h2>
            <p>
              We provide hand delivery across all Coimbatore areas and express dispatch across Tamil Nadu and pan-India. Delivery slots are allocated in Morning (9:00 AM - 12:00 PM), Afternoon (1:00 PM - 5:00 PM), and Evening (6:00 PM - 9:00 PM) windows.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-[#1E1E1E] font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#E10600]" />
              <span>4. Concierge Assistance</span>
            </h2>
            <p>
              Have special customization requests or need bespoke corporate gift hampers? Reach our concierge desk directly:
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="https://wa.me/917708354636?text=Hello%20Happiwrapz!%20I%20have%20a%20question%20about%20terms."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-serif uppercase tracking-wider font-semibold shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E1E1E] hover:bg-[#E10600] text-white text-xs font-serif uppercase tracking-wider font-semibold transition-colors shadow-xs"
              >
                <span>Browse Collection</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
