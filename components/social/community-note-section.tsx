"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { addCommunityNoteAction, deleteCommunityNoteAction } from "@/actions/social.actions"
import { UserLink } from "@/components/news/user-bits"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatDateTime } from "@/lib/format"
import { ExternalLinkIcon, ShieldAlertIcon, Trash2Icon } from "lucide-react"

type NoteItem = {
  id: string
  content: string
  sourceUrl: string | null
  createdAt: Date
  user: {
    username: string
    fullName: string
    avatarDriveId: string | null
    isVerified: boolean
  }
}

type Props = {
  articleId: string
  slug: string
  notes: NoteItem[]
  viewer: {
    id: string
    username: string
    fullName: string
    trustScore: number
    isVerified: boolean
    isStaff: boolean
  } | null
}

export function CommunityNoteSection({ articleId, slug, notes, viewer }: Props) {
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [content, setContent] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [pending, startTransition] = useTransition()

  const canAdd = viewer && (viewer.isStaff || viewer.isVerified || viewer.trustScore >= 50)

  function submit() {
    startTransition(async () => {
      const res = await addCommunityNoteAction(articleId, slug, content, sourceUrl)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Catatan komunitas berhasil dipublikasikan.")
        setOpen(false)
        setContent("")
        setSourceUrl("")
      }
    })
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await deleteCommunityNoteAction(id, slug)
      if (res?.error) toast.error(res.error)
      else toast.success("Catatan komunitas dihapus.")
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {notes.map((note) => (
        <aside
          key={note.id}
          className="rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 p-4 text-sm dark:border-amber-500/20"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlertIcon className="size-4 text-amber-600 dark:text-amber-400" />
              <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300">
                Catatan Komunitas
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Diajukan oleh <UserLink user={note.user} /></span>
              <span>·</span>
              <time dateTime={note.createdAt.toISOString()}>{formatDateTime(note.createdAt)}</time>
              {viewer && (viewer.username === note.user.username || viewer.isStaff) && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Hapus catatan"
                  disabled={pending}
                  onClick={() => setDeleteId(note.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2Icon className="size-3" />
                </Button>
              )}
            </div>
          </div>

          <p className="mt-2 text-foreground break-words whitespace-pre-wrap">{note.content}</p>

          {note.sourceUrl && (
            <p className="mt-2 text-xs">
              <a
                href={note.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
              >
                Rujukan Verifikasi Konteks <ExternalLinkIcon className="size-3" />
              </a>
            </p>
          )}
        </aside>
      ))}

      {canAdd && (
        <div>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="h-auto w-full justify-start border-dashed py-2 text-left whitespace-normal sm:w-auto sm:justify-center sm:text-center">
            <ShieldAlertIcon className="size-3.5 shrink-0 text-amber-600" />
            + Ajukan Catatan Konteks / Koreksi Komunitas
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Catatan Komunitas (Anti-Hoaks)</DialogTitle>
                <DialogDescription>
                  Bantu pembaca memahami konteks tambahan, klarifikasi, atau koreksi fakta berita ini.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="note-content">Konteks / Koreksi Fakta</Label>
                  <Textarea
                    id="note-content"
                    placeholder="Tuliskan klarifikasi konteks yang objektif dan ringkas..."
                    rows={4}
                    maxLength={1000}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="note-source">Tautan Sumber Bukti Rujukan (opsional)</Label>
                  <Input
                    id="note-source"
                    type="url"
                    placeholder="https://..."
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                  Batal
                </Button>
                <Button onClick={submit} disabled={pending || content.trim().length < 10}>
                  {pending ? "Mengirim..." : "Publikasikan Catatan"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(isOpen) => !isOpen && setDeleteId(null)}
        title="Hapus Catatan Komunitas"
        description="Apakah Anda yakin ingin menghapus catatan konteks komunitas ini?"
        confirmLabel="Ya, Hapus"
        pending={pending}
        onConfirm={() => {
          if (deleteId) remove(deleteId)
        }}
      />
    </div>
  )
}
