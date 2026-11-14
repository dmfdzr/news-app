"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useActionState, useState } from "react"

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
          <Input
            id={`password-${mode}`}
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Minimal 8 karakter"
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </div>
        {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
        {state?.success && <p role="status" className="text-sm text-emerald-600">{state.success}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
        {onSwitchMode ? (
          <button
            type="button"
            onClick={() => onSwitchMode(isLogin ? "daftar" : "masuk")}
            className="cursor-pointer font-semibold text-blue-600 hover:underline"
          >
            {isLogin ? "Daftar sekarang" : "Masuk di sini"}
          </button>
        ) : (
          <Link href={isLogin ? "/daftar" : "/masuk"} className="font-medium text-blue-600 hover:underline">
            {isLogin ? "Daftar" : "Masuk"}
          </Link>
        )}
      </p>
    </div>
  )
}

export function AuthForm({ mode, next }: { mode: "masuk" | "daftar"; next: string }) {
  const isLogin = mode === "masuk"

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-8">
      <h1 className="font-heading text-2xl font-extrabold">{isLogin ? "Masuk" : "Buat akun"}</h1>
      <AuthFormFields mode={mode} next={next} />
    </div>
  )
}

export function AuthDialog({
  initialMode = "masuk",
  next,
  label,
  variant = "default",
  size = "sm",
  className,
}: {
  initialMode?: "masuk" | "daftar"
  next?: string
  label: string
  variant?: "default" | "outline" | "ghost" | "secondary" | "link"
  size?: "default" | "sm" | "xs" | "lg"
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"masuk" | "daftar">(initialMode)
  const pathname = usePathname()
  const targetNext = next ?? pathname ?? "/"

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => {
          setMode(initialMode)
          setOpen(true)
        }}
      >
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">
              {mode === "masuk" ? "Masuk ke ClimateStories" : "Buat Akun ClimateStories"}
            </DialogTitle>
            <DialogDescription>
              {mode === "masuk"
                ? "Masuk untuk menulis berita warga, berdiskusi, dan menyimpan bacaan."
                : "Daftar sebagai jurnalis warga dan mulai berkontribusi di ClimateStories."}
            </DialogDescription>
          </DialogHeader>
          <AuthFormFields key={mode} mode={mode} next={targetNext} onSwitchMode={setMode} />
        </DialogContent>
      </Dialog>
    </>
  )
}

