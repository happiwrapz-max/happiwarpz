import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Happiwrapz — Handcrafted Ribbon Flowers & Luxury Gifts",
    short_name: "Happiwrapz",
    description:
      "Artisanal satin ribbon roses & golden sunflowers, glitter keepsake flowers, and luxury gift hampers in Coimbatore, Tamil Nadu.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#E10600",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
