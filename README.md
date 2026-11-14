# ClimateStories — Social News & Citizen Journalism Platform

**ClimateStories** adalah platform portal berita sosial dan jurnalisme warga modern yang memadukan tata letak editorial majalah (*Hero Bento Grid* & *Editorial Split Layout*) dengan interaksi sosial media aktif (repost, quote opini, diskusi berjenjang, catatan komunitas anti-hoaks, dan moderasi konten).

---

## Tech Stack Utama

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling & UI:** Tailwind CSS v4, shadcn/ui primitives, Lucide Icons, TipTap Rich Text Editor
- **Database & ORM:** Supabase PostgreSQL + Prisma ORM 6
- **Autentikasi:** Supabase Auth (Email & Password)
- **Penyimpanan Media:** Cloudinary CDN + Sharp WebP compression + Edge Caching Proxy (`/api/media/[...fileId]`)
- **SEO & Discovery:** Next.js Metadata, Dynamic Sitemap (`/sitemap.xml`), Robots (`/robots.txt`), Web App Manifest (`/manifest.webmanifest`)
- **Automated CI:** GitHub Actions workflow linting, typechecking, testing, & build verification

---

## Fitur Utama

1. **Hero Bento Grid & Navigasi Kategori:**
   - Layout 3 kolom: 1 Headline utama besar (kiri), 1 sub-headline menengah (tengah), dan 3 berita ringkas (kanan).
   - Filter instan per kategori di navbar (`Nasional`, `Teknologi`, `Ekonomi`, `Olahraga`, `Opini`).
   - Bar **Topik Hangat** (`#tag`) di bagian atas beranda untuk penjelajahan topik berita terpopuler secara instan.

2. **Editorial Reader View:**
   - Tampilan baca split: Gambar besar sticky kiri berdampingan dengan lead berita dan **3 Poin Inti Berita (TL;DR Key Takeaways)** di kanan, menyambung teks penuh di bawah.
   - Dilengkapi estimasi waktu baca (`~X menit baca`), jumlah tayangan (*views*), dan tombol kembali (*Back Button*).
   - **Reading Progress Bar** di bagian atas layar dan tombol *floating* kembali ke atas saat halaman digulir.
   - Menu **Bagikan** (Salin Tautan, WhatsApp, X / Twitter) untuk mempermudah distribusi berita.
   - Rekomendasi **Berita Terkait** dari kanal kategori yang sama di bagian bawah artikel.

3. **Dual-Mode Repost & Interaksi Sosial:**
   - *Direct Repost*: Bagikan ulang berita ke feed pengikut dengan 1 klik.
   - *Quote News (Opini)*: Berikan opini dan analisis kritis di atas kartu berita.
   - *Like/Upvote*, *Bookmark* (tersimpan), dan *Follow* sesama penulis.

4. **Komentar Berjenjang (*Nested Replies*):**
   - Diskusi interaktif berjenjang dengan kemampuan membalas komentar, mengedit, atau menghapus komentar milik sendiri.

5. **Sistem Kredibilitas & Anti-Hoaks:**
   - Wajib mencantumkan rujukan sumber berita dan penandaan jenis berita (*Laporan Langsung* vs *Saduran/Opini*).
   - **Catatan Komunitas (*Community Notes*)**: Kontributor terverifikasi (*Trust Score* ≥ 50) dapat mengajukan koreksi konteks fakta di bawah artikel.
   - **Lencana Verified Contributor**: Otomatis didapatkan saat skor kepercayaan mencapai 50+ (Like +1 poin, Repost +3 poin).

6. **Dashboard Monitoring & Manajemen Aplikasi (`/admin`):**
   - **Tampilan Khusus Staf**: Admin dan Moderator memiliki antarmuka dashboard monitoring tersendiri tanpa tampilan portal berita publik.
   - **Sidebar Sticky & Kolapsibel**: Kontrol panel berada di sidebar kiri yang tetap (*sticky*) saat halaman digulir, dapat dibuka-tutup (ikon toggle di bagian bawah sidebar pada desktop & tombol hamburger di navbar pada mobile).
   - **Menu Ringkasan (*Summary*)**: Panel utama metrik cepat (Laporan Warga, Headline Bento, Kategori Kanal, Total Akun/Berita), metrik operasional (Total Tayangan, Interaksi Publik, Catatan Komunitas, Rasio Penyelesaian Moderasi), distribusi alasan laporan & sebaran kanal, serta Top 5 Berita & Top Kontributor.
   - **Fitur Monitoring & Pratinjau**: Antrean Laporan Warga (hoaks/spam), Monitoring Seluruh Berita Publik (views, kanal, dialog pratinjau berita lengkap, tombol hapus konten pelanggaran), Headline Bento Grid, dan Kategori Kanal.
   - **Pencarian & Filter Instan**: Filter dan search real-time pada tab Laporan, Berita, Headline, dan Pengguna.
   - **Manajemen Pengguna (Admin Master)**: Kontrol seluruh akun user (ganti peran `USER` ↔ `MODERATOR` ↔ `ADMIN`, atur trust score, toggle verified contributor, dan hapus user).

