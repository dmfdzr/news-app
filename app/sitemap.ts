import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/env"
import { articleService } from "@/services/article.service"
import { categoryService } from "@/services/category.service"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl().origin

  const [categories, articlesResult] = await Promise.all([
    categoryService.list(),
    articleService.listPublished({ page: 1 }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/cari`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/kategori/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }))

  const articleRoutes: MetadataRoute.Sitemap = articlesResult.items.map((a) => ({
    url: `${siteUrl}/berita/${a.slug}`,
    lastModified: a.publishedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes]
}
