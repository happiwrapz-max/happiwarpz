import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ShieldCheck, Lock, UserCheck, EyeOff } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-[#1E1E1E]">
      <Navbar />

      <main className="container-main max-w-4xl pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 sm:px-6">
        <div className="mb-10 text-center sm:text-left border-b border-[#EFEAE2] pb-8">
          <span className="text-[11px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block mb-1">
            PRIVACY & DATA PROTECTION
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#1E1E1E] font-normal">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#666] mt-2">
            Last updated October 2026 • Happiwrapz Floral Atelier Bangalore
          </p>
        </div>

        <div className="space-y-10 text-xs sm:text-sm text-[#444] leading-relaxed">
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-[#1E1E1E] font-semibold flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-[#E10600]" />
              <span>1. Zero Financial Data Collection</span>
            </h2>
            <p>
              Happiwrapz does not process, capture, or store credit cards, debit cards, bank account details, or CVVs. Because our shop operates on an artisanal concierge request workflow, no financial data is ever collected or processed on our servers.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-[#1E1E1E] font-semibold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#E10600]" />
              <span>2. Recipient Information & Hand Delivery</span>
            </h2>
            <p>
              When you submit a gift request, we collect only the necessary details required to craft your keepsake bouquet and arrange safe hand delivery:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#555]">
              <li>Sender and recipient name and contact telephone number.</li>
              <li>Delivery address, city, and postal code.</li>
              <li>Custom gift message and calligraphy card preferences.</li>
              <li>Preferred delivery date and morning/afternoon slot.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-[#1E1E1E] font-semibold flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#E10600]" />
              <span>3. Data Protection & Confidentiality</span>
            </h2>
            <p>
              We treat your romantic gestures, surprise anniversary deliveries, and gift messages with strict discretion. Your contact information is never sold, shared, or distributed to third-party marketing companies.
            </p>
          </div>

          <div className="pt-4 border-t border-[#EFEAE2] flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs text-[#888]">
              Questions about our privacy protocol? Contact{" "}
              <a href="mailto:concierge@happiwrapz.in" className="text-[#E10600] underline">
                concierge@happiwrapz.in
              </a>
            </span>
            <Link
              href="/catalog"
              className="px-6 py-2.5 rounded-full bg-[#1E1E1E] hover:bg-[#E10600] text-white text-xs font-serif uppercase tracking-wider font-semibold transition-colors shadow-xs"
            >
              Return to Catalog
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
