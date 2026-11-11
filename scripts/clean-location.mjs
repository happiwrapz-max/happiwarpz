import fs from "fs";
import path from "path";

const files = [
  "src/app/catalog/page.tsx",
  "src/app/order/confirmation/page.tsx",
  "src/app/terms/page.tsx",
  "src/app/manifest.ts",
  "src/app/page.tsx",
  "src/components/auth/LayeredBotanicalPanel.tsx",
  "src/components/product/ProductInfo.tsx",
  "src/components/bag/BagDrawer.tsx",
  "src/components/bag/OrderRequestForm.tsx",
  "src/app/dashboard/addresses/page.tsx",
  "src/app/admin/occasions/page.tsx",
  "src/app/admin/orders/page.tsx",
  "src/app/admin/products/[id]/page.tsx",
  "src/app/admin/customers/page.tsx"
];

const basePath = "D:/New folder/happiwrapz";

for (const rel of files) {
  const p = path.join(basePath, rel);
  if (!fs.existsSync(p)) continue;
  let text = fs.readFileSync(p, "utf-8");
  let orig = text;

  text = text.replace(/Handcrafted in Bangalore/g, "Handcrafted in Coimbatore");
  text = text.replace(/same-day Bangalore hand delivery/g, "same-day Coimbatore delivery");
  text = text.replace(/Bangalore delivery runs/g, "Coimbatore delivery runs");
  text = text.replace(/Bangalore delivery/g, "Coimbatore delivery");
  text = text.replace(/Bangalore Delivery/g, "Coimbatore Delivery");
  text = text.replace(/Bangalore Courier Delivery/g, "Coimbatore Delivery");
  text = text.replace(/Bangalore Express:/g, "Coimbatore Express:");
  text = text.replace(/Bangalore Studio/g, "Coimbatore Studio");
  text = text.replace(/useState\("Bangalore"\)/g, 'useState("Coimbatore")');
  text = text.replace(/value="Bangalore"/g, 'value="Coimbatore"');
  text = text.replace(/hampers in Bangalore\./g, "hampers in Coimbatore, Tamil Nadu.");
  text = text.replace(/hampers in Bangalore/g, "hampers in Coimbatore");
  text = text.replace(/Hand Delivery in Bangalore/g, "Hand Delivery in Coimbatore");
  text = text.replace(/We provide white-glove hand delivery across all Bangalore pin codes \(including Koramangala, Indiranagar, Whitefield, HSR Layout, and Jayanagar\)\./g, "We provide hand delivery across all Coimbatore areas and express dispatch across Tamil Nadu and pan-India.");

  if (text !== orig) {
    fs.writeFileSync(p, text, "utf-8");
    console.log(`Updated location in: ${rel}`);
  }
}

