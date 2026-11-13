import { PrismaClient } from "@prisma/client"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const prisma = new PrismaClient()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const secretKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !secretKey) {
  console.error("SUPABASE_SECRET_KEY atau URL tidak ditemukan di .env")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const categories = [
  { name: "Nasional", slug: "nasional", description: "Kabar kebijakan, daerah, dan peristiwa terkini nasional." },
  { name: "Teknologi", slug: "teknologi", description: "Perkembangan AI, gawai, perangkat lunak, dan riset inovasi." },
  { name: "Ekonomi", slug: "ekonomi", description: "Pasar keuangan, industri, perdagangan, dan bisnis UMKM." },
  { name: "Olahraga", slug: "olahraga", description: "Sepak bola, bulu tangkis, dan ajang olahraga nasional & dunia." },
  { name: "Opini", slug: "opini", description: "Sudut pandang kritis, analisis, dan esai dari kontributor." },
]

const usersToSeed = [
  {
    email: "admin@climatestories.id",
    password: "admin123",
    username: "admin",
    fullName: "Admin Master",
    bio: "Super Administrator ClimateStories.",
    role: "ADMIN" as const,
    isVerified: true,
    trustScore: 250,
  },
  {
    email: "moderator@climatestories.id",
    password: "moderator123",
    username: "moderator",
    fullName: "Tim Moderator",
    bio: "Pengawas konten & kurasi berita ClimateStories.",
    role: "MODERATOR" as const,
    isVerified: true,
    trustScore: 150,
  },
  {
    email: "user@climatestories.id",
    password: "user1234",
    username: "jurnalis_warga",
    fullName: "Citizen Reporter",
    bio: "Penulis dan kontributor berita jurnalisme warga.",
    role: "USER" as const,
    isVerified: false,
    trustScore: 15,
  },
]

async function main() {
  console.log("1. Membersihkan database Supabase...")
  await prisma.report.deleteMany()
  await prisma.communityNote.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.repost.deleteMany()
  await prisma.like.deleteMany()
  await prisma.bookmark.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.article.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()

  console.log("2. Membersihkan akun Supabase Auth lama...")
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
  if (authUsers?.users) {
    for (const u of authUsers.users) {
      await supabaseAdmin.auth.admin.deleteUser(u.id)
    }
  }

  console.log("3. Menyemai kategori...")
  for (const [orderIndex, cat] of categories.entries()) {
    await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        orderIndex,
      },
    })
  }

  console.log("4. Membuat user untuk tiap role...")
  for (const u of usersToSeed) {
    // Create in Supabase Auth
    const { data: authCreated, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.fullName },
    })

    if (authErr || !authCreated?.user) {
      console.error(`Gagal membuat auth untuk ${u.email}:`, authErr?.message)
      continue
    }

    // Create in Prisma Database
    await prisma.user.create({
      data: {
        id: authCreated.user.id,
        email: u.email,
        username: u.username,
        fullName: u.fullName,
        bio: u.bio,
        role: u.role,
        isVerified: u.isVerified,
        trustScore: u.trustScore,
      },
    })

    console.log(`   ✓ [${u.role}] ${u.email} (Username: @${u.username} | Password: ${u.password})`)
  }

  console.log("\nSelesai! Akun baru berhasil dibuat untuk setiap role.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
