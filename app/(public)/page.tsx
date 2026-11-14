import { Suspense } from "react"
import Link from "next/link"

import { ArticleGrid } from "@/components/news/article-card"
import { ReadingProgress } from "@/components/news/back-button"
import { EditorialReader } from "@/components/news/editorial-reader"
import { HeroBentoGrid } from "@/components/news/hero-bento-grid"
import { HomeSkeleton } from "@/components/news/home-skeleton"
import { ActionBar } from "@/components/social/action-bar"
import { getCurrentUser } from "@/lib/auth"
import { articleService } from "@/services/article.service"
import { socialService } from "@/services/social.service"
import { FlameIcon } from "lucide-react"

export const dynamic = "force-dynamic"

const DEFAULT_TAGS = ["iklim", "lingkungan", "energi", "nasional", "teknologi", "ekonomi"]

async function Home() {
  const [{ main, middle, right, more }, user] = await Promise.all([
    articleService.getHome(),
    getCurrentUser(),
  ])

  const [featured, state] = await Promise.all([
    main ? articleService.getBySlug(main.slug) : Promise.resolve(null),
    user && main
      ? socialService.getViewerState(user.id, main.id)
      : Promise.resolve({ liked: false, bookmarked: false, reposted: false, quoteText: null }),
  ])

  const empty = !main && !middle && right.length === 0
  const isAuthor = user && featured ? user.id === featured.authorId : false
  const isStaff = user ? user.role === "ADMIN" || user.role === "MODERATOR" : false

  const tagCounts = new Map<string, number>()
  for (const a of [main, middle, ...right, ...more]) {
    if (!a?.tags) continue
    for (const t of a.tags) {
      const clean = t.trim().toLowerCase()
      if (clean) tagCounts.set(clean, (tagCounts.get(clean) ?? 0) + 1)
    }
  }
  const dynamicTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t)
  const trendingTags = Array.from(new Set([...dynamicTags, ...DEFAULT_TAGS])).slice(0, 8)

  return (
    <div className="flex flex-col gap-6 sm:gap-10">
      <ReadingProgress />

      {/* TRENDING TAGS BAR */}
      <nav
        aria-label="Topik populer"
        className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-xs dark:border-white/10 dark:bg-muted/40"
      >
        <span className="inline-flex shrink-0 items-center gap-1 font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
          <FlameIcon className="size-3.5" /> Topik Hangat:
        </span>
        {trendingTags.map((tag) => (
          <Link
            key={tag}
            href={`/cari?q=${encodeURIComponent(tag)}`}
            className="shrink-0 rounded-full bg-background px-3 py-1 font-medium text-slate-700 shadow-2xs ring-1 ring-slate-200/80 transition-colors hover:bg-emerald-600 hover:text-white dark:bg-card dark:text-slate-300 dark:ring-white/10 dark:hover:bg-emerald-600"
          >
            #{tag}
          </Link>
        ))}
      </nav>

      <HeroBentoGrid main={main} middle={middle} right={right} />

      {featured && (
        <section aria-label="Tulisan Berita Pilihan" className="flex flex-col gap-5 rounded-2xl bg-slate-50/70 p-4 sm:gap-6 sm:rounded-3xl sm:p-6 lg:p-8 dark:bg-muted/30">
          <EditorialReader
            article={featured}
            viewer={
              user
                ? {
                    id: user.id,
                    username: user.username,
                    fullName: user.fullName,
                    trustScore: user.trustScore,
                    isVerified: user.isVerified,
                    isStaff,
                  }
                : null
            }
          />
          <ActionBar
            articleId={featured.id}
            slug={featured.slug}
            isAuthor={isAuthor}
            signedIn={!!user}
            counts={featured._count}
            state={state}
          />
        </section>
      )}

      <section aria-labelledby="terbaru">
        <h2 id="terbaru" className="font-heading mb-4 text-xl font-extrabold tracking-tight sm:mb-6 sm:text-2xl lg:text-3xl">
          Berita Terbaru Lainnya
        </h2>
        <ArticleGrid
          articles={more}
          empty={empty ? "Belum ada berita. Jadilah yang pertama menulis!" : "Tidak ada berita lainnya."}
        />
      </section>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <Home />
    </Suspense>
  )
}
