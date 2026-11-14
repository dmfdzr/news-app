"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"

import { updateEmailAction, updatePasswordAction, updateProfileAction } from "@/actions/user.actions"
import { ImageUploader } from "@/components/news/image-uploader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingOverlay } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { EyeIcon, EyeOffIcon } from "lucide-react"

export function ProfileForm({
  initial,
}: {
  initial: { fullName: string; username: string; email: string; bio: string; avatarDriveId: string }
}) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, undefined)
  const [emailState, emailAction, emailPending] = useActionState(updateEmailAction, undefined)
  const [pwdState, pwdAction, pwdPending] = useActionState(updatePasswordAction, undefined)

  const [avatar, setAvatar] = useState(initial.avatarDriveId)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  useEffect(() => {
    if (profileState?.error) toast.error(profileState.error)
    if (profileState?.success) toast.success(profileState.success)
  }, [profileState])

  useEffect(() => {
    if (emailState?.error) toast.error(emailState.error)
    if (emailState?.success) toast.success(emailState.success)
  }, [emailState])

  useEffect(() => {
    if (pwdState?.error) toast.error(pwdState.error)
    if (pwdState?.success) toast.success(pwdState.success)
  }, [pwdState])

  return (
    <Tabs defaultValue="profil" className="w-full max-w-4xl">
      <LoadingOverlay
        open={profilePending || emailPending || pwdPending}
        message="Menyimpan pengaturan akun..."
      />
      <TabsList className="mb-6 grid w-full grid-cols-3">
        <TabsTrigger value="profil" className="text-xs sm:text-sm">Profil</TabsTrigger>
        <TabsTrigger value="email" className="text-xs sm:text-sm">Email Akun</TabsTrigger>
        <TabsTrigger value="keamanan" className="text-xs sm:text-sm">Kata Sandi</TabsTrigger>
      </TabsList>

      {/* TAB 1: INFORMASI PROFIL & USERNAME */}
      <TabsContent value="profil">
        <Card className="rounded-2xl border-slate-200/80 dark:border-white/10">
          <CardHeader>
            <CardTitle>Informasi Profil</CardTitle>
            <CardDescription>
              Ubah foto profil, nama lengkap, username unik, dan bio akun Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={profileAction} className="flex flex-col gap-5">
              <input type="hidden" name="avatarDriveId" value={avatar} />
              <div className="flex flex-col gap-2">
                <Label>Foto Profil</Label>
                <ImageUploader kind="avatar" value={avatar} onChange={setAvatar} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  minLength={2}
                  maxLength={60}
                  defaultValue={initial.fullName}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username (@)</Label>
                <Input
                  id="username"
                  name="username"
                  required
                  pattern="[a-z0-9_]{3,20}"
                  defaultValue={initial.username}
                />
                <p className="text-xs text-muted-foreground">
                  3-20 karakter huruf kecil, angka, atau garis bawah (_).
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" rows={3} maxLength={300} defaultValue={initial.bio} />
              </div>
              <Button type="submit" disabled={profilePending} className="w-fit">
                {profilePending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 2: UBAH EMAIL */}
      <TabsContent value="email">
        <Card className="rounded-2xl border-slate-200/80 dark:border-white/10">
          <CardHeader>
            <CardTitle>Alamat Email</CardTitle>
            <CardDescription>
              Perbarui alamat email yang terhubung dengan akun login Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={emailAction} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="current-email">Email Saat Ini</Label>
                <Input id="current-email" value={initial.email} disabled className="opacity-70" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email Baru</Label>
                <Input id="email" name="email" type="email" required placeholder="nama@email.com" />
              </div>
              <Button type="submit" disabled={emailPending} className="w-fit">
                {emailPending ? "Memperbarui..." : "Perbarui Email"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 3: UBAH KATA SANDI */}
      <TabsContent value="keamanan">
        <Card className="rounded-2xl border-slate-200/80 dark:border-white/10">
          <CardHeader>
            <CardTitle>Keamanan Akun</CardTitle>
            <CardDescription>
              Ganti kata sandi akun Anda untuk menjaga keamanan akses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={pwdAction} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Kata Sandi Baru</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPwd ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="Minimal 8 karakter"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    tabIndex={-1}
                    aria-label={showPwd ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                    onClick={() => setShowPwd((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPwd ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPwd ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="Ulangi kata sandi baru"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    tabIndex={-1}
                    aria-label={showConfirmPwd ? "Sembunyikan konfirmasi kata sandi" : "Lihat konfirmasi kata sandi"}
                    onClick={() => setShowConfirmPwd((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPwd ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" disabled={pwdPending} className="w-fit">
                {pwdPending ? "Mengubah..." : "Ganti Kata Sandi"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
