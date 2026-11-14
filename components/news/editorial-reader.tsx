import Link from "next/link"

import { DriveImage } from "@/components/news/drive-image"
import { UserAvatar, UserLink } from "@/components/news/user-bits"
import { CommunityNoteSection } from "@/components/social/community-note-section"
import { Badge } from "@/components/ui/badge"
import { formatDate, readingTimeMinutes } from "@/lib/format"
import { sanitizeHtml } from "@/lib/sanitize"
import type { articleService } from "@/services/article.service"
import { ClockIcon, ExternalLinkIcon, EyeIcon, ShieldCheckIcon } from "lucide-react"

type Article = NonNullable<Awaited<ReturnType<typeof articleService.getBySlug>>>

export function EditorialReader({
  article,
  viewer,
  showHeaderLabel = true,
}: {
  article: Article
  viewer?: {
    id: string
    username: string
    fullName: string
    trustScore: number
    isVerified: boolean
    isStaff: boolean
  } | null
  showHeaderLabel?: boolean
}) {
  return (
    <article className="flex flex-col gap-5 sm:gap-6">
      {showHeaderLabel && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <span className="font-heading text-xs font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
            TULISAN BERITA
          </span>
          <span className="text-xs text-slate-500">Editorial &amp; Citizen Journalism</span>
        </div>
      )}

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" render={<Link href={`/kategori/${article.category.slug}`} />}>
            {article.category.name}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <ShieldCheckIcon className="size-3 text-emerald-600" />
            {article.type === "CITIZEN_REPORT" ? "Laporan Langsung" : "Saduran / Opini"}
          </Badge>
          {article.status === "DRAFT" && <Badge variant="destructive">Draft</Badge>}
        </div>
        <h1 className="font-heading text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl lg:text-4xl">{article.title}</h1>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <UserAvatar user={article.author} />
            <div className="flex min-w-0 flex-col">
              <UserLink user={article.author} />
              {article.publishedAt && <time dateTime={article.publishedAt.toISOString()}>{formatDate(article.publishedAt)}</time>}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-muted">
              <ClockIcon className="size-3.5 text-emerald-600" />
              ~{readingTimeMinutes(article.content)} menit baca
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-muted">
              <EyeIcon className="size-3.5 text-blue-600" />
              {(article.viewCount ?? 0).toLocaleString("id-ID")} tayangan
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <figure className="lg:sticky lg:top-24 lg:col-span-5">
          <DriveImage
            driveId={article.thumbnailDriveId}
            alt={article.imageCaption ?? article.title}
            priority
            className="aspect-[4/3] w-full rounded-2xl"
          />
          {article.imageCaption && (
            <figcaption className="mt-2 text-xs text-slate-600 dark:text-slate-400">{article.imageCaption}</figcaption>
          )}
        </figure>

        <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
          {article.excerpt && <p className="text-base font-medium text-slate-700 sm:text-lg dark:text-slate-300">{article.excerpt}</p>}
          {article.keyTakeaways.length > 0 && (
            <section aria-labelledby="takeaways" className="rounded-2xl bg-slate-100 p-4 sm:p-5 dark:bg-muted">
              <h2 id="takeaways" className="font-heading mb-2 text-sm font-bold tracking-wide uppercase">
                3 Poin Inti Berita (TL;DR)
              </h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm">
                {article.keyTakeaways.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </section>
          )}

          {article.communityNotes && article.communityNotes.length > 0 && (
            <CommunityNoteSection
              articleId={article.id}
              slug={article.slug}
              notes={article.communityNotes}
              viewer={viewer ?? null}
            />
          )}

          {article.sourceUrl && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-600 dark:border-white/10 dark:bg-muted/50 dark:text-slate-400">
              <span className="font-semibold text-foreground">Sumber Rujukan Terverifikasi: </span>
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 break-all text-blue-600 hover:underline"
              >
                {article.sourceUrl} <ExternalLinkIcon className="size-3 shrink-0" />
              </a>
            </div>
          )}
        </div>
      </div>

      <div
        className="prose prose-sm sm:prose-base prose-slate dark:prose-invert mt-2 max-w-none overflow-x-hidden break-words sm:mt-4"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
      />

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <span className="text-xs text-slate-500 font-medium">Tag:</span>
          {article.tags.map((tag) => (
            <Link
              key={tag}
              href={`/cari?q=${encodeURIComponent(tag)}`}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-muted dark:text-slate-300"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {article.communityNotes && article.communityNotes.length === 0 && viewer && (
        <div className="pt-2">
          <CommunityNoteSection
            articleId={article.id}
            slug={article.slug}
            notes={[]}
            viewer={viewer}
          />
        </div>
      )}
    </article>
  )
}
