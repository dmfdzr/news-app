import Link from "next/link"
import { FileQuestionIcon, HomeIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <FileQuestionIcon className="size-7" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs font-bold tracking-widest text-emerald-600 uppercase">Error 404</span>
        <h1 className="font-heading text-2xl font-black tracking-tight sm:text-3xl">Halaman Tidak Ditemukan</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Tautan yang Anda tuju mungkin sudah dipindahkan, dihapus, atau belum pernah diterbitkan.
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants({ size: "sm" }), "gap-2 rounded-xl")}>
        <HomeIcon className="size-3.5" /> Kembali ke Beranda
      </Link>
    </div>
  )
}
