"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/lib/theme-context"
import { BannerSlider } from "@/components/banner-slider"
import { OnlineIndicator } from "@/components/online-indicator"
import { ThreeHeroBackground } from "@/components/three-hero-background"
import {
  MessageCircleHeart, Brain, Sparkles, BookOpen, BarChart3, Shield,
  Menu, X, GraduationCap, ArrowRight, School, Heart,
  CheckCircle2, ChevronDown, MapPin, Phone, Globe, Award,
  Compass, Users, ShieldCheck, HelpCircle, Sparkle, Target
} from "lucide-react"

const features = [
  {
    icon: MessageCircleHeart,
    title: "Curhat Anonim & Aman",
    desc: "Siswa bebas mencurahkan keluh kesah tanpa rasa cemas. Identitas nama dirahasiakan, dibalas langsung oleh Guru BK resmi SMPN 1 Genteng.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Brain,
    title: "Asesmen Minat & Bakat",
    desc: "Eksplorasi minat karier berbasis RIASEC (Holland Code) untuk membantu siswa kelas 7, 8, dan 9 merencanakan studi lanjut ke SMA/SMK unggulan.",
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: Sparkles,
    title: "Screening Psikologi Mandiri",
    desc: "Deteksi awal suasana hati, tingkat kecemasan, dan kesejahteraan emosional siswa secara berkala demi lingkungan belajar yang suportif.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: BookOpen,
    title: "Diagnostik Gaya Belajar",
    desc: "Kenali kecenderungan gaya belajar unik (Visual, Auditori, Read/Write, Kinestetik) agar belajar di kelas maupun mandiri lebih efektif.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Heart,
    title: "Asesmen Karakter Diri",
    desc: "Pengenalan karakter kepribadian dan potensi positif siswa untuk mewujudkan Profil Pelajar Pancasila yang tangguh dan berintegritas.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: BarChart3,
    title: "Portal & Rekapitulasi Guru",
    desc: "Guru BK dan Wali Kelas memantau dinamika perkembangan siswa per kelas (7A-7I, 8A-8I, 9A-9I) dengan visualisasi data yang komprehensif.",
    color: "from-sky-500 to-cyan-600",
  },
]

const pilarBK = [
  {
    bidang: "Bimbingan Pribadi",
    icon: Heart,
    deskripsi: "Membantu siswa memahami keunikan diri, mengelola emosi, menumbuhkan kepercayaan diri, dan membentuk akhlak mulia.",
  },
  {
    bidang: "Bimbingan Sosial",
    icon: Users,
    deskripsi: "Membangun interaksi sosial yang sehat, empati, anti-perundungan (stop bullying), dan adaptasi lingkungan di sekolah.",
  },
  {
    bidang: "Bimbingan Belajar",
    icon: BookOpen,
    deskripsi: "Mengatasi kesulitan belajar, menumbuhkan motivasi, serta menemukan strategi belajar yang efektif dan menyenangkan.",
  },
  {
    bidang: "Bimbingan Karier",
    icon: Compass,
    deskripsi: "Mengarahkan cita-cita masa depan, pengenalan ragam profesi, dan penelusuran penjurusan jenjang menengah atas.",
  },
]

const roleCards = [
  {
    icon: BookOpen,
    role: "Siswa",
    desc: "Ruang aman untuk curhat anonim, mengerjakan asesmen minat bakat, cek gaya belajar, dan konsultasi.",
    action: "Masuk & Curhat",
    href: "/curhat",
    badge: "Siswa SPENSA",
  },
  {
    icon: GraduationCap,
    role: "Guru BK & Wali Kelas",
    desc: "Kelola pendampingan konseling, pantau hasil asesmen rombel, dan cetak laporan perkembangan siswa.",
    action: "Masuk Portal Guru",
    href: "/login",
    badge: "Guru & Walas",
  },
  {
    icon: ShieldCheck,
    role: "Administrator",
    desc: "Pusat tata kelola akun siswa, manajemen kelas 7A-9I, konfigurasi instrumen asesmen, dan cadangan data.",
    action: "Portal Admin",
    href: "/login",
    badge: "Sistem Sekolah",
  },
]

