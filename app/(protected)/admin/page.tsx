import type { Metadata } from "next"

import { AdminDashboardLayout } from "@/components/admin/admin-dashboard-layout"
import { requireStaff } from "@/lib/auth"
import { articleService } from "@/services/article.service"
import { categoryService } from "@/services/category.service"
import { socialService } from "@/services/social.service"
import { userService } from "@/services/user.service"

export async function generateMetadata(): Promise<Metadata> {
  const staff = await requireStaff()
  return {
    title: staff.role === "ADMIN" ? "Dashboard Admin Master" : "Panel Kurasi Moderator",
  }
}

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
    <AdminDashboardLayout
      staff={staff}
      articles={articles}
      categories={categories}
      users={users}
      reports={reports}
    />
  )
}