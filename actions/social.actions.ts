"use server"

import { revalidatePath } from "next/cache"

import { requireUser } from "@/lib/auth"
import { toActionError, type ActionState } from "@/lib/errors"
import { invalidateCache } from "@/lib/prisma"
import { socialService } from "@/services/social.service"

async function run(
  fn: (user: Awaited<ReturnType<typeof requireUser>>) => Promise<unknown>,
  fallback: string,
  slug?: string
): Promise<ActionState> {
  const user = await requireUser()
  try {
    await fn(user)
  } catch (error) {
    return toActionError(error, fallback)
  }
  invalidateCache("article:", "user:", "notif:", "social:")
  if (slug) revalidatePath(`/berita/${slug}`)
  revalidatePath("/")
  return {}
}

export async function toggleLikeAction(articleId: string, slug: string) {
  return run((u) => socialService.toggleLike(u, articleId), "Tidak dapat memproses suka.", slug)
}

export async function toggleBookmarkAction(articleId: string, slug: string) {
  const result = await run((u) => socialService.toggleBookmark(u, articleId), "Tidak dapat menyimpan berita.", slug)
  revalidatePath("/bookmark")
  return result
}

export async function repostAction(articleId: string, slug: string, quoteText?: string) {
  return run((u) => socialService.repost(u, articleId, quoteText), "Tidak dapat me-repost berita.", slug)
}

export async function undoRepostAction(articleId: string, slug: string) {
  return run((u) => socialService.undoRepost(u, articleId), "Tidak dapat membatalkan repost.", slug)
}

export async function addCommentAction(articleId: string, slug: string, content: string, parentId?: string) {
  return run((u) => socialService.addComment(u, articleId, content, parentId), "Tidak dapat mengirim komentar.", slug)
}

export async function editCommentAction(commentId: string, slug: string, content: string) {
  return run((u) => socialService.editComment(u, commentId, content), "Tidak dapat mengubah komentar.", slug)
}

export async function deleteCommentAction(commentId: string, slug: string) {
  return run((u) => socialService.deleteComment(u, commentId), "Tidak dapat menghapus komentar.", slug)
}

export async function toggleFollowAction(targetId: string, username: string) {
  const result = await run((u) => socialService.toggleFollow(u, targetId), "Tidak dapat memproses ikuti.")
  revalidatePath(`/@${username}`)
  revalidatePath("/mengikuti")
  return result
}

export async function addCommunityNoteAction(articleId: string, slug: string, content: string, sourceUrl?: string) {
  return run((u) => socialService.addCommunityNote(u, articleId, content, sourceUrl), "Gagal mengirim catatan komunitas.", slug)
}

export async function deleteCommunityNoteAction(noteId: string, slug: string) {
  return run((u) => socialService.deleteCommunityNote(u, noteId), "Gagal menghapus catatan komunitas.", slug)
}

export async function createReportAction(
  reason: "HOAX" | "SPAM" | "MISLEADING" | "HARASSMENT" | "OTHER",
  details?: string,
  articleId?: string,
  commentId?: string
) {
  return run(
    (u) => socialService.createReport(u, { reason, details, articleId, commentId }),
    "Tidak dapat mengirim laporan."
  )
}
