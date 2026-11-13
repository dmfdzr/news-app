"use client"

import { createContext, useContext, useState } from "react"

type AdminSidebarContextType = {
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  toggleMobile: () => void
}

const AdminSidebarContext = createContext<AdminSidebarContextType | null>(null)

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <AdminSidebarContext.Provider
      value={{
        mobileOpen,
        setMobileOpen,
        toggleMobile: () => setMobileOpen((prev) => !prev),
      }}
    >
      {children}
    </AdminSidebarContext.Provider>
  )
}

export function useAdminSidebar() {
  return useContext(AdminSidebarContext)
}
