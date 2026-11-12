import type { Metadata } from "next"
import Link from "next/link"

import {
  CategoryForm,
  HeadlineSelect,
  ReportActions,
  RoleSelect,
  UserDeleteButton,
  UserTrustScoreControl,
  UserVerifiedToggle,
} from "@/components/admin/admin-controls"
import { Badge } from "@/components/ui/badge"
import { requireStaff } from "@/lib/auth"
import { formatDateTime } from "@/lib/format"
import { articleService } from "@/services/article.service"
import { categoryService } from "@/services/category.service"
import { socialService } from "@/services/social.service"
import { userService } from "@/services/user.service"

export const metadata: Metadata = { title: "Panel Moderator" }
export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const staff = await requireStaff()
  const isAdmin = staff.role === "ADMIN"
  const [articles, categories, users, reports] = await Promise.all([
    articleService.listForHeadlineAdmin(),
    categoryService.list(),
    isAdmin ? userService.listUsers() : Promise.resolve([]),
    socialService.listReports(),
  ])

  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">Panel Moderator</h1>

      <section aria-labelledby="laporan" className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 id="laporan" className="text-xl font-bold">Laporan Komunitas (Anti-Hoaks &amp; Spam)</h2>
          <Badge variant="outline">{reports.filter((r) => r.status === "PENDING").length} Menunggu</Badge>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Tindaklanjuti laporan pengguna terhadap berita palsu, informasi menyesatkan, atau komentar spam.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-semibold text-slate-500 uppercase">
                <th className="py-2 pr-4">Waktu</th>
                <th className="py-2 pr-4">Pelapor</th>
                <th className="py-2 pr-4">Alasan</th>
                <th className="py-2 pr-4">Konten Terlapor</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2 pr-4 text-xs whitespace-nowrap text-slate-500">{formatDateTime(r.createdAt)}</td>
                  <td className="py-2 pr-4 text-xs font-medium">@{r.user.username}</td>
                  <td className="py-2 pr-4">
                    <Badge variant={r.reason === "HOAX" ? "destructive" : "secondary"}>{r.reason}</Badge>
                    {r.details && <p className="mt-1 text-xs text-slate-500 max-w-xs">{r.details}</p>}
                  </td>
                  <td className="py-2 pr-4 text-xs">
                    {r.article && (
                      <Link href={`/berita/${r.article.slug}`} className="font-medium text-blue-600 hover:underline">
                        [Berita] {r.article.title}
                      </Link>
                    )}
                    {r.comment && (
                      <p className="italic text-slate-600 dark:text-slate-400">
                        [Komentar] &quot;{r.comment.content.slice(0, 60)}...&quot;
                      </p>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-xs font-semibold">
                    <Badge variant={r.status === "PENDING" ? "outline" : r.status === "RESOLVED" ? "secondary" : "destructive"}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-2">
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
                  <td colSpan={6} className="py-4 text-center text-slate-500">
                    Tidak ada laporan komunitas saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="headline" className="flex flex-col gap-3">
        <h2 id="headline" className="text-xl font-bold">Headline Bento Grid</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">Satu berita utama, satu tengah, maksimal tiga di daftar kanan.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="py-2 pr-4"><Link href={`/berita/${a.slug}`} className="hover:underline">{a.title}</Link></td>
                  <td className="py-2"><HeadlineSelect articleId={a.id} value={a.headlinePosition} /></td>
                </tr>
              ))}
              {articles.length === 0 && <tr><td className="py-4 text-slate-600">Belum ada berita terbit.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="kategori" className="flex flex-col gap-3">
        <h2 id="kategori" className="text-xl font-bold">Kategori Navbar</h2>
        {categories.map((c) => <CategoryForm key={c.id} category={c} />)}
        <h3 className="mt-2 text-sm font-semibold">Tambah kategori</h3>
        <CategoryForm />
      </section>

      {isAdmin && (
        <section aria-labelledby="pengguna" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="pengguna" className="text-xl font-bold">Manajemen Pengguna (Admin Master)</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Kelola peran, lencana verified, skor reputasi, dan akun seluruh pengguna.
              </p>
            </div>
            <Badge variant="outline">{users.length} Akun Terdaftar</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-semibold text-slate-500 uppercase">
                  <th className="py-2 pr-4">Pengguna</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Peran</th>
                  <th className="py-2 pr-4">Reputasi</th>
                  <th className="py-2 pr-4">Verified</th>
                  <th className="py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrentAdmin = u.id === staff.id
                  return (
                    <tr key={u.id} className="border-b">
                      <td className="py-2.5 pr-4">
                        <Link href={`/@${u.username}`} className="font-semibold text-foreground hover:underline">
                          {u.fullName}
                        </Link>
                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="py-2.5 pr-4">
                        <RoleSelect userId={u.id} value={u.role} disabled={isCurrentAdmin} />
                      </td>
                      <td className="py-2.5 pr-4">
                        <UserTrustScoreControl userId={u.id} score={u.trustScore} disabled={isCurrentAdmin} />
                      </td>
                      <td className="py-2.5 pr-4">
                        <UserVerifiedToggle userId={u.id} isVerified={u.isVerified} disabled={isCurrentAdmin} />
                      </td>
                      <td className="py-2.5">
                        <UserDeleteButton userId={u.id} username={u.username} disabled={isCurrentAdmin} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
