"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireUser } from "@/lib/auth"
import { isLocalMode } from "@/lib/env"
import { toActionError, type ActionState } from "@/lib/errors"
import { localDb } from "@/lib/local-db"
import { invalidateCache, prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { userService } from "@/services/user.service"

const emailSchema = z.string().trim().email("Format email tidak valid.")
const passwordSchema = z.string().min(8, "Kata sandi minimal 8 karakter.")

export async function updateProfileAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  try {
    await userService.updateProfile(user, {
      fullName: String(formData.get("fullName") ?? ""),
      username: String(formData.get("username") ?? ""),
      bio: String(formData.get("bio") ?? ""),
      avatarDriveId: String(formData.get("avatarDriveId") ?? "") || undefined,
    })
  } catch (error) {
    return toActionError(error, "Tidak dapat memperbarui profil.")
  }
  revalidatePath("/", "layout")
  return { success: "Profil berhasil diperbarui." }
}

export async function updateEmailAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  const rawEmail = String(formData.get("email") ?? "")
  const parsed = emailSchema.safeParse(rawEmail)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const newEmail = parsed.data.toLowerCase()

  if (newEmail === user.email.toLowerCase()) {
    return { error: "Email baru sama dengan email saat ini." }
  }

  if (isLocalMode) {
    const clash = localDb.getUserByEmail(newEmail)
    if (clash && clash.id !== user.id) return { error: "Email sudah digunakan oleh akun lain." }
    localDb.updateUser(user.id, { email: newEmail })
    revalidatePath("/", "layout")
    return { success: "Email berhasil diperbarui." }
  }

  const clash = await prisma.user.findUnique({ where: { email: newEmail } })
  if (clash && clash.id !== user.id) return { error: "Email sudah digunakan oleh akun lain." }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) return { error: error.message || "Gagal memperbarui email di sistem autentikasi." }

    await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail },
    })
    invalidateCache("user:")
  } catch (error) {
    return toActionError(error, "Gagal memperbarui email.")
  }

  revalidatePath("/", "layout")
  return { success: "Email berhasil diperbarui. Periksa kotak masuk untuk konfirmasi jika diminta." }
}

export async function updatePasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser()
  const password = String(formData.get("password") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")

  const parsed = passwordSchema.safeParse(password)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  if (password !== confirmPassword) return { error: "Konfirmasi kata sandi tidak cocok." }

  if (isLocalMode) {
    return { success: "Kata sandi berhasil diperbarui (Mode lokal)." }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { error: error.message || "Gagal memperbarui kata sandi." }
  } catch (error) {
    return toActionError(error, "Gagal memperbarui kata sandi.")
  }

  return { success: "Kata sandi berhasil diperbarui." }
}

