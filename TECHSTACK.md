# Tech Stack — BK Online

## Frontend

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Next.js** | 16.2.6 | React framework, routing, SSR/SSG |
| **React** | 19.x | UI library, komponen interaktif |
| **TypeScript** | 5.x | Type safety untuk seluruh kode |
| **Tailwind CSS** | 4.x | Utility-first CSS styling |
| **shadcn/ui** | latest | Komponen UI (Card, Button, Dialog, Select, dll) |
| **Framer Motion** | latest | Animasi, transisi, AnimatePresence |
| **Lucide React** | latest | Ikon SVG (MessageCircleHeart, Brain, Sparkles, dll) |
| **Recharts** | latest | Grafik asesmen (bar, pie, radar chart) |

## Backend

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Next.js API Routes** | 16.2.6 | REST API endpoint di `/app/api/*` |
| **Prisma** | ^5.22.0 | ORM untuk database |
| **bcryptjs** | latest | Hash password |
| **Zod** | latest | Validasi input (form & API) |
| **react-hook-form** | latest | Form management |

## Database

| Teknologi | Lingkungan | Kegunaan |
|-----------|-----------|----------|
| **SQLite** | Development | Database lokal (file `prisma/dev.db`) |
| **PostgreSQL** | Production (Vercel) | Database云端 via Neon / Supabase / Vercel Postgres |
| **Prisma Client** | Semua | Query builder & migrasi |

> **Catatan:** SQLite **tidak bisa** digunakan di Vercel karena environment serverless bersifat stateless.
> Untuk production di Vercel, wajib menggunakan PostgreSQL.

## Fitur & Library Pendukung

| Library | Kegunaan |
|---------|----------|
| **sonner** | Toast notifikasi |
| **xlsx** | Import/export Excel |
| **html2canvas** | Export grafik ke gambar |
| **jspdf** | Export laporan ke PDF |
| **uuid** | Generate ID unik |
| **class-variance-authority** | Utility untuk component variants |
| **tailwind-merge** | Merge Tailwind classes |
| **clsx** | Conditional class names |
| **tw-animate-css** | Animasi CSS untuk Tailwind |

## Tema & Styling

| Fitur | Detail |
|-------|--------|
| **CSS Variables** | `--primary`, `--primary-foreground`, `--ring` di `globals.css` |
| **Theme Context** | `useTheme()` — 6 preset warna (Indigo, Emerald, Rose, Sky, Violet, Orange) |
| **Penyimpanan tema** | `localStorage` key `bk_theme` |
| **Responsive** | Mobile-first, breakpoint `sm/md/lg` |
| **Dark mode** | Class `.dark` via `next-themes` (terpisah dari tema warna) |

## Tooling

| Tool | Kegunaan |
|------|----------|
| **Turbopack** | Dev server (Next.js built-in) |
| **ESLint** | Linting kode |
| **PostCSS** | CSS processing (`@tailwindcss/postcss`) |
| **Prisma CLI** | `prisma db push`, `prisma generate`, `prisma studio` |
| **Vercel CLI** | Deploy & preview dari terminal |

## Deployment (Vercel)

| Layanan | Keterangan |
|---------|------------|
| **Vercel** | Hosting Next.js (production) |
| **Neon** / **Supabase** / **Vercel Postgres** | PostgreSQL database untuk production |
| **Prisma Migrate** | Migrasi database production |

### Langkah Deployment ke Vercel

1. **Siapkan database PostgreSQL** — Buat project di [Neon](https://neon.new), [Supabase](https://supabase.com), atau Vercel Postgres, salin connection string-nya.

2. **Update Prisma schema** — Ubah provider dari `sqlite` ke `postgresql` di `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Install driver PostgreSQL**:
   ```bash
   npm remove @libsql/client @prisma/adapter-libsql
   npm install @prisma/adapter-pg @neondatabase/serverless
   ```

4. **Update Prisma client** (`src/lib/db.ts`) — Gunakan adapter Neon untuk serverless.

5. **Push ke GitHub** — Buat repository, push semua kode.

6. **Import ke Vercel**:
   - Buka [vercel.com/new](https://vercel.com/new)
   - Import repository GitHub
   - Framework: Next.js (otomatis terdeteksi)
   - Tambahkan environment variable: `DATABASE_URL` (isi dengan connection string PostgreSQL)
   - Deploy

7. **Migrate database** — Setelah deploy pertama, jalankan:
   ```bash
   npx prisma migrate deploy
   ```
   atau via Vercel Post-Deploy hook / GitHub Action.

8. **Setup domain kustom** (opsional) — Vercel → Project → Settings → Domains.

> **Lihat panduan lengkap** di `README.md` → bagian Deployment.

## Struktur Direktori

```
src/
├── app/
│   ├── api/           # REST API endpoints
│   ├── admin/         # Admin pages (dashboard, banner, siswa, guru, laporan, dll)
│   ├── asesmen/       # Student assessment pages
│   ├── guru/          # Teacher assessment pages
│   ├── (auth)/        # Login & register pages
│   ├── curhat/        # Anonymous chat page
│   └── page.tsx       # Landing page
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── asesmen/       # Assessment form components
│   ├── charts.tsx     # Recharts wrappers
│   ├── banner-slider.tsx
│   ├── desktop-nav.tsx
│   └── mobile-nav.tsx
├── lib/
│   ├── asesmen/       # Assessment logic (soal, skor, interpretasi)
│   ├── auth-context.tsx
│   ├── theme-context.tsx
│   └── db.ts          # Prisma client instance
└── app/globals.css    # Tailwind v4 config & CSS variables
```

## Aliran Data

### Development (Lokal)
```
Browser → Next.js (React/Tailwind)
              ↕ API Routes
           Prisma ORM
              ↕
           SQLite DB (prisma/dev.db)
```

### Production (Vercel)
```
Browser → Vercel Edge/CDN
              ↕
           Next.js Serverless Functions
              ↕ API Routes
           Prisma ORM
              ↕
           PostgreSQL (Neon / Supabase)
```
