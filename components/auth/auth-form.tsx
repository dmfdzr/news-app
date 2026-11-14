"use client"

import { usePathname } from "next/navigation"
import { useActionState, useState, useSyncExternalStore } from "react"

import { signInAction, signUpAction } from "@/actions/auth.actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingOverlay } from "@/components/ui/skeleton"
import { EyeIcon, EyeOffIcon } from "lucide-react"

function AuthFormFields({
  mode,
  next,
  onSwitchMode,
}: {
  mode: "masuk" | "daftar"
  next: string
  onSwitchMode?: (mode: "masuk" | "daftar") => void
}) {
  const [state, formAction, pending] = useActionState(mode === "masuk" ? signInAction : signUpAction, undefined)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const isLogin = mode === "masuk"

  return (
    <div className="flex flex-col gap-5">
      <LoadingOverlay
        open={pending}
        message={isLogin ? "Memverifikasi kredensial akun..." : "Mendaftarkan akun baru..."}
      />
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        {!isLogin && (
          <div className="flex flex-col gap-2">
            <Label htmlFor={`fullName-${mode}`}>Nama lengkap</Label>
            <Input id={`fullName-${mode}`} name="fullName" required minLength={2} autoComplete="name" placeholder="Nama lengkap Anda" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor={`email-${mode}`}>Email</Label>
          <Input id={`email-${mode}`} name="email" type="email" required autoComplete="email" placeholder="nama@email.com" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`password-${mode}`}>Kata sandi</Label>
          <div className="relative">
            <Input
              id={`password-${mode}`}
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              tabIndex={-1}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </Button>
          </div>
        </div>
        {!isLogin && (
          <div className="flex flex-col gap-2">
            <Label htmlFor={`confirmPassword-${mode}`}>Konfirmasi kata sandi</Label>
            <div className="relative">
              <Input
                id={`confirmPassword-${mode}`}
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="Ulangi kata sandi"
                autoComplete="new-password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Sembunyikan konfirmasi kata sandi" : "Lihat konfirmasi kata sandi"}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </Button>
            </div>
          </div>
        )}
        {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
        {state?.success && <p role="status" className="text-sm text-emerald-600">{state.success}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
        <button
          type="button"
          onClick={() => onSwitchMode?.(isLogin ? "daftar" : "masuk")}
          className="cursor-pointer font-semibold text-blue-600 hover:underline"
        >
          {isLogin ? "Daftar sekarang" : "Masuk di sini"}
        </button>
      </p>
    </div>
  )
}

function subscribeUrl(callback: () => void) {
  window.addEventListener("popstate", callback)
  return () => window.removeEventListener("popstate", callback)
}

function getUrlAuth(): string | null {
  try {
    return new URLSearchParams(window.location.search).get("auth")
  } catch {
    return null
  }
}

export function AuthDialog({
  initialMode = "masuk",
  next,
  label,
  variant = "default",
  size = "sm",
  className,
  syncWithUrl = false,
}: {
  initialMode?: "masuk" | "daftar"
  next?: string
  label: string
  variant?: "default" | "outline" | "ghost" | "secondary" | "link"
  size?: "default" | "sm" | "xs" | "lg"
  className?: string
  syncWithUrl?: boolean
}) {
  const urlAuth = useSyncExternalStore(subscribeUrl, getUrlAuth, () => null)
  const [openOverride, setOpenOverride] = useState<boolean | null>(null)
  const [mode, setMode] = useState<"masuk" | "daftar">(initialMode)
  const pathname = usePathname()
  const targetNext = next ?? pathname ?? "/"

  const isUrlMatch = syncWithUrl && (urlAuth === "masuk" || urlAuth === "daftar")
  const isOpen = openOverride ?? isUrlMatch
  const activeMode = openOverride ? mode : isUrlMatch ? (urlAuth as "masuk" | "daftar") : mode

  function handleOpenChange(nextOpen: boolean) {
    setOpenOverride(nextOpen)
    if (!nextOpen && typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (url.searchParams.has("auth")) {
        url.searchParams.delete("auth")
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : "") + url.hash)
      }
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => {
          setMode(initialMode)
          setOpenOverride(true)
        }}
      >
        {label}
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">
              {activeMode === "masuk" ? "Masuk ke ClimateStories" : "Buat Akun ClimateStories"}
            </DialogTitle>
            <DialogDescription>
              {activeMode === "masuk"
                ? "Masuk untuk menulis berita warga, berdiskusi, dan menyimpan bacaan."
                : "Daftar sebagai jurnalis warga dan mulai berkontribusi di ClimateStories."}
            </DialogDescription>
          </DialogHeader>
          <AuthFormFields key={activeMode} mode={activeMode} next={targetNext} onSwitchMode={setMode} />
        </DialogContent>
      </Dialog>
    </>
  )
}

