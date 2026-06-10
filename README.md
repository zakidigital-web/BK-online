# BK Online — Bimbingan Konseling Digital

Aplikasi Bimbingan Konseling berbasis web untuk SMP Negeri 1 Genteng.
Fitur: curhat anonim dengan indikator online/offline guru BK, asesmen minat bakat (RIASEC),
screening psikologi, gaya belajar (VARK), karakter diri (Big Five), asesmen guru,
dan monitoring siswa oleh Guru BK.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Neon Serverless)
- **Library:** Recharts, Lucide, sonner, xlsx, jspdf, html2canvas

## Cara Memulai (Development)

```bash
# 1. Clone & install dependencies
git clone https://github.com/zakidigital-web/BK-online.git
cd BK-online
npm install

# 2. Setup environment
cp .env.example .env
# Isi DATABASE_URL dengan connection string PostgreSQL

# 3. Push schema ke database
npx prisma db push
npx prisma generate

# 4. Jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Akun Demo
Setelah menjalankan inisialisasi di Pengaturan → Inisialisasi Akun Demo:
| Role     | Username | Password   |
|----------|----------|------------|
| Admin    | admin    | admin123   |
| Guru BK  | guru     | guru123    |
| Wali Kelas | walas  | walas123   |
| Siswa    | siswa    | siswa123   |

## Deployment (Vercel + Neon)

Proyek ini sudah menggunakan **PostgreSQL (Neon)** — tidak perlu migrasi dari SQLite.

### Langkah Deployment

#### 1. Push ke GitHub
```bash
git push -u origin main
```

#### 2. Import ke Vercel
1. Buka [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** — pilih `zakidigital-web/BK-online`
3. **Framework Preset:** Next.js (otomatis terdeteksi)
4. **Environment Variables:**
   - `DATABASE_URL` — isi dengan connection string Neon PostgreSQL
5. Klik **Deploy**

#### 3. Sync Database
Setelah deploy, jalankan:
```bash
npx prisma db push
```
atau via **Vercel Post-Deploy Hook**.

### Environment Variables
| Variable      | Contoh Value | Keterangan                |
|---------------|-------------|---------------------------|
| `DATABASE_URL`| `postgresql://...` | Connection string Neon PostgreSQL |

## Scripts

| Script | Kegunaan |
|--------|----------|
| `npm run dev` | Jalankan dev server (Turbopack) |
| `npm run build` | Build production |
| `npm start` | Jalankan production server |
| `npm run lint` | ESLint |
| `npx prisma studio` | DB browser GUI |
| `npx prisma db push` | Push schema ke database |

## Lisensi

Hak cipta © 2026 SMP Negeri 1 Genteng. Aplikasi internal sekolah.
