export function cleanEnv(value?: string): string {
  if (!value) return ""
  return value.trim().replace(/^["']|["']$/g, "")
}

const dbUrl = cleanEnv(process.env.DATABASE_URL)
const supaUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)
const supaAnon = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const isLocalMode =
  cleanEnv(process.env.LOCAL_MODE) === "true" ||
  !dbUrl ||
  dbUrl.includes("[PROJECT-REF]") ||
  dbUrl.includes("localhost:5432/db") ||
  !supaUrl ||
  !supaAnon

export function getSiteUrl(): URL {
  const raw =
    cleanEnv(process.env.NEXT_PUBLIC_SITE_URL) ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${cleanEnv(process.env.VERCEL_PROJECT_PRODUCTION_URL)}`
      : process.env.VERCEL_URL
        ? `https://${cleanEnv(process.env.VERCEL_URL)}`
        : "http://localhost:3000")
  try {
    return new URL(raw.startsWith("http") ? raw : `https://${raw}`)
  } catch {
    return new URL("http://localhost:3000")
  }
}

