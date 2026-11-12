"use client"

import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function BackButton({ label = "Kembali" }: { label?: string }) {
  const router = useRouter()

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="group -ml-2 w-fit gap-1.5 text-xs font-semibold text-slate-600 transition-colors hover:text-foreground dark:text-slate-400"
    >
      <ArrowLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
      {label}
    </Button>
  )
}
