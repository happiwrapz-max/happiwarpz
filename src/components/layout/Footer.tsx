"use client";

import Link from "next/link";
import { useState } from "react";
import { Phone, Mail, MapPin, ShieldCheck, Heart, MessageSquare } from "lucide-react";
import { useBagStore } from "@/lib/store/useBagStore";

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const openDrawer = useBagStore((s) => s.openDrawer);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      try {
        await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
      } catch (err) {
        console.warn("Newsletter subscription failed:", err);
      }
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail("");
    }
  };

  return (
    <footer className="bg-white text-[#1E1E1E] border-t border-[#EFEAE2] overflow-x-hidden">
      {/* Newsletter / Join Us Section */}
      <div className="border-b border-[#EFEAE2] bg-[#FAF8F5] py-10 sm:py-14">
        <div className="container-main px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="w-full md:max-w-md text-center md:text-left">
            <span className="text-[11px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block mb-1">
              JOIN OUR FLORAL CIRCLE
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#1E1E1E] font-normal">
              Sign up for our newsletter
            </h3>
            <p className="text-xs text-[#666] mt-1 max-w-sm mx-auto md:mx-0">
              Receive secret seasonal bouquet previews and get 5% off your first handcrafted gift order.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row w-full md:w-auto max-w-md gap-2.5"
          >
            <input
              type="email"
              required
              placeholder="Your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full sm:w-auto sm:min-w-[240px] px-4 py-3 text-xs bg-white border border-[#EFEAE2] rounded-full text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#E10600] hover:bg-[#C20500] text-white text-xs font-serif uppercase tracking-wider font-semibold rounded-full transition-all duration-300 shadow-[0_4px_14px_rgba(225,6,0,0.25)] cursor-pointer text-center shrink-0"
            >
              {subscribed ? "Subscribed!" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container-main px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-serif tracking-[0.2em] text-[#1E1E1E] font-semibold uppercase"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#E10600]" />
              <span>HAPPIWRAPZ</span>
            </Link>
            <p className="text-xs text-[#666] leading-relaxed max-w-sm">
              Artisanal luxury floristry and bespoke gift wrapping atelier based in Bangalore. Hand-tied morning roses, signature glitter keepsakes, and European presentation.
            </p>

            <div className="pt-2 space-y-2.5 text-xs text-[#555]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#E10600] shrink-0 mt-0.5" />
                <span>Koramangala 4th Block, Bangalore, Karnataka 560034</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E10600] shrink-0" />
                <a href="tel:080045678923" className="hover:text-[#E10600]">
                  0 800 456 789 23 • Mon-Sat 9:00 - 18:00
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#E10600] shrink-0" />
                <a href="mailto:concierge@happiwrapz.in" className="hover:text-[#E10600]">
                  concierge@happiwrapz.in
                </a>
              </div>
            </div>

            {/* Mobile Quick WhatsApp Button */}
            <div className="pt-2 sm:hidden">
              <a
                href="https://wa.me/919876543210?text=Hello%20Happiwrapz!%20I%20have%20an%20inquiry%20about%20your%20bouquets."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Links Section: 2 Columns on Mobile for Clean Browsing */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:col-span-3 gap-6 sm:gap-8">
            {/* Collections */}
            <div className="space-y-3 font-serif">
              <h4 className="text-xs font-semibold text-[#1E1E1E] uppercase tracking-[0.18em]">
                Collections
              </h4>
              <ul className="space-y-2 text-xs text-[#666] font-sans">
                <li>
                  <Link href="/catalog?category=Flower+Bouquet" className="hover:text-[#E10600] transition-colors block py-0.5">
                    Handcrafted Ribbon Flowers
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=Flower+Bouquet" className="hover:text-[#E10600] transition-colors block py-0.5">
                    Glitter Luxury Editions
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=Gift+Box" className="hover:text-[#E10600] transition-colors block py-0.5">
                    Midnight Rose Boxes
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=Gift+Hamper" className="hover:text-[#E10600] transition-colors block py-0.5">
                    Celebration Hampers
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=Gift+Wrap" className="hover:text-[#E10600] transition-colors block py-0.5">
                    Bespoke Gift Wrapping
                  </Link>
                </li>
              </ul>
            </div>

            {/* Occasions */}
            <div className="space-y-3 font-serif">
              <h4 className="text-xs font-semibold text-[#1E1E1E] uppercase tracking-[0.18em]">
                Occasions
              </h4>
              <ul className="space-y-2 text-xs text-[#666] font-sans">
                <li>
                  <Link href="/#occasions" className="hover:text-[#E10600] transition-colors block py-0.5">
                    Birthdays
                  </Link>
                </li>
                <li>
                  <Link href="/#occasions" className="hover:text-[#E10600] transition-colors block py-0.5">
                    Anniversaries
                  </Link>
                </li>
                <li>
                  <Link href="/#occasions" className="hover:text-[#E10600] transition-colors block py-0.5">
                    Weddings
                  </Link>
                </li>
                <li>
                  <Link href="/#occasions" className="hover:text-[#E10600] transition-colors block py-0.5">
                    Baby Showers
                  </Link>
                </li>
                <li>
                  <Link href="/#occasions" className="hover:text-[#E10600] transition-colors block py-0.5">
                    Just Because
                  </Link>
                </li>
              </ul>
            </div>

            {/* Order & Concierge */}
            <div className="col-span-2 sm:col-span-1 space-y-3 font-serif">
              <h4 className="text-xs font-semibold text-[#1E1E1E] uppercase tracking-[0.18em]">
                Order Concierge
              </h4>
              <ul className="space-y-2 text-xs text-[#666] font-sans">
                <li>
                  <button
                    onClick={openDrawer}
                    className="hover:text-[#E10600] transition-colors font-medium text-[#1E1E1E] text-left cursor-pointer block py-0.5"
                  >
                    Open Cart Drawer
                  </button>
                </li>
                <li>
                  <Link href="/order/lookup" className="hover:text-[#E10600] transition-colors block py-0.5">
                    Track By Reference
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#E10600] transition-colors block py-0.5">
                    Customer Dashboard
                  </Link>
                </li>
                <li className="pt-1">
                  <span className="inline-flex items-center gap-1.5 text-[#059669] font-medium text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Zero Online Charge</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar with payment assurances & copyright */}
        <div className="pt-8 mt-8 border-t border-[#EFEAE2] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-[#888]">
          <p>© 2026 HAPPIWRAPZ FLORAL ATELIER. All rights reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#777]">
            <span>Verified Floristry</span>
            <span>•</span>
            <span>WhatsApp Direct Fulfill</span>
            <span>•</span>
            <span>Bangalore Hand-Delivered</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
