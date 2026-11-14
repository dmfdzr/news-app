"use client"

import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"

import { toggleBookmarkAction, toggleLikeAction } from "@/actions/social.actions"
import { AuthDialog } from "@/components/auth/auth-form"
import { ReportDialog } from "@/components/social/report-dialog"
import { RepostMenu } from "@/components/social/repost-modal"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { BookmarkIcon, CheckIcon, HeartIcon, LinkIcon, MessageCircleIcon, Share2Icon } from "lucide-react"

function ShareMenu({ slug }: { slug: string }) {
  function getArticleUrl() {
    if (typeof window === "undefined") return `/berita/${slug}`
    return `${window.location.origin}/berita/${slug}`
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getArticleUrl())
      toast.success("Tautan berita berhasil disalin!")
    } catch {
      toast.error("Gagal menyalin tautan.")
    }
  }

  function shareWhatsApp() {
    const url = encodeURIComponent(getArticleUrl())
    window.open(`https://wa.me/?text=${url}`, "_blank", "noopener,noreferrer")
  }

  function shareX() {
    const url = encodeURIComponent(getArticleUrl())
    window.open(`https://twitter.com/intent/tweet?url=${url}`, "_blank", "noopener,noreferrer")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" aria-label="Bagikan berita">
            <Share2Icon className="size-3.5" />
            <span className="hidden sm:inline">Bagikan</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem onClick={copyLink}>
          <LinkIcon className="size-3.5" /> Salin tautan berita
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareWhatsApp}>
          <CheckIcon className="size-3.5 text-emerald-600" /> Bagikan ke WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareX}>
          <Share2Icon className="size-3.5 text-sky-500" /> Bagikan ke X / Twitter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type Props = {
  articleId: string
  slug: string
  isAuthor: boolean
  signedIn: boolean
  counts: { likes: number; reposts: number; comments: number }
  state: { liked: boolean; bookmarked: boolean; reposted: boolean; quoteText: string | null }
}

export function ActionBar({ articleId, slug, isAuthor, signedIn, counts, state }: Props) {
  const [pending, startTransition] = useTransition()
  const [optimistic, setOptimistic] = useOptimistic(
    { liked: state.liked, likes: counts.likes, bookmarked: state.bookmarked },
    (current, action: "like" | "bookmark") =>
      action === "like"
        ? { ...current, liked: !current.liked, likes: current.likes + (current.liked ? -1 : 1) }
        : { ...current, bookmarked: !current.bookmarked }
  )

  function run(kind: "like" | "bookmark") {
    startTransition(async () => {
      setOptimistic(kind)
      const result = await (kind === "like" ? toggleLikeAction(articleId, slug) : toggleBookmarkAction(articleId, slug))
      if (result?.error) toast.error(result.error)
    })
  }

  if (!signedIn) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 border-y py-3 text-xs sm:gap-3 sm:text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span>{counts.likes} suka</span>
          <span>{counts.reposts} repost</span>
          <span>{counts.comments} komentar</span>
        </div>
        <div className="flex items-center gap-2">
          <ShareMenu slug={slug} />
          <AuthDialog
            initialMode="masuk"
            next={`/berita/${slug}`}
            label="Masuk untuk berinteraksi"
            variant="outline"
            size="xs"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-y py-3">
      <Button
        variant={optimistic.liked ? "default" : "outline"}
        size="sm"
        disabled={pending}
        aria-pressed={optimistic.liked}
        onClick={() => run("like")}
      >
        <HeartIcon className={cn(optimistic.liked && "fill-current")} /> {optimistic.likes}
      </Button>
      <RepostMenu
        articleId={articleId}
        slug={slug}
        isAuthor={isAuthor}
        reposted={state.reposted}
        quoteText={state.quoteText}
        count={counts.reposts}
      />
      <a href="#komentar" className="inline-flex h-8 items-center gap-1.5 rounded-4xl border px-3 text-sm font-medium hover:bg-accent">
        <MessageCircleIcon className="size-4" /> {counts.comments}
      </a>
      <ShareMenu slug={slug} />
      <ReportDialog articleId={articleId} />
      <Button
        variant={optimistic.bookmarked ? "default" : "outline"}
        size="sm"
        className="ml-auto"
        disabled={pending}
        aria-pressed={optimistic.bookmarked}
        onClick={() => run("bookmark")}
      >
        <BookmarkIcon className={cn(optimistic.bookmarked && "fill-current")} />
        {optimistic.bookmarked ? "Tersimpan" : "Simpan"}
      </Button>
    </div>
  )
}
