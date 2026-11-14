import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { after } from "next/server"
import { Suspense } from "react"

import { ArticleGrid } from "@/components/news/article-card"
import { EditorialReader } from "@/components/news/editorial-reader"
import { BackButton, ReadingProgress } from "@/components/news/back-button"
import { ActionBar } from "@/components/social/action-bar"
import { DiscussionTabs } from "@/components/social/discussion-tabs"
import { buttonVariants } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { stripHtml } from "@/lib/format"
import { mediaUrl } from "@/lib/media"
import { cn } from "@/lib/utils"
import { articleService } from "@/services/article.service"
import { socialService } from "@/services/social.service"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await articleService.getBySlug(slug)
  if (!article || article.status !== "PUBLISHED") return { title: "Berita tidak ditemukan" }

  const description = article.excerpt ?? stripHtml(article.content).slice(0, 160)
  const image = mediaUrl(article.thumbnailDriveId)
  return {
    title: article.title,
    description,
    openGraph: {
      type: "article",
      title: article.title,
      description,
      images: [image],
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author.fullName],
    },
    twitter: { card: "summary_large_image", title: article.title, description, images: [image] },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const [article, user] = await Promise.all([articleService.getBySlug(slug), getCurrentUser()])
  if (!article) notFound()

  const isAuthor = user?.id === article.authorId
  const isStaff = user?.role === "ADMIN" || user?.role === "MODERATOR"
  // Drafts are only visible to their author (and admins).
  if (article.status !== "PUBLISHED" && !isAuthor && user?.role !== "ADMIN") notFound()

  if (article.status === "PUBLISHED") after(() => articleService.incrementViews(article.id).catch(() => {}))

  const [state, relatedResult] = await Promise.all([
    user
      ? socialService.getViewerState(user.id, article.id)
      : Promise.resolve({ liked: false, bookmarked: false, reposted: false, quoteText: null }),
    articleService.listPublished({ categorySlug: article.category.slug, page: 1 }),
  ])

  const related = relatedResult.items.filter((a) => a.id !== article.id).slice(0, 4)

  return (
    <div className="flex w-full flex-col gap-6">
      <ReadingProgress />
      <div className="flex items-center justify-between">
        <BackButton />
        {(isAuthor || user?.role === "ADMIN") && (
          <Link href={`/edit/${article.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Edit berita
          </Link>
        )}
      </div>
      <EditorialReader
        article={article}
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
      {article.status === "PUBLISHED" && (
        <>
          <ActionBar
            articleId={article.id}
            slug={article.slug}
            isAuthor={isAuthor}
            signedIn={!!user}
            counts={article._count}
            state={state}
          />
          <Suspense fallback={<div className="mt-8 h-32 animate-pulse rounded-2xl bg-muted/40" />}>
            <DiscussionTabs
              articleId={article.id}
              slug={article.slug}
              viewer={user ? { id: user.id, isStaff } : null}
            />
          </Suspense>
          {related.length > 0 && (
            <section aria-labelledby="related-heading" className="mt-8 border-t pt-8">
              <h2 id="related-heading" className="font-heading mb-6 text-xl font-extrabold tracking-tight sm:text-2xl">
                Berita Terkait di Kanal {article.category.name}
              </h2>
              <ArticleGrid articles={related} />
            </section>
          )}
        </>
      )}
    </div>
  )
}
