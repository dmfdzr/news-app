import { PrismaClient } from "@prisma/client"
import { cleanEnv } from "@/lib/env"

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = cleanEnv(process.env.DATABASE_URL)
  if (!process.env.DIRECT_URL) {
    process.env.DIRECT_URL = process.env.DATABASE_URL
  } else {
    process.env.DIRECT_URL = cleanEnv(process.env.DIRECT_URL)
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

