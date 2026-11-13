"use client"

import { useState } from "react"
import {
  BarChart3Icon,
  CheckCircle2Icon,
  EyeIcon,
  FileTextIcon,
  FlagIcon,
  Grid2X2Icon,
  HeartIcon,
  LayersIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessageSquareIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  ShieldAlertIcon,
  SparklesIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"

import { signOutAction } from "@/actions/auth.actions"
import { useAdminSidebar } from "@/components/admin/admin-sidebar-context"
import {
  CategoryForm,
  HeadlineSelect,
  ReportActions,
  RoleSelect,
  UserDeleteButton,
  UserTrustScoreControl,
  UserVerifiedToggle,
  AdminDeleteArticleButton,
} from "@/components/admin/admin-controls"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { User as UserModel } from "@prisma/client"

type AdminDashboardProps = {
  staff: UserModel
  articles: Array<{
    id: string
    title: string
    slug: string
    headlinePosition: string
    viewCount?: number
    publishedAt: Date | null
    author: { fullName: string; username: string }
    category: { name: string }
    _count?: {
      comments: number
      likes: number
      reposts: number
      communityNotes: number
    }
  }>
  categories: Array<{ id: string; name: string; description: string | null; orderIndex: number }>
  users: Array<{
    id: string
    username: string
    fullName: string
    email: string
    role: "USER" | "MODERATOR" | "ADMIN"
    isVerified: boolean
    trustScore: number
  }>
  reports: Array<{
    id: string
    reason: "HOAX" | "SPAM" | "MISLEADING" | "HARASSMENT" | "OTHER"
    details: string | null
    status: "PENDING" | "RESOLVED" | "DISMISSED"
    createdAt: Date
    user: { username: string; fullName: string }
    article: { id: string; title: string; slug: string } | null
    comment: { id: string; content: string } | null
  }>
}

type TabKey = "ringkasan" | "laporan" | "berita" | "headline" | "kategori" | "pengguna"

export function AdminDashboardLayout({ staff, articles, categories, users, reports }: AdminDashboardProps) {
  const isAdmin = staff.role === "ADMIN"

  const pendingReports = reports.filter((r) => r.status === "PENDING")
  const handledReports = reports.filter((r) => r.status !== "PENDING")
  const resolutionRate = reports.length > 0 ? Math.round((handledReports.length / reports.length) * 100) : 100
  const activeHeadlines = articles.filter((a) => a.headlinePosition !== "NONE")

  // ponytail: in-memory aggregation over <=100 recent articles/users; move to SQL GROUP BY when articles > 1,000
  const totalViews = articles.reduce((acc, a) => acc + (a.viewCount ?? 0), 0)
  const totalLikes = articles.reduce((acc, a) => acc + (a._count?.likes ?? 0), 0)
  const totalComments = articles.reduce((acc, a) => acc + (a._count?.comments ?? 0), 0)
  const totalReposts = articles.reduce((acc, a) => acc + (a._count?.reposts ?? 0), 0)
  const totalEngagement = totalLikes + totalComments + totalReposts
  const totalCommunityNotes = articles.reduce((acc, a) => acc + (a._count?.communityNotes ?? 0), 0)

  const [sevenDaysAgo] = useState(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  const articlesLast7Days = articles.filter(
    (a) => a.publishedAt && new Date(a.publishedAt) >= sevenDaysAgo
  ).length

  const reasonLabels: Record<AdminDashboardProps["reports"][number]["reason"], string> = {
    HOAX: "Indikasi Hoaks",
    MISLEADING: "Informasi Menyesatkan",
    SPAM: "Spam / Promosi",
    HARASSMENT: "Ujaran Kebencian / Pelecehan",
    OTHER: "Lainnya",
  }
  const reportReasons = (["HOAX", "MISLEADING", "SPAM", "HARASSMENT", "OTHER"] as const).map((reason) => ({
    reason,
    label: reasonLabels[reason],
    count: reports.filter((r) => r.reason === reason).length,
  }))

  const categoryStats = categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      count: articles.filter((a) => a.category.name === c.name).length,
    }))
    .sort((a, b) => b.count - a.count)

  const topArticles = [...articles]
    .sort((a, b) => {
      const scoreA = (a.viewCount ?? 0) + ((a._count?.likes ?? 0) + (a._count?.comments ?? 0) + (a._count?.reposts ?? 0)) * 5
      const scoreB = (b.viewCount ?? 0) + ((b._count?.likes ?? 0) + (b._count?.comments ?? 0) + (b._count?.reposts ?? 0)) * 5
      return scoreB - scoreA
    })
    .slice(0, 5)

  const verifiedUsersCount = users.filter((u) => u.isVerified || u.trustScore >= 50).length
  const topContributors = [...users]
    .filter((u) => u.role === "USER")
    .sort((a, b) => b.trustScore - a.trustScore)
    .slice(0, 5)

  const [activeTab, setActiveTab] = useState<TabKey>("ringkasan")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const sidebarContext = useAdminSidebar()
  const isMobileDrawerOpen = sidebarContext ? sidebarContext.mobileOpen : false
  const closeMobileDrawer = () => sidebarContext?.setMobileOpen(false)

  const navItems = [
    {
      key: "ringkasan" as TabKey,
      label: "Ringkasan",
      icon: BarChart3Icon,
    },
    {
      key: "laporan" as TabKey,
      label: "Laporan Warga",
      icon: ShieldAlertIcon,
      badge: pendingReports.length > 0 ? pendingReports.length : undefined,
      badgeColor: "bg-rose-500 text-white",
    },
    {
      key: "berita" as TabKey,
      label: "Monitoring Berita",
      icon: FileTextIcon,
      count: articles.length,
    },
    {
      key: "headline" as TabKey,
      label: "Headline Bento",
      icon: Grid2X2Icon,
      count: activeHeadlines.length,
    },
    {
      key: "kategori" as TabKey,
      label: "Kategori Kanal",
      icon: LayersIcon,
      count: categories.length,
    },
    ...(isAdmin
      ? [
          {
            key: "pengguna" as TabKey,
            label: "Kelola Pengguna",
            icon: UsersIcon,
            count: users.length,
          },
        ]
      : []),
  ]

  return (
    <div className="relative -mx-4 -my-6 flex min-h-[calc(100vh-4rem)] lg:-mx-8">
      {/* MOBILE DRAWER BACKDROP */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={closeMobileDrawer}
        />
      )}

      {/* SIDEBAR MONITORING DASHBOARD (DESKTOP & MOBILE DRAWER) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-card transition-all duration-300 md:sticky md:top-16 md:z-20 md:h-[calc(100vh-4rem)] dark:border-white/10",
          sidebarCollapsed ? "md:w-20" : "md:w-64",
          isMobileDrawerOpen ? "w-68 translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* SIDEBAR HEADER MOBILE */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 md:hidden dark:border-white/10">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <LayoutDashboardIcon className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-sm font-extrabold tracking-tight truncate">
                {isAdmin ? "Admin Master" : "Moderator"}
              </span>
              <span className="text-[10px] text-muted-foreground">Control Center</span>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={closeMobileDrawer}
            className="flex text-muted-foreground hover:text-foreground"
            aria-label="Tutup menu"
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        {/* SIDEBAR HEADER DESKTOP (STICKY TOP) */}
        <div className={cn(
          "hidden md:flex items-center gap-2.5 border-b border-slate-200/80 px-4 py-3.5 dark:border-white/10",
          sidebarCollapsed ? "justify-center px-2" : "justify-start"
        )}>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <LayoutDashboardIcon className="size-4" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-heading text-xs font-black tracking-tight truncate text-foreground">
                {isAdmin ? "ADMIN CONTROL" : "MODERATOR PANEL"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">Monitoring &amp; Manage</span>
            </div>
          )}
        </div>

        {/* SIDEBAR MENU LIST */}
        <div className="flex flex-1 flex-col gap-1.5 p-3 overflow-y-auto">
          {!sidebarCollapsed && (
            <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Monitoring Menu
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActiveTab(item.key)
                  closeMobileDrawer()
                }}
                className={cn(
                  "group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all select-none",
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-accent/80 hover:text-foreground dark:text-slate-400 dark:hover:text-white",
                  sidebarCollapsed && "justify-center px-2 py-3"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={cn("size-4 shrink-0", isActive ? "text-white" : "text-slate-500 group-hover:text-foreground")} />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}

                {!sidebarCollapsed && item.badge !== undefined && (
                  <span className={cn("ml-auto flex size-5 items-center justify-center rounded-full text-[10px] font-bold", item.badgeColor)}>
                    {item.badge}
                  </span>
                )}
                {!sidebarCollapsed && item.count !== undefined && !item.badge && (
                  <span className="ml-auto text-[10px] text-muted-foreground opacity-80">
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* SIDEBAR FOOTER (USER INFO, TOGGLE COLLAPSE & LOGOUT) */}
        <div className="border-t border-slate-200 p-3 flex flex-col gap-2 dark:border-white/10">
          {/* USER INFO & LOGOUT */}
          <div className={cn("flex items-center gap-2.5 rounded-xl p-2 bg-muted/40", sidebarCollapsed && "justify-center p-1.5")}>
            <div className="size-8 rounded-full bg-blue-600/20 text-blue-600 font-bold flex items-center justify-center shrink-0 text-xs">
              {staff.fullName.slice(0, 2).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-foreground">{staff.fullName}</p>
                <p className="truncate text-[10px] text-muted-foreground">@{staff.username}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <form action={signOutAction}>
                <Button variant="ghost" size="icon-xs" type="submit" title="Keluar">
                  <LogOutIcon className="size-3.5 text-rose-500" />
                </Button>
              </form>
            )}
          </div>

          {/* DESKTOP SIDEBAR TOGGLE BUTTON (DI BAGIAN BAWAH SIDEBAR) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              "hidden md:flex w-full items-center text-xs font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground rounded-xl transition-all",
              sidebarCollapsed ? "justify-center px-0 h-9" : "justify-between px-3 h-9"
            )}
            title={sidebarCollapsed ? "Buka Sidebar" : "Perkecil Sidebar"}
          >
            {!sidebarCollapsed && <span>Perkecil Sidebar</span>}
            {sidebarCollapsed ? <PanelLeftOpenIcon className="size-4" /> : <PanelLeftCloseIcon className="size-4" />}
          </Button>
        </div>
      </aside>

      {/* MAIN MONITORING CONTENT AREA */}
      <div className="flex min-w-0 flex-1 flex-col px-4 py-6 md:px-8">
        {/* TOP STATUS BAR */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-black tracking-tight capitalize">
              {activeTab === "ringkasan"
                ? "Ringkasan & Metrik Aplikasi"
                : activeTab === "laporan"
                  ? "Laporan Komunitas (Anti-Hoaks & Spam)"
                  : activeTab === "berita"
                    ? "Monitoring Berita Publik"
                    : activeTab === "headline"
                      ? "Penataan Headline Bento Grid"
                      : activeTab === "kategori"
                        ? "Manajemen Kanal Kategori"
                        : "Manajemen Pengguna (Super Admin)"}
            </h1>
            <p className="text-xs text-muted-foreground">
              Dashboard monitoring aktif untuk peran <strong>{staff.role}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={isAdmin ? "bg-blue-600 text-white" : "bg-amber-600 text-white"}>
              {isAdmin ? "SUPER ADMIN" : "MODERATOR"}
            </Badge>
          </div>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === "ringkasan" && (
          <div className="flex flex-col gap-6">
            {/* BARIS 1: 4 KARTU UTAMA (KLIK UNTUK PINDAH MENU) */}
            <section aria-label="Statistik Utama" className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
              <Card
                onClick={() => setActiveTab("laporan")}
                className="cursor-pointer rounded-2xl border-slate-200/80 p-4 transition-all hover:border-rose-400 hover:shadow-sm dark:border-white/10"
              >
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-semibold tracking-wider uppercase">Laporan Warga</span>
                  <FlagIcon className="size-4 text-rose-500" />
                </div>
                <p className="mt-1.5 text-2xl font-black text-rose-600 dark:text-rose-400">
                  {pendingReports.length}
                </p>
                <span className="text-[11px] text-muted-foreground">
                  Menunggu tindakan ({reports.length} total)
                </span>
              </Card>

              <Card
                onClick={() => setActiveTab("headline")}
                className="cursor-pointer rounded-2xl border-slate-200/80 p-4 transition-all hover:border-emerald-400 hover:shadow-sm dark:border-white/10"
              >
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-semibold tracking-wider uppercase">Headline Bento</span>
                  <Grid2X2Icon className="size-4 text-emerald-600" />
                </div>
                <p className="mt-1.5 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {activeHeadlines.length} / 5
                </p>
                <span className="text-[11px] text-muted-foreground">Slot aktif di beranda</span>
              </Card>

              <Card
                onClick={() => setActiveTab("kategori")}
                className="cursor-pointer rounded-2xl border-slate-200/80 p-4 transition-all hover:border-blue-400 hover:shadow-sm dark:border-white/10"
              >
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-semibold tracking-wider uppercase">Kategori Kanal</span>
                  <LayersIcon className="size-4 text-blue-500" />
                </div>
                <p className="mt-1.5 text-2xl font-black text-blue-600 dark:text-blue-400">
                  {categories.length}
                </p>
                <span className="text-[11px] text-muted-foreground">Kanal berita aktif</span>
              </Card>

              <Card
                onClick={() => setActiveTab(isAdmin ? "pengguna" : "berita")}
                className="cursor-pointer rounded-2xl border-slate-200/80 p-4 transition-all hover:border-indigo-400 hover:shadow-sm dark:border-white/10"
              >
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-semibold tracking-wider uppercase">
                    {isAdmin ? "Total Akun User" : "Berita Terbit"}
                  </span>
                  {isAdmin ? (
                    <UsersIcon className="size-4 text-indigo-500" />
                  ) : (
                    <FileTextIcon className="size-4 text-indigo-500" />
                  )}
                </div>
                <p className="mt-1.5 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {isAdmin ? users.length : articles.length}
                </p>
                <span className="text-[11px] text-muted-foreground">
                  {isAdmin ? `${verifiedUsersCount} kontributor terverifikasi` : `${articlesLast7Days} terbit 7 hari terakhir`}
                </span>
              </Card>
            </section>

            {/* BARIS 2: METRIK OPERASIONAL & INTERAKSI KOMUNITAS */}
            <section aria-label="Metrik Operasional & Interaksi" className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
              <Card className="rounded-2xl border-slate-200/80 p-4 dark:border-white/10">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-semibold tracking-wider uppercase">Total Tayangan</span>
                  <EyeIcon className="size-4 text-sky-500" />
                </div>
                <p className="mt-1.5 text-2xl font-black text-sky-600 dark:text-sky-400">
                  {totalViews.toLocaleString("id-ID")}
                </p>
                <span className="text-[11px] text-muted-foreground">
                  Dari {articles.length} berita ({articlesLast7Days} baru minggu ini)
                </span>
              </Card>

              <Card className="rounded-2xl border-slate-200/80 p-4 dark:border-white/10">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-semibold tracking-wider uppercase">Interaksi Publik</span>
                  <HeartIcon className="size-4 text-pink-500" />
                </div>
                <p className="mt-1.5 text-2xl font-black text-pink-600 dark:text-pink-400">
                  {totalEngagement.toLocaleString("id-ID")}
                </p>
                <span className="text-[11px] text-muted-foreground">
                  {totalLikes} suka · {totalComments} komentar · {totalReposts} repost
                </span>
              </Card>

              <Card className="rounded-2xl border-slate-200/80 p-4 dark:border-white/10">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-semibold tracking-wider uppercase">Catatan Komunitas</span>
                  <SparklesIcon className="size-4 text-amber-500" />
                </div>
                <p className="mt-1.5 text-2xl font-black text-amber-600 dark:text-amber-400">
                  {totalCommunityNotes}
                </p>
                <span className="text-[11px] text-muted-foreground">
                  Verifikasi fakta &amp; konteks ahli
                </span>
              </Card>

              <Card className="rounded-2xl border-slate-200/80 p-4 dark:border-white/10">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-semibold tracking-wider uppercase">Rasio Moderasi</span>
                  <CheckCircle2Icon className="size-4 text-teal-500" />
                </div>
                <p className="mt-1.5 text-2xl font-black text-teal-600 dark:text-teal-400">
                  {resolutionRate}%
                </p>
                <span className="text-[11px] text-muted-foreground">
                  {handledReports.length} dari {reports.length} laporan selesai
                </span>
              </Card>
            </section>

            {/* BARIS 3: BREAKDOWN DISTRIBUSI & PERINGKAT */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* DISTRIBUSI LAPORAN & KANAL */}
              <Card className="rounded-2xl border-slate-200/80 dark:border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Distribusi Laporan &amp; Kanal Berita</CardTitle>
                  <CardDescription>
                    Pemetaan alasan laporan warga dan sebaran artikel pada tiap kanal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div>
                    <h3 className="mb-2.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      Laporan Berdasarkan Alasan
                    </h3>
                    <div className="flex flex-col gap-2">
                      {reportReasons.map((item) => {
                        const pct = reports.length > 0 ? Math.round((item.count / reports.length) * 100) : 0
                        return (
                          <div key={item.reason} className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground">{item.label}</span>
                              <span className="text-muted-foreground">
                                {item.count} ({pct}%)
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-rose-500 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="mb-2.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      Sebaran Berita per Kanal
                    </h3>
                    <div className="flex flex-col gap-2">
                      {categoryStats.map((cat) => {
                        const pct = articles.length > 0 ? Math.round((cat.count / articles.length) * 100) : 0
                        return (
                          <div key={cat.id} className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground">{cat.name}</span>
                              <span className="text-muted-foreground">
                                {cat.count} berita ({pct}%)
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-blue-600 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* TOP BERITA & KONTRIBUTOR */}
              <Card className="rounded-2xl border-slate-200/80 dark:border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {isAdmin ? "Berita Terpopuler & Top Kontributor" : "Berita dengan Trafik & Diskusi Tertinggi"}
                  </CardTitle>
                  <CardDescription>
                    Pantau artikel dengan jangkauan tertinggi serta reputasi jurnalis warga.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div>
                    <h3 className="mb-2.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      Top 5 Berita Terpopuler
                    </h3>
                    {topArticles.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Belum ada berita terbit.</p>
                    ) : (
                      <div className="flex flex-col divide-y">
                        {topArticles.map((a, idx) => (
                          <div key={a.id} className="flex items-center justify-between gap-3 py-2 text-xs">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-foreground">
                                {idx + 1}. {a.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                @{a.author.username} · {a.category.name}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <EyeIcon className="size-3" /> {a.viewCount ?? 0}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <MessageSquareIcon className="size-3" /> {a._count?.comments ?? 0}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="border-t pt-4">
                      <h3 className="mb-2.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        Top Kontributor Jurnalis Warga (Trust Score)
                      </h3>
                      {topContributors.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Belum ada kontributor warga.</p>
                      ) : (
                        <div className="flex flex-col divide-y">
                          {topContributors.map((u) => (
                            <div key={u.id} className="flex items-center justify-between py-2 text-xs">
                              <div>
                                <span className="font-semibold text-foreground">{u.fullName}</span>{" "}
                                <span className="text-muted-foreground">@{u.username}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {u.isVerified && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    Verified
                                  </Badge>
                                )}
                                <Badge variant="outline" className="font-mono text-[11px]">
                                  {u.trustScore} poin
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "laporan" && (
          <Card className="rounded-2xl border-slate-200/80 dark:border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Antrean Laporan Anti-Hoaks &amp; Spam</CardTitle>
                  <CardDescription>
                    Tinjau laporan warga atas indikasi berita palsu, informasi menyesatkan, atau komentar tidak pantas.
                  </CardDescription>
                </div>
                <Badge variant={pendingReports.length > 0 ? "destructive" : "outline"}>
                  {pendingReports.length} Perlu Tindakan
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-2.5 pr-4">Waktu</th>
                      <th className="py-2.5 pr-4">Pelapor</th>
                      <th className="py-2.5 pr-4">Alasan</th>
                      <th className="py-2.5 pr-4">Konten Terlapor</th>
                      <th className="py-2.5 pr-4">Status</th>
                      <th className="py-2.5">Aksi Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} className="border-b transition-colors hover:bg-muted/40">
                        <td className="py-3 pr-4 text-xs whitespace-nowrap text-slate-500">
                          {formatDateTime(r.createdAt)}
                        </td>
                        <td className="py-3 pr-4 text-xs font-medium">@{r.user.username}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={r.reason === "HOAX" ? "destructive" : "secondary"}>
                            {r.reason}
                          </Badge>
                          {r.details && (
                            <p className="mt-1 max-w-xs text-xs text-slate-500">{r.details}</p>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-xs">
                          {r.article && (
                            <span className="font-medium text-foreground">
                              [Berita] {r.article.title}
                            </span>
                          )}
                          {r.comment && (
                            <p className="italic text-slate-600 dark:text-slate-400">
                              [Komentar] &quot;{r.comment.content.slice(0, 60)}...&quot;
                            </p>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-xs font-semibold">
                          <Badge
                            variant={
                              r.status === "PENDING"
                                ? "outline"
                                : r.status === "RESOLVED"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <ReportActions
                            reportId={r.id}
                            targetType={r.article ? "ARTICLE" : r.comment ? "COMMENT" : undefined}
                            targetId={r.article?.id ?? r.comment?.id}
                          />
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                          Tidak ada laporan yang perlu ditindaklanjuti.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "berita" && (
          <Card className="rounded-2xl border-slate-200/80 dark:border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monitoring Berita Publik</CardTitle>
                  <CardDescription>
                    Awasi seluruh tulisan jurnalis warga, jumlah tayangan (*views*), tanggal publikasi, dan hapus jika menyalahi aturan.
                  </CardDescription>
                </div>
                <Badge variant="outline">{articles.length} Berita Terbit</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-2.5 pr-4">Judul Berita</th>
                      <th className="py-2.5 pr-4">Penulis</th>
                      <th className="py-2.5 pr-4">Kanal</th>
                      <th className="py-2.5 pr-4">Tayang</th>
                      <th className="py-2.5 pr-4">Tanggal</th>
                      <th className="py-2.5">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((a) => (
                      <tr key={a.id} className="border-b transition-colors hover:bg-muted/40">
                        <td className="py-2.5 pr-4">
                          <span className="font-medium text-foreground">{a.title}</span>
                        </td>
                        <td className="py-2.5 pr-4 text-xs font-medium">
                          {a.author.fullName} (@{a.author.username})
                        </td>
                        <td className="py-2.5 pr-4 text-xs">
                          <Badge variant="secondary">{a.category.name}</Badge>
                        </td>
                        <td className="py-2.5 pr-4 text-xs text-muted-foreground">
                          {a.viewCount ?? 0} views
                        </td>
                        <td className="py-2.5 pr-4 text-xs whitespace-nowrap text-muted-foreground">
                          {a.publishedAt ? formatDateTime(a.publishedAt) : "-"}
                        </td>
                        <td className="py-2.5">
                          <AdminDeleteArticleButton articleId={a.id} title={a.title} />
                        </td>
                      </tr>
                    ))}
                    {articles.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                          Belum ada berita terbit dalam aplikasi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "headline" && (
          <Card className="rounded-2xl border-slate-200/80 dark:border-white/10">
            <CardHeader>
              <CardTitle>Penataan Berita Headline Bento Grid</CardTitle>
              <CardDescription>
                Tentukan posisi tayang artikel pada Hero Bento Grid: 1 Utama Besar (Kiri), 1 Menengah (Tengah), dan 3 Ringkas (Daftar Kanan).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-2.5 pr-4">Judul Artikel</th>
                      <th className="py-2.5">Posisi Tayang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((a) => (
                      <tr key={a.id} className="border-b transition-colors hover:bg-muted/40">
                        <td className="py-2.5 pr-4">
                          <span className="font-medium text-foreground">{a.title}</span>
                        </td>
                        <td className="py-2.5">
                          <HeadlineSelect articleId={a.id} value={a.headlinePosition} />
                        </td>
                      </tr>
                    ))}
                    {articles.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-8 text-center text-sm text-slate-500">
                          Belum ada berita terbit untuk dijadikan headline.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "kategori" && (
          <Card className="rounded-2xl border-slate-200/80 dark:border-white/10">
            <CardHeader>
              <CardTitle>Manajemen Kanal Kategori</CardTitle>
              <CardDescription>
                Kategori berita yang tampil pada portal berita pengguna.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {categories.map((c) => (
                  <CategoryForm key={c.id} category={c} />
                ))}
              </div>
              <div className="mt-4 border-t pt-4">
                <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  + Tambah Kategori Baru
                </h3>
                <CategoryForm />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "pengguna" && isAdmin && (
          <Card className="rounded-2xl border-slate-200/80 dark:border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manajemen Pengguna (Super Admin)</CardTitle>
                  <CardDescription>
                    Atur hak akses peran (`USER` ↔ `MODERATOR` ↔ `ADMIN`), status Verified Contributor, dan skor reputasi.
                  </CardDescription>
                </div>
                <Badge variant="outline">{users.length} Akun Terdaftar</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-2.5 pr-4">Pengguna</th>
                      <th className="py-2.5 pr-4">Email</th>
                      <th className="py-2.5 pr-4">Peran</th>
                      <th className="py-2.5 pr-4">Reputasi</th>
                      <th className="py-2.5 pr-4">Verified</th>
                      <th className="py-2.5">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const isCurrentAdmin = u.id === staff.id
                      return (
                        <tr key={u.id} className="border-b transition-colors hover:bg-muted/40">
                          <td className="py-3 pr-4">
                            <span className="font-semibold text-foreground">{u.fullName}</span>
                            <p className="text-xs text-muted-foreground">@{u.username}</p>
                          </td>
                          <td className="py-3 pr-4 text-xs text-slate-600 dark:text-slate-400">
                            {u.email}
                          </td>
                          <td className="py-3 pr-4">
                            <RoleSelect userId={u.id} value={u.role} disabled={isCurrentAdmin} />
                          </td>
                          <td className="py-3 pr-4">
                            <UserTrustScoreControl
                              userId={u.id}
                              score={u.trustScore}
                              disabled={isCurrentAdmin}
                            />
                          </td>
                          <td className="py-3 pr-4">
                            <UserVerifiedToggle
                              userId={u.id}
                              isVerified={u.isVerified}
                              disabled={isCurrentAdmin}
                            />
                          </td>
                          <td className="py-3">
                            <UserDeleteButton
                              userId={u.id}
                              username={u.username}
                              disabled={isCurrentAdmin}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
