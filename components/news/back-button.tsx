"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, ArrowUpIcon } from "lucide-react"

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

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0)
      setShowTop(scrollTop > 400)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[60] h-1 w-full bg-transparent"
      >
        <div
          className="h-full bg-emerald-600 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {showTop && (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-label="Kembali ke atas"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed right-5 bottom-5 z-40 rounded-full shadow-lg ring-1 ring-border transition-transform hover:-translate-y-0.5"
        >
          <ArrowUpIcon className="size-4" />
        </Button>
      )}
    </>
  )
}

