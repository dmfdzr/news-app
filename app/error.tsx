"use client"

import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangleIcon className="size-7" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-black tracking-tight sm:text-3xl">Terjadi Kesalahan</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Gagal memuat konten halaman. Silakan coba kembali atau muat ulang peramban Anda.
        </p>
      </div>
      <Button onClick={reset} size="sm" className="gap-2 rounded-xl">
        <RotateCcwIcon className="size-3.5" /> Coba Lagi
      </Button>
    </div>
  )
}
