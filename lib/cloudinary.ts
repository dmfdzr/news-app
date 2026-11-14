import "server-only"

import { v2 as cloudinary } from "cloudinary"
import { Readable } from "node:stream"
import { cleanEnv } from "@/lib/env"

function resolveCloudName(): string {
  return (
    cleanEnv(process.env.CLOUDINARY_CLOUD_NAME) ||
    cleanEnv(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) ||
    cleanEnv(process.env.CLOUDINARY_URL?.split("@")[1])
  )
}

function getCloudinary() {
  const cloudName = resolveCloudName()
  const apiKey = cleanEnv(process.env.CLOUDINARY_API_KEY)
  const apiSecret = cleanEnv(process.env.CLOUDINARY_API_SECRET)

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    })
    return cloudinary
  }

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true })
    return cloudinary
  }

  return null
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    (resolveCloudName() &&
      cleanEnv(process.env.CLOUDINARY_API_KEY) &&
      cleanEnv(process.env.CLOUDINARY_API_SECRET)) ||
      cleanEnv(process.env.CLOUDINARY_URL)
  )
}

export async function uploadToCloudinary(
  buffer: Buffer,
  publicId?: string
): Promise<{ fileId: string; url: string }> {
  const c = getCloudinary()
  if (!c) {
    // Fallback if Cloudinary credentials are not yet set
    const fallbackId = `local-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
    return { fileId: fallbackId, url: `/api/media/${fallbackId}` }
  }

  return new Promise((resolve, reject) => {
    const filename = publicId || `cs_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
    const uploadStream = c.uploader.upload_stream(
      {
        folder: "climatestories",
        public_id: filename,
        resource_type: "image",
        format: "webp",
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"))
        } else {
          resolve({
            fileId: result.public_id,
            url: result.secure_url,
          })
        }
      }
    )

    Readable.from(buffer).pipe(uploadStream)
  })
}

export async function deleteFromCloudinary(fileId: string | null | undefined): Promise<void> {
  if (!fileId) return
  const c = getCloudinary()
  if (!c) return
  try {
    await c.uploader.destroy(fileId, { resource_type: "image" })
  } catch {}
}

export function getCloudinaryImageUrl(publicId: string): string {
  const cloudName = resolveCloudName()
  if (cloudName) {
    const normalizedId = publicId.startsWith("cs_") ? `climatestories/${publicId}` : publicId
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${normalizedId}`
  }
  return `/api/media/${publicId}`
}
