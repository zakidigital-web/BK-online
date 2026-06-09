# BK Online — Bimbingan Konseling Digital

Aplikasi Bimbingan Konseling berbasis web untuk SMP Negeri 1 Genteng. Fitur: curhat anonim, asesmen minat bakat, screening psikologi, gaya belajar, karakter diri, dan monitoring siswa oleh Guru BK.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** SQLite (development) / PostgreSQL (production)
- **Library:** Recharts, Lucide, sonner, xlsx, jspdf, html2canvas

## Cara Memulai (Development)

```bash
# 1. Install dependencies
npm install

# 2. Setup database (SQLite)
npx prisma generate
npx prisma db push

# 3. Jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Akun Demo
Setelah menjalankan inisialisasi di Pengaturan → Inisialisasi Akun Demo:
| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Guru BK | guru | guru123 |
| Wali Kelas | walas | walas123 |
| Siswa | siswa | siswa123 |

## Deployment ke Vercel

### Peringatan: SQLite tidak bisa di Vercel
Vercel menggunakan serverless function yang **stateless** — filesystem bersifat read-only dan ephemeral. SQLite (`dev.db`) tidak akan berfungsi. Anda **wajib** menggunakan **PostgreSQL** untuk production.

### Langkah-langkah

#### 1. Buat Database PostgreSQL
Pilih salah satu (gratis):
- **[Neon](https://neon.new)** — Serverless PostgreSQL, free tier 0.5GB
- **[Supabase](https://supabase.com)** — PostgreSQL + auth, free tier 500MB
- **[Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)** — Storage bawaan Vercel

Setelah membuat project, salin **connection string** (DATABASE_URL).

#### 2. Update Prisma Schema
Ubah `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Hapus atau komentari `@libsql/client` dan `@prisma/adapter-libsql` jika ada.

#### 3. Install Driver PostgreSQL
```bash
npm remove @libsql/client @prisma/adapter-libsql
npm install @prisma/adapter-pg
npm install -D @types/pg
```

Untuk Neon:
```bash
npm install @neondatabase/serverless
```

#### 4. Update Prisma Client (`src/lib/db.ts`)
Sesuaikan inisialisasi prisma untuk PostgreSQL:
```ts
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { Pool } from "@neondatabase/serverless"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: process.env.DATABASE_URL?.includes("neon")
      ? new PrismaNeon(new Pool({ connectionString: process.env.DATABASE_URL }))
      : undefined,
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

#### 5. Push & Migrate Database
```bash
npx prisma db push        # Untuk pertama kali, atau
npx prisma migrate dev    # Buat migration file
npx prisma generate
```

#### 6. Push ke GitHub
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/username/bk-app.git
git push -u origin main
```

#### 7. Deploy ke Vercel
1. Buka [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** — pilih repository GitHub
3. **Framework Preset:** Next.js (otomatis terdeteksi)
4. **Environment Variables:**
   - `DATABASE_URL` — isi dengan connection string PostgreSQL
5. Klik **Deploy**

#### 8. Migrate Database Production
Setelah deploy, jalankan migrasi via terminal:
```bash
npx prisma migrate deploy
```
Atau setup di **Vercel Post-Deploy Hook** / GitHub Action.

### Environment Variables Production
| Variable | Contoh Value | Keterangan |
|----------|-------------|------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Connection string PostgreSQL |

### Catatan Penting
- **Backup database** — Saat masih SQLite, backup via menu Pengaturan → Backup & Restore. Setelah migrasi ke PostgreSQL, gunakan fitur backup bawaan dari penyedia database (Neon/Supabase).
- **File upload** — Fitur backup/restore .db tidak relevan di PostgreSQL. Nonaktifkan atau sesuaikan menu tersebut.
- **XLSX import** — Tetap berfungsi, tidak ada perubahan.

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
