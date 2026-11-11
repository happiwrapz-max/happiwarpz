import fs from "fs";
import path from "path";

const filesToClean = [
  "src/app/admin/content/page.tsx",
  "src/app/admin/custom-orders/[id]/page.tsx",
  "src/app/admin/custom-orders/page.tsx",
  "src/app/admin/inventory/page.tsx",
  "src/app/admin/orders/[id]/page.tsx",
  "src/app/admin/products/new/page.tsx",
  "src/app/admin/products/page.tsx",
  "src/app/admin/settings/page.tsx",
  "src/app/admin/team/page.tsx",
  "src/app/admin/page.tsx",
  "src/app/api/auth/forgot-password/route.ts",
  "src/app/catalog/page.tsx",
  "src/app/dashboard/layout.tsx",
  "src/app/login/page.tsx",
  "src/app/order/confirmation/page.tsx",
  "src/app/order/lookup/page.tsx",
  "src/app/privacy/page.tsx",
  "src/app/product/[slug]/page.tsx",
  "src/app/signup/page.tsx",
  "src/app/terms/page.tsx",
  "src/app/page.tsx",
  "src/components/auth/BotanicalAuthCard.tsx",
  "src/components/auth/LayeredBotanicalPanel.tsx",
  "src/components/home/AboutSection.tsx",
  "src/components/product/ProductGallery.tsx",
  "src/components/product/ProductInfo.tsx",
  "src/lib/server/db.ts",
  "src/lib/server/seedData.ts"
];

const basePath = "D:/New folder/happiwrapz";

let totalChanges = 0;

for (const relPath of filesToClean) {
  const fullPath = path.join(basePath, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping non-existent: ${relPath}`);
    continue;
  }
  let content = fs.readFileSync(fullPath, "utf-8");
  let original = content;

  // Specific high-priority replacements
  content = content.replace(/Atelier Email/g, "Store Email");
  content = content.replace(/atelier email/gi, "store email");
  content = content.replace(/Standard Atelier Wrap/g, "Standard Signature Wrap");
  content = content.replace(/Bespoke Atelier Commissions/g, "Bespoke Custom Commissions");
  content = content.replace(/Fresh Handcrafted Atelier Restock/g, "Fresh Handcrafted Restock");
  content = content.replace(/Free Atelier Dispatch/g, "Free Signature Dispatch");
  content = content.replace(/Internal Atelier Notes/g, "Internal Notes");
  content = content.replace(/Add New Atelier Creation/g, "Add New Creation");
  content = content.replace(/Products & Atelier Creations/g, "Products & Custom Creations");
  content = content.replace(/the atelier is preparing/g, "the studio is preparing");
  content = content.replace(/Atelier Executive Dashboard/g, "Executive Dashboard");
  content = content.replace(/Top Atelier Creation/g, "Top Creation");
  content = content.replace(/Happiwrapz Atelier/g, "Happiwrapz");
  content = content.replace(/CINEMATIC LUXURY FLORAL ATELIER COLLECTION HERO/g, "CINEMATIC LUXURY FLORAL COLLECTION HERO");
  content = content.replace(/natural atelier wall/g, "natural floral wall");
  content = content.replace(/Panoramic Cinematic Atelier Background/g, "Panoramic Cinematic Collection Background");
  content = content.replace(/Luxury Parisian floral atelier with crimson roses/g, "Luxury floral studio with crimson roses");
  content = content.replace(/Happiwrapz Atelier Archive/g, "Happiwrapz Signature Collection");
  content = content.replace(/Switch to atelier management portal\./g, "Switch to store management portal.");
  content = content.replace(/Go to Atelier Admin/g, "Go to Admin Dashboard");
  content = content.replace(/Client Portal & Atelier Sign In - Happiwrapz/g, "Client Portal & Sign In - Happiwrapz");
  content = content.replace(/Happiwrapz atelier owner/g, "Happiwrapz team");
  content = content.replace(/Bangalore atelier/g, "studio in Coimbatore, Tamil Nadu, India");
  content = content.replace(/real-time atelier progress/g, "real-time order progress");
  content = content.replace(/our atelier concierge/g, "our concierge");
  content = content.replace(/Happiwrapz Floral Atelier Bangalore/g, "Happiwrapz, Coimbatore, Tamil Nadu, India");
  content = content.replace(/VERIFIED ATELIER EXPERIENCES/g, "VERIFIED CUSTOMER EXPERIENCES");
  content = content.replace(/THE HAPPIWRAPZ ATELIER STANDARD/g, "THE HAPPIWRAPZ QUALITY STANDARD");
  content = content.replace(/Atelier Registry & Membership - Happiwrapz/g, "Account Registry & Membership - Happiwrapz");
  content = content.replace(/floral atelier circle/g, "Happiwrapz circle");
  content = content.replace(/Gift Wrapping Atelier/g, "Gift Wrapping Studio");
  content = content.replace(/Reach our atelier desk directly/g, "Reach our concierge desk directly");
  content = content.replace(/ABOUT ATELIER SECTION/g, "ABOUT SECTION");
  content = content.replace(/Happiwrapz Botanical Atelier and Satin Ribbons/g, "Happiwrapz Botanical Studio and Satin Ribbons");
  content = content.replace(/Handcrafted Atelier/g, "Handcrafted Studio");
  content = content.replace(/Atelier de Fleurs/g, "Studio de Fleurs");
  content = content.replace(/Happiwrapz Artisanal Floral Atelier in Bangalore/g, "Happiwrapz Floral Studio in Coimbatore, Tamil Nadu, India");
  content = content.replace(/Happiwrapz Artisanal Floral Atelier/g, "Happiwrapz Artisanal Floral Studio");
  content = content.replace(/Signature Atelier/g, "Signature Collection");
  content = content.replace(/\{ id: "atelier", label: "Atelier \(50 Roses\)", subtitle: "Ultra Luxury", priceDelta: 2600 \}/g, '{ id: "luxe", label: "Grand Luxe (50 Roses)", subtitle: "Ultra Luxury", priceDelta: 2600 }');
  content = content.replace(/Our atelier artist will pen this in gold calligraphy/g, "Our calligraphy artist will pen this in gold script");
  content = content.replace(/remaining in atelier inventory/g, "remaining in studio inventory");
  content = content.replace(/ATELIER10/g, "HAPPI10");

  // Catch any remaining standalone "atelier" or "altier" in strings or JSX
  content = content.replace(/\batelier\b/gi, (match) => {
    if (match === "Atelier") return "Studio";
    if (match === "ATELIER") return "STUDIO";
    return "studio";
  });
  content = content.replace(/\baltier\b/gi, (match) => {
    if (match === "Altier") return "Studio";
    if (match === "ALTIER") return "STUDIO";
    return "studio";
  });

  if (content !== original) {
    fs.writeFileSync(fullPath, content, "utf-8");
    console.log(`Updated: ${relPath}`);
    totalChanges++;
  }
}

console.log(`Finished. Updated ${totalChanges} files.`);

