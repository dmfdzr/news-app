import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { cleanEnv, isLocalMode } from "@/lib/env"

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
      url.pathname = "/masuk"
      url.search = `?next=${encodeURIComponent(pathname)}`
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"))
  if (!hasAuthCookie) {
    if (isProtected) {
      const url = request.nextUrl.clone()
      url.pathname = "/masuk"
      url.search = `?next=${encodeURIComponent(pathname)}`
      return NextResponse.redirect(url)
    }
    return response
  }

  try {
    const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)
    const supabaseAnonKey = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user && isProtected) {
      const url = request.nextUrl.clone()
      url.pathname = "/masuk"
      url.search = `?next=${encodeURIComponent(pathname)}`
      return NextResponse.redirect(url)
    }
  } catch (err) {
    console.error("Supabase proxy error:", err)
  }

  return response
}
