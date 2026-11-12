"use server"

import { revalidatePath } from "next/cache"

import { requireStaff, requireUser } from "@/lib/auth"
import { toActionError, type ActionState } from "@/lib/errors"
import { articleService } from "@/services/article.service"
import { categoryService } from "@/services/category.service"
import { socialService } from "@/services/social.service"
import { userService } from "@/services/user.service"
import type { HeadlinePosition, ReportStatus, Role } from "@prisma/client"

const POSITIONS: HeadlinePosition[] = ["NONE", "MAIN_LEFT", "MIDDLE_CENTER", "RIGHT_LIST"]
const ROLES: Role[] = ["USER", "MODERATOR", "ADMIN"]
const REPORT_STATUSES: ReportStatus[] = ["PENDING", "RESOLVED", "DISMISSED"]

export async function setHeadlineAction(articleId: string, position: string): Promise<ActionState> {
  await requireStaff()
  if (!POSITIONS.includes(position as HeadlinePosition)) return { error: "Posisi tidak valid." }
  try {
    await articleService.setHeadline(articleId, position as HeadlinePosition)
  } catch (error) {
    return toActionError(error, "Tidak dapat mengubah headline.")
  }
  revalidatePath("/")
  revalidatePath("/admin")
  return { success: "Headline diperbarui." }
}

export async function saveCategoryAction(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff()
  const id = String(formData.get("id") ?? "")
  const input = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || undefined,
    orderIndex: String(formData.get("orderIndex") ?? "0"),
  }
  try {
    if (id) await categoryService.update(id, input)
    else await categoryService.create(input)
  } catch (error) {
    return toActionError(error, "Tidak dapat menyimpan kategori.")
  }
  revalidatePath("/", "layout")
  return { success: "Kategori disimpan." }
}

export async function deleteCategoryAction(id: string): Promise<ActionState> {
  await requireStaff()
  try {
    await categoryService.remove(id)
  } catch (error) {
    return toActionError(error, "Tidak dapat menghapus kategori.")
  }
  revalidatePath("/", "layout")
  return { success: "Kategori dihapus." }
}

export async function setRoleAction(userId: string, role: string): Promise<ActionState> {
  const admin = await requireUser()
  if (admin.role !== "ADMIN") return { error: "Hanya admin yang dapat mengubah peran." }
  if (!ROLES.includes(role as Role)) return { error: "Peran tidak valid." }
  if (admin.id === userId) return { error: "Anda tidak dapat mengubah peran sendiri." }
  try {
    await userService.setRole(userId, role as Role)
  } catch (error) {
    return toActionError(error, "Tidak dapat mengubah peran.")
  }
  revalidatePath("/admin")
  return { success: "Peran diperbarui." }
}

export async function toggleUserVerifiedAction(userId: string): Promise<ActionState> {
  const admin = await requireUser()
  if (admin.role !== "ADMIN") return { error: "Hanya admin yang dapat mengubah status verifikasi." }
  try {
    await userService.toggleVerified(userId)
  } catch (error) {
    return toActionError(error, "Gagal mengubah status verifikasi.")
  }
  revalidatePath("/admin")
  return { success: "Status verifikasi diperbarui." }
}

export async function setUserTrustScoreAction(userId: string, trustScore: number): Promise<ActionState> {
  const admin = await requireUser()
  if (admin.role !== "ADMIN") return { error: "Hanya admin yang dapat mengubah skor reputasi." }
  try {
    await userService.setTrustScore(userId, trustScore)
  } catch (error) {
    return toActionError(error, "Gagal mengubah skor reputasi.")
  }
  revalidatePath("/admin")
  return { success: "Skor reputasi diperbarui." }
}

export async function deleteUserAction(userId: string): Promise<ActionState> {
  const admin = await requireUser()
  if (admin.role !== "ADMIN") return { error: "Hanya admin yang dapat menghapus akun pengguna." }
  if (admin.id === userId) return { error: "Anda tidak dapat menghapus akun sendiri." }
  try {
    await userService.deleteUser(userId)
  } catch (error) {
    return toActionError(error, "Gagal menghapus pengguna.")
  }
  revalidatePath("/admin")
  return { success: "Pengguna berhasil dihapus." }
}

export async function updateReportStatusAction(reportId: string, status: string): Promise<ActionState> {
  await requireStaff()
  if (!REPORT_STATUSES.includes(status as ReportStatus)) return { error: "Status laporan tidak valid." }
  try {
    await socialService.updateReportStatus(reportId, status as ReportStatus)
  } catch (error) {
    return toActionError(error, "Gagal memperbarui status laporan.")
  }
  revalidatePath("/admin")
  return { success: "Status laporan diperbarui." }
}

export async function deleteReportedItemAction(
  reportId: string,
  targetType: "ARTICLE" | "COMMENT",
  targetId: string
): Promise<ActionState> {
  const staff = await requireStaff()
  try {
    if (targetType === "ARTICLE") {
      await articleService.remove(staff, targetId)
    } else {
      await socialService.deleteComment(staff, targetId)
    }
    await socialService.updateReportStatus(reportId, "RESOLVED")
  } catch (error) {
    return toActionError(error, "Gagal menghapus konten terlapor.")
  }
  revalidatePath("/admin")
  revalidatePath("/")
  return { success: "Konten berhasil ditindak dan dihapus." }
}

