"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AssessmentMascot, MascotCharacter } from "@/components/asesmen/assessment-mascot"
import { ThreeMascot3D } from "@/components/asesmen/three-mascot-3d"
import { useAuth } from "@/lib/auth-context"
import {
  Brain,
  BookOpen,
  Heart,
  Star,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  FileQuestion,
  HelpCircle,
  Lightbulb,
  CheckCheck,
  ChevronRight,
  Filter
} from "lucide-react"

interface AssessmentDetail {
  id: string
  title: string
  subtitle: string
  href: string
  character: MascotCharacter
  characterName: string
  characterRole: string
  icon: React.ElementType
  color: string
  badgeColor: string
  duration: string
  itemsCount: string
  tag: string
  category: "karier" | "belajar" | "mental" | "kepribadian"
  theory: string
  benefits: string
}

const assessments: AssessmentDetail[] = [
  {
    id: "minat-bakat",
    title: "Minat & Bakat (Holland RIASEC)",
    subtitle: "Eksplorasi minat karier dan preferensi kerja masa depan berdasarkan 6 tipe kepribadian kerja.",
    href: "/asesmen/minat-bakat",
    character: "kimi",
    characterName: "Kimi",
    characterRole: "Konselor Sahabat Karier",
    icon: Compass,
    color: "from-emerald-500 to-teal-600",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    duration: "~5 Menit",
    itemsCount: "30 Pertanyaan",
    tag: "Wajib / Utama",
    category: "karier",
    theory: "Teori Holland RIASEC (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)",
    benefits: "Mengetahui potensi jurusan sekolah lanjutan (SMA/SMK) dan rumpun profesi masa depan yang paling cocok.",
  },
  {
    id: "gaya-belajar",
    title: "Gaya Belajar (VARK Learning Style)",
    subtitle: "Temukan modalitas belajar paling efektif untuk meningkatkan pemahaman pelajaran di kelas.",
    href: "/asesmen/gaya-belajar",
    character: "piko",
    characterName: "Piko",
    characterRole: "Pemandu Belajar Efektif",
    icon: BookOpen,
    color: "from-blue-500 to-indigo-600",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    duration: "~3 Menit",
    itemsCount: "16 Pertanyaan",
    tag: "Rekomendasi",
    category: "belajar",
    theory: "Model VARK oleh Neil Fleming (Visual, Auditory, Read/Write, Kinesthetic)",
    benefits: "Menemukan teknik belajar paling cepat dan menyenangkan sesuai gaya menyerap informasi alami otakmu.",
  },
  {
    id: "psikologi",
    title: "Refleksi Emosi & Psikologi",
    subtitle: "Ruang evaluasi mandiri yang tenang untuk memeriksa suasana hati, tingkat stres, dan resiliensi.",
    href: "/asesmen/psikologi",
    character: "mimi",
    characterName: "Mimi",
    characterRole: "Teman Curahan Hati",
    icon: Heart,
    color: "from-rose-500 to-pink-600",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    duration: "~3 Menit",
    itemsCount: "15 Pertanyaan",
    tag: "Penting / Sensitif",
    category: "mental",
    theory: "Skala Kesejahteraan Emosional & Skrining Tingkat Beban Mental Siswa",
    benefits: "Membantu mengenali tanda stres dan kelelahan mental lebih awal agar mendapat bimbingan tepat dari Guru BK.",
  },
  {
    id: "karakter",
    title: "Karakter & Nilai Diri",
    subtitle: "Eksplorasi dimensi kepribadian positif serta penentuan 5 nilai utama yang menjadi pedoman hidup.",
    href: "/karakter",
    character: "sparky",
    characterName: "Sparky",
    characterRole: "Penjelajah Karakter",
    icon: Star,
    color: "from-amber-500 to-orange-600",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    duration: "~5 Menit",
    itemsCount: "25 Soal + 5 Nilai",
    tag: "Pengembangan Diri",
    category: "kepribadian",
    theory: "Dimensi Profil Pelajar & Nilai-Nilai Budi Pekerti Universal",
    benefits: "Membangun rasa percaya diri, etika pergaulan yang sehat, dan fondasi kepemimpinan berintegritas.",
  },
  {
    id: "mbti",
    title: "Tipe Kepribadian MBTI",
    subtitle: "Kenali 16 tipe kepribadian unik untuk memahami cara berinteraksi, berpikir, dan mengambil keputusan.",
    href: "/asesmen/mbti",
    character: "zen",
    characterName: "Zen",
    characterRole: "Analis Kepribadian MBTI",
    icon: Brain,
    color: "from-indigo-500 to-purple-600",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    duration: "~5 Menit",
    itemsCount: "20 Pertanyaan",
    tag: "Eksplorasi Lanjutan",
    category: "kepribadian",
    theory: "Tipologi Kepribadian Myers-Briggs (Extraversion/Introversion, Sensing/Intuition, Thinking/Feeling, Judging/Perceiving)",
    benefits: "Memahami gaya komunikasi antarteman, kekuatan kerja kelompok, dan cara mengatasi konflik sosial.",
  },
]

