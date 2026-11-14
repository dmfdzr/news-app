"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { createReportAction } from "@/actions/social.actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { LoadingOverlay } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { FlagIcon } from "lucide-react"

type Props = {
  articleId?: string
  commentId?: string
  title?: string
}

export function ReportDialog({ articleId, commentId, title }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<"HOAX" | "SPAM" | "MISLEADING" | "HARASSMENT" | "OTHER">("HOAX")
  const [details, setDetails] = useState("")
  const [pending, startTransition] = useTransition()

  function submit() {
    startTransition(async () => {
      const res = await createReportAction(reason, details, articleId, commentId)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Laporan berhasil dikirim. Tim moderator akan menindaklanjuti.")
        setOpen(false)
        setDetails("")
      }
    })
  }

  return (
    <>
      <LoadingOverlay open={pending} message="Mengirim laporan ke moderator..." />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="xs" className="text-slate-500 hover:text-destructive">
            <FlagIcon className="size-3.5" />
            <span className="sr-only sm:not-sr-only">Laporkan</span>
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Laporkan {commentId ? "Komentar" : "Berita"}</DialogTitle>
          <DialogDescription>
            {title ? `Laporkan: "${title.slice(0, 50)}..."` : "Bantu jaga ekosistem berita anti-hoaks dan diskusi sehat."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="report-reason">Alasan Laporan</Label>
            <Select
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as typeof reason)}
            >
              <option value="HOAX">Berita Palsu / Hoaks</option>
              <option value="MISLEADING">Informasi Menyesatkan</option>
              <option value="SPAM">Spam / Promosi Tak Layak</option>
              <option value="HARASSMENT">Ujaran Kebencian / Pelecehan</option>
              <option value="OTHER">Lainnya</option>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="report-details">Keterangan Tambahan (opsional)</Label>
            <Textarea
              id="report-details"
              placeholder="Berikan bukti atau konteks penjelasan..."
              rows={3}
              maxLength={500}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Batal
          </Button>
          <Button variant="destructive" onClick={submit} disabled={pending}>
            {pending ? "Mengirim..." : "Kirim Laporan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
