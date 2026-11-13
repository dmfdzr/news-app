"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
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
import { ConfirmDialog } from "@/components/ui/dialog"
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
  const [currentRole, setCurrentRole] = useState(value)
  const [pendingRole, setPendingRole] = useState<string | null>(null)

  return (
    <>
      <Select
        aria-label="Peran"
        value={currentRole}
        disabled={disabled || pending}
        wrapperClassName="w-36"
        onChange={(e) => {
          if (e.target.value !== currentRole) setPendingRole(e.target.value)
        }}
      >
        <option value="USER">User</option>
        <option value="MODERATOR">Moderator</option>
        <option value="ADMIN">Admin</option>
      </Select>
      <ConfirmDialog
        open={pendingRole !== null}
        onOpenChange={(open) => !open && setPendingRole(null)}
        title="Ubah Peran Pengguna"
        description={`Apakah Anda yakin ingin mengubah hak akses pengguna ini menjadi ${pendingRole ?? ""}?`}
        variant="default"
        confirmLabel="Ya, Ubah Peran"
        pending={pending}
        onConfirm={() => {
          if (!pendingRole) return
          const targetRole = pendingRole
          startTransition(async () => {
            const r = await setRoleAction(userId, targetRole)
            if (r?.error) toast.error(r.error)
            else {
              setCurrentRole(targetRole)
              toast.success(r?.success ?? "Tersimpan.")
            }
          })
        }}
      />
    </>
  )
}