7. **Pemisahan Peran & Navbar Minimalis:**
   - **Admin & Moderator**: Navbar hanya menampilkan logo/nama aplikasi, switch tema, dan icon profil akun staf. Tidak ada menu portal berita atau tombol tulis berita.
   - **User (Jurnalis Warga)**: Menikmati portal berita publik lengkap, pencarian, notifikasi, dan tombol `+ Tulis Berita`.
   - **Guest**: Akses membaca penuh, eksplorasi kategori, dan modal dialog Masuk/Daftar instan tanpa harus berpindah halaman.

8. **Editorial Footer Responsif:**
   - Informasi platform, tautan cepat seluruh kanal kategori, dan navigasi pencarian di bagian bawah halaman (khusus User & Guest).

9. **Manajemen Akun Mandiri (`/pengaturan` via Edit Profil):**
   - Akses via tombol "Edit profil" di halaman profil saya (`/@username`).
   - Tab **Profil**: Ubah foto avatar, nama lengkap, username unik, dan bio.
   - Tab **Email Akun**: Perbarui alamat email login akun.
   - Tab **Kata Sandi**: Ganti kata sandi akun login.

10. **Pusat Notifikasi (`/notifikasi`):**
   - Ikon lonceng navbar dengan badge angka jumlah interaksi baru (khusus akun user).
   - Tab filter notifikasi (Suka, Repost, Komentar, Catatan Komunitas, Pengikut Baru).

11. **Custom Dialog & Modal Actions:**
   - Seluruh tindakan penting (Hapus Akun, Verifikasi User, Ubah Role, Hapus Berita, Hapus Komentar, Hapus Catatan Komunitas, Tindakan Laporan) menggunakan dialog konfirmasi modern terstandarisasi.
   - Modal Masuk / Daftar terintegrasi langsung di navbar dan tombol interaksi.

---

## Panduan Instalasi & Menjalankan

### 1. Kloning & Install Dependensi
```bash
git clone https://github.com/dmfdzr/news-app.git
cd news-app
npm install
```

### 2. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Isi variabel konfigurasi pada `.env`:
```env
# 1. SUPABASE DATABASE (Prisma Pooler & Direct)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:5432/postgres"

# 2. SUPABASE AUTH & API KEYS
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_..."
SUPABASE_SECRET_KEY="sb_secret_..."

# 3. CLOUDINARY MEDIA STORAGE
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# 4. SITE CONFIG
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Migrasi Database & Seeding
Jalankan migrasi tabel ke PostgreSQL dan semai kategori navbar awal:
```bash
npm run db:migrate
npm run db:seed
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## Akun Bawaan (Default Accounts)

Setelah menjalankan `npm run db:seed`, akun berikut siap digunakan:

| Role | Email | Password | Username | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@climatestories.id` | `admin123` | `@admin` | Akses penuh manajemen pengguna, moderasi laporan, headline, dan kategori di `/admin`. |
| **MODERATOR** | `moderator@climatestories.id` | `moderator123` | `@moderator` | Akses panel kurasi headline, kategori, laporan anti-hoaks di `/admin`. |
| **USER** | `user@climatestories.id` | `user1234` | `@jurnalis_warga` | Pengguna jurnalisme warga (tulis berita, interaksi sosial, bookmark, follow). |

---

## Daftar Script Tersedia

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan Next.js server dalam mode development |
| `npm run build` | Menjalankan production build & typecheck |
| `npm run start` | Menjalankan server hasil production build |
| `npm run lint` | Menjalankan audit ESLint kode |
| `npm run typecheck` | Menjalankan pengecekan TypeScript tanpa emit |
| `npm run test` | Menjalankan unit tests (Node.js test runner) |
| `npm run db:migrate` | Menerapkan migrasi skema database Prisma |
| `npm run db:seed` | Menginisialisasi data awal kategori dan admin master |
