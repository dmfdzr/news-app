import { Suspense } from "react"

import { ArticleGrid } from "@/components/news/article-card"
import { EditorialReader } from "@/components/news/editorial-reader"
import { HeroBentoGrid } from "@/components/news/hero-bento-grid"
import { HomeSkeleton } from "@/components/news/home-skeleton"
import { ActionBar } from "@/components/social/action-bar"
import { getCurrentUser } from "@/lib/auth"
import { articleService } from "@/services/article.service"
import { socialService } from "@/services/social.service"

export const dynamic = "force-dynamic"

async function Home() {
  const [{ main, middle, right, more }, user] = await Promise.all([
    articleService.getHome(),
    getCurrentUser(),
  ])

  const featured = main ? await articleService.getBySlug(main.slug) : null
  const empty = !main && !middle && right.length === 0
  const isAuthor = user && featured ? user.id === featured.authorId : false
  const isStaff = user ? user.role === "ADMIN" || user.role === "MODERATOR" : false

  const state = user && featured
    ? await socialService.getViewerState(user.id, featured.id)
    : { liked: false, bookmarked: false, reposted: false, quoteText: null }

  return (
    <div className="flex flex-col gap-8 sm:gap-12">
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
