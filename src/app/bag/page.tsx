"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBagStore } from "@/lib/store/useBagStore";

export default function BagPage() {
  const router = useRouter();
  const openDrawer = useBagStore((s) => s.openDrawer);

  useEffect(() => {
    // Open in-place cart drawer and return to homepage
    openDrawer();
    router.replace("/");
  }, [openDrawer, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-[#1E1E1E] font-serif text-sm">
      Opening Order Cart...
    </div>
  );
}
