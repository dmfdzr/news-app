import Link from "next/link"

import { ArticleMeta } from "@/components/news/article-card"
import { DriveImage } from "@/components/news/drive-image"
import type { ArticleCard } from "@/services/article.service"

type Props = {
  main?: ArticleCard
  middle?: ArticleCard
  right: ArticleCard[]
}

export function HeroBentoGrid({ main, middle, right }: Props) {
  if (!main && !middle && right.length === 0) return null

  return (
    <section aria-label="Headline" className="rounded-2xl bg-slate-100 p-4 sm:rounded-3xl sm:p-6 lg:p-8 dark:bg-muted">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {main && (
          <article className="md:col-span-7 xl:col-span-5">
            <Link href={`/berita/${main.slug}`} className="block overflow-hidden rounded-2xl">
              <DriveImage driveId={main.thumbnailDriveId} alt={main.title} priority className="aspect-[4/3] w-full rounded-2xl" />
            </Link>
            <h2 className="font-heading mt-3 text-xl leading-tight font-bold sm:mt-4 sm:text-2xl lg:text-3xl">
              <Link href={`/berita/${main.slug}`} className="hover:underline">
                {main.title}
              </Link>
            </h2>
            <div className="mt-2.5 sm:mt-3">
              <ArticleMeta article={main} />
            </div>
          </article>
        )}

        {middle && (
          <article className="md:col-span-5 xl:col-span-4">
            <Link href={`/berita/${middle.slug}`} className="block overflow-hidden rounded-2xl">
              <DriveImage driveId={middle.thumbnailDriveId} alt={middle.title} priority className="aspect-[16/10] w-full rounded-2xl" />
            </Link>
            <h2 className="font-heading mt-3 text-lg font-bold sm:mt-4 sm:text-xl">
              <Link href={`/berita/${middle.slug}`} className="hover:underline">
                {middle.title}
              </Link>
            </h2>
            {middle.excerpt && <p className="mt-2 line-clamp-4 text-sm text-slate-600 dark:text-slate-400">{middle.excerpt}</p>}
          </article>
        )}

        {right.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-12 lg:grid-cols-3 xl:col-span-3 xl:flex xl:flex-col xl:justify-between">
            {right.map((a) => (
              <article key={a.id} className="flex items-center gap-3.5 sm:gap-4">
                <Link href={`/berita/${a.slug}`} className="shrink-0">
                  <DriveImage driveId={a.thumbnailDriveId} alt={a.title} className="size-20 rounded-xl 2xl:size-24" />
                </Link>
                <h3 className="min-w-0 text-sm font-semibold">
                  <Link href={`/berita/${a.slug}`} className="line-clamp-3 hover:underline">
                    {a.title}
                  </Link>
                </h3>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