export function CategoryForm({ category }: { category?: { id: string; name: string; description: string | null; orderIndex: number } }) {
  const [state, action, pending] = useActionState(saveCategoryAction, undefined)
  const [removing, startRemove] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) toast.success(state.success)
  }, [state])

  return (
    <>
      <form action={action} className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-center">
        {category && <input type="hidden" name="id" value={category.id} />}
        <Input name="name" required placeholder="Nama kategori" aria-label="Nama kategori" defaultValue={category?.name} className="w-full sm:col-span-3" />
        <Input name="description" placeholder="Deskripsi" aria-label="Deskripsi" defaultValue={category?.description ?? ""} className="w-full sm:col-span-5" />
        <Input name="orderIndex" type="number" min={0} aria-label="Urutan" defaultValue={category?.orderIndex ?? 0} className="w-full sm:col-span-2" />
        <div className="flex items-center gap-2 sm:col-span-2">
          <Button type="submit" size="sm" disabled={pending} className="flex-1 sm:flex-initial">{category ? "Simpan" : "Tambah"}</Button>
          {category && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={removing}
              onClick={() => setConfirmDelete(true)}
            >
              Hapus
            </Button>
          )}
        </div>
      </form>
      {category && (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title="Hapus Kategori Kanal"
          description={`Hapus kategori "${category.name}"? Kategori yang masih memiliki berita aktif tidak dapat dihapus.`}
          confirmLabel="Ya, Hapus Kategori"
          pending={removing}
          onConfirm={() => {
            startRemove(async () => {
              const r = await deleteCategoryAction(category.id)
              if (r?.error) toast.error(r.error)
              else toast.success(r?.success ?? "Dihapus.")
            })
          }}
        />
      )}
    </>
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
  const [confirmAction, setConfirmAction] = useState<"RESOLVED" | "DISMISSED" | "DELETE" | null>(null)

  function setStatus(status: "RESOLVED" | "DISMISSED") {
    startTransition(async () => {
      const res = await updateReportStatusAction(reportId, status)
      if (res?.error) toast.error(res.error)
      else toast.success(res?.success ?? "Status diperbarui.")
    })
  }

  function deleteContent() {
    if (!targetType || !targetId) return
    startTransition(async () => {
      const res = await deleteReportedItemAction(reportId, targetType, targetId)
      if (res?.error) toast.error(res.error)
      else toast.success(res?.success ?? "Konten dihapus.")
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        <Button size="xs" variant="outline" disabled={pending} onClick={() => setConfirmAction("RESOLVED")}>
          Selesai
        </Button>
        <Button size="xs" variant="ghost" disabled={pending} onClick={() => setConfirmAction("DISMISSED")}>
          Abaikan
        </Button>
        {targetType && targetId && (
          <Button size="xs" variant="destructive" disabled={pending} onClick={() => setConfirmAction("DELETE")}>
            Hapus Konten
          </Button>
        )}
      </div>
      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={
          confirmAction === "DELETE"
            ? "Hapus Konten Terlapor"
            : confirmAction === "RESOLVED"
              ? "Tandai Laporan Selesai"
              : "Abaikan Laporan"
        }
        description={
          confirmAction === "DELETE"
            ? `Hapus ${targetType === "ARTICLE" ? "berita" : "komentar"} terlapor ini secara permanen? Tindakan ini tidak dapat dibatalkan.`
            : confirmAction === "RESOLVED"
              ? "Tandai laporan warga ini sebagai telah ditindaklanjuti (RESOLVED)?"
              : "Abaikan laporan warga ini karena tidak ditemukan pelanggaran (DISMISSED)?"
        }
        variant={confirmAction === "DELETE" ? "destructive" : "default"}
        confirmLabel={
          confirmAction === "DELETE"
            ? "Ya, Hapus Permanen"
            : confirmAction === "RESOLVED"
              ? "Ya, Tandai Selesai"
              : "Ya, Abaikan"
        }
        pending={pending}
        onConfirm={() => {
          if (confirmAction === "DELETE") deleteContent()
          else if (confirmAction) setStatus(confirmAction)
        }}
      />
    </>
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
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <Button
        size="xs"
        variant={isVerified ? "default" : "outline"}
        disabled={disabled || pending}
        className={isVerified ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}
        onClick={() => setConfirmOpen(true)}
      >
        <BadgeCheckIcon className="size-3.5" />
        {isVerified ? "Verified" : "Belum"}
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isVerified ? "Cabut Status Verified Contributor" : "Verifikasi Kontributor"}
        description={
          isVerified
            ? "Cabut lencana Verified Contributor dari pengguna ini? Pengguna tidak lagi berstatus terverifikasi."
            : "Berikan status Verified Contributor kepada pengguna ini? Pengguna akan memperoleh lencana terverifikasi dan hak mengajukan Catatan Komunitas."
        }
        variant={isVerified ? "destructive" : "default"}
        confirmLabel={isVerified ? "Ya, Cabut Status" : "Ya, Verifikasi"}
        pending={pending}
        onConfirm={() =>
          startTransition(async () => {
            const r = await toggleUserVerifiedAction(userId)
            if (r?.error) toast.error(r.error)
            else toast.success(r?.success ?? "Status diperbarui.")
          })
        }
      />
    </>
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
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <Button
        size="icon-xs"
        variant="ghost"
        disabled={disabled || pending}
        aria-label={`Hapus user ${username}`}
        className="text-destructive hover:bg-destructive/10"
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2Icon className="size-3.5" />
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus Akun Pengguna"
        description={`Hapus akun @${username} secara permanen? Seluruh berita, repost, dan komentar pengguna ini akan ikut terhapus dan tidak dapat dipulihkan.`}
        confirmLabel="Ya, Hapus Akun"
        pending={pending}
        onConfirm={() =>
          startTransition(async () => {
            const r = await deleteUserAction(userId)
            if (r?.error) toast.error(r.error)
            else toast.success(r?.success ?? "Pengguna dihapus.")
          })
        }
      />
    </>
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
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <Button
        size="icon-xs"
        variant="ghost"
        disabled={pending}
        aria-label={`Hapus berita ${title}`}
        className="text-destructive hover:bg-destructive/10"
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2Icon className="size-3.5" />
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus Berita Publik"
        description={`Hapus berita "${title}" secara permanen dari portal ClimateStories? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Berita"
        pending={pending}
        onConfirm={() =>
          startTransition(async () => {
            const r = await adminDeleteArticleAction(articleId)
            if (r?.error) toast.error(r.error)
            else toast.success(r?.success ?? "Berita dihapus.")
          })
        }
      />
    </>
  )
}



