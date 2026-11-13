"use client"

import { useActionState, useEffect, useTransition } from "react"
import { toast } from "sonner"

import {
  adminDeleteArticleAction,
  deleteCategoryAction,
  deleteReportedItemAction,
  deleteUserAction,
  saveCategoryAction,
  setHeadlineAction,
  setRoleAction,
  setUserTrustScoreAction,
  toggleUserVerifiedAction,
  updateReportStatusAction,
} from "@/actions/admin.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { BadgeCheckIcon, Trash2Icon } from "lucide-react"

export function HeadlineSelect({ articleId, value }: { articleId: string; value: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Select
      aria-label="Posisi headline"
      defaultValue={value}
      disabled={pending}
      wrapperClassName="w-40"
      onChange={(e) =>
        startTransition(async () => {
          const r = await setHeadlineAction(articleId, e.target.value)
          if (r?.error) toast.error(r.error)
          else toast.success(r?.success ?? "Tersimpan.")
        })
      }
    >
      <option value="NONE">Tidak ada</option>
      <option value="MAIN_LEFT">Utama (kiri)</option>
      <option value="MIDDLE_CENTER">Tengah</option>
      <option value="RIGHT_LIST">Daftar kanan</option>
    </Select>
  )
}

export function RoleSelect({ userId, value, disabled }: { userId: string; value: string; disabled: boolean }) {
  const [pending, startTransition] = useTransition()
  return (
    <Select
      aria-label="Peran"
      defaultValue={value}
      disabled={disabled || pending}
      wrapperClassName="w-36"
      onChange={(e) =>
        startTransition(async () => {
          const r = await setRoleAction(userId, e.target.value)
          if (r?.error) toast.error(r.error)
          else toast.success(r?.success ?? "Tersimpan.")
        })
      }
    >
      <option value="USER">User</option>
      <option value="MODERATOR">Moderator</option>
      <option value="ADMIN">Admin</option>
    </Select>
  )
}

export function CategoryForm({ category }: { category?: { id: string; name: string; description: string | null; orderIndex: number } }) {
  const [state, action, pending] = useActionState(saveCategoryAction, undefined)
  const [removing, startRemove] = useTransition()

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) toast.success(state.success)
  }, [state])

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      {category && <input type="hidden" name="id" value={category.id} />}
      <Input name="name" required placeholder="Nama kategori" aria-label="Nama kategori" defaultValue={category?.name} className="w-44" />
      <Input name="description" placeholder="Deskripsi" aria-label="Deskripsi" defaultValue={category?.description ?? ""} className="w-56" />
      <Input name="orderIndex" type="number" min={0} aria-label="Urutan" defaultValue={category?.orderIndex ?? 0} className="w-20" />
      <Button type="submit" size="sm" disabled={pending}>{category ? "Simpan" : "Tambah"}</Button>
      {category && (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={removing}
          onClick={() => {
            if (!confirm(`Hapus kategori "${category.name}"?`)) return
            startRemove(async () => {
              const r = await deleteCategoryAction(category.id)
              if (r?.error) toast.error(r.error)
              else toast.success(r?.success ?? "Dihapus.")
            })
          }}
        >
          Hapus
        </Button>
      )}
    </form>
  )
}

export function ReportActions({
  reportId,
  targetType,
  targetId,
}: {
  reportId: string
  targetType?: "ARTICLE" | "COMMENT"
  targetId?: string
}) {
  const [pending, startTransition] = useTransition()

  function setStatus(status: "RESOLVED" | "DISMISSED") {
    startTransition(async () => {
      const res = await updateReportStatusAction(reportId, status)
      if (res?.error) toast.error(res.error)
      else toast.success(res?.success ?? "Status diperbarui.")
    })
  }

  function deleteContent() {
    if (!targetType || !targetId) return
    if (!confirm(`Hapus konten ${targetType.toLowerCase()} ini secara permanen?`)) return
    startTransition(async () => {
      const res = await deleteReportedItemAction(reportId, targetType, targetId)
      if (res?.error) toast.error(res.error)
      else toast.success(res?.success ?? "Konten dihapus.")
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button size="xs" variant="outline" disabled={pending} onClick={() => setStatus("RESOLVED")}>
        Selesai
      </Button>
      <Button size="xs" variant="ghost" disabled={pending} onClick={() => setStatus("DISMISSED")}>
        Abaikan
      </Button>
      {targetType && targetId && (
        <Button size="xs" variant="destructive" disabled={pending} onClick={deleteContent}>
          Hapus Konten
        </Button>
      )}
    </div>
  )
}

export function UserVerifiedToggle({
  userId,
  isVerified,
  disabled,
}: {
  userId: string
  isVerified: boolean
  disabled: boolean
}) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      size="xs"
      variant={isVerified ? "default" : "outline"}
      disabled={disabled || pending}
      className={isVerified ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}
      onClick={() =>
        startTransition(async () => {
          const r = await toggleUserVerifiedAction(userId)
          if (r?.error) toast.error(r.error)
          else toast.success(r?.success ?? "Status diperbarui.")
        })
      }
    >
      <BadgeCheckIcon className="size-3.5" />
      {isVerified ? "Verified" : "Belum"}
    </Button>
  )
}

export function UserTrustScoreControl({
  userId,
  score,
  disabled,
}: {
  userId: string
  score: number
  disabled: boolean
}) {
  const [pending, startTransition] = useTransition()

  function updateScore(val: number) {
    startTransition(async () => {
      const r = await setUserTrustScoreAction(userId, val)
      if (r?.error) toast.error(r.error)
      else toast.success(r?.success ?? "Skor diperbarui.")
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        min={0}
        defaultValue={score}
        disabled={disabled || pending}
        aria-label="Skor reputasi"
        className="h-8 w-18 text-xs font-semibold"
        onBlur={(e) => {
          const val = parseInt(e.target.value, 10)
          if (!isNaN(val) && val !== score) updateScore(val)
        }}
      />
    </div>
  )
}

export function UserDeleteButton({
  userId,
  username,
  disabled,
}: {
  userId: string
  username: string
  disabled: boolean
}) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      size="icon-xs"
      variant="ghost"
      disabled={disabled || pending}
      aria-label={`Hapus user ${username}`}
      className="text-destructive hover:bg-destructive/10"
      onClick={() => {
        if (!confirm(`Hapus akun @${username} secara permanen? Seluruh berita dan komentar akan terhapus.`))
          return
        startTransition(async () => {
          const r = await deleteUserAction(userId)
          if (r?.error) toast.error(r.error)
          else toast.success(r?.success ?? "Pengguna dihapus.")
        })
      }}
    >
      <Trash2Icon className="size-3.5" />
    </Button>
  )
}

export function AdminDeleteArticleButton({
  articleId,
  title,
}: {
  articleId: string
  title: string
}) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      size="icon-xs"
      variant="ghost"
      disabled={pending}
      aria-label={`Hapus berita ${title}`}
      className="text-destructive hover:bg-destructive/10"
      onClick={() => {
        if (!confirm(`Hapus berita "${title}" secara permanen dari portal?`)) return
        startTransition(async () => {
          const r = await adminDeleteArticleAction(articleId)
          if (r?.error) toast.error(r.error)
          else toast.success(r?.success ?? "Berita dihapus.")
        })
      }}
    >
      <Trash2Icon className="size-3.5" />
    </Button>
  )
}


