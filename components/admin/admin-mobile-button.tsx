"use client"

import { MenuIcon } from "lucide-react"
import { useAdminSidebar } from "@/components/admin/admin-sidebar-context"
import { Button } from "@/components/ui/button"

export function AdminMobileMenuButton() {
  const sidebar = useAdminSidebar()
  if (!sidebar) return null

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Buka Menu Sidebar"
      onClick={sidebar.toggleMobile}
      className="md:hidden text-slate-700 hover:bg-slate-200/60 dark:text-slate-200 dark:hover:bg-muted"
    >
      <MenuIcon className="size-5" />
    </Button>
  )
}
