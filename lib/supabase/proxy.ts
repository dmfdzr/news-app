import { NextResponse, type NextRequest } from "next/server"

import { isLocalMode } from "@/lib/env"

const PROTECTED_PREFIXES = [
  "/tulis",
  "/edit",
  "/bookmark",
  "/mengikuti",
  "/pengaturan",
  "/admin",
  "/notifikasi",
]

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (isLocalMode) {
    const localId = request.cookies.get("local_user_id")?.value
    if (localId === "guest" && isProtected) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      url.search = `?auth=masuk&next=${encodeURIComponent(pathname)}`
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  const response = NextResponse.next({ request })

  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"))
  if (!hasAuthCookie && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    url.search = `?auth=masuk&next=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url)
  }

  return response
}
