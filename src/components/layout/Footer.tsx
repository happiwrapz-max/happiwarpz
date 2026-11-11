"use client";

import Link from "next/link";
import { useState } from "react";
import { Phone, Mail, MapPin, ShieldCheck, MessageSquare } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { useBagStore } from "@/lib/store/useBagStore";

export default function Footer() {
  const openDrawer = useBagStore((s) => s.openDrawer);

  return (
    <footer className="bg-white text-[#1E1E1E] border-t border-[#EFEAE2] overflow-x-hidden">
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
              Handcrafted satin ribbon flower bouquets, everlasting floral arrangements, and personalized gift hampers crafted with passion in Coimbatore, Tamil Nadu, India.
            </p>

            <div className="pt-2 space-y-2.5 text-xs text-[#555]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#E10600] shrink-0 mt-0.5" />
                <span>Coimbatore, Tamil Nadu, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E10600] shrink-0" />
                <a href="tel:+917708354636" className="hover:text-[#E10600] font-medium transition-colors">
                  +91 7708354636
                </a>
              </div>
              <div className="flex items-center gap-2">
                <InstagramIcon className="w-3.5 h-3.5 text-[#E10600] shrink-0" />
                <a
                  href="https://www.instagram.com/happiwrapz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#E10600] font-medium transition-colors"
                >
                  @happiwrapz
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#E10600] shrink-0" />
                <a href="mailto:contact@happiwrapz.com" className="hover:text-[#E10600] transition-colors">
                  contact@happiwrapz.com
                </a>
              </div>
            </div>

            {/* Quick WhatsApp & Call Buttons */}
            <div className="pt-3 flex flex-wrap gap-2.5">
              <a
                href="https://wa.me/917708354636?text=Hello%20Happiwrapz!%20I%20have%20an%20inquiry%20about%20your%20ribbon%20bouquets."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold transition-all shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
              <a
                href="tel:+917708354636"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E1E1E] hover:bg-black text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold transition-all shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 text-[#E10600]" />
                <span>Call Now</span>
              </a>
            </div>
          </div>

          {/* Links Section */}
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
                  <Link href="/contact" className="hover:text-[#E10600] transition-colors block py-0.5">
                    Custom Requests
                  </Link>
                </li>
              </ul>
            </div>

            {/* Order & Support */}
            <div className="col-span-2 sm:col-span-1 space-y-3 font-serif">
              <h4 className="text-xs font-semibold text-[#1E1E1E] uppercase tracking-[0.18em]">
                Customer Support
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
                  <Link href="/contact" className="hover:text-[#E10600] transition-colors block py-0.5">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[#E10600] transition-colors block py-0.5">
                    About Our Craft
                  </Link>
                </li>
                <li className="pt-1">
                  <span className="inline-flex items-center gap-1.5 text-[#059669] font-medium text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Everlasting Beauty</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar with assurances & copyright */}
        <div className="pt-8 mt-8 border-t border-[#EFEAE2] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-[#888]">
          <p>© {new Date().getFullYear()} HAPPIWRAPZ. All rights reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#777]">
            <Link href="/terms" className="hover:text-[#E10600] transition-colors">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[#E10600] transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <span>Handcrafted Ribbon Floristry</span>
            <span>•</span>
            <span>Coimbatore, Tamil Nadu, India</span>
            <span>•</span>
            <a href="https://www.instagram.com/happiwrapz/" target="_blank" rel="noopener noreferrer" className="hover:text-[#E10600]">
              Instagram: @happiwrapz
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
