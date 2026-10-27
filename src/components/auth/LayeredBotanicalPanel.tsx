import Image from "next/image";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";

export default function LayeredBotanicalPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-full h-full min-h-[640px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E1E1E] via-[#2A1012] to-[#E10600]/90 text-white p-10 md:p-14 shadow-2xl border border-[#EFEAE2]">
      {/* Background Organic Layered Waves & Curves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft atmospheric gradient orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#E10600]/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

        {/* Layered Organic Wave 1 */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 object-cover"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,1000 C300,800 400,600 500,700 C600,800 700,500 1000,400 L1000,1000 L0,1000 Z"
            fill="url(#wave-grad-1)"
          />
          <defs>
            <linearGradient id="wave-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#E10600" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Layered Organic Wave 2 */}
        <svg
          className="absolute inset-0 w-full h-full opacity-25 object-cover"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C200,200 400,100 600,300 C800,500 900,200 1000,300 L1000,0 L0,0 Z"
            fill="url(#wave-grad-2)"
          />
          <defs>
            <linearGradient id="wave-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E1E1E" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#E10600" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top Header inside Panel */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-serif tracking-widest uppercase text-white">
          <RibbonEmblem className="w-3.5 h-3.5 text-[#E10600]" />
          Atelier de Fleurs
        </span>
        <span className="text-xs font-serif uppercase tracking-wider text-white/80">Bangalore Studio</span>
      </div>

      {/* Centerpiece Image Card with Layered Framing */}
      <div className="relative z-10 my-auto py-8">
        <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black/40 backdrop-blur-sm group">
          <Image
            src="/images/auth/botanical-art.jpg"
            alt="Handcrafted Luxury Roses"
            fill
            sizes="300px"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <span className="text-[10px] font-serif font-bold tracking-widest text-[#E10600] uppercase">
              Signature Collection
            </span>
            <p className="font-serif text-base text-white font-medium mt-0.5">
              Glitter Luxury Roses in Matte Wrap
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Editorial Quote */}
      <div className="relative z-10 space-y-2">
        <blockquote className="font-serif text-lg sm:text-xl font-normal leading-relaxed text-white italic">
          “Every celebration begins with a gesture wrapped in thoughtfulness.”
        </blockquote>
        <p className="text-xs font-serif uppercase tracking-wider text-white/70">
          Happiwrapz Artisanal Floral Atelier
        </p>
      </div>
    </div>
  );
}
