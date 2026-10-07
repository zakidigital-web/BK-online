"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  MessageCircleHeart,
  Brain,
  Sparkles,
  UserCircle,
  Users,
  FileText,
  ChevronRight,
  Clock,
  GraduationCap,
  RotateCcw,
  Settings,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Compass,
  ArrowRight,
  Download,
  School,
  Heart,
  Star,
  Flame,
  Lightbulb,
  Send,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { ThreeMascot3D } from "@/components/asesmen/three-mascot-3d"

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalRiasec: 0,
    totalPsikologi: 0,
    totalVark: 0,
    totalKarakter: 0,
    totalMbti: 0,
    totalChat: 0,
    pendingUsers: 0,
    totalGuru: 0,
    pendingRetake: 0,
    kelasList: [] as string[],
    siswaRaw: [] as any[],
    chatRaw: [] as any[],
  })

  // Selected class for Walas / Guru Mapel
  const [selectedClass, setSelectedClass] = useState<string>("")

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchJson = async (url: string, fallback: any) => {
          try {
            const res = await fetch(url)
            if (!res.ok) return fallback
            return await res.json()
          } catch {
            return fallback
          }
        }

        const [siswaData, chatData, pendingData, retakeData, guruData] = await Promise.all([
          fetchJson("/api/siswa", { siswa: [] }),
          fetchJson("/api/chat", { messages: [] }),
          fetchJson("/api/admin/user-status", { users: [] }),
          fetchJson("/api/admin/retake", { requests: [] }),
          fetchJson("/api/admin/guru", { guru: [] }),
        ])

        const kelasSet = new Set<string>()
        let r = 0, p = 0, v = 0, k = 0, m = 0

        siswaData.siswa?.forEach((s: any) => {
          if (s.kelas) kelasSet.add(s.kelas)
          if (s._count?.minatBakat > 0) r++
          if (s._count?.psikologi > 0) p++
          if (s._count?.gayaBelajar > 0) v++
          if (s._count?.karakterDiri > 0) k++
          if (s._count?.mbti > 0) m++
        })

        const sortedKelas = Array.from(kelasSet).sort()
        const pendingRetakes = retakeData.requests?.filter((req: any) => req.status === "pending")?.length || 0

        setStats({
          totalSiswa: siswaData.siswa?.length || 0,
          totalRiasec: r,
          totalPsikologi: p,
          totalVark: v,
          totalKarakter: k,
          totalMbti: m,
          totalChat: chatData.messages?.length || 0,
          pendingUsers: pendingData.users?.length || 0,
          totalGuru: guruData.guru?.length || 0,
          pendingRetake: pendingRetakes,
          kelasList: sortedKelas,
          siswaRaw: siswaData.siswa || [],
          chatRaw: chatData.messages || [],
        })

        // Default selected class
        if (user?.kelas && sortedKelas.includes(user.kelas)) {
          setSelectedClass(user.kelas)
        } else if (sortedKelas.length > 0) {
          setSelectedClass(sortedKelas[0])
        }
      } catch (e) {
        console.error("Gagal memuat data dashboard", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  // If user is student, forward to student beranda
  if (user?.role === "siswa") {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-bold">Mengarahkan ke Beranda Siswa...</h2>
        <Link href="/beranda">
          <Button className="bg-indigo-600 text-white rounded-xl">Buka Beranda Siswa</Button>
        </Link>
      </div>
    )
  }

  const role = user?.role || "admin"

  return (
    <div className="space-y-6 pb-12">
      {/* 1. ADMIN BERANDA */}
      {role === "admin" && (
        <AdminBeranda stats={stats} user={user} />
      )}

      {/* 2. GURU BK BERANDA */}
      {role === "guru" && (
        <GuruBKBeranda stats={stats} user={user} />
      )}

      {/* 3. WALI KELAS BERANDA */}
      {role === "walas" && (
        <WalasBeranda
          stats={stats}
          user={user}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
        />
      )}

      {/* 4. GURU MAPEL BERANDA */}
      {role === "guru-mapel" && (
        <GuruMapelBeranda
          stats={stats}
          user={user}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
        />
      )}
    </div>
  )
}

/* =========================================================================
   1. VIEW BERANDA ADMINISTRATOR SISTEM
   ========================================================================= */
