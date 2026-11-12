"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AppNotification } from "@/services/notification.service"
import {
  BellIcon,
  HeartIcon,
  MessageCircleIcon,
  Repeat2Icon,
  ShieldAlertIcon,
  UserPlusIcon,
} from "lucide-react"

function NotificationIcon({ type }: { type: AppNotification["type"] }) {
  switch (type) {
    case "REPOST":
      return <Repeat2Icon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
    case "LIKE":
      return <HeartIcon className="mt-0.5 size-4 shrink-0 text-rose-500 fill-rose-500/20" />
    case "COMMENT":
      return <MessageCircleIcon className="mt-0.5 size-4 shrink-0 text-blue-500" />
    case "FOLLOW":
      return <UserPlusIcon className="mt-0.5 size-4 shrink-0 text-indigo-500" />
    case "NOTE":
      return <ShieldAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
  }
}

export function NotificationsMenu({
  notifications = [],
}: {
  notifications?: AppNotification[]
}) {
  const [seen, setSeen] = useState(false)
  const unreadCount = seen ? 0 : notifications.length

  return (
    <DropdownMenu onOpenChange={(open) => open && setSeen(true)}>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Notifikasi" className="relative">
            <BellIcon className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-heading flex items-center justify-between text-xs font-bold tracking-wider uppercase text-slate-500">
          <span>Notifikasi</span>
          <span className="text-[10px] font-normal text-blue-600">
            {notifications.length} Total
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Belum ada notifikasi baru.
          </div>
        ) : (
          notifications.slice(0, 5).map((item) => (
            <DropdownMenuItem
              key={item.id}
              render={<Link href={item.href} />}
              className="flex items-start gap-3 py-2.5"
            >
              <NotificationIcon type={item.type} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="line-clamp-2 text-xs leading-snug">
                  <strong className="text-foreground">{item.actor.fullName}</strong> {item.text}
                </p>
                {item.article && (
                  <span className="truncate text-[11px] text-muted-foreground italic">
                    {item.article.title}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link
              href="/notifikasi"
              className="w-full justify-center text-center text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            />
          }
        >
          Lihat Semua Notifikasi →
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
