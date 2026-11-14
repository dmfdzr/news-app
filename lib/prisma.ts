import { PrismaClient } from "@prisma/client"
import { cleanEnv, isLocalMode } from "@/lib/env"

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = cleanEnv(process.env.DATABASE_URL)
  if (!process.env.DIRECT_URL) {
    process.env.DIRECT_URL = process.env.DATABASE_URL
  } else {
    process.env.DIRECT_URL = cleanEnv(process.env.DIRECT_URL)
  }
}

// ponytail: in-process TTL cache to cut remote Supabase round-trips; swap for Redis if multi-region strict consistency is needed
type CacheEntry<T> = { value: T; expiresAt: number }

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  prismaConnected?: boolean
  appCache?: Map<string, CacheEntry<unknown>>
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()
const appCache = globalForPrisma.appCache ?? new Map<string, CacheEntry<unknown>>()

if (!isLocalMode && !globalForPrisma.prismaConnected) {
  globalForPrisma.prismaConnected = true
  void prisma.$connect().catch(() => {})
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
  globalForPrisma.appCache = appCache
}

export async function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now()
  const hit = appCache.get(key) as CacheEntry<T> | undefined
  if (hit && hit.expiresAt > now) return hit.value
  const value = await fn()
  appCache.set(key, { value, expiresAt: now + ttlMs })
  return value
}

export function invalidateCache(...prefixes: string[]) {
  if (prefixes.length === 0) {
    appCache.clear()
    return
  }
  for (const k of appCache.keys()) {
    if (prefixes.some((p) => k.startsWith(p))) appCache.delete(k)
  }
}


