"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { ThreeMascot3D } from "@/components/asesmen/three-mascot-3d"
import {
  MessageCircleHeart,
  Compass,
  Sparkles,
  BookOpen,
  Brain,
  Heart,
  Star,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lightbulb,
  Award,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Zap,
  Target,
  FileText
} from "lucide-react"

export default function SiswaBerandaPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dataAssessments, setDataAssessments] = useState<Record<string, any>>({})
  const [studentInfo, setStudentInfo] = useState<any>(null)

  useEffect(() => {
    async function loadStatus() {
      if (!user) return
      try {
        const nisnQuery = user.username || ""
        const res = await fetch(`/api/siswa/asesmen?nisn=${encodeURIComponent(nisnQuery)}&jenis=all`)
        if (res.ok) {
          const json = await res.json()
          if (json.assessments) {
            setDataAssessments(json.assessments)
          }
          if (json.siswa) {
            setStudentInfo(json.siswa)
          }
        }
      } catch (err) {
        console.error("Gagal memuat status asesmen siswa", err)
      } finally {
        setLoading(false)
      }
    }
    loadStatus()
  }, [user])

  const mbCompleted = Boolean(dataAssessments.minatBakat?.completed)
  const psiCompleted = Boolean(dataAssessments.psikologi?.completed)
  const gbCompleted = Boolean(dataAssessments.gayaBelajar?.completed)
  const kdCompleted = Boolean(dataAssessments.karakterDiri?.completed)
  const mbtiCompleted = Boolean(dataAssessments.mbti?.completed)

  const completedCount = [mbCompleted, psiCompleted, gbCompleted, kdCompleted, mbtiCompleted].filter(Boolean).length
  const progressPercent = Math.round((completedCount / 5) * 100)

  // Label & deskripsi hasil Minat Bakat (Holland RIASEC)
  let mbCode = ""
  let mbDesc = ""
  if (mbCompleted && dataAssessments.minatBakat?.skor) {
    const sorted = Object.entries(dataAssessments.minatBakat.skor).sort(([, a]: any, [, b]: any) => (b as number) - (a as number))
    if (sorted[0]) {
      const code = String(sorted[0][0]).toUpperCase()
      mbCode = code
      const descMap: Record<string, string> = {
        R: "Realistis: Praktis, menyukai kegiatan fisik & teknis",
        I: "Investigatif: Peneliti, kritis, menyukai analisis sains & pemecahan masalah",
        A: "Artistik: Kreatif, imajinatif, menyukai seni & ekspresi bebas",
        S: "Sosial: Ramah, suka menolong, komunikatif & empati tinggi",
        E: "Enterprising: Jiwa pemimpin, persuasif & wirausaha",
        C: "Konvensional: Rapi, terorganisir, teliti & sistematis",
      }
      mbDesc = descMap[code] || "Minat karier unik terpetakan"
    }
  }

  // Label & deskripsi Gaya Belajar (VARK)
  let gbName = ""
  let gbTip = ""
  if (gbCompleted && dataAssessments.gayaBelajar?.skor) {
    const sorted = Object.entries(dataAssessments.gayaBelajar.skor).sort(([, a]: any, [, b]: any) => (b as number) - (a as number))
    if (sorted[0]) {
      gbName = String(sorted[0][0])
      const tipMap: Record<string, string> = {
        Visual: "Paling cepat paham dengan diagram, warna, mind map, dan ilustrasi video.",
        Auditori: "Mudah menyerap pelajaran lewat mendengarkan penjelasan lisan & diskusi kelompok.",
        Kinestetik: "Sangat optimal bila belajar sambil praktik langsung, bergerak, dan eksperimen.",
        "Read/Write": "Senang membaca teks buku, merangkum materi, dan membuat catatan tertulis rapi.",
      }
      gbTip = tipMap[gbName] || "Gaya belajar khas kamu sudah terdata."
    }
  }

  // Label MBTI
  let mbtiCode = ""
  let mbtiDesc = ""
  if (mbtiCompleted && dataAssessments.mbti?.skor) {
    const skor = dataAssessments.mbti.skor
    const e_i = (skor.E || 0) >= (skor.I || 0) ? "E" : "I"
    const s_n = (skor.S || 0) >= (skor.N || 0) ? "S" : "N"
    const t_f = (skor.T || 0) >= (skor.F || 0) ? "T" : "F"
    const j_p = (skor.J || 0) >= (skor.P || 0) ? "J" : "P"
    mbtiCode = `${e_i}${s_n}${t_f}${j_p}`
    mbtiDesc = "Tipe kepribadian terpetakan"
  }

  // Asesmen berikutnya yang direkomendasikan untuk diisi
  const pendingAssessments = [
    { id: "minat-bakat", title: "Minat & Bakat (Holland)", href: "/asesmen/minat-bakat", completed: mbCompleted, duration: "5 Menit", icon: Compass, color: "from-emerald-500 to-teal-600" },
    { id: "gaya-belajar", title: "Gaya Belajar (VARK)", href: "/asesmen/gaya-belajar", completed: gbCompleted, duration: "3 Menit", icon: BookOpen, color: "from-blue-500 to-indigo-600" },
    { id: "psikologi", title: "Refleksi Emosi & Hati", href: "/asesmen/psikologi", completed: psiCompleted, duration: "3 Menit", icon: Heart, color: "from-rose-500 to-pink-600" },
    { id: "karakter", title: "Karakter & Nilai Diri", href: "/karakter", completed: kdCompleted, duration: "5 Menit", icon: Star, color: "from-amber-500 to-orange-600" },
    { id: "mbti", title: "Kepribadian MBTI", href: "/asesmen/mbti", completed: mbtiCompleted, duration: "6-8 Menit", icon: Brain, color: "from-indigo-500 to-purple-600" },
  ]
  const nextRecommended = pendingAssessments.find((a) => !a.completed)

  const displayName = studentInfo?.nama || user?.name || "Siswa Hebat"
  const displayKelas = studentInfo?.kelas || user?.kelas || "Kelas SMPN 1 Genteng"

  return (
    <div className="space-y-6 pb-16">
      {/* 1. HERO PROFILE DASHBOARD BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-xl overflow-hidden relative rounded-3xl">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-3.5 text-center md:text-left max-w-lg">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/15 text-indigo-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                <span>Dashboard Pribadi Siswa · SMPN 1 Genteng</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Halo, <span className="text-amber-300">{displayName}</span>! 👋
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Ini adalah ruang kendali pribadi potensi belajarmu. Pantau kemajuan pemetaan diri, temukan gaya belajarmu, atau konsultasikan apa pun ke Guru BK.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
                <Badge className="bg-white/10 hover:bg-white/15 text-slate-200 border-white/10 text-xs px-3 py-1 rounded-xl">
                  {displayKelas}
                </Badge>
                <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl border border-white/10 text-[11px] text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Bimbingan Konseling Ramah Siswa
                </span>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
                <Link href="/curhat" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-11 px-5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold shadow-lg shadow-rose-500/20 gap-2 tap-bounce">
                    <MessageCircleHeart className="h-4 w-4" /> Curhat ke Guru BK
                  </Button>
                </Link>
                <Link href="/asesmen" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto h-11 px-5 rounded-2xl bg-white/10 hover:bg-white/20 border-white/20 text-white font-semibold backdrop-blur-md gap-2 tap-bounce">
                    <Compass className="h-4 w-4" /> Buka Pusat Asesmen
                  </Button>
                </Link>
              </div>
            </div>

            {/* 3D Interactive Mascot */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="relative p-2">
                <ThreeMascot3D
                  character="kimi"
                  mood={completedCount >= 3 ? "cheering" : "happy"}
                  size={155}
                  interactive={true}
                  showParticles={true}
                  showSpeechBubble={true}
                  message={`Hai ${displayName.split(" ")[0]}! Sentuh aku untuk berputar! ✨`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 2. REKOMENDASI TUGAS / NEXT ACTION ATAU SELAMAT */}
      {nextRecommended ? (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/80 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${nextRecommended.color} text-white shadow-md`}>
                <nextRecommended.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-600 text-white px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                    Rekomendasi Langkah Berikutnya
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {nextRecommended.duration}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Lengkapi Asesmen: {nextRecommended.title}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Isi instrumen ini agar Guru BK dapat memberikan gambaran potensi diri dan metode belajar yang paling pas untukmu.
                </p>
              </div>
            </div>

            <Link href={nextRecommended.href} className="shrink-0">
              <Button className={`w-full sm:w-auto h-10 px-5 rounded-xl font-bold bg-gradient-to-r ${nextRecommended.color} text-white shadow-md gap-2`}>
                <Zap className="h-4 w-4" /> Mulai Sekarang <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                  Sempurna! 100% Selesai
                </span>
                <h3 className="text-base font-extrabold text-emerald-950 mt-1">
                  Seluruh 5 Asesmen Telah Lengkap Terisi
                </h3>
                <p className="text-xs text-emerald-800">
                  Profil kepribadian, gaya belajar, dan minat kariermu sudah tersimpan di database BK SMPN 1 Genteng.
                </p>
              </div>
            </div>
            <Link href="/asesmen">
              <Button variant="outline" size="sm" className="bg-white border-emerald-300 text-emerald-800 rounded-xl font-semibold gap-1.5">
                Review Semua Hasil <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 3. PROGRES EKSPLORASI DIRI */}
      <Card className="border-0 shadow-sm bg-white rounded-2xl p-5 border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-600" />
              Progres Kelengkapan Portofolio BK Siswa
            </h2>
            <p className="text-xs text-slate-500">
              {completedCount === 5
                ? "Semua asesmen telah terisi! Data siap digunakan untuk bimbingan karier."
                : `Masih ada ${5 - completedCount} asesmen yang belum diisi untuk melengkapi profilmu.`}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
              {completedCount} dari 5 Selesai ({progressPercent}%)
            </span>
          </div>
        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full"
          />
        </div>
      </Card>

      {/* 4. PETA POTENSI DIRI (MY PERSONAL PROFILE INSIGHTS) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-600" />
              Rangkuman Profil Potensi Dirimu
            </h2>
            <p className="text-xs text-slate-500">
              Hasil intisari dari asesmen yang telah kamu kerjakan
            </p>
          </div>
          <Link href="/asesmen" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Buka Pusat Asesmen <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Gaya Belajar */}
          <Card className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
            gbCompleted ? "bg-white border-blue-200/80 shadow-xs" : "bg-slate-50/70 border-slate-200/60"
          }`}>
            <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  {gbCompleted ? (
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                      {gbName}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400 text-[10px]">Belum Diisi</Badge>
                  )}
                </div>
                <h3 className="font-bold text-xs text-slate-900">Gaya Belajar (VARK)</h3>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {gbCompleted ? gbTip : "Cari tahu caramu paling cepat menyerap materi pelajaran."}
                </p>
              </div>
              <Link href="/asesmen/gaya-belajar">
                <Button variant="ghost" size="sm" className="w-full text-xs font-semibold h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 justify-start gap-1">
                  {gbCompleted ? "Lihat Detail Gaya Belajar" : "Mulai Tes VARK"} <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card 2: Minat Bakat RIASEC */}
          <Card className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
            mbCompleted ? "bg-white border-emerald-200/80 shadow-xs" : "bg-slate-50/70 border-slate-200/60"
          }`}>
            <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Compass className="h-4 w-4" />
                  </div>
                  {mbCompleted ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                      Tipe {mbCode}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400 text-[10px]">Belum Diisi</Badge>
                  )}
                </div>
                <h3 className="font-bold text-xs text-slate-900">Minat Karier (Holland)</h3>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {mbCompleted ? mbDesc : "Petakan bakat dan jurusan sekolah/karier masa depanmu."}
                </p>
              </div>
              <Link href="/asesmen/minat-bakat">
                <Button variant="ghost" size="sm" className="w-full text-xs font-semibold h-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-0 justify-start gap-1">
                  {mbCompleted ? "Lihat Detail Karier" : "Mulai Tes Holland"} <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card 3: Kepribadian MBTI */}
          <Card className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
            mbtiCompleted ? "bg-white border-purple-200/80 shadow-xs" : "bg-slate-50/70 border-slate-200/60"
          }`}>
            <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <Brain className="h-4 w-4" />
                  </div>
                  {mbtiCompleted ? (
                    <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold">
                      {mbtiCode}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400 text-[10px]">Belum Diisi</Badge>
                  )}
                </div>
                <h3 className="font-bold text-xs text-slate-900">Kepribadian (MBTI)</h3>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {mbtiCompleted ? `Kekuatan kepribadian unikmu (${mbtiCode}) siap dioptimalkan.` : "Kenali caramu berinteraksi, berpikir, dan mengambil keputusan."}
                </p>
              </div>
              <Link href="/asesmen/mbti">
                <Button variant="ghost" size="sm" className="w-full text-xs font-semibold h-7 text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-0 justify-start gap-1">
                  {mbtiCompleted ? "Lihat Profil MBTI" : "Mulai Tes MBTI"} <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card 4: Psikologi & Karakter */}
          <Card className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
            psiCompleted || kdCompleted ? "bg-white border-rose-200/80 shadow-xs" : "bg-slate-50/70 border-slate-200/60"
          }`}>
            <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                    <Heart className="h-4 w-4" />
                  </div>
                  {psiCompleted ? (
                    <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold">
                      Terekam
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400 text-[10px]">Belum Diisi</Badge>
                  )}
                </div>
                <h3 className="font-bold text-xs text-slate-900">Emosi & Nilai Diri</h3>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {psiCompleted ? "Refleksi suasana hati dan dimensi karakter positifmu tercatat." : "Cek tingkat stres dan pilih 5 nilai utama fondasi hidupmu."}
                </p>
              </div>
              <Link href="/asesmen/psikologi">
                <Button variant="ghost" size="sm" className="w-full text-xs font-semibold h-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-0 justify-start gap-1">
                  {psiCompleted ? "Lihat Refleksi Emosi" : "Mulai Refleksi"} <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 5. DUA KARTU LAYANAN: PUSAT ASESMEN & CURHAT PRIVAT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hub Pusat Asesmen */}
        <Card className="border border-slate-200/80 shadow-sm bg-gradient-to-br from-indigo-50/70 via-white to-white rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Pusat Asesmen Lengkap</h3>
                <p className="text-[11px] text-slate-500">5 Instrumen Penelusuran Potensi Siswa</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Ingin mempelajari teori ilmiah di balik tes, berkenalan dengan 5 maskot pemandu (Kimi, Piko, Mimi, Sparky, Zen), atau mengulang instrumen tertentu? Kunjungi Pusat Asesmen lengkap.
          </p>
          <Link href="/asesmen">
            <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-xs">
              Jelajahi Pusat Asesmen <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>

        {/* Layanan Curhat & Hotline */}
        <Card className="border border-slate-200/80 shadow-sm bg-gradient-to-br from-rose-50/70 via-white to-white rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
                <MessageCircleHeart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Layanan Curhat Guru BK</h3>
                <p className="text-[11px] text-slate-500">Pilih Guru BK & Mode Nama Asli/Anonim</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Punya masalah pertemanan, stres belajar, atau bingung menentukan langkah? Guru BK SMPN 1 Genteng siap mendampingi. Kamu bebas memilih berkonsultasi dengan nama asli atau mode anonim rahasia.
          </p>
          <Link href="/curhat">
            <Button size="sm" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-1.5 shadow-xs">
              Buka Ruang Curhat Sekarang <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* 6. MOTIVASI & TIPS BELAJAR HARIAN */}
      <Card className="border border-amber-200/70 bg-gradient-to-r from-amber-50/60 to-orange-50/60 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Kata Inspirasi Hari Ini</h4>
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                &ldquo;Setiap anak memiliki kejeniusannya masing-masing. Jangan bandingkan prosesmu dengan orang lain. Fokus kenali dirimu dan kembangkan potensi terbaikmu!&rdquo;
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-800 self-end sm:self-center shrink-0">
            Tim BK SMPN 1 Genteng
          </span>
        </div>
      </Card>
    </div>
  )
}