function AdminBeranda({ stats, user }: { stats: any; user: any }) {
  const adminCards = [
    {
      icon: Users,
      label: "Database Siswa",
      count: stats.totalSiswa,
      href: "/admin/siswa",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      desc: "Kelola data & import Excel",
    },
    {
      icon: GraduationCap,
      label: "Akun Guru & Walas",
      count: stats.totalGuru,
      href: "/admin/guru",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      desc: "Manajemen peran & akses",
    },
    {
      icon: MessageCircleHeart,
      label: "Riwayat Curhat",
      count: stats.totalChat,
      href: "/admin/curhat",
      color: "text-rose-600",
      bg: "bg-rose-50",
      desc: "Log percakapan konseling",
    },
    {
      icon: RotateCcw,
      label: "Persetujuan Retake",
      count: stats.pendingRetake,
      href: "/admin/retake",
      color: "text-amber-600",
      bg: "bg-amber-50",
      desc: stats.pendingRetake > 0 ? "Perlu ditinjau segera" : "Semua selesai diverifikasi",
      badge: stats.pendingRetake > 0 ? `${stats.pendingRetake} Pending` : undefined,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Administrator */}
      <Card className="border-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/15 text-indigo-200">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Administrator Sistem · SMPN 1 Genteng</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Bertugas, <span className="text-indigo-300">{user?.name || "Admin"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              Pusat kendali master data, hak akses pendidik, bank soal asesmen, serta pemeliharaan infrastruktur BK Online.
            </p>
            <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
              <Link href="/admin/pengaturan">
                <Button size="sm" className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs gap-1.5 backdrop-blur-sm">
                  <Settings className="h-3.5 w-3.5" /> Pengaturan Sistem
                </Button>
              </Link>
              <Link href="/admin/banner">
                <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 shadow-sm">
                  <LayoutDashboard className="h-3.5 w-3.5" /> Kelola Banner Slider
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center shrink-0">
            <ThreeMascot3D character="zen" mood="happy" size={135} interactive showParticles showSpeechBubble message="Sistem BK beroperasi normal! 🛡️" />
          </div>
        </CardContent>
      </Card>

      {/* Pending Account Alert */}
      {stats.pendingUsers > 0 && (
        <Card className="border-amber-200 bg-amber-50/70 shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  {stats.pendingUsers} Akun Pendaftar Menunggu Verifikasi
                </h4>
                <p className="text-xs text-amber-700">
                  Ada pendaftar baru yang membutuhkan persetujuan admin sebelum dapat masuk.
                </p>
              </div>
            </div>
            <Link href="/admin/siswa">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs shrink-0 shadow-xs">
                Verifikasi Sekarang
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {adminCards.map((item, idx) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <Link href={item.href}>
              <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white group cursor-pointer h-full flex flex-col justify-between">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg}`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    {item.badge && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {item.count}
                  </div>
                  <div className="text-xs font-bold text-slate-800">{item.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Master Data & Quick Control Modules */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3 px-1">Modul Administrasi Utama</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <Link href="/admin/guru">
            <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl p-4 bg-white hover:border-indigo-200 group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Kelola Akun Guru</h4>
                  <p className="text-xs text-slate-500">Guru BK, Wali Kelas, & Guru Mapel</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/pertanyaan">
            <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl p-4 bg-white hover:border-blue-200 group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Bank Soal Asesmen</h4>
                  <p className="text-xs text-slate-500">Atur butir soal & skala asesmen</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/analisa">
            <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl p-4 bg-white hover:border-violet-200 group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors">Analisa Menyeluruh</h4>
                  <p className="text-xs text-slate-500">Pemetaan tren minat & psikologi</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/guru/laporan">
            <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl p-4 bg-white hover:border-teal-200 group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors">Laporan Asesmen Guru</h4>
                  <p className="text-xs text-slate-500">Portofolio gaya mengajar & MBTI guru</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/banner">
            <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl p-4 bg-white hover:border-amber-200 group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">Banner Beranda</h4>
                  <p className="text-xs text-slate-500">Pengumuman & slider foto kegiatan</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/pengaturan">
            <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl p-4 bg-white hover:border-slate-300 group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-800 transition-colors">Pengaturan & Backup</h4>
                  <p className="text-xs text-slate-500">Unduh backup database & reset uji</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   2. VIEW BERANDA GURU BK (KONSELOR SEKOLAH)
   ========================================================================= */
function GuruBKBeranda({ stats, user }: { stats: any; user: any }) {
  const counselingCards = [
    {
      icon: MessageCircleHeart,
      label: "Ruang Curhat Siswa",
      count: stats.totalChat,
      href: "/admin/curhat",
      color: "text-rose-600",
      bg: "bg-rose-50",
      desc: "Tanggapi pesan anonim & siswa",
      cta: "Buka Curhat",
    },
    {
      icon: RotateCcw,
      label: "Permintaan Retake",
      count: stats.pendingRetake,
      href: "/admin/retake",
      color: "text-amber-600",
      bg: "bg-amber-50",
      desc: stats.pendingRetake > 0 ? "Permohonan retake butuh verifikasi" : "Semua retake terkelola",
      cta: "Tinjau Retake",
    },
    {
      icon: FileText,
      label: "Laporan Asesmen",
      count: stats.kelasList.length,
      href: "/admin/laporan",
      color: "text-blue-600",
      bg: "bg-blue-50",
      desc: "Rekap RIASEC & VARK per kelas",
      cta: "Lihat Laporan",
    },
    {
      icon: Users,
      label: "Database Siswa",
      count: stats.totalSiswa,
      href: "/admin/siswa",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      desc: "Data bimbingan & catatan konseling",
      cta: "Data Siswa",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Guru BK */}
      <Card className="border-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-xl rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3.5 text-center md:text-left max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/15 text-rose-200">
              <Heart className="h-4 w-4 text-rose-400" />
              <span>Ruang Konselor BK · SMPN 1 Genteng</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Bertugas, <span className="text-rose-300">{user?.name || "Bapak/Ibu Guru BK"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Dampingi perjalanan tumbuh kembang mental, arah karier, dan potensi unik setiap siswa dengan penuh empati dan kerahasiaan.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-2 justify-center md:justify-start">
              <Link href="/admin/curhat">
                <Button className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-2 shadow-md shadow-rose-600/25">
                  <MessageCircleHeart className="h-4 w-4" /> Buka Ruang Konseling ({stats.totalChat})
                </Button>
              </Link>
              <Link href="/asesmen">
                <Button variant="outline" className="rounded-xl bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs gap-1.5">
                  <Compass className="h-4 w-4" /> Simulasi Asesmen Siswa
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center shrink-0">
            <ThreeMascot3D character="kimi" mood="cheering" size={145} interactive showParticles showSpeechBubble message="Kimi siap bantu konseling hari ini! 🌸" />
          </div>
        </CardContent>
      </Card>

      {/* Counseling Quick Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {counselingCards.map((item, idx) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <Link href={item.href}>
              <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white group cursor-pointer h-full flex flex-col justify-between">
                <CardContent className="p-4 sm:p-5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg} mb-3`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {item.count}
                  </div>
                  <div className="text-xs font-bold text-slate-800">{item.label}</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</p>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                    <span>{item.cta}</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Assessment Participation Overview */}
      <Card className="border-0 shadow-sm bg-white rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" /> Partisipasi Asesmen Siswa
            </h3>
            <p className="text-xs text-slate-500">Cakupan pengisian instrumen BK di SMPN 1 Genteng</p>
          </div>
          <Link href="/admin/laporan">
            <Button size="sm" variant="outline" className="text-xs rounded-xl gap-1">
              Laporan Lengkap <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-100/70 text-center">
            <Compass className="h-5 w-5 text-emerald-600 mx-auto mb-1.5" />
            <div className="text-xl font-bold text-emerald-900">{stats.totalRiasec}</div>
            <div className="text-[11px] font-semibold text-emerald-700">Minat Bakat</div>
          </div>
          <div className="rounded-xl bg-blue-50/70 p-3.5 border border-blue-100/70 text-center">
            <BookOpen className="h-5 w-5 text-blue-600 mx-auto mb-1.5" />
            <div className="text-xl font-bold text-blue-900">{stats.totalVark}</div>
            <div className="text-[11px] font-semibold text-blue-700">Gaya Belajar</div>
          </div>
          <div className="rounded-xl bg-rose-50/70 p-3.5 border border-rose-100/70 text-center">
            <Heart className="h-5 w-5 text-rose-600 mx-auto mb-1.5" />
            <div className="text-xl font-bold text-rose-900">{stats.totalPsikologi}</div>
            <div className="text-[11px] font-semibold text-rose-700">Psikologi</div>
          </div>
          <div className="rounded-xl bg-amber-50/70 p-3.5 border border-amber-100/70 text-center">
            <Star className="h-5 w-5 text-amber-600 mx-auto mb-1.5" />
            <div className="text-xl font-bold text-amber-900">{stats.totalKarakter}</div>
            <div className="text-[11px] font-semibold text-amber-700">Karakter</div>
          </div>
          <div className="rounded-xl bg-purple-50/70 p-3.5 border border-purple-100/70 text-center col-span-2 sm:col-span-1">
            <Brain className="h-5 w-5 text-purple-600 mx-auto mb-1.5" />
            <div className="text-xl font-bold text-purple-900">{stats.totalMbti}</div>
            <div className="text-[11px] font-semibold text-purple-700">MBTI</div>
          </div>
        </div>
      </Card>

      {/* Teacher Self-Assessments Grid */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-white rounded-2xl p-5 border border-indigo-100/80">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-indigo-600" /> Asesmen Mandiri Guru BK
            </h3>
            <p className="text-xs text-slate-500">Ketahui gaya kepemimpinan konseling & evaluasi kesejahteraan diri</p>
          </div>
          <Link href="/guru/laporan">
            <Button size="sm" variant="ghost" className="text-xs text-indigo-600 hover:text-indigo-700">
              Hasil Portofolio Saya &rarr;
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/guru/asesmen">
            <div className="p-3.5 bg-white rounded-xl border border-indigo-100/80 hover:border-indigo-300 shadow-2xs hover:shadow-xs transition-all">
              <div className="font-bold text-xs text-slate-900">Gaya Mengajar & Konseling</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Pemetaan pendekatan pedagogik</p>
            </div>
          </Link>
          <Link href="/guru/psikologi">
            <div className="p-3.5 bg-white rounded-xl border border-rose-100/80 hover:border-rose-300 shadow-2xs hover:shadow-xs transition-all">
              <div className="font-bold text-xs text-slate-900">Refleksi Psikologi Guru</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Evaluasi kesejahteraan emosi pendidik</p>
            </div>
          </Link>
          <Link href="/guru/mbti">
            <div className="p-3.5 bg-white rounded-xl border border-purple-100/80 hover:border-purple-300 shadow-2xs hover:shadow-xs transition-all">
              <div className="font-bold text-xs text-slate-900">Tipe MBTI Guru</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Kenali 16 tipe kepribadian pendidik</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  )
}

/* =========================================================================
   3. VIEW BERANDA WALI KELAS (WALAS)
   ========================================================================= */
function WalasBeranda({
  stats,
  user,
  selectedClass,
  setSelectedClass,
}: {
  stats: any
  user: any
  selectedClass: string
  setSelectedClass: (k: string) => void
}) {
  const targetClass = user?.kelas || selectedClass || stats.kelasList[0] || "7A"
  const classStudents = stats.siswaRaw.filter((s: any) => s.kelas === targetClass)
  const totalClassStudents = classStudents.length

  let riasecDone = 0, varkDone = 0, psiDone = 0, karDone = 0, mbtiDone = 0
  classStudents.forEach((s: any) => {
    if (s._count?.minatBakat > 0) riasecDone++
    if (s._count?.gayaBelajar > 0) varkDone++
    if (s._count?.psikologi > 0) psiDone++
    if (s._count?.karakterDiri > 0) karDone++
    if (s._count?.mbti > 0) mbtiDone++
  })

  return (
    <div className="space-y-6">
      {/* Hero Wali Kelas */}
      <Card className="border-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white shadow-xl rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3.5 text-center md:text-left max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/15 text-blue-200">
              <School className="h-4 w-4 text-blue-400" />
              <span>Ruang Wali Kelas · {targetClass}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, <span className="text-blue-300">{user?.name || "Wali Kelas"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pantau perkembangan belajar, karakter, dan kesejahteraan siswa binaan di kelas <strong>{targetClass}</strong> secara terpadu.
            </p>

            {/* Class Switcher if not hard-coded */}
            {stats.kelasList.length > 1 && (
              <div className="flex items-center gap-2 pt-1 justify-center md:justify-start">
                <span className="text-xs text-slate-300">Pilih Kelas:</span>
                <select
                  value={targetClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-white/15 text-white border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold backdrop-blur-md focus:outline-none cursor-pointer"
                >
                  {stats.kelasList.map((k: string) => (
                    <option key={k} value={k} className="text-slate-900 bg-white">
                      Kelas {k}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-wrap gap-2.5 pt-2 justify-center md:justify-start">
              <Link href={`/admin/laporan?kelas=${encodeURIComponent(targetClass)}`}>
                <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-2 shadow-md">
                  <FileText className="h-4 w-4" /> Cetak Laporan Kelas {targetClass}
                </Button>
              </Link>
              <Link href={`/admin/siswa?kelas=${encodeURIComponent(targetClass)}`}>
                <Button variant="outline" className="rounded-xl bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs gap-1.5">
                  <Users className="h-4 w-4" /> Daftar Siswa ({totalClassStudents})
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center shrink-0">
            <ThreeMascot3D character="piko" mood="happy" size={145} interactive showParticles showSpeechBubble message={`Kelas ${targetClass} siap berprestasi! 🌟`} />
          </div>
        </CardContent>
      </Card>

      {/* Cohort Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="border border-slate-100 shadow-sm rounded-2xl p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Total Siswa Kelas</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalClassStudents}</div>
          <p className="text-[11px] text-slate-400 mt-1">Siswa terdaftar di {targetClass}</p>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Gaya Belajar (VARK)</span>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">
            {varkDone} / {totalClassStudents}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalClassStudents > 0 ? `${Math.round((varkDone / totalClassStudents) * 100)}% siswa selesai` : "0%"}
          </p>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Minat Karier RIASEC</span>
            <Compass className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">
            {riasecDone} / {totalClassStudents}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalClassStudents > 0 ? `${Math.round((riasecDone / totalClassStudents) * 100)}% siswa selesai` : "0%"}
          </p>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Screening Emosi</span>
            <Heart className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700">
            {psiDone} / {totalClassStudents}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalClassStudents > 0 ? `${Math.round((psiDone / totalClassStudents) * 100)}% siswa terekam` : "0%"}
          </p>
        </Card>
      </div>

      {/* Classroom Insights & Coordination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Tips Wali Kelas */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-white rounded-2xl p-5 border border-blue-100/80">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Peran Kemitraan Wali Kelas</h4>
              <p className="text-[11px] text-blue-800">Sinergi dengan Guru BK & Guru Mapel</p>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed mb-4">
            Sebagai wali kelas, data asesmen gaya belajar (VARK) dapat Anda bagikan ke guru mata pelajaran untuk menentukan ritme penugasan. Apabila ada murid dengan penurunan performa, Anda dapat mengarahkan mereka berkonsultasi ke Guru BK.
          </p>
          <Link href={`/admin/laporan?kelas=${encodeURIComponent(targetClass)}`}>
            <Button size="sm" className="h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-2xs">
              Buka Analisis Lengkap Kelas {targetClass} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>

        {/* Asesmen Mandiri Walas */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50/70 via-orange-50/50 to-white rounded-2xl p-5 border border-amber-100/80">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Portofolio Pendidik Saya</h4>
              <p className="text-[11px] text-amber-900">Pengembangan diri wali kelas</p>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed mb-4">
            Ikuti asesmen gaya mengajar dan evaluasi psikologi pendidik untuk melengkapi portofolio kompetensi kepemimpinan kelas Anda.
          </p>
          <div className="flex gap-2">
            <Link href="/guru/asesmen">
              <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs bg-white">
                Gaya Mengajar
              </Button>
            </Link>
            <Link href="/guru/laporan">
              <Button size="sm" className="h-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs">
                Hasil Saya
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* =========================================================================
   4. VIEW BERANDA GURU MATA PELAJARAN (GURU MAPEL)
   ========================================================================= */
function GuruMapelBeranda({
  stats,
  user,
  selectedClass,
  setSelectedClass,
}: {
  stats: any
  user: any
  selectedClass: string
  setSelectedClass: (k: string) => void
}) {
  const targetClass = selectedClass || stats.kelasList[0] || "7A"
  const classStudents = stats.siswaRaw.filter((s: any) => s.kelas === targetClass)
  const totalInClass = classStudents.length

  let varkCompleted = 0
  classStudents.forEach((s: any) => {
    if (s._count?.gayaBelajar > 0) varkCompleted++
  })

  return (
    <div className="space-y-6">
      {/* Hero Guru Mapel */}
      <Card className="border-0 bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 text-white shadow-xl rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3.5 text-center md:text-left max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/15 text-teal-200">
              <BookOpen className="h-4 w-4 text-teal-400" />
              <span>Guru Mata Pelajaran · {user?.mapel || "SMPN 1 Genteng"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, <span className="text-teal-300">{user?.name || "Bapak/Ibu Guru"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ketahui modalitas belajar siswa (Visual, Auditori, Kinestetik) di setiap kelas yang Anda ajar untuk merancang strategi pembelajaran yang tepat sasaran.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2 justify-center md:justify-start">
              <Link href="/guru/asesmen">
                <Button className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold gap-2 shadow-md">
                  <GraduationCap className="h-4 w-4" /> Asesmen Gaya Mengajar Saya
                </Button>
              </Link>
              <Link href="/guru/laporan">
                <Button variant="outline" className="rounded-xl bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs gap-1.5">
                  <FileText className="h-4 w-4" /> Portofolio Saya
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center shrink-0">
            <ThreeMascot3D character="sparky" mood="happy" size={145} interactive showParticles showSpeechBubble message="Yuk sesuaikan metode ajar di kelas! 💡" />
          </div>
        </CardContent>
      </Card>

      {/* Class Selector for Teaching Style Check */}
      <Card className="border border-slate-100 shadow-sm rounded-2xl p-5 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-teal-600" />
              Pemeriksaan Gaya Belajar Murid di Kelas
            </h3>
            <p className="text-xs text-slate-500">Pilih kelas yang Anda ajar untuk melihat profil belajar murid</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Pilih Kelas:</span>
            <select
              value={targetClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer"
            >
              {stats.kelasList.map((k: string) => (
                <option key={k} value={k}>
                  Kelas {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100/70">
            <div className="text-xs font-bold text-blue-900">Siswa Tipe Visual</div>
            <p className="text-[11px] text-blue-700 mt-1">
              Gunakan diagram alur, presentasi visual, penyorotan warna, dan video penjelasan.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100/70">
            <div className="text-xs font-bold text-purple-900">Siswa Tipe Auditori</div>
            <p className="text-[11px] text-purple-700 mt-1">
              Perbanyak diskusi interaktif, tanya-jawab lisan, mnemonik, dan nada intonasi variatif.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100/70">
            <div className="text-xs font-bold text-amber-900">Siswa Tipe Kinestetik</div>
            <p className="text-[11px] text-amber-700 mt-1">
              Beri kesempatan praktik langsung, eksperimen, role play, dan pemecahan masalah aktif.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>{varkCompleted} dari {totalInClass} siswa kelas {targetClass} sudah mengisi asesmen VARK</span>
          <Link href={`/admin/laporan?kelas=${encodeURIComponent(targetClass)}`} className="font-semibold text-teal-600 hover:text-teal-700">
            Lihat Laporan Lengkap Kelas {targetClass} &rarr;
          </Link>
        </div>
      </Card>

      {/* 3 Self Assessment Cards for Teacher */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3 px-1">Asesmen Pengembangan Diri Guru</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Link href="/guru/asesmen">
            <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl p-4 bg-white group cursor-pointer hover:border-teal-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-600 transition-colors">Gaya Mengajar</h4>
                  <p className="text-xs text-slate-500">Evaluasi pendekatan instruksional</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/guru/psikologi">
            <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl p-4 bg-white group cursor-pointer hover:border-rose-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors">Psikologi Pendidik</h4>
                  <p className="text-xs text-slate-500">Kesejahteraan & stabilitas emosional</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/guru/mbti">
            <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl p-4 bg-white group cursor-pointer hover:border-purple-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">Tipe MBTI Guru</h4>
                  <p className="text-xs text-slate-500">16 tipe kepribadian kepemimpinan</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
