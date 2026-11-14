import Link from "next/link"

import { signOutAction } from "@/actions/auth.actions"
import { AdminMobileMenuButton } from "@/components/admin/admin-mobile-button"
import { AuthDialog } from "@/components/auth/auth-form"
import { NotificationsMenu } from "@/components/layout/notifications-menu"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserAvatar } from "@/components/news/user-bits"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getCurrentUser } from "@/lib/auth"
import { categoryService } from "@/services/category.service"
import { notificationService } from "@/services/notification.service"
import { PenLineIcon, SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export async function Navbar() {
  const user = await getCurrentUser()
  const isStaff = user?.role === "ADMIN" || user?.role === "MODERATOR"

  // JIKA ROLE ADALAH ADMIN ATAU MODERATOR:
  // Tampilan navbar minimalis khusus dashboard monitoring: Icon hamburger (mobile) + Nama app/logo + Icon profil akun.
  if (isStaff && user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-slate-100/95 backdrop-blur dark:border-white/10 dark:bg-background/95">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <AdminMobileMenuButton />
            <Link href="/admin" className="font-heading flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Logo" className="size-8 object-contain" />
              <span>
                Climate<span className="text-emerald-600">Stories</span>
              </span>
              <span className="hidden sm:inline-flex rounded-lg bg-blue-600/10 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {user.role === "ADMIN" ? "Admin Control" : "Moderator"}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Menu akun staff" />}>
                <UserAvatar user={user} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56">
                <DropdownMenuItem render={<Link href={`/@${user.username}`} />}>Akun staff saya</DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={signOutAction}>
                  <DropdownMenuItem
                    nativeButton
                    render={<button type="submit" className="w-full text-left" />}
                    variant="destructive"
                  >
                    Keluar
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    )
  }

  const [categories, notifications] = await Promise.all([
    categoryService.list(),
    user ? notificationService.list(user.id) : Promise.resolve([]),
  ])

  // TAMPILAN NAVBAR UNTUK ROLE USER & GUEST (PORTAL BERITA)
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-slate-100/90 backdrop-blur dark:border-white/10 dark:bg-background/90">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-3.5 sm:h-16 sm:gap-4 sm:px-6 lg:gap-8 lg:px-10 xl:px-12">
        <Link href="/" className="font-heading flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight sm:text-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo" className="size-7 object-contain sm:size-8" />
          <span>
            Climate<span className="text-emerald-600">Stories</span>
          </span>
        </Link>

        <nav aria-label="Kategori" className="hidden min-w-0 flex-1 items-center gap-5 overflow-x-auto md:flex lg:gap-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/kategori/${c.slug}`}
              className="text-sm font-semibold tracking-wide whitespace-nowrap text-slate-600 uppercase hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Link href="/cari" aria-label="Cari berita" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
            <SearchIcon />
          </Link>
          <ThemeToggle />
          {user && <NotificationsMenu notifications={notifications} />}
          {user ? (
            <>
              <Link href="/tulis" className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>
                <PenLineIcon /> Tulis Berita
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Menu akun" />}>
                  <UserAvatar user={user} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56">
                  <DropdownMenuItem render={<Link href={`/@${user.username}`} />}>Profil saya</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/tulis" />}>Tulis berita</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/mengikuti" />}>Feed mengikuti</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/bookmark" />}>Bookmark</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <form action={signOutAction}>
                    <DropdownMenuItem
                      nativeButton
                      render={<button type="submit" className="w-full text-left" />}
                      variant="destructive"
                    >
                      Keluar
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <AuthDialog
                initialMode="masuk"
                label="Masuk"
                variant="ghost"
                size="sm"
                className="px-2.5 text-xs sm:px-3 sm:text-sm"
              />
              <AuthDialog
                initialMode="daftar"
                label="Daftar"
                variant="default"
                size="sm"
                className="px-2.5 text-xs sm:px-3 sm:text-sm"
              />
            </>
          )}
        </div>
      </div>

      <nav aria-label="Kategori (mobile)" className="flex gap-4 overflow-x-auto border-t border-slate-200 px-3.5 py-2 sm:px-6 md:hidden dark:border-white/10">
        {categories.map((c) => (
          <Link key={c.id} href={`/kategori/${c.slug}`} className="shrink-0 text-xs font-semibold tracking-wide whitespace-nowrap text-slate-600 uppercase dark:text-slate-300">
            {c.name}
          </Link>
        ))}
      </nav>
    </header>
  )
}

export async function Footer() {
  const user = await getCurrentUser()
  if (user?.role === "ADMIN" || user?.role === "MODERATOR") return null

  const categories = await categoryService.list()

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-100/70 dark:border-white/10 dark:bg-muted/30">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-8 px-3.5 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-12 lg:px-10 xl:px-12">
        <div className="flex flex-col gap-3 lg:col-span-5">
          <Link href="/" className="font-heading flex items-center gap-2 text-xl font-extrabold tracking-tight">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="size-8 object-contain" />
            <span>
              Climate<span className="text-emerald-600">Stories</span>
            </span>
          </Link>
          <p className="max-w-md text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-400">
            Platform berita sosial dan jurnalisme warga independen. Mengangkat kabar iklim, lingkungan, dan isu publik dengan verifikasi fakta komunitas (*Community Notes*).
          </p>
        </div>

        <div className="flex flex-col gap-2.5 lg:col-span-4">
          <h3 className="font-heading text-xs font-bold tracking-wider text-foreground uppercase">
            Kanal Berita
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/kategori/${c.slug}`}
                className="rounded-xl bg-background px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80 transition-colors hover:text-foreground dark:bg-card dark:text-slate-300 dark:ring-white/10"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 lg:col-span-3">
          <h3 className="font-heading text-xs font-bold tracking-wider text-foreground uppercase">
            Navigasi Cepat
          </h3>
          <ul className="flex flex-col gap-1.5 text-xs text-slate-600 sm:text-sm dark:text-slate-400">
            <li>
              <Link href="/" className="hover:text-foreground hover:underline">
                Beranda Utama
              </Link>
            </li>
            <li>
              <Link href="/cari" className="hover:text-foreground hover:underline">
                Pencarian &amp; Topik
              </Link>
            </li>
            {user && (
              <li>
                <Link href="/tulis" className="hover:text-foreground hover:underline">
                  Tulis Laporan Warga
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 dark:border-white/10">
        © {new Date().getFullYear()} ClimateStories — Citizen Journalism &amp; Anti-Hoax Social News.
      </div>
    </footer>
  )
}

