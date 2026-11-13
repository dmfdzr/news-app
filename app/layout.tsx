import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"

import "./globals.css"
import { AdminSidebarProvider } from "@/components/admin/admin-sidebar-context"
import { Navbar } from "@/components/layout/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { getSiteUrl } from "@/lib/env"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" })

export const metadata: Metadata = {
  title: { default: "ClimateStories", template: "%s | ClimateStories" },
  description: "Platform jurnalisme dan berita sosial: tulis, repost, dan diskusikan isu lingkungan dan kabar terkini.",
  metadataBase: getSiteUrl(),
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn("antialiased", inter.variable, jakarta.variable, "font-sans")}
    >
      <body>
        <ThemeProvider>
          <AdminSidebarProvider>
            <Navbar />
            <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">{children}</main>
            <Toaster richColors />
          </AdminSidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}