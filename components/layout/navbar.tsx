import Link from "next/link"

import { signOutAction } from "@/actions/auth.actions"
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
  const [categories, user] = await Promise.all([categoryService.list(), getCurrentUser()])
  const notifications = user ? await notificationService.list(user.id) : []
  const isStaff = user?.role === "ADMIN" || user?.role === "MODERATOR"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-slate-100/90 backdrop-blur dark:border-white/10 dark:bg-background/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:gap-8 lg:px-8">
        <Link href="/" className="font-heading flex items-center gap-2 text-xl font-extrabold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo" className="size-8 object-contain" />
          <span>
            Climate<span className="text-emerald-600">Stories</span>
          </span>
        </Link>

        <nav aria-label="Kategori" className="hidden min-w-0 flex-1 items-center gap-6 overflow-x-auto md:flex">
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

        <div className="ml-auto flex items-center gap-2">
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
                  <DropdownMenuItem render={<Link href="/pengaturan" />}>Pengaturan</DropdownMenuItem>
                  {isStaff && <DropdownMenuItem render={<Link href="/admin" />}>Panel moderator</DropdownMenuItem>}
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
              <Link href="/masuk" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                Masuk
              </Link>
              <Link href="/daftar" className={cn(buttonVariants({ size: "sm" }))}>
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>

      <nav aria-label="Kategori (mobile)" className="flex gap-4 overflow-x-auto border-t border-slate-200 px-4 py-2 md:hidden dark:border-white/10">
        {categories.map((c) => (
          <Link key={c.id} href={`/kategori/${c.slug}`} className="text-xs font-semibold tracking-wide whitespace-nowrap text-slate-600 uppercase dark:text-slate-300">
            {c.name}
          </Link>
        ))}
      </nav>
    </header>
  )
}
