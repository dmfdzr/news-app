import type { NextConfig } from "next"

const cloudName = (
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_URL?.split("@")[1] ||
  ""
)
  .trim()
  .replace(/^["']|["']$/g, "")

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: cloudName,
  },
  // "@" folders are reserved for parallel routes, so /@username maps to /profil/username.
  async rewrites() {
    return [{ source: "/@:username", destination: "/profil/:username" }]
  },
}

export default nextConfig