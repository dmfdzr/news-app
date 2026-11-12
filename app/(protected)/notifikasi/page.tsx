import type { Metadata } from "next"
import Link from "next/link"

import { UserAvatar, UserLink } from "@/components/news/user-bits"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { requireUser } from "@/lib/auth"
import { formatDateTime } from "@/lib/format"
import { notificationService, type AppNotification } from "@/services/notification.service"
import { BellIcon, HeartIcon, MessageCircleIcon, Repeat2Icon, ShieldAlertIcon, UserPlusIcon } from "lucide-react"

export const metadata: Metadata = { title: "Notifikasi" }
export const dynamic = "force-dynamic"

function NotificationIcon({ type }: { type: AppNotification["type"] }) {
  switch (type) {
    case "REPOST":
      return <Repeat2Icon className="size-4 text-emerald-600" />
    case "LIKE":
      return <HeartIcon className="size-4 text-rose-500 fill-rose-500/20" />
    case "COMMENT":
      return <MessageCircleIcon className="size-4 text-blue-500" />
    case "FOLLOW":
      return <UserPlusIcon className="size-4 text-indigo-500" />
    case "NOTE":
      return <ShieldAlertIcon className="size-4 text-amber-500" />
  }
}

function NotificationRow({ item }: { item: AppNotification }) {
  return (
    <li className="flex items-start gap-4 rounded-2xl border border-slate-200/70 bg-card p-4 transition-all hover:border-slate-300 hover:shadow-xs dark:border-white/10 dark:hover:border-white/20">
      <div className="relative shrink-0">
        <UserAvatar user={item.actor} size="default" />
        <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-background shadow-xs ring-1 ring-border">
          <NotificationIcon type={item.type} />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-1.5 text-sm">
          <UserLink user={item.actor} />
          <span className="text-muted-foreground">{item.text}</span>
          {item.article && (
            <Link href={item.href} className="font-semibold text-foreground hover:underline">
              &quot;{item.article.title}&quot;
            </Link>
          )}
        </div>

        <time className="mt-1 block text-xs text-slate-500" dateTime={item.createdAt.toISOString()}>
          {formatDateTime(item.createdAt)}
        </time>
      </div>

      <Link
        href={item.href}
        className="shrink-0 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-muted dark:text-slate-300 dark:hover:bg-muted/80"
      >
        Lihat
      </Link>
    </li>
  )
}

function NotificationList({ items, empty }: { items: AppNotification[]; empty: string }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center text-sm text-slate-500">
        <BellIcon className="mb-2 size-8 text-slate-300 dark:text-slate-600" />
        <p>{empty}</p>
      </div>
    )
  }
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <NotificationRow key={item.id} item={item} />
      ))}
    </ul>
  )
}

export default async function NotificationsPage() {
  const user = await requireUser()
  const allNotifs = await notificationService.list(user.id)

  const reposts = allNotifs.filter((n) => n.type === "REPOST")
  const likes = allNotifs.filter((n) => n.type === "LIKE")
  const comments = allNotifs.filter((n) => n.type === "COMMENT")
  const notes = allNotifs.filter((n) => n.type === "NOTE")

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">Notifikasi</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Aktivitas interaksi pembaca terhadap berita, opini, dan komentar Anda.
          </p>
        </div>
        <Badge variant="outline" className="h-7 px-3 text-xs">
          {allNotifs.length} Aktivitas
        </Badge>
      </header>

      <Tabs defaultValue="semua">
        <TabsList className="mb-4">
          <TabsTrigger value="semua">Semua ({allNotifs.length})</TabsTrigger>
          <TabsTrigger value="repost">Repost ({reposts.length})</TabsTrigger>
          <TabsTrigger value="suka">Suka ({likes.length})</TabsTrigger>
          <TabsTrigger value="komentar">Komentar ({comments.length})</TabsTrigger>
          <TabsTrigger value="catatan">Catatan Komunitas ({notes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="semua">
          <NotificationList items={allNotifs} empty="Belum ada notifikasi baru untuk Anda." />
        </TabsContent>
        <TabsContent value="repost">
          <NotificationList items={reposts} empty="Belum ada yang me-repost tulisan Anda." />
        </TabsContent>
        <TabsContent value="suka">
          <NotificationList items={likes} empty="Belum ada yang menyukai tulisan Anda." />
        </TabsContent>
        <TabsContent value="komentar">
          <NotificationList items={comments} empty="Belum ada komentar baru pada tulisan Anda." />
        </TabsContent>
        <TabsContent value="catatan">
          <NotificationList items={notes} empty="Belum ada catatan komunitas yang diajukan." />
        </TabsContent>
      </Tabs>
    </div>
  )
}