export default function AsesmenHubPage() {
  const { user } = useAuth()
  const [activeMascotIndex, setActiveMascotIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMascotIndex((prev) => (prev + 1) % assessments.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const currentHero = assessments[activeMascotIndex]

  const filteredAssessments = assessments.filter((a) => {
    if (selectedCategory === "all") return true
    return a.category === selectedCategory
  })

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO TESTING CENTER SPOTLIGHT */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl overflow-hidden relative rounded-3xl">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-3.5 text-center md:text-left max-w-lg">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/15 text-indigo-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Pusat Asesmen & Pemetaan Potensi Siswa · SMPN 1 Genteng</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Katalog Instrumen Asesmen BK
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Setiap siswa memiliki potensi emas yang berbeda. Ikuti 5 instrumen terstandar berikut untuk mengungkap bakat, gaya belajar terbaik, serta peta kepribadian unikmu.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Data Dijamin Rahasia
                </span>
                <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" /> Analisis & Hasil Otomatis
                </span>
                <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                  <FileQuestion className="h-4 w-4 text-amber-400" /> 5 Instrumen Teruji
                </span>
              </div>
            </div>

            {/* 3D Mascot Interactive Spotlight */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="relative p-2">
                <ThreeMascot3D
                  key={currentHero.character}
                  character={currentHero.character}
                  mood="cheering"
                  size={155}
                  interactive={true}
                  showParticles={true}
                  showSpeechBubble={true}
                  message={`Halo! Aku ${currentHero.characterName}, ${currentHero.characterRole.toLowerCase()}! ✨`}
                />
              </div>

              {/* Mascot Switcher Pills */}
              <div className="flex items-center gap-1.5 mt-2 bg-black/30 p-1 rounded-full border border-white/10">
                {assessments.map((a, idx) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setActiveMascotIndex(idx)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                      activeMascotIndex === idx
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {a.characterName}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 2. PETUNJUK PENGERJAAN 3 LANGKAH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <Card className="border border-indigo-100 bg-white rounded-2xl p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-xs">
              1
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">Pilih Instrumen</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Pilih asesmen yang ingin kamu isi. Kamu bebas mengerjakan secara bertahap sesuai waktu luangmu.
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-indigo-100 bg-white rounded-2xl p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-xs">
              2
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">Jawab Jujur & Spontan</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Tidak ada jawaban yang salah atau dinilai angka rapor. Pilihlah opsi yang paling menggambarkan dirimu.
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-indigo-100 bg-white rounded-2xl p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-xs">
              3
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">Hasil & Bimbingan BK</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Hasil keluar seketika dan tersimpan rapi untuk panduan pemilihan jurusan serta konseling bersama Guru BK.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. FILTER & DAFTAR INSTRUMEN ASESMEN MENDALAM */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Daftar Lengkap 5 Instrumen Asesmen
            </h2>
            <p className="text-xs text-slate-500">
              Rincian instrumen, landasan teori, dan manfaat bagi perkembangan siswa
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "Semua (5)" },
              { id: "karier", label: "Minat Karier" },
              { id: "belajar", label: "Gaya Belajar" },
              { id: "mental", label: "Refleksi Mental" },
              { id: "kepribadian", label: "Kepribadian" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedCategory(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === f.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredAssessments.map((item, idx) => {
            const IconComponent = item.icon
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
              >
                <Card className="border border-slate-200/80 bg-white shadow-xs hover:shadow-md transition-all duration-200 rounded-3xl overflow-hidden group">
                  <div className={`h-1.5 bg-gradient-to-r ${item.color}`} />
                  <CardContent className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left: Mascot & Core Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative shrink-0">
                        <AssessmentMascot
                          character={item.character}
                          mood="happy"
                          size={64}
                          animated={false}
                        />
                        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-xs border border-slate-200">
                          <IconComponent className="h-3.5 w-3.5 text-indigo-600" />
                        </span>
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`${item.badgeColor} text-[10px] font-bold rounded-lg`}>
                            {item.tag}
                          </Badge>
                          <span className="text-xs font-semibold text-slate-400">
                            Pemandu: <strong className="text-slate-700">{item.characterName}</strong> ({item.characterRole})
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                            {item.subtitle}
                          </p>
                        </div>

                        {/* Rincian Teori & Manfaat */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] border-t border-slate-100">
                          <div>
                            <span className="text-slate-400 block font-medium">Landasan Teori:</span>
                            <span className="text-slate-700 font-semibold">{item.theory}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Manfaat Hasil:</span>
                            <span className="text-slate-700">{item.benefits}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Meta & CTA Button */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                      <div className="flex items-center gap-3 text-xs text-slate-500 md:text-right">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="h-3.5 w-3.5 text-slate-400" /> {item.duration}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-medium">
                          <FileQuestion className="h-3.5 w-3.5 text-slate-400" /> {item.itemsCount}
                        </span>
                      </div>

                      <Link href={item.href} className="w-auto">
                        <Button className={`h-10 px-5 rounded-xl font-bold bg-gradient-to-r ${item.color} text-white shadow-xs gap-1.5 hover:opacity-95 transition-all`}>
                          Mulai Pengerjaan <ArrowRight className="h-4 w-4" />
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

      {/* 4. BANNER KEMBALI KE BERANDA & KONSULTASI BK */}
      <Card className="border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-white rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">
              Sudah menyelesaikan asesmen dan ingin melihat ringkasan profilmu?
            </h4>
            <p className="text-xs text-slate-600">
              Kunjungi Beranda Pribadi untuk melihat integrasi gaya belajar, minat karier, dan status bimbinganmu.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/beranda">
              <Button variant="outline" size="sm" className="rounded-xl border-slate-300 text-slate-700 font-semibold gap-1.5">
                Buka Beranda <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link href="/curhat">
              <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5">
                Konsultasi BK <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
