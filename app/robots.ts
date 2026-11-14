import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/env"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl().origin

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/pengaturan", "/tulis", "/edit/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
