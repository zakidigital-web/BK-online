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
  Flame,
  Lightbulb,
  Award,
  ChevronRight,
  Smile,
} from "lucide-react"

interface AssessmentStatusItem {
  id: string
  title: string
  subtitle: string
  href: string
  character: "kimi" | "piko" | "mimi" | "sparky" | "zen"
  color: string
  badgeColor: string
  icon: React.ElementType
  completed: boolean
  resultLabel?: string
}

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

  // Extra result labels
  let mbLabel = ""
  if (mbCompleted && dataAssessments.minatBakat?.skor) {
    const sorted = Object.entries(dataAssessments.minatBakat.skor).sort(([, a]: any, [, b]: any) => (b as number) - (a as number))
    if (sorted[0]) mbLabel = String(sorted[0][0]).toUpperCase()
  }

  let gbLabel = ""
  if (gbCompleted && dataAssessments.gayaBelajar?.skor) {
    const sorted = Object.entries(dataAssessments.gayaBelajar.skor).sort(([, a]: any, [, b]: any) => (b as number) - (a as number))
    if (sorted[0]) gbLabel = String(sorted[0][0])
  }

  let mbtiLabel = ""
  if (mbtiCompleted && dataAssessments.mbti?.skor) {
    const skor = dataAssessments.mbti.skor
    const e_i = (skor.E || 0) >= (skor.I || 0) ? "E" : "I"
    const s_n = (skor.S || 0) >= (skor.N || 0) ? "S" : "N"
    const t_f = (skor.T || 0) >= (skor.F || 0) ? "T" : "F"
    const j_p = (skor.J || 0) >= (skor.P || 0) ? "J" : "P"
    mbtiLabel = `${e_i}${s_n}${t_f}${j_p}`
  }

  const assessmentCards: AssessmentStatusItem[] = [
    {
      id: "minat-bakat",
      title: "Minat & Bakat (Holland)",
      subtitle: "Petualangan karier impian berdasarkan teori RIASEC.",
      href: "/asesmen/minat-bakat",
      character: "kimi",
      color: "from-emerald-500 to-teal-600",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Compass,
      completed: mbCompleted,
      resultLabel: mbLabel ? `Tipe: ${mbLabel}` : undefined,
    },
    {
      id: "gaya-belajar",
      title: "Gaya Belajar (VARK)",
      subtitle: "Temukan apakah kamu tipe Visual, Auditori, atau Kinestetik.",
      href: "/asesmen/gaya-belajar",
      character: "piko",
      color: "from-blue-500 to-indigo-600",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: BookOpen,
      completed: gbCompleted,
      resultLabel: gbLabel ? `Gaya: ${gbLabel}` : undefined,
    },
    {
      id: "psikologi",
      title: "Refleksi Emosi & Hati",
      subtitle: "Ruang tenang mengecek kondisi suasana hati & tingkat stres.",
      href: "/asesmen/psikologi",
      character: "mimi",
      color: "from-rose-500 to-pink-600",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      icon: Heart,
      completed: psiCompleted,
      resultLabel: psiCompleted ? "Terekam Nyaman" : undefined,
    },
    {
      id: "karakter",
      title: "Karakter & Nilai Diri",
      subtitle: "5 dimensi kepribadian positif untuk fondasi masa depanmu.",
      href: "/karakter",
      character: "sparky",
      color: "from-amber-500 to-orange-600",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Star,
      completed: kdCompleted,
      resultLabel: kdCompleted ? "Nilai Terpilih" : undefined,
    },
    {
      id: "mbti",
      title: "Kepribadian MBTI",
      subtitle: "16 tipe kepribadian unik dan potensi interaksi sosialmu.",
      href: "/asesmen/mbti",
      character: "zen",
      color: "from-indigo-500 to-purple-600",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      icon: Brain,
      completed: mbtiCompleted,
      resultLabel: mbtiLabel ? `MBTI: ${mbtiLabel}` : undefined,
    },
  ]

  const displayName = studentInfo?.nama || user?.name || "Siswa Hebat"
  const displayKelas = studentInfo?.kelas || user?.kelas || "Kelas SMPN 1 Genteng"

  return (
    <div className="space-y-6 pb-14">
      {/* Hero Banner with 3D Mascot */}
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
                <span>Sahabat BK Digital · SMPN 1 Genteng</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Halo, <span className="text-amber-300">{displayName}</span>! 👋
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Selamat datang di beranda pribadimu! Bersama squad karakter BK yang lucu, mari kenali bakat terbaikmu atau ceritakan apa pun yang sedang kamu rasakan dengan aman.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
                <Badge className="bg-white/10 hover:bg-white/15 text-slate-200 border-white/10 text-xs px-3 py-1 rounded-xl">
                  {displayKelas}
                </Badge>
                <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl border border-white/10 text-[11px] text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Curhat Rahasia Terlindungi
                </span>
              </div>

              {/* Action Buttons */}
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

            {/* 3D Mascot Showcase */}
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

      {/* Progress Bar Asesmen */}
      <Card className="border-0 shadow-sm bg-white rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-600" />
              Progres Eksplorasi Potensi Diri
            </h2>
            <p className="text-xs text-slate-500">
              Selesaikan 5 asesmen untuk mendapatkan profil kepribadian utuh
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl">
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

      {/* 5 Assessment Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-base font-bold text-slate-900">Daftar Asesmen Kamu</h2>
            <p className="text-xs text-slate-500">Pilih asesmen untuk melihat hasil atau mulai mengisi</p>
          </div>
          <Link href="/asesmen" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Lihat Semua <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {assessmentCards.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
              >
                <Card className="h-full border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden bg-white flex flex-col group">
                  <div className={`h-1.5 bg-gradient-to-r ${item.color}`} />
                  <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-sm shrink-0`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {item.title}
                            </h3>
                            <span className="text-[11px] text-slate-400 capitalize">
                              Maskot: {item.character}
                            </span>
                          </div>
                        </div>

                        {item.completed ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold rounded-lg shrink-0 gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Selesai
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500 border-slate-200 text-[10px] font-medium rounded-lg shrink-0">
                            Belum Diisi
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        {item.subtitle}
                      </p>

                      {item.resultLabel && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 mb-2">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          {item.resultLabel}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> ~3-5 Menit
                      </span>

                      <Link href={item.href}>
                        <Button
                          size="sm"
                          className={`h-8 rounded-xl text-xs font-semibold gap-1.5 ${
                            item.completed
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                              : `bg-gradient-to-r ${item.color} text-white shadow-xs`
                          }`}
                        >
                          {item.completed ? "Lihat Hasil" : "Mulai"} <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Motivational Study Tips & Counseling Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tips Belajar Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 via-orange-50 to-white rounded-2xl p-5 border border-amber-100/80">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Tips Belajar Harian</h3>
              <p className="text-[11px] text-amber-800">Inspirasi sahabat BK</p>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed mb-3">
            &ldquo;Belajar sedikit setiap hari lebih efektif daripada belajar semalaman sebelum ujian. Jangan lupa luangkan waktu istirahat 10 menit setelah 45 menit belajar agar otak tetap segar!&rdquo;
          </p>
          <div className="flex items-center justify-between text-[11px] text-amber-900 font-medium">
            <span>✨ Semangat Belajar Hari Ini</span>
            <span className="text-amber-700 font-bold">SMPN 1 Genteng</span>
          </div>
        </Card>

        {/* Layanan Curhat & Hotline Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 via-pink-50 to-white rounded-2xl p-5 border border-rose-100/80">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500 text-white shadow-xs">
              <MessageCircleHeart className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Ruang Aman Curhat</h3>
              <p className="text-[11px] text-rose-800">Konseling Ramah & Rahasia</p>
            </div>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed mb-3">
            Punya beban pikiran, masalah pertemanan, atau bingung menentukan jurusan? Guru BK siap mendengarkan tanpa menghakimi. Kamu bisa memilih mode nama samaran jika ingin lebih nyaman.
          </p>
          <Link href="/curhat">
            <Button size="sm" className="h-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-1.5 shadow-xs">
              Mulai Curhat Sekarang <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
