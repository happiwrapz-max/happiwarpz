import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://happiwrapz.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/dashboard",
          "/dashboard/*",
          "/api/*",
          "/order/confirmation",
          "/login",
          "/signup",
          "/forgot-password",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/images/*", "/_next/image*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