const statsSchool = [
  { label: "Siswa Aktif Terdaftar", value: "590+", sub: "Kelas 7, 8, dan 9" },
  { label: "Rombongan Belajar", value: "27", sub: "Kelas 7A-7I, 8A-8I, 9A-9I" },
  { label: "Guru & Tenaga Kependidikan", value: "60", sub: "Pendidik Berdedikasi" },
  { label: "Kerahasiaan Curhat", value: "100%", sub: "Enkripsi Anonim Terjaga" },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { preset, presets } = useTheme()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const primaryHex = presets[preset]?.hex || "#2563eb"

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* ============ HEADER ============ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm"
            : "bg-slate-900/40 backdrop-blur-sm border-b border-white/10"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-sm shadow-md transition-transform group-hover:scale-105 ring-2 ring-white/20">
              SP1
            </div>
            <div className="flex flex-col">
              <span className={`font-black text-base leading-tight tracking-tight transition-colors ${scrolled ? "text-slate-900" : "text-white"}`}>
                BK ONLINE
              </span>
              <span className={`text-[11px] font-medium tracking-wide transition-colors ${scrolled ? "text-slate-500" : "text-blue-200/90"}`}>
                SMP Negeri 1 Genteng
              </span>
            </div>
          </Link>

          <nav className={`hidden md:flex items-center gap-6 text-sm font-medium transition-colors ${scrolled ? "text-slate-600" : "text-white/85"}`}>
            <a href="#profil" className="hover:text-blue-500 transition-colors">Profil Sekolah</a>
            <a href="#fitur" className="hover:text-blue-500 transition-colors">Layanan BK</a>
            <a href="#alur" className="hover:text-blue-500 transition-colors">Alur Konseling</a>
            <Link href="/curhat" className="hover:text-blue-500 transition-colors">Curhat</Link>
            <Link href="/asesmen" className="hover:text-blue-500 transition-colors">Pusat Asesmen</Link>
            {user ? (
              <Link href={user.role === "siswa" ? "/beranda" : "/admin/dashboard"}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm font-semibold px-4">
                  Buka Portal ({user.name.split(" ")[0]})
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2 pl-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className={`rounded-xl font-semibold ${scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"}`}>
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm font-semibold px-4">
                    Daftar Siswa
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              className={`p-2 rounded-xl transition-colors ${scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-slate-200/50 bg-white"
            >
              <div className="px-4 py-4 space-y-2 text-slate-800">
                {user && (
                  <Link href={user.role === "siswa" ? "/beranda" : "/admin/dashboard"} onClick={() => setMenuOpen(false)} className="block pb-2">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-white">
                      Buka Portal ({user.name})
                    </Button>
                  </Link>
                )}
                <a href="#profil" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100">
                  Profil SMPN 1 Genteng
                </a>
                <a href="#fitur" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100">
                  Layanan BK & Asesmen
                </a>
                <a href="#alur" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100">
                  Alur Konseling
                </a>
                <Link href="/curhat" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100">
                  Curhat Anonim
                </Link>
                <Link href="/asesmen" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100">
                  Pusat Asesmen Siswa
                </Link>
                {!user && (
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <Link href="/login" onClick={() => setMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full justify-center">
                        Masuk Akun
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMenuOpen(false)}>
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-center">
                        Daftar Akun Siswa
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 pb-16 md:pb-0">
        {/* ============ HERO SECTION ============ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full opacity-25 bg-blue-600 blur-[120px]" />
            <div className="absolute -bottom-32 -left-32 w-[450px] h-[450px] rounded-full opacity-20 bg-indigo-600 blur-[120px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-slate-950/80" />
            <ThreeHeroBackground primaryColor={primaryHex} />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="lg:col-span-7"
              >
                {/* School Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-white/15 text-blue-200">
                    <School className="h-3.5 w-3.5 text-blue-400" />
                    <span>SMP Negeri 1 Genteng</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs py-0.5">
                    Akreditasi A
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-slate-300 text-xs py-0.5 hidden sm:inline-flex">
                    NPSN: 20525726
                  </Badge>
                  <OnlineIndicator minimal />
                </div>

                <h1 className="text-3xl font-black leading-tight sm:text-5xl lg:text-[3.25rem] tracking-tight">
                  Layanan Bimbingan Konseling Digital{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                    SMPN 1 Genteng
                  </span>
                </h1>

                <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                  Platform resmi Bimbingan dan Konseling (BK) untuk mendampingi seluruh siswa SMP Negeri 1 Genteng dalam menemukan potensi diri, mengatasi masalah belajar, curhat secara aman, dan merencanakan masa depan yang gemilang.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/curhat">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-900/40 gap-2 h-12 px-6">
                      <MessageCircleHeart className="h-4 w-4" />
                      Mulai Curhat Anonim
                    </Button>
                  </Link>
                  <Link href="/asesmen">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-slate-600 text-slate-200 hover:bg-white/10 rounded-xl gap-2 h-12 px-6"
                    >
                      <Brain className="h-4 w-4" />
                      Pusat Asesmen Siswa
                    </Button>
                  </Link>
                </div>

                {/* Highlights pill */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-300">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% Rahasia & Terlindungi
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Responsif oleh Guru BK
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Terintegrasi Rombel 7-9
                  </span>
                </div>
              </motion.div>

              {/* Visual Card Hero */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={mounted ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="lg:col-span-5"
              >
                <div className="relative rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl p-6 sm:p-7 shadow-2xl">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-blue-300 font-semibold">Visi Sekolah</div>
                        <div className="text-sm font-bold text-white">SPENSA Genteng</div>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 text-[10px]">Unggul & Karakter</Badge>
                  </div>

                  <blockquote className="text-sm sm:text-base italic text-slate-200 leading-relaxed font-light mb-6 border-l-2 border-blue-400 pl-3">
                    &ldquo;Terwujudnya Murid yang Beriman dan Bertakwa, Unggul dalam Prestasi, Kompeten, Berkarakter, serta Berwawasan Global.&rdquo;
                  </blockquote>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-2xl font-black text-blue-400">27 Kelas</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Rombel 7A–7I, 8A–8I, 9A–9I</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-2xl font-black text-emerald-400">Genteng</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Banyuwangi, Jawa Timur</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============ ROLE CARDS (AKSES PERAN) ============ */}
        <section className="mx-auto max-w-6xl px-4 -mt-10 sm:px-6 relative z-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate={mounted ? "visible" : {}}
            className="grid gap-5 md:grid-cols-3"
          >
            {roleCards.map((item) => {
              const Icon = item.icon
              return (
                <motion.div key={item.role} variants={itemAnim}>
                  <Link href={item.href}>
                    <Card className="relative border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group hover:-translate-y-2 bg-gradient-to-br from-white to-slate-50 border-slate-200/80 p-0">
                      <div className="h-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-110 transition-transform">
                            <Icon className="h-6 w-6" />
                          </div>
                          <Badge variant="outline" className="text-[11px] font-semibold text-slate-600 bg-slate-50">
                            {item.badge}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.role}</h3>
                        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[40px]">{item.desc}</p>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                          <span>{item.action}</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        {/* ============ BANNER SLIDER DARI ADMIN ============ */}
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
          <BannerSlider />
        </section>

        {/* ============ PROFIL & NILAI BK SPENSA ============ */}
        <section id="profil" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-blue-700 mb-3">
              <School className="h-3.5 w-3.5" /> Profil & Pilar BK SPENSA
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Bimbingan Konseling yang Mengayomi & Membangun
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Di SMP Negeri 1 Genteng, Bimbingan dan Konseling bukan tempat penghakiman, melainkan sahabat setia murid dalam tumbuh kembang akademik, sosial, dan kepribadian.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pilarBK.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.bidang}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{p.bidang}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{p.deskripsi}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ============ FITUR LAYANAN BK LENGKAP ============ */}
        <section id="fitur" className="bg-slate-100/70 border-y border-slate-200/70 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3.5 py-1 text-xs font-bold text-indigo-700 mb-3">
                <Sparkle className="h-3.5 w-3.5" /> Instrumen Digital Terlengkap
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
                Layanan Terpadu Bimbingan & Asesmen
              </h2>
              <p className="mt-3 text-slate-600 text-sm sm:text-base">
                Dirancang khusus untuk mendukung kebutuhan siswa jenjang SMP dalam mengenali kekuatan diri dan mengatasi tantangan belajar.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => {
                const Icon = f.icon
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-105 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ============ ALUR KERJA KONSELING ============ */}
        <section id="alur" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 mb-3">
              <Compass className="h-3.5 w-3.5" /> Sederhana & Solutif
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Alur Pendampingan BK Siswa
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Hanya butuh 3 langkah praktis bagi siswa untuk mendapatkan bimbingan dari Guru BK.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Curhat atau Isi Asesmen",
                desc: "Siswa menulis pesan anonim atau mengisi tes psikologi, minat bakat, gaya belajar, dan karakter tanpa beban rasa malu.",
              },
              {
                step: "02",
                title: "Guru BK Merespons & Menganalisis",
                desc: "Guru BK membaca curhatan dengan penuh empati serta memetakan kebutuhan konseling berdasarkan hasil asesmen riil.",
              },
              {
                step: "03",
                title: "Solusi & Tindak Lanjut Positif",
                desc: "Diberikan arahan solusi praktis, jadwal tatap muka jika diperlukan, dan laporan rekap untuk kemajuan belajar siswa.",
              },
            ].map((st, i) => (
              <motion.div
                key={st.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative rounded-2xl bg-white border border-slate-200/90 p-6 text-center shadow-sm"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-lg mb-4 shadow-md">
                  {st.step}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{st.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{st.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============ STATISTIK SPENSA GENTENG ============ */}
        <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {statsSchool.map((st, i) => (
                <motion.div
                  key={st.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10"
                >
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">{st.value}</div>
                  <div className="mt-1 font-bold text-xs sm:text-sm text-blue-100">{st.label}</div>
                  <div className="text-[11px] text-blue-200/70 mt-0.5">{st.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA AJAKAN ============ */}
        <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-b from-blue-50/70 to-indigo-50/40 border border-blue-100 p-8 sm:p-12 shadow-sm"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-3.5 py-1 text-xs font-semibold mb-4">
              <Heart className="h-3.5 w-3.5" /> Jangan Pendam Masalahmu Sendiri
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Guru BK SMPN 1 Genteng Siap Mendengarmu
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Mulai dari masalah pelajaran, pertemanan, kecemasan, hingga impian masa depan. Tuliskan ceritamu sekarang dengan aman tanpa perlu takut nama diketahui.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/curhat">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold gap-2 h-12 px-6 shadow-md shadow-blue-600/20">
                  <MessageCircleHeart className="h-4 w-4" />
                  Mulai Curhat Sekarang
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-xl font-bold gap-2 h-12 px-6 border-slate-300">
                  Masuk Portal Sekolah
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ============ FOOTER DENGAN INFORMASI LENGKAP SMPN 1 GENTENG ============ */}
      <footer className="border-t border-slate-200 bg-white text-slate-600">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="grid gap-8 md:grid-cols-12">
            {/* Info Sekolah */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm">
                  SP1
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">SMP NEGERI 1 GENTENG</h3>
                  <p className="text-xs text-slate-500">Bimbingan & Konseling Digital</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Mendukung terciptanya iklim sekolah ramah anak, berprestasi, dan berkarakter Profil Pelajar Pancasila melalui pelayanan bimbingan konseling digital yang humanis.
              </p>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Jl. Bromo No. 49, Genteng Kulon, Kec. Genteng, Kab. Banyuwangi, Jawa Timur 68465</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>NPSN: <strong>20525726</strong> • Akreditasi: <strong>A</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600 shrink-0" />
                  <a href="https://www.smpn1genteng.sch.id" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    www.smpn1genteng.sch.id
                  </a>
                </div>
              </div>
            </div>

            {/* Menu Navigasi Layanan */}
            <div className="md:col-span-3">
              <h4 className="font-bold text-slate-900 text-sm mb-3.5">Layanan Unggulan</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link href="/curhat" className="hover:text-blue-600 transition-colors">Curhat Anonim Online</Link></li>
                <li><Link href="/asesmen/minat-bakat" className="hover:text-blue-600 transition-colors">Asesmen Minat Bakat (RIASEC)</Link></li>
                <li><Link href="/asesmen/gaya-belajar" className="hover:text-blue-600 transition-colors">Tes Gaya Belajar (VARK)</Link></li>
                <li><Link href="/asesmen/psikologi" className="hover:text-blue-600 transition-colors">Screening Psikologi Siswa</Link></li>
                <li><Link href="/karakter" className="hover:text-blue-600 transition-colors">Asesmen Karakter Diri</Link></li>
              </ul>
            </div>

            {/* Portal & Jam Layanan */}
            <div className="md:col-span-4">
              <h4 className="font-bold text-slate-900 text-sm mb-3.5">Akses Portal & Jam Layanan</h4>
              <ul className="space-y-2 text-xs sm:text-sm mb-4">
                <li><Link href="/login" className="hover:text-blue-600 transition-colors">Login Siswa & Wali Murid</Link></li>
                <li><Link href="/login" className="hover:text-blue-600 transition-colors">Login Guru BK & Wali Kelas</Link></li>
                <li><Link href="/register" className="hover:text-blue-600 transition-colors">Registrasi Akun Siswa Baru</Link></li>
              </ul>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs">
                <div className="font-semibold text-slate-800">Ruang BK SMPN 1 Genteng</div>
                <div className="text-slate-500 mt-0.5">Senin – Jumat: 07.00 – 15.00 WIB</div>
                <div className="text-slate-500">Layanan Curhat Online: Aktif 24 Jam</div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
            <p>&copy; {new Date().getFullYear()} Bimbingan Konseling Digital — SMP Negeri 1 Genteng, Banyuwangi.</p>
            <p className="font-medium text-slate-600">Terwujudnya Generasi Unggul, Berkarakter & Berwawasan Global</p>
          </div>
        </div>
      </footer>

      {/* ============ MOBILE BOTTOM BAR NAVIGATION ============ */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 shadow-lg backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          <Link
            href="/"
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold text-blue-600"
          >
            <School className="h-5 w-5" />
            <span>Beranda</span>
          </Link>
          <Link
            href="/curhat"
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-slate-500 hover:text-blue-600"
          >
            <MessageCircleHeart className="h-5 w-5" />
            <span>Curhat</span>
          </Link>
          <Link
            href="/asesmen"
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-slate-500 hover:text-blue-600"
          >
            <Brain className="h-5 w-5" />
            <span>Asesmen</span>
          </Link>
          <Link
            href="/login"
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-slate-500 hover:text-blue-600"
          >
            <Shield className="h-5 w-5" />
            <span>Masuk</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
