"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/lib/theme-context"
import { BannerSlider } from "@/components/banner-slider"
import {
  MessageCircleHeart, Brain, Sparkles, BookOpen, BarChart3, Shield,
  Menu, X, GraduationCap,   ArrowRight, School, Heart,
  CheckCircle2, Palette, ChevronDown,
} from "lucide-react"

const features = [
  { icon: MessageCircleHeart, title: "Curhat Anonim", desc: "Siswa bisa curhat tanpa nama. Guru BK membalas dengan akun resmi." },
  { icon: Brain, title: "Minat Bakat", desc: "Asesmen RIASEC untuk mengenali potensi dan arah karier siswa." },
  { icon: Sparkles, title: "Screening Psikologi", desc: "Deteksi awal kondisi psikologis siswa melalui asesmen mandiri." },
  { icon: BookOpen, title: "Gaya Belajar", desc: "Kenali cara belajar siswa: Visual, Auditori, Read/Write, atau Kinestetik." },
  { icon: Heart, title: "Karakter Diri", desc: "Asesmen kepribadian untuk memahami kekuatan dan area pengembangan." },
  { icon: BarChart3, title: "Dashboard Guru", desc: "Pantau hasil asesmen, kelola percakapan, dan cetak laporan kelas." },
]

const roleCards = [
  { icon: BookOpen, role: "Siswa", desc: "Curhat anonim, isi asesmen, lihat hasil", action: "Mulai Curhat", href: "/curhat" },
  { icon: GraduationCap, role: "Guru BK", desc: "Kelola konseling, pantau siswa, cetak laporan", action: "Masuk sebagai Guru BK", href: "/login" },
  { icon: Shield, role: "Admin", desc: "Atur akun, backup data, konfigurasi sistem", action: "Masuk sebagai Admin", href: "/login" },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { preset, presets, setPreset } = useTheme()
  const { user } = useAuth()
  const router = useRouter()
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white text-sm font-bold shadow-sm transition-transform group-hover:scale-105">
              BK
            </div>
            <span className={`font-bold transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>BK Online</span>
          </Link>
          <nav className={`hidden md:flex items-center gap-6 text-sm font-medium transition-colors ${scrolled ? "text-gray-600" : "text-white/80"}`}>
            <Link href="/curhat" className="hover:text-primary transition-colors">Curhat</Link>
            <button onClick={() => router.push(user ? "/asesmen/minat-bakat" : "/login")} className="hover:text-primary transition-colors">Asesmen</button>
            <Link href="/login" className="hover:text-primary transition-colors">Masuk</Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl shadow-sm text-primary-foreground">
                Daftar
              </Button>
            </Link>
            <div className="relative">
              <button
                onClick={() => setThemeOpen(!themeOpen)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                  scrolled ? "border-slate-200 hover:border-slate-300" : "border-white/30 hover:border-white/50"
                }`}
                title="Ganti tema"
              >
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: presets[preset]?.hex || presets.indigo.hex }} />
              </button>
              <AnimatePresence>
                {themeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                  >
                    {Object.entries(presets).map(([key, p]) => (
                      <button
                        key={key}
                        onClick={() => { setPreset(key); setThemeOpen(false) }}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          preset === key ? "bg-slate-100 font-semibold text-gray-900" : "text-gray-600 hover:bg-slate-50"
                        }`}
                      >
                        <div className="h-5 w-5 rounded-full border border-white/30 shadow-sm" style={{ backgroundColor: p.hex }} />
                        {p.label}
                        {preset === key && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-primary" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                scrolled ? "border-slate-200" : "border-white/30"
              }`}
              title="Ganti tema"
            >
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: presets[preset]?.hex || presets.indigo.hex }} />
            </button>
            <button className={`p-2 rounded-lg transition-colors ${scrolled ? "hover:bg-slate-100" : "hover:bg-white/10"}`} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className={`h-5 w-5 ${scrolled ? "text-gray-700" : "text-white"}`} /> : <Menu className={`h-5 w-5 ${scrolled ? "text-gray-700" : "text-white"}`} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden overflow-hidden ${scrolled ? "border-t border-slate-100" : ""}`}
            >
              <div className={`px-4 py-4 space-y-2 ${scrolled ? "bg-white" : "bg-slate-900"}`}>
                <Link href="/curhat" className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:bg-primary/5 hover:text-primary" : "text-white/70 hover:bg-white/10 hover:text-white"}`} onClick={() => setMenuOpen(false)}>Curhat Anonim</Link>
                <button onClick={() => { router.push(user ? "/asesmen/minat-bakat" : "/login"); setMenuOpen(false) }} className={`block w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:bg-primary/5 hover:text-primary" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>Asesmen Siswa</button>
                <Link href="/login" className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:bg-primary/5 hover:text-primary" : "text-white/70 hover:bg-white/10 hover:text-white"}`} onClick={() => setMenuOpen(false)}>Masuk</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="block pt-1">
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90">Daftar Akun</Button>
                </Link>
                <div className={`pt-2 ${scrolled ? "border-t border-slate-100" : "border-t border-white/10"}`}>
                  <p className={`text-xs mb-2 px-1 ${scrolled ? "text-gray-400" : "text-white/50"}`}>Tema warna</p>
                  <div className="flex gap-2 px-1">
                    {Object.entries(presets).map(([key, p]) => (
                      <button
                        key={key}
                        onClick={() => { setPreset(key); setMenuOpen(false) }}
                        className={`h-7 w-7 rounded-full border-2 transition-all ${preset === key ? "border-gray-900 scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: p.hex }}
                        title={p.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pb-20 md:pb-0">
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-16">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20" style={{ backgroundColor: presets[preset]?.hex || "#4f46e5", filter: "blur(100px)" }} />
            <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-10" style={{ backgroundColor: presets[preset]?.hex || "#4f46e5", filter: "blur(100px)" }} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-slate-900/60" />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm mb-6 border border-white/10">
                  <School className="h-4 w-4" />
                  SMP Negeri 1 Genteng
                </div>
                <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  Bimbingan Konseling
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${presets[preset]?.hex || "#4f46e5"}, ${presets[preset]?.hex || "#4f46e5"}88)` }}>
                    Digital & Terintegrasi
                  </span>
                </h1>
                <p className="mt-4 text-lg text-slate-300 leading-relaxed max-w-lg">
                  Satu platform untuk curhat anonim, asesmen minat bakat, screening psikologi,
                  dan monitoring siswa oleh Guru BK.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/curhat">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-lg gap-2 h-12 px-6 shadow-black/20">
                      Mulai Curhat <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-500 text-slate-200 hover:bg-white/10 rounded-xl gap-2 h-12 px-6"
                    onClick={() => document.getElementById("fitur")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Lihat Fitur <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-8 flex items-center gap-6 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" style={{ color: presets[preset]?.hex || "#4f46e5" }} /> Gratis</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" style={{ color: presets[preset]?.hex || "#4f46e5" }} /> Privasi Terjaga</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" style={{ color: presets[preset]?.hex || "#4f46e5" }} /> Real-time</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={mounted ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden lg:flex justify-center"
              >
                <div className="relative w-full max-w-md aspect-square">
                  <div className="absolute inset-0 rounded-3xl" style={{ backgroundColor: `${presets[preset]?.hex || "#4f46e5"}15` }} />
                  <div className="relative grid grid-cols-2 gap-4 p-6">
                    {[
                      { icon: MessageCircleHeart, label: "Curhat" },
                      { icon: Brain, label: "Minat Bakat" },
                      { icon: Sparkles, label: "Psikologi" },
                      { icon: BookOpen, label: "Gaya Belajar" },
                    ].map((item, i) => {
                      const Icon = item.icon
                      return (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={mounted ? { opacity: 1, y: 0 } : {}}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex flex-col items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-5"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
                            <Icon className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <span className="text-sm font-medium text-white/90">{item.label}</span>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============ THEME PICKER (mobile floating) ============ */}
        <div className="fixed bottom-6 right-6 z-40 md:hidden">
          <div className="relative">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl border-4 border-white"
            >
              <Palette className="h-5 w-5" />
            </button>
            <AnimatePresence>
              {themeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-16 right-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl"
                >
                  <div className="flex gap-2.5">
                    {Object.entries(presets).map(([key, p]) => (
                      <button
                        key={key}
                        onClick={() => { setPreset(key); setThemeOpen(false) }}
                        className={`h-9 w-9 rounded-full transition-all ${preset === key ? "ring-2 ring-offset-2 scale-110" : "ring-0"}`}
                        style={{ backgroundColor: p.hex }}
                        title={p.label}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ============ ROLE CARDS ============ */}
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
                    <Card className="relative border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group hover:-translate-y-2 bg-transparent py-0 ring-0">
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, ${presets[preset]?.hex || "#4f46e5"}, ${presets[preset]?.hex || "#4f46e5"}dd)` }}
                      />
                      <div className="absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 translate-y-1/3 -translate-x-1/3 rounded-full bg-white/5" />
                      <CardContent className="relative p-6 text-white">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
                            <Icon className="h-7 w-7" />
                          </div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm group-hover:bg-white/25 transition-colors">
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold">{item.role}</h3>
                        <p className="mt-1.5 text-sm text-white/80 leading-relaxed">{item.desc}</p>
                        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-white/90">
                          {item.action}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        {/* ============ BANNER SLIDER ============ */}
        <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
          <BannerSlider />
        </section>

        {/* ============ FEATURES ============ */}
        <section id="fitur" className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Sparkles className="h-4 w-4" /> Fitur Lengkap
            </div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Semua Kebutuhan BK dalam Satu Platform</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Dari curhat anonim hingga asesmen psikologi, semua terintegrasi untuk mendukung
              layanan bimbingan konseling yang lebih efektif.
            </p>
          </motion.div>
          <motion.div
            variants={container}
            initial="hidden"
            animate={mounted ? "visible" : {}}
            className="grid grid-cols-3 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
          >
            {features.map((f) => {
              const Icon = f.icon
              return (
                <motion.div key={f.title} variants={itemAnim}>
                  <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center sm:rounded-3xl sm:p-6 sm:shadow-sm sm:hover:shadow-lg sm:transition-all sm:duration-300 sm:group sm:hover:-translate-y-1 sm:cursor-default sm:border-0 sm:block sm:text-left">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 sm:mb-4 sm:group-hover:scale-110 sm:transition-transform sm:duration-300">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-1 text-xs font-semibold text-gray-900 sm:mt-0 sm:text-base">{f.title}</h3>
                    <p className="hidden sm:block sm:mt-2 sm:text-sm sm:text-gray-500 sm:leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="bg-slate-50 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                <GraduationCap className="h-4 w-4" /> Cara Kerja
              </div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Bagaimana Alur BK Digital?</h2>
              <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                Dari siswa hingga guru BK, semua terhubung dalam satu alur yang sederhana.
              </p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { step: "01", title: "Siswa Curhat / Isi Asesmen", desc: "Siswa mengirim pesan anonim atau mengisi asesmen minat bakat, psikologi, gaya belajar, dan karakter diri." },
                { step: "02", title: "Guru BK Pantau & Respons", desc: "Guru BK melihat percakapan, membalas curhat, dan memantau hasil asesmen siswa secara real-time." },
                { step: "03", title: "Laporan & Tindak Lanjut", desc: "Cetak laporan per siswa atau per kelas untuk kebutuhan konseling dan dokumentasi BK." },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={mounted ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + parseInt(item.step) * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-bold mb-5">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ STATS ============ */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "100%", label: "Privasi Terjaga" },
                { value: "6+", label: "Modul Asesmen" },
                { value: "Real-time", label: "Percakapan" },
                { value: "Gratis", label: "Untuk Sekolah" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={mounted ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-4xl font-black text-primary-foreground/90">{s.value}</div>
                  <div className="mt-1 text-sm text-primary-foreground/70 font-medium">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={mounted ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <GraduationCap className="h-4 w-4" /> Siap Memulai?
            </div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Wujudkan BK Digital di Sekolah Anda</h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              Siswa bisa langsung curhat, guru bisa langsung pantau. Semua gratis untuk sekolah.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/curhat">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 h-12 px-6 shadow-md">
                  Mulai Curhat <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-xl gap-2 h-12 px-6 border-slate-300">
                  Masuk ke Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ============ MOBILE BOTTOM NAV ============ */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/90 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden safe-area-bottom">
        <div className="mx-auto flex max-w-sm items-center justify-between gap-1 px-3 py-1.5">
          <Link
            href="/"
            className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 min-w-0"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full">
              <School className="h-4 w-4" />
            </div>
            <span className="truncate leading-tight">Beranda</span>
          </Link>
          <Link
            href="/curhat"
            className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 min-w-0"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full">
              <MessageCircleHeart className="h-4 w-4" />
            </div>
            <span className="truncate leading-tight">Curhat</span>
          </Link>
          <button
            onClick={() => router.push(user ? "/asesmen/minat-bakat" : "/login")}
            className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 min-w-0"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full">
              <Brain className="h-4 w-4" />
            </div>
            <span className="truncate leading-tight">Asesmen</span>
          </button>
          <Link
            href="/login"
            className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 min-w-0"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full">
              <Shield className="h-4 w-4" />
            </div>
            <span className="truncate leading-tight">Masuk</span>
          </Link>
        </div>
      </nav>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-[10px] font-bold">
                  BK
                </div>
                <span className="font-bold text-gray-900">BK Online</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Aplikasi Bimbingan Konseling Digital untuk SMP Negeri 1 Genteng.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">Fitur</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Curhat Anonim</li>
                <li>Asesmen Minat Bakat</li>
                <li>Screening Psikologi</li>
                <li>Gaya Belajar & Karakter</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">Akses Cepat</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/curhat" className="text-gray-400 hover:text-primary transition-colors">Mulai Curhat</Link></li>
                <li><button onClick={() => router.push(user ? "/asesmen/minat-bakat" : "/login")} className="text-gray-400 hover:text-primary transition-colors">Lihat Asesmen</button></li>
                <li><Link href="/login" className="text-gray-400 hover:text-primary transition-colors">Masuk</Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-primary transition-colors">Daftar</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-gray-400">
            <p>&copy; 2026 BK Online — SMP Negeri 1 Genteng</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
