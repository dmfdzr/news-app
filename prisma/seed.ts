import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const categories = [
  { name: "Nasional", slug: "nasional", description: "Kabar kebijakan, daerah, dan peristiwa terkini nasional." },
  { name: "Teknologi", slug: "teknologi", description: "Perkembangan AI, gawai, perangkat lunak, dan riset inovasi." },
  { name: "Ekonomi", slug: "ekonomi", description: "Pasar keuangan, industri, perdagangan, dan bisnis UMKM." },
  { name: "Olahraga", slug: "olahraga", description: "Sepak bola, bulu tangkis, dan ajang olahraga nasional & dunia." },
  { name: "Opini", slug: "opini", description: "Sudut pandang kritis, analisis, dan esai dari kontributor." },
]

async function main() {
  console.log("Membersihkan data lama...")
  // Clean in referential order
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

  console.log("Menyemai kategori...")
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

  console.log("Membuat admin master...")
  const adminId = "f23dbfc6-da68-4068-bab5-0fced7edcf0c"
  await prisma.user.create({
    data: {
      id: adminId,
      email: "admin@wartawarga.id",
      username: "admin",
      fullName: "Admin Master",
      bio: "Administrator & Redaksi Utama ClimateStories.",
      role: "ADMIN",
      isVerified: true,
      trustScore: 100,
    },
  })

  console.log("Seed Supabase selesai. Database bersih dengan 1 Master Admin.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
