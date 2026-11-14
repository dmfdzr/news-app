import fs from "node:fs"
import path from "node:path"
import { NextResponse, type NextRequest } from "next/server"
import sharp from "sharp"

import { getCurrentUser } from "@/lib/auth"
import { deleteFromCloudinary, isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary"
import { DRIVE_ID_PATTERN, MAX_UPLOAD_BYTES } from "@/lib/media"

export const runtime = "nodejs"

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"])
const LOCAL_MEDIA_DIR = path.join(process.cwd(), ".local-media")

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Anda harus masuk terlebih dahulu." }, { status: 401 })

  const form = await request.formData().catch(() => null)
  const file = form?.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 })
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Format gambar tidak didukung." }, { status: 415 })
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Ukuran gambar maksimal 5 MB." }, { status: 413 })

  const kind = form?.get("kind") === "avatar" ? "avatar" : "thumbnail"

  try {
    const isAvatar = kind === "avatar"
    const webp = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({
        width: isAvatar ? 256 : 1200,
        height: isAvatar ? 256 : undefined,
        fit: isAvatar ? "cover" : "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: isAvatar ? 75 : 78, effort: 4 })
      .toBuffer()

    if (isCloudinaryConfigured()) {
      const replaceFileId = String(form?.get("replaceFileId") ?? "")
      const userSuffix = `_${user.id.slice(0, 8)}`
      if (replaceFileId && DRIVE_ID_PATTERN.test(replaceFileId) && replaceFileId.endsWith(userSuffix)) {
        await deleteFromCloudinary(replaceFileId)
      }
      const publicId = `cs_${kind}_${Date.now()}_${user.id.slice(0, 8)}`
      const uploaded = await uploadToCloudinary(webp, publicId)
      return NextResponse.json({ fileId: uploaded.fileId, url: uploaded.url })
    }

    // Local / fallback mode
    if (!fs.existsSync(LOCAL_MEDIA_DIR)) {
      fs.mkdirSync(LOCAL_MEDIA_DIR, { recursive: true })
    }
    const fileId = `local-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
    fs.writeFileSync(path.join(LOCAL_MEDIA_DIR, `${fileId}.webp`), webp)
    return NextResponse.json({ fileId })
  } catch (e) {
    console.error("Upload error:", e)
    return NextResponse.json({ error: "Gagal mengunggah gambar." }, { status: 500 })
  }
}
