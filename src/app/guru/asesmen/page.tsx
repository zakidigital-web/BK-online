"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { soals, skalaLabel, hitungSkorGuru, getTipeGuruUtama, dimensiWarna, dimensiLabels } from "@/lib/asesmen/guru"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  Sparkles,
  BookOpen,
  ClipboardList,
  Circle,
  CheckCircle2,
  Frown,
  Meh,
  Smile,
  Heart,
  Star,
  RotateCcw,
  Compass,
  FileText,
  ListOrdered,
  Layers,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { AssessmentMascot } from "@/components/asesmen/assessment-mascot"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

const skalaIcons = [
  { icon: Frown, label: "Sgt Tdk Sesuai", color: "text-rose-500", bg: "hover:border-rose-300 hover:bg-rose-50/50" },
  { icon: Meh, label: "Kurang Sesuai", color: "text-amber-500", bg: "hover:border-amber-300 hover:bg-amber-50/50" },
  { icon: Circle, label: "Netral", color: "text-slate-400", bg: "hover:border-slate-300 hover:bg-slate-50/50" },
  { icon: Smile, label: "Sesuai", color: "text-indigo-500", bg: "hover:border-indigo-300 hover:bg-indigo-50/50" },
  { icon: Sparkles, label: "Sangat Sesuai", color: "text-emerald-500", bg: "hover:border-emerald-300 hover:bg-emerald-50/50" },
]

