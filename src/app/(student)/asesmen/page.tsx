"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AssessmentMascot, MascotCharacter } from "@/components/asesmen/assessment-mascot"
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
} from "lucide-react"

interface AssessmentCardInfo {
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
  tag?: string
}

const assessments: AssessmentCardInfo[] = [
  {
    id: "minat-bakat",
    title: "Minat & Bakat",
    subtitle: "Temukan minat karier dan potensi kerja masa depan berdasarkan teori Holland RIASEC.",
    href: "/asesmen/minat-bakat",
    character: "kimi",
    characterName: "Kimi",
    characterRole: "Konselor Sahabat",
    icon: Compass,
    color: "from-emerald-500 to-teal-600",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    duration: "~5 Menit",
    itemsCount: "30 Pertanyaan",
    tag: "Wajib",
  },
  {
    id: "gaya-belajar",
    title: "Gaya Belajar (VARK)",
    subtitle: "Ketahui caramu paling efektif menyerap ilmu: Visual, Auditori, Membaca, atau Kinestetik.",
    href: "/asesmen/gaya-belajar",
    character: "piko",
    characterName: "Piko",
    characterRole: "Pemandu Belajar",
    icon: BookOpen,
    color: "from-blue-500 to-indigo-600",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    duration: "~3 Menit",
    itemsCount: "16 Pertanyaan",
    tag: "Rekomendasi",
  },
  {
    id: "psikologi",
    title: "Refleksi Emosi & Psikologi",
    subtitle: "Ruang aman dan tenang untuk memeriksa suasana hati, tingkat stres, dan kesejahteraan mental.",
    href: "/asesmen/psikologi",
    character: "mimi",
    characterName: "Mimi",
    characterRole: "Teman Cerita & Hati",
    icon: Heart,
    color: "from-rose-500 to-orange-500",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    duration: "~3 Menit",
    itemsCount: "15 Pertanyaan",
    tag: "Penting",
  },
  {
    id: "karakter",
    title: "Karakter & Nilai Diri",
    subtitle: "Eksplorasi 5 dimensi kepribadian dan pilih nilai-nilai positif yang menjadi fondasi hidupmu.",
    href: "/karakter",
    character: "sparky",
    characterName: "Sparky",
    characterRole: "Penjelajah Karakter",
    icon: Star,
    color: "from-amber-500 to-orange-500",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    duration: "~5 Menit",
    itemsCount: "25 Pertanyaan + Nilai",
    tag: "Inspiratif",
  },
  {
    id: "mbti",
    title: "Tipe Kepribadian MBTI",
    subtitle: "Kenali 16 tipe kepribadian (seperti INTJ, ENFP, INFJ) dan kekuatan alamimu dalam bersosialisasi.",
    href: "/asesmen/mbti",
    character: "zen",
    characterName: "Zen",
    characterRole: "Analis MBTI",
    icon: Brain,
    color: "from-indigo-500 to-violet-600",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    duration: "~5 Menit",
    itemsCount: "20 Pertanyaan",
    tag: "Opsional",
  },
]

export default function AsesmenHubPage() {
  const { user } = useAuth()
  const [activeMascotIndex, setActiveMascotIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMascotIndex((prev) => (prev + 1) % assessments.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const currentHero = assessments[activeMascotIndex]

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner with Animated Mascot Spotlight */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl overflow-hidden relative rounded-3xl">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 text-center md:text-left max-w-lg">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/15">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Sahabat Konseling Digital SMPN 1 Genteng</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Kenali Potensi Diri & Masa Depanmu
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Halo, {user?.name ? <strong>{user.name}</strong> : "Siswa Hebat"}! Bersama squad karakter BK yang lucu dan ramah, mari ikuti asesmen untuk mengenal gaya belajar, minat karier, dan kekuatan unikmu!
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Data Aman & Rahasia
                </span>
                <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" /> Hasil Instan Otomatis
                </span>
              </div>
            </div>

            {/* Spotlight Interactive Mascot Showcase */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative p-2">
                <AssessmentMascot
                  key={currentHero.character}
                  character={currentHero.character}
                  mood="excited"
                  size={140}
                  showSpeechBubble
                  message={`Halo! Aku ${currentHero.characterName}, ${currentHero.characterRole.toLowerCase()}! ✨`}
                />
              </div>

              {/* Mini Mascot Switcher Indicators */}
              <div className="flex items-center gap-2 mt-2">
                {assessments.map((a, idx) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setActiveMascotIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      activeMascotIndex === idx
                        ? "w-7 bg-white shadow-sm"
                        : "w-2.5 bg-white/30 hover:bg-white/60"
                    }`}
                    title={a.characterName}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grid of 5 Assessments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Daftar Asesmen BK
            </h2>
            <p className="text-xs text-slate-500">
              Pilih asesmen yang ingin kamu kerjakan hari ini
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map((item, idx) => {
            const IconComponent = item.icon
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.06 }}
              >
                <Card className="h-full border-0 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden flex flex-col group">
                  <div className={`h-1.5 bg-gradient-to-r ${item.color}`} />
                  <CardContent className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Top Badges & Mascot Avatar */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <AssessmentMascot
                              character={item.character}
                              mood="happy"
                              size={52}
                              animated={false}
                            />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-slate-500 block">
                              Pemandu: {item.characterName}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {item.title}
                            </h3>
                          </div>
                        </div>

                        {item.tag && (
                          <Badge variant="outline" className={`text-[10px] font-bold ${item.badgeColor} rounded-lg shrink-0`}>
                            {item.tag}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" /> {item.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconComponent className="h-3.5 w-3.5 text-slate-400" /> {item.itemsCount}
                        </span>
                      </div>

                      <Link href={item.href}>
                        <Button
                          size="sm"
                          className={`bg-gradient-to-r ${item.color} text-white font-semibold rounded-xl text-xs gap-1.5 shadow-sm hover:opacity-95 transition-all`}
                        >
                          Mulai <ArrowRight className="h-3.5 w-3.5" />
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
    </div>
  )
}
