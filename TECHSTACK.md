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
| **PostgreSQL (Neon)** | Production | Serverless PostgreSQL, free tier 0.5GB |
| **Prisma Client** | Semua | Query builder & migrasi |
| **Prisma Neon Adapter** | Production | Adapter Neon untuk Prisma di serverless |

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
| **Penyimpanan tema** | Database `Setting` model (admin-only via Pengaturan), dikirim via API |
| **Responsive** | Mobile-first, breakpoint `sm/md/lg` |

## Online / Offline Indicator

| Fitur | Detail |
|-------|--------|
| **Heartbeat API** | `POST /api/user/heartbeat` — update `lastSeen` setiap 60 detik |
| **Status API** | `GET /api/user/online-status` — daftar guru/admin + lastSeen |
| **Client Hook** | `useHeartbeat(userId)` — ping 60s + visibility/focus API |
| **UI Component** | `OnlineIndicator` — minimal (dot + count) atau daftar lengkap |
| **Threshold** | 2 menit tanpa heartbeat → dianggap offline |

## Tooling

| Tool | Kegunaan |
|------|----------|
| **Turbopack** | Dev server (Next.js built-in) |
| **ESLint** | Linting kode |
| **PostCSS** | CSS processing (`@tailwindcss/postcss`) |
| **Prisma CLI** | `prisma db push`, `prisma generate`, `prisma studio` |
| **Vercel CLI** | Deploy & preview dari terminal |

## Deployment (Vercel + Neon)

Proyek sudah menggunakan **PostgreSQL (Neon)** langsung — tidak perlu migrasi dari SQLite.

| Layanan | Keterangan |
|---------|------------|
| **Vercel** | Hosting Next.js (production) |
| **Neon** | PostgreSQL serverless (sudah terhubung) |
| **Prisma db push** | Sinkronisasi skema ke database |

> **Lihat panduan lengkap** di `README.md` → bagian Deployment.

## Struktur Direktori

```
src/
├── app/
│   ├── api/           # REST API endpoints
│   │   ├── auth/      # Login, register, password
│   │   ├── chat/      # Curhat messages
│   │   ├── user/      # Anonymous ID, heartbeat, online-status
│   │   └── ...        # Asesmen, banner, setting, laporan, dll
│   ├── admin/         # Admin pages (dashboard, banner, siswa, guru, laporan, dll)
│   ├── asesmen/       # Student assessment pages
│   ├── guru/          # Teacher assessment pages
│   ├── (auth)/        # Login & register pages
│   ├── curhat/        # Anonymous chat page
│   └── page.tsx       # Landing page
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── asesmen/       # Assessment form components
│   ├── curhat/        # Chat interface component
│   ├── charts.tsx     # Recharts wrappers
│   ├── banner-slider.tsx
│   ├── desktop-nav.tsx
│   ├── mobile-nav.tsx
│   ├── online-indicator.tsx
│   └── heartbeat-provider.tsx
├── lib/
│   ├── asesmen/       # Assessment logic (soal, skor, interpretasi)
│   ├── auth-context.tsx
│   ├── theme-context.tsx
│   ├── use-heartbeat.ts
│   └── db.ts          # Prisma client instance
└── app/globals.css    # Tailwind v4 config & CSS variables
```

## Aliran Data

### Development & Production (Neon PostgreSQL)
```
Browser → Next.js (React/Tailwind)
              ↕ API Routes
           Prisma ORM
              ↕
           PostgreSQL (Neon Serverless)
```
