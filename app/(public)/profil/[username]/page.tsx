import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ArticleCardView, ArticleGrid } from "@/components/news/article-card"
import { AuthDialog } from "@/components/auth/auth-form"
import { UserAvatar } from "@/components/news/user-bits"
import { FollowButton } from "@/components/profile/follow-button"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/auth"
import { formatDate, formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import { articleService } from "@/services/article.service"
import { socialService } from "@/services/social.service"
import { userService } from "@/services/user.service"
import { BadgeCheckIcon } from "lucide-react"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const clean = decodeURIComponent(username).replace(/^@/, "")
  const profile = await userService.getByUsername(clean)
  return { title: profile ? `${profile.fullName} (@${profile.username})` : "Profil" }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const clean = decodeURIComponent(username).replace(/^@/, "")
  const profile = await userService.getByUsername(clean)
  if (!profile) notFound()

  const viewer = await getCurrentUser()
  const isSelf = viewer?.id === profile.id
  const [articles, reposts, comments, following] = await Promise.all([
    articleService.listByAuthor(profile.id, isSelf),
    userService.listReposts(profile.id),
    userService.listComments(profile.id),
    viewer && !isSelf ? socialService.isFollowing(viewer.id, profile.id) : Promise.resolve(false),
  ])

  const drafts = articles.filter((a) => a.status === "DRAFT")
  const live = articles.filter((a) => a.status === "PUBLISHED")

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <header className="flex flex-col items-start gap-4 rounded-2xl bg-slate-100 p-4 sm:flex-row sm:items-center sm:rounded-3xl sm:p-6 dark:bg-muted">
        <UserAvatar user={profile} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="font-heading flex flex-wrap items-center gap-2 text-xl font-extrabold sm:text-2xl">
            <span className="break-words">{profile.fullName}</span>
            {profile.role !== "USER" && (
              <Badge className={profile.role === "ADMIN" ? "bg-blue-600 text-white" : "bg-amber-600 text-white"}>
                {profile.role === "ADMIN" ? "SUPER ADMIN" : "MODERATOR"}
              </Badge>
            )}
            {profile.isVerified && <BadgeCheckIcon className="size-5 shrink-0 text-emerald-600" aria-label="Verified Contributor" />}
          </h1>
          <p className="text-xs text-slate-600 sm:text-sm dark:text-slate-400">@{profile.username} · bergabung {formatDate(profile.createdAt)}</p>
          {profile.bio && <p className="mt-1 text-sm break-words whitespace-pre-wrap">{profile.bio}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm">
            <span><strong>{profile._count.articles}</strong> berita</span>
            <span><strong>{profile._count.followers}</strong> pengikut</span>
            <span><strong>{profile._count.following}</strong> mengikuti</span>
            <Badge variant="outline" className="border-blue-500/30 bg-blue-50/50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300">
              Skor Kepercayaan: {profile.trustScore}
            </Badge>
            {profile.isVerified ? (
              <Badge className="bg-emerald-600 text-white">
                <BadgeCheckIcon className="mr-1 size-3.5" />
                Verified Contributor
              </Badge>
            ) : (
              <span className="text-xs text-slate-500">
                (Perlu {Math.max(0, 50 - profile.trustScore)} poin lagi untuk Verified Contributor)
              </span>
            )}
          </div>
        </div>
        {isSelf ? (
          <Link href="/pengaturan" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full sm:w-auto")}>
            Edit profil
          </Link>
        ) : viewer ? (
          <FollowButton targetId={profile.id} username={profile.username} following={following} />
        ) : (
          <AuthDialog
            initialMode="masuk"
            next={`/@${profile.username}`}
            label="Ikuti"
            size="sm"
            className="w-full sm:w-auto"
          />
        )}
      </header>

      <Tabs defaultValue={profile.role === "USER" ? "berita" : "repost"}>
        <TabsList>
          {profile.role === "USER" && <TabsTrigger value="berita">Berita</TabsTrigger>}
          <TabsTrigger value="repost">Repost &amp; Opini</TabsTrigger>
          <TabsTrigger value="komentar">Komentar</TabsTrigger>
        </TabsList>

        {profile.role === "USER" && (
          <TabsContent value="berita" className="flex flex-col gap-8 pt-4">
            {isSelf && drafts.length > 0 && (
              <section aria-labelledby="draft">
                <h2 id="draft" className="mb-3 text-sm font-bold tracking-wide uppercase">Draft</h2>
                <ul className="flex flex-col gap-2">
                  {drafts.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-100 px-4 py-3 text-sm dark:bg-muted">
                      <span className="truncate">{d.title}</span>
                      <Link href={`/edit/${d.id}`} className="font-medium text-blue-600 hover:underline">Lanjutkan</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <ArticleGrid articles={live} empty="Belum ada berita." />
          </TabsContent>
        )}

        <TabsContent value="repost" className="pt-4">
          {reposts.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">Belum ada repost.</p>
          ) : (
            <ul className="flex flex-col gap-8">
              {reposts.map((r) => (
                <li key={r.id} className="flex flex-col gap-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {profile.fullName} me-repost · {formatDateTime(r.createdAt)}
                  </p>
                  {r.quoteText && <blockquote className="border-l-4 border-emerald-600 pl-4 text-sm whitespace-pre-wrap">{r.quoteText}</blockquote>}
                  <div className="max-w-md">
                    <ArticleCardView article={r.article} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="komentar" className="pt-4">
          {comments.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">Belum ada komentar.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {comments.map((c) => (
                <li key={c.id} className="rounded-xl bg-slate-100 p-4 text-sm dark:bg-muted">
                  <p className="whitespace-pre-wrap">{c.content}</p>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    pada <Link href={`/berita/${c.article.slug}`} className="font-medium hover:underline">{c.article.title}</Link> · {formatDateTime(c.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
