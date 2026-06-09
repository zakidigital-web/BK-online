"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { questions, hitungSkor, getTipeMBTI, getPersentase, labelDimensi, getDeskripsi } from "@/lib/asesmen/mbti"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Brain, User, ClipboardList, Circle, CheckCircle2, Sparkles } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

type DotState = "answered" | "current" | "unreached"

function ProgressDots({ states }: { states: DotState[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 py-2">
      {states.map((s, i) => (
        <div
          key={i}
          className={`flex items-center justify-center rounded-full transition-all duration-200 ${
            s === "current" ? "h-7 w-7 ring-2 ring-indigo-400 ring-offset-1 scale-110" :
            s === "answered" ? "h-6 w-6 bg-indigo-500 text-white" :
            "h-5 w-5 border border-gray-300 text-gray-300"
          }`}
        >
          {s === "answered" ? <Check className="h-3 w-3" /> :
           s === "current" ? <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> :
           <Circle className="h-2.5 w-2.5" />}
        </div>
      ))}
    </div>
  )
}

const dimensiLabel: Record<string, string> = {
  EI: "Ekstrovert vs Introvert",
  SN: "Sensing vs Intuition",
  TF: "Thinking vs Feeling",
  JP: "Judging vs Perceiving",
}

export default function GuruMbtiPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [jawaban, setJawaban] = useState<Record<number, number>>({})
  const [hasil, setHasil] = useState<Record<string, number> | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [existing, setExisting] = useState<Record<string, number> | null>(null)
  const [showReview, setShowReview] = useState(false)

  const totalSteps = questions.length
  const answered = Object.keys(jawaban).length

  useEffect(() => {
    if (user && (user.role === "siswa" || user.role === "walas")) router.push("/")
  }, [user, router])

  useEffect(() => {
    if (!user) return
    fetch(`/api/guru/asesmen?guruId=${user.id}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (data.asesmen?.skorMbti && data.asesmen.skorMbti !== "{}") setExisting(JSON.parse(data.asesmen.skorMbti))
      })
      .catch(() => {})
  }, [user])

  function answer(value: number) {
    setJawaban((prev) => ({ ...prev, [questions[step].id]: value }))
    if (step < totalSteps - 1) {
      setTimeout(() => setStep((s) => s + 1), 200)
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
    const skor = hitungSkor(jawaban)
    try {
      const res = await fetch("/api/guru/mbti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guruId: user.id, jawaban }),
      })
      if (!res.ok) throw new Error()
      setHasil(skor)
      toast.success("Tes MBTI selesai!")
    } catch {
      toast.error("Gagal menyimpan")
    } finally {
      setSubmitting(false)
    }
  }

  if (existing && !hasil && !showReview) {
    const tipe = getTipeMBTI(existing)
    const deskripsi = getDeskripsi(tipe)
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
              <ClipboardList className="h-7 w-7 text-indigo-600" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">MBTI Tersimpan</h2>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-600">Opsional</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Anda sudah pernah mengerjakan tes MBTI.</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-bold text-white tracking-widest">
              {tipe}
            </div>
            <p className="mt-2 text-sm text-gray-600">{deskripsi.title} — {deskripsi.desc}</p>
            <div className="mt-6 flex gap-3 justify-center">
              <Button onClick={() => router.push("/guru/laporan")} className="bg-indigo-600 hover:bg-indigo-700">
                Lihat Hasil
              </Button>
              <Button variant="outline" onClick={() => { setExisting(null); setStep(0); setJawaban({}) }}>
                Ambil Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (hasil) {
    const tipe = getTipeMBTI(hasil)
    const persentase = getPersentase(hasil)
    const deskripsi = getDeskripsi(tipe)
    return (
      <div className="space-y-6">
        <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
              <Brain className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Tipe Kepribadian</h2>
            <p className="mt-1 text-indigo-600 font-medium">{user?.name}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2 text-xl font-bold text-white tracking-widest">
              {tipe}
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-800">{deskripsi.title}</p>
            <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">{deskripsi.desc}</p>
          </CardContent>
        </Card>

        {Object.entries(persentase).map(([d, v]) => {
          const lb = labelDimensi[d]
          const isKiriDominan = v.kiri >= v.kanan
          return (
            <Card key={d} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isKiriDominan ? "text-indigo-600" : "text-gray-400"}`}>{lb.kiri}</span>
                  <span className={`text-xs font-semibold ${!isKiriDominan ? "text-indigo-600" : "text-gray-400"}`}>{lb.kanan}</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-indigo-500 transition-all" style={{ width: `${v.kiri}%` }} />
                  <div className="absolute inset-y-0 right-0 rounded-full bg-purple-500 transition-all" style={{ width: `${v.kanan}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-400">
                  <span>{v.kiri}%</span>
                  <span>{d}</span>
                  <span>{v.kanan}%</span>
                </div>
              </CardContent>
            </Card>
          )
        })}

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="mb-2 font-semibold text-gray-900">Peran</h3>
            <p className="text-sm text-gray-600">{deskripsi.role}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-semibold text-emerald-700">Kekuatan</h3>
              <ul className="space-y-1">
                {deskripsi.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" /> {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-semibold text-amber-700">Kelemahan</h3>
              <ul className="space-y-1">
                {deskripsi.weaknesses.map((s) => (
                  <li key={s} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <Circle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" /> {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => { setHasil(null); setExisting(null); setStep(0); setJawaban({}); setShowReview(false) }}>
            Ambil Lagi
          </Button>
          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2" onClick={() => router.push("/guru/laporan")}>
            <Sparkles className="h-4 w-4" /> Laporan Lengkap
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="border-0 shadow-sm w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Brain className="mx-auto h-12 w-12 text-gray-200" />
            <p className="mt-3 text-gray-400">Silakan login terlebih dahulu</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showReview) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <ClipboardList className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Review Jawaban</h1>
            <p className="text-sm text-gray-500">Periksa kembali jawaban Anda sebelum menyimpan</p>
          </div>
        </div>

        <div className="space-y-2">
          {questions.map((s, i) => (
            <Card key={s.id} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-3">
                  <span className="text-xs font-medium text-gray-400">{i + 1}.</span>
                  <span className="text-sm text-gray-700 ml-1">{s.text}</span>
                </div>
                <Badge variant={jawaban[s.id] ? "default" : "outline"} className="shrink-0 text-xs">
                  {jawaban[s.id] ? ["Sangat Tidak Setuju", "Tidak Setuju", "Netral", "Setuju", "Sangat Setuju"][jawaban[s.id] - 1] : "—"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={goBack}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
          </Button>
          <Button onClick={submit} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            {submitting ? "Menyimpan..." : "Simpan & Lihat Hasil"} <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  const q = questions[step]
  if (!q) {
    setStep(0)
    return null
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
          <Brain className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">Tes Kepribadian MBTI <span className="text-[10px] font-normal text-gray-400">(Opsional)</span></h1>
            <span className="text-sm font-medium text-gray-400">{answered}/{totalSteps}</span>
          </div>
          {(() => {
            const dotStates: DotState[] = questions.map((s, i) => {
              if (jawaban[s.id] !== undefined) return "answered"
              if (i === step) return "current"
              return "unreached"
            })
            return (
              <>
                <ProgressDots states={dotStates} />
                <div className="flex items-center justify-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-indigo-600">
                    <CheckCircle2 className="h-3 w-3" /> {answered} terjawab
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <Circle className="h-3 w-3" /> {totalSteps - answered} tersisa
                  </span>
                </div>
              </>
            )
          })()}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-indigo-400 to-purple-500" />
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-indigo-600">
                <User className="h-3.5 w-3.5" />
                <span>{dimensiLabel[q.dimensi] || q.dimensi}</span>
              </div>
              <h2 className="mb-6 text-lg font-semibold text-gray-900 leading-relaxed">{q.text}</h2>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isSelected = jawaban[q.id] === val
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => answer(val)}
                      className={`group relative flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all duration-200 ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50 shadow-md scale-105"
                          : "border-gray-100 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50/50 hover:scale-[1.02]"
                      }`}
                    >
                      <span className={`text-xl font-bold transition-colors ${isSelected ? "text-indigo-700" : "text-gray-400 group-hover:text-indigo-600"}`}>
                        {val}
                      </span>
                      <span className={`mt-1 text-center text-[10px] leading-tight transition-colors ${isSelected ? "text-indigo-700 font-medium" : "text-gray-400 group-hover:text-indigo-600"}`}>
                        {["Sangat Tidak Setuju", "Tidak Setuju", "Netral", "Setuju", "Sangat Setuju"][val - 1]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={goBack} disabled={step === 0}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Sebelumnya
        </Button>
        {answered === totalSteps ? (
          <Button onClick={() => setShowReview(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            Review & Simpan <Check className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setStep((s) => Math.min(s + 1, totalSteps - 1))}>
            Lewati <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