export default function GuruAsesmenPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [jawaban, setJawaban] = useState<Record<number, number>>({})
  const [hasil, setHasil] = useState<Record<string, number> | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [existing, setExisting] = useState<Record<string, number> | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const totalSteps = soals.length
  const answeredCount = Object.keys(jawaban).length
  const progressPercent = Math.round((answeredCount / totalSteps) * 100)

  useEffect(() => {
    if (user && user.role === "siswa") router.push("/curhat")
  }, [user, router])

  useEffect(() => {
    if (!user) return
    fetch(`/api/guru/asesmen?guruId=${user.id}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (data.asesmen?.skor && data.asesmen.skor !== "{}") {
          setExisting(JSON.parse(data.asesmen.skor))
        }
      })
      .catch(() => {})
  }, [user])

  function answer(value: number) {
    setJawaban((prev) => ({ ...prev, [soals[step].id]: value }))
    if (step < totalSteps - 1) {
      setTimeout(() => setStep((s) => s + 1), 220)
    } else {
      setTimeout(() => setShowReview(true), 300)
    }
  }

  function goBack() {
    if (showReview) { setShowReview(false); return }
    if (step > 0) setStep((s) => s - 1)
  }

  async function submit() {
    if (!user) { toast.error("Anda harus login"); return }
    setSubmitting(true)
    const skor = hitungSkorGuru(jawaban)
    try {
      const res = await fetch("/api/guru/asesmen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guruId: user.id, jawaban }),
      })
      if (!res.ok) throw new Error()
      setHasil(skor)
      setShowReview(false)
      toast.success("Asesmen gaya mengajar berhasil disimpan! 🎉")
    } catch {
      toast.error("Gagal menyimpan asesmen")
    } finally {
      setSubmitting(false)
    }
  }

  // SCREEN: Hasil Asesmen Tersimpan Sebelumnya
  if (existing && !hasil && !showReview) {
    return (
      <div className="max-w-xl mx-auto space-y-4 pb-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 bg-gradient-to-br from-indigo-50 via-violet-50 to-white shadow-md overflow-hidden rounded-3xl">
            <CardContent className="p-6 sm:p-8 text-center flex flex-col items-center">
              <AssessmentMascot
                character="kimi"
                mood="cheering"
                size={120}
                showSpeechBubble
                message={`Halo ${user?.name || "Bapak/Ibu Guru"}! Hasil asesmen gaya mengajar Anda sudah tersimpan! ✨`}
                className="mb-3"
              />
              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs px-3 py-1 font-semibold mb-2">
                Asesmen Gaya Mengajar
              </Badge>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Profil Gaya Mengajar Tersedia
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-md leading-relaxed">
                Anda sudah pernah menyelesaikan asesmen ini. Anda dapat melihat hasil analisis lengkap atau mengerjakan ulang jika ada perubahan gaya mengajar.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full justify-center">
                <Button
                  onClick={() => router.push("/guru/laporan")}
                  className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md gap-2 flex-1"
                >
                  <FileText className="h-4 w-4" /> Lihat Laporan Hasil
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setExisting(null); setStep(0); setJawaban({}) }}
                  className="h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 flex-1"
                >
                  <RotateCcw className="h-4 w-4" /> Ambil Ulang Asesmen
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // SCREEN: Hasil Asesmen yang Baru Selesai
  if (hasil) {
    const sorted = Object.entries(hasil).sort(([, a], [, b]) => b - a)
    const tipe = getTipeGuruUtama(hasil)
    return (
      <div className="max-w-2xl mx-auto space-y-5 pb-12">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-xl overflow-hidden rounded-3xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <CardContent className="p-6 sm:p-8 text-center flex flex-col items-center relative z-10">
              <AssessmentMascot
                character="kimi"
                mood="cheering"
                size={130}
                showSpeechBubble
                message={`Luar biasa, ${user?.name || "Bapak/Ibu"}! Profil pedagogik Anda siap diterapkan di kelas! 🎉`}
                className="mb-3"
              />
              <Badge className="bg-white/20 text-white border-white/30 text-xs px-3 py-1 font-semibold mb-2">
                Profil Gaya Mengajar Guru
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {user?.name}
              </h2>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white text-indigo-700 px-4 py-1.5 text-sm font-bold shadow-md">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {tipe.label}
              </div>
              <p className="mt-3 text-sm text-indigo-100 max-w-lg leading-relaxed">
                {tipe.desc}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Breakdown Dimensi Pedagogik */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" /> Dimensi & Karakteristik Mengajar
            </h3>
            <span className="text-xs text-slate-500 font-medium">{sorted.length} Dimensi</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {sorted.map(([dimensi, nilai]) => {
              const color = dimensiWarna[dimensi] || "#6366f1"
              return (
                <Card key={dimensi} className="border-0 shadow-xs bg-white rounded-2xl overflow-hidden">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">
                        {dimensiLabels[dimensi] || dimensi}
                      </span>
                      <span className="text-base font-extrabold" style={{ color }}>
                        {nilai}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${nilai}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            className="h-11 rounded-xl flex-1 gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={() => { setHasil(null); setExisting(null); setStep(0); setJawaban({}); setShowReview(false) }}
          >
            <RotateCcw className="h-4 w-4" /> Ulangi Asesmen
          </Button>
          <Button
            className="h-11 rounded-xl flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md gap-2"
            onClick={() => router.push("/guru/laporan")}
          >
            <GraduationCap className="h-4 w-4" /> Laporan Lengkap Guru
          </Button>
        </div>
      </div>
    )
  }

  // SCREEN: Review Sebelum Submit
  if (showReview) {
    return (
      <div className="max-w-2xl mx-auto space-y-5 pb-24 md:pb-12">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 shadow-2xs">
            <ClipboardList className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Review Jawaban Asesmen
            </h1>
            <p className="text-xs text-slate-500">
              Periksa kembali {answeredCount} dari {totalSteps} pertanyaan sebelum menyimpan
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-sm bg-indigo-50/70 border-indigo-100/80 rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <AssessmentMascot character="kimi" mood="thinking" size={48} animated={false} />
            <p className="text-xs text-indigo-900 leading-relaxed">
              <strong>Tips dari Kimi:</strong> Pastikan jawaban mencerminkan gaya mengajar Anda yang sesungguhnya di kelas sehari-hari ya!
            </p>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {soals.map((s, i) => {
            const currentVal = jawaban[s.id]
            return (
              <Card
                key={s.id}
                onClick={() => { setStep(i); setShowReview(false) }}
                className="border-0 shadow-xs bg-white rounded-2xl hover:border-indigo-200 transition-all cursor-pointer tap-bounce"
              >
                <CardContent className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[11px] font-bold text-slate-400">#{i + 1}</span>
                      <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full">
                        {s.dimensi}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                      {s.pertanyaan}
                    </p>
                  </div>
                  <Badge
                    variant={currentVal ? "default" : "outline"}
                    className={`shrink-0 text-xs px-2.5 py-1 font-semibold rounded-xl ${
                      currentVal ? "bg-indigo-600 text-white" : "border-slate-300 text-slate-400"
                    }`}
                  >
                    {currentVal ? skalaLabel[currentVal - 1] : "Belum"}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Bottom Bar Review */}
        <div className="fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 p-3 sm:static sm:bg-transparent sm:border-0 sm:p-0 flex items-center justify-between gap-3 safe-area-bottom">
          <Button
            variant="outline"
            onClick={goBack}
            className="h-11 rounded-xl border-slate-200 gap-1.5 text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || answeredCount === 0}
            className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md gap-2 flex-1 sm:flex-initial"
          >
            {submitting ? "Menyimpan..." : "Simpan & Lihat Hasil"} <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // SCREEN: Pertanyaan Aktif
  const q = soals[step]
  if (!q) {
    setStep(0)
    return null
  }

  const currentDimensiColor = dimensiWarna[q.dimensi] || "#6366f1"

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-28 md:pb-12 select-none">
      {/* Top Header Card */}
      <div className="sticky top-14 z-20 bg-slate-50/90 backdrop-blur-xl pt-2 pb-2">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shadow-2xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                Asesmen Gaya Mengajar
              </h1>
              <span className="text-[11px] font-semibold text-slate-400">
                Pertanyaan {step + 1} dari {totalSteps}
              </span>
            </div>
          </div>

          {/* Quick Navigator Pill */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger render={
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 text-xs font-bold text-indigo-700 tap-bounce shadow-2xs"
              />
            }>
              <ListOrdered className="h-3.5 w-3.5" />
              <span>{answeredCount}/{totalSteps}</span>
            </SheetTrigger>
            <SheetContent side="bottom" showCloseButton={false} className="px-4 pb-8 rounded-t-3xl bg-white/95 backdrop-blur-2xl">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300" />
              <SheetHeader className="pb-3 border-b border-slate-100">
                <SheetTitle className="text-base font-extrabold text-slate-900">
                  Daftar Pertanyaan ({answeredCount}/{totalSteps})
                </SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 pt-4 max-h-[50vh] overflow-y-auto">
                {soals.map((s, idx) => {
                  const isAnswered = jawaban[s.id] !== undefined
                  const isCurrent = idx === step
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setStep(idx); setSheetOpen(false) }}
                      className={`h-10 rounded-xl text-xs font-bold transition-all tap-bounce ${
                        isCurrent
                          ? "bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 scale-105"
                          : isAnswered
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Live Smooth Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -25 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-0 shadow-md bg-white rounded-3xl overflow-hidden relative">
            <div className="h-2 w-full" style={{ backgroundColor: currentDimensiColor }} />
            <CardContent className="p-5 sm:p-7 space-y-6">
              {/* Dimensi & Mascot Helper */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: `${currentDimensiColor}15`, color: currentDimensiColor }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Dimensi {q.dimensi}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <AssessmentMascot character="kimi" mood="thinking" size={32} animated={false} />
                  <span className="hidden sm:inline font-medium">Kimi mendampingi</span>
                </div>
              </div>

              {/* Pertanyaan */}
              <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed min-h-[56px]">
                {q.pertanyaan}
              </h2>

              {/* 5 Skala Pilihan — Responsive Stacked / Grid for Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isSelected = jawaban[q.id] === val
                  const meta = skalaIcons[val - 1]
                  const IconComp = meta.icon

                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => answer(val)}
                      className={`group relative flex items-center sm:flex-col justify-between sm:justify-center rounded-2xl border-2 p-3 sm:p-3.5 transition-all duration-200 tap-bounce ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/90 shadow-md shadow-indigo-600/10 scale-[1.02]"
                          : `border-slate-200/80 bg-white ${meta.bg}`
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:flex-col sm:gap-1.5">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-500 group-hover:scale-105"
                          }`}
                        >
                          <IconComp className="h-4 w-4" />
                        </div>
                        <span
                          className={`text-xs sm:text-[11px] leading-tight font-semibold text-left sm:text-center ${
                            isSelected ? "text-indigo-700 font-bold" : "text-slate-600"
                          }`}
                        >
                          {skalaLabel[val - 1]}
                        </span>
                      </div>

                      {/* Right Indicator (Mobile) / Number Pill (Desktop) */}
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold sm:hidden ${
                          isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {val}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Floating / Sticky Bottom Navigation Controls on Mobile */}
      <div className="fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-4 py-3 md:static md:bg-transparent md:border-0 md:px-0 flex items-center justify-between gap-3 safe-area-bottom">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={step === 0}
          className="h-12 sm:h-11 rounded-2xl border-slate-200 gap-1.5 text-slate-700 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setShowReview(true)}
          className="h-12 sm:h-11 rounded-2xl text-xs font-bold text-indigo-600 hover:bg-indigo-50"
        >
          <ClipboardList className="h-4 w-4 mr-1" />
          Review ({answeredCount})
        </Button>

        {step === totalSteps - 1 ? (
          <Button
            onClick={() => setShowReview(true)}
            disabled={answeredCount === 0}
            className="h-12 sm:h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md gap-2"
          >
            Selesai <Check className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.min(s + 1, totalSteps - 1))}
            className="h-12 sm:h-11 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-1.5 font-semibold"
          >
            <span className="hidden sm:inline">Lewati</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
