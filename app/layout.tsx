import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"

import "./globals.css"
import { AdminSidebarProvider } from "@/components/admin/admin-sidebar-context"
import { Footer, Navbar } from "@/components/layout/navbar"
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
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <AdminSidebarProvider>
            <Navbar />
            <main className="mx-auto w-full max-w-[1600px] flex-1 px-3.5 py-4 sm:px-6 sm:py-6 lg:px-10 xl:px-12 has-[[data-admin-dashboard]]:max-w-none has-[[data-admin-dashboard]]:p-0">
              {children}
            </main>
            <Footer />
            <Toaster richColors />
          </AdminSidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}