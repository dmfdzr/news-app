import "server-only"

import { isLocalMode } from "@/lib/env"
import { localDb } from "@/lib/local-db"
import { prisma } from "@/lib/prisma"

export type NotificationType = "REPOST" | "LIKE" | "COMMENT" | "FOLLOW" | "NOTE"

export type AppNotification = {
  id: string
  type: NotificationType
  actor: {
    username: string
    fullName: string
    avatarDriveId: string | null
    isVerified: boolean
  }
  article?: {
    id: string
    title: string
    slug: string
  } | null
  text?: string | null
  createdAt: Date
  read: boolean
  href: string
}

export const notificationService = {
  async list(userId: string): Promise<AppNotification[]> {
    if (isLocalMode) {
      const myArticles = localDb.getArticles().filter((a) => a.authorId === userId)
      const myArticleIds = new Set(myArticles.map((a) => a.id))
      const notifs: AppNotification[] = []

      // 1. Reposts on user's articles
      localDb.getAllReposts().forEach((r) => {
        if (myArticleIds.has(r.articleId) && r.userId !== userId) {
          const actor = localDb.getUserById(r.userId)
          const article = localDb.getArticleById(r.articleId)
          if (actor && article) {
            notifs.push({
              id: `notif-rep-${r.id}`,
              type: "REPOST",
              actor: {
                username: actor.username,
                fullName: actor.fullName,
                avatarDriveId: actor.avatarDriveId,
                isVerified: actor.isVerified,
              },
              article: { id: article.id, title: article.title, slug: article.slug },
              text: r.quoteText ?? "me-repost berita Anda",
              createdAt: r.createdAt,
              read: false,
              href: `/berita/${article.slug}`,
            })
          }
        }
      })

      // 2. Likes on user's articles
      localDb["data"].likes.forEach((l) => {
        if (myArticleIds.has(l.articleId) && l.userId !== userId) {
          const actor = localDb.getUserById(l.userId)
          const article = localDb.getArticleById(l.articleId)
          if (actor && article) {
            notifs.push({
              id: `notif-like-${l.id}`,
              type: "LIKE",
              actor: {
                username: actor.username,
                fullName: actor.fullName,
                avatarDriveId: actor.avatarDriveId,
                isVerified: actor.isVerified,
              },
              article: { id: article.id, title: article.title, slug: article.slug },
              text: "menyukai berita Anda",
              createdAt: l.createdAt,
              read: false,
              href: `/berita/${article.slug}`,
            })
          }
        }
      })

      // 3. Comments on user's articles
      localDb["data"].comments.forEach((c) => {
        if (myArticleIds.has(c.articleId) && c.userId !== userId) {
          const actor = localDb.getUserById(c.userId)
          const article = localDb.getArticleById(c.articleId)
          if (actor && article) {
            notifs.push({
              id: `notif-comm-${c.id}`,
              type: "COMMENT",
              actor: {
                username: actor.username,
                fullName: actor.fullName,
                avatarDriveId: actor.avatarDriveId,
                isVerified: actor.isVerified,
              },
              article: { id: article.id, title: article.title, slug: article.slug },
              text: c.content,
              createdAt: c.createdAt,
              read: false,
              href: `/berita/${article.slug}#komentar`,
            })
          }
        }
      })

      // 4. Followers
      localDb["data"].follows.forEach((f) => {
        if (f.followingId === userId) {
          const actor = localDb.getUserById(f.followerId)
          if (actor) {
            notifs.push({
              id: `notif-fol-${f.followerId}`,
              type: "FOLLOW",
              actor: {
                username: actor.username,
                fullName: actor.fullName,
                avatarDriveId: actor.avatarDriveId,
                isVerified: actor.isVerified,
              },
              text: "mulai mengikuti Anda",
              createdAt: f.createdAt,
              read: false,
              href: `/@${actor.username}`,
            })
          }
        }
      })

      // 5. Community Notes on user's articles
      ;(localDb["data"].communityNotes || []).forEach((n) => {
        if (myArticleIds.has(n.articleId) && n.userId !== userId) {
          const actor = localDb.getUserById(n.userId)
          const article = localDb.getArticleById(n.articleId)
          if (actor && article) {
            notifs.push({
              id: `notif-note-${n.id}`,
              type: "NOTE",
              actor: {
                username: actor.username,
                fullName: actor.fullName,
                avatarDriveId: actor.avatarDriveId,
                isVerified: actor.isVerified,
              },
              article: { id: article.id, title: article.title, slug: article.slug },
              text: "mengajukan Catatan Komunitas pada berita Anda",
              createdAt: n.createdAt,
              read: false,
              href: `/berita/${article.slug}`,
            })
          }
        }
      })

      return notifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }

    // Prisma mode: aggregate recent social events for this user
    const [reposts, likes, comments, follows, notes] = await Promise.all([
      prisma.repost.findMany({
        where: { article: { authorId: userId }, userId: { not: userId } },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { username: true, fullName: true, avatarDriveId: true, isVerified: true } },
          article: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.like.findMany({
        where: { article: { authorId: userId }, userId: { not: userId } },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { username: true, fullName: true, avatarDriveId: true, isVerified: true } },
          article: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.comment.findMany({
        where: { article: { authorId: userId }, userId: { not: userId } },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { username: true, fullName: true, avatarDriveId: true, isVerified: true } },
          article: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.follow.findMany({
        where: { followingId: userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          follower: { select: { username: true, fullName: true, avatarDriveId: true, isVerified: true } },
        },
      }),
      prisma.communityNote.findMany({
        where: { article: { authorId: userId }, userId: { not: userId } },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { username: true, fullName: true, avatarDriveId: true, isVerified: true } },
          article: { select: { id: true, title: true, slug: true } },
        },
      }),
    ])

    const notifs: AppNotification[] = [
      ...reposts.map((r) => ({
        id: `notif-rep-${r.id}`,
        type: "REPOST" as const,
        actor: r.user,
        article: r.article,
        text: r.quoteText ?? "me-repost berita Anda",
        createdAt: r.createdAt,
        read: false,
        href: `/berita/${r.article.slug}`,
      })),
      ...likes.map((l) => ({
        id: `notif-like-${l.id}`,
        type: "LIKE" as const,
        actor: l.user,
        article: l.article,
        text: "menyukai berita Anda",
        createdAt: l.createdAt,
        read: false,
        href: `/berita/${l.article.slug}`,
      })),
      ...comments.map((c) => ({
        id: `notif-comm-${c.id}`,
        type: "COMMENT" as const,
        actor: c.user,
        article: c.article,
        text: c.content,
        createdAt: c.createdAt,
        read: false,
        href: `/berita/${c.article.slug}#komentar`,
      })),
      ...follows.map((f) => ({
        id: `notif-fol-${f.follower.username}`,
        type: "FOLLOW" as const,
        actor: f.follower,
        text: "mulai mengikuti Anda",
        createdAt: f.createdAt,
        read: false,
        href: `/@${f.follower.username}`,
      })),
      ...notes.map((n) => ({
        id: `notif-note-${n.id}`,
        type: "NOTE" as const,
        actor: n.user,
        article: n.article,
        text: "mengajukan Catatan Komunitas pada berita Anda",
        createdAt: n.createdAt,
        read: false,
        href: `/berita/${n.article.slug}`,
      })),
    ]

    return notifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },
}
