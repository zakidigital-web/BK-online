"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { questions, hitungSkor, getTipeTeratas, labelDimensi, rekomendasiKarier } from "@/lib/asesmen/minat-bakat"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  ClipboardList,
  Download,
  Frown,
  Meh,
  Palette,
  Search,
  Smile,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
  Circle,
  SkipForward,
  Compass,
  Star,
  CheckCircle2,
  Clock,
  UserCircle,
  Loader2,
  Send,
  Clock3,
} from "lucide-react"


const dimensiIcons = {
  R: Wrench,
  I: Search,
  A: Palette,
  S: Users,
  E: TrendingUp,
  C: ClipboardList,
} as const

const skalaMinatLabel = [
  "Sgt Tdk Sesuai",
  "Kurang Sesuai",
  "Netral",
  "Sesuai",
  "Sgt Sesuai",
]

const skalaMinatIcons = [Frown, Meh, Meh, Smile, Sparkles]

const STORAGE_KEY = "bk_asesmen_minat_bakat"

type DotState = "answered" | "skipped" | "current" | "unreached"

function ProgressDots({ states, onJump }: { states: DotState[]; onJump?: (i: number) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 py-2">
      {states.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onJump?.(i)}
          className={`flex items-center justify-center rounded-full transition-all duration-200 ${
            s === "current" ? "h-7 w-7 ring-2 ring-emerald-400 ring-offset-1 scale-110" :
            s === "answered" ? "h-6 w-6 bg-emerald-500 text-white" :
            s === "skipped" ? "h-6 w-6 border-2 border-amber-400 text-amber-500 bg-amber-50" :
            "h-5 w-5 border border-gray-300 text-gray-300"
          } ${onJump ? "cursor-pointer hover:opacity-80" : ""}`}
        >
          {s === "answered" ? <Check className="h-3 w-3" /> :
           s === "skipped" ? <span className="text-xs font-bold">&ndash;</span> :
           s === "current" ? <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> :
           <Circle className="h-2.5 w-2.5" />}
        </button>
      ))}
    </div>
  )
}

export function MinatBakatForm() {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [showIntro, setShowIntro] = useState(true)
  const [nama, setNama] = useState("")
  const [kelas, setKelas] = useState("")
  const [jawaban, setJawaban] = useState<Record<number, number>>({})
  const [skipped, setSkipped] = useState<Set<number>>(new Set())
  const [hasil, setHasil] = useState<Record<string, number> | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadingSiswa, setLoadingSiswa] = useState(false)

  useEffect(() => {
    if (!user) return
    setNama(user.name)
    setLoadingSiswa(true)
    fetch(`/api/siswa?nisn=${encodeURIComponent(user.username)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.siswa?.[0]) setKelas(d.siswa[0].kelas)
      })
      .catch(() => {})
      .finally(() => setLoadingSiswa(false))
  }, [user])

  const restored = useRef(false)

  useEffect(() => {
    if (!nama || !kelas || restored.current) return
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return
      const data = JSON.parse(saved)
      if (data.nama === nama && data.kelas === kelas && (Object.keys(data.jawaban || {}).length > 0 || (data.skipped || []).length > 0)) {
        setJawaban(data.jawaban || {})
        setSkipped(new Set(data.skipped || []))
        setStep(Math.min(data.step || 0, totalSteps - 1))
        setShowIntro(false)
        restored.current = true
      }
    } catch {}
  }, [nama, kelas])

  useEffect(() => {
    if (!nama || !kelas || hasil) return
    if (Object.keys(jawaban).length === 0 && skipped.size === 0) return
    try {
      const data = { jawaban, skipped: [...skipped], step, nama, kelas, savedAt: Date.now() }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, [jawaban, skipped, step, nama, kelas, hasil])

  const [existingStatus, setExistingStatus] = useState<{completed: boolean; retakeStatus: string} | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [sendingRetake, setSendingRetake] = useState(false)

  useEffect(() => {
    if (!nama || !kelas || !user?.username) return
    setCheckingStatus(true)
    fetch(`/api/siswa/asesmen/status?nisn=${encodeURIComponent(user.username)}&jenis=minat-bakat`)
      .then((r) => r.json())
      .then((data) => setExistingStatus(data))
      .catch(() => {})
      .finally(() => setCheckingStatus(false))
  }, [nama, kelas, user?.username])

  const checkStatus = useCallback(async () => {
    if (!nama || !kelas || !user?.username) return
    try {
      const r = await fetch(`/api/siswa/asesmen/status?nisn=${encodeURIComponent(user.username)}&jenis=minat-bakat`)
      const data = await r.json()
      setExistingStatus(data)
    } catch {}
  }, [nama, kelas, user?.username])

  useEffect(() => {
    if (existingStatus?.retakeStatus !== "pending") return
    const id = setInterval(checkStatus, 15000)
    const onVisibility = () => { if (document.visibilityState === "visible") checkStatus() }
    document.addEventListener("visibilitychange", onVisibility)
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVisibility) }
  }, [existingStatus?.retakeStatus, checkStatus])

  async function requestRetake() {
    if (!user?.username) return
    setSendingRetake(true)
    try {
      const res = await fetch("/api/siswa/retake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nisn: user.username, jenis: "minat-bakat" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(data.message || "Permintaan retake dikirim")
      await checkStatus()
    } catch {
      toast.error("Gagal mengirim permintaan")
    } finally {
      setSendingRetake(false)
    }
  }

  const totalSteps = questions.length
  const answeredCount = Object.keys(jawaban).length
  const skippedCount = skipped.size
  const remainingCount = totalSteps - answeredCount
  const isDone = answeredCount === totalSteps

  const dotStates: DotState[] = questions.map((q, i) => {
    if (jawaban[q.id] !== undefined) return "answered"
    if (skipped.has(q.id)) return "skipped"
    if (i === step) return "current"
    return "unreached"
  })

  function answer(value: number) {
    setJawaban((prev) => ({ ...prev, [questions[step].id]: value }))
    setSkipped((prev) => { const n = new Set(prev); n.delete(questions[step].id); return n })
    if (step < totalSteps - 1) {
      setTimeout(() => setStep((s) => s + 1), 200)
    }
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1)
  }

  function skipQuestion() {
    setSkipped((prev) => new Set(prev).add(questions[step].id))
    if (step < totalSteps - 1) {
      setStep((s) => s + 1)
    }
  }

  function jumpTo(index: number) {
    setStep(index)
  }

  async function submit() {
    if (!nama.trim()) {
      toast.error("Isi nama dulu")
      return
    }
    setSubmitting(true)
    const skor = hitungSkor(jawaban)
    try {
      const res = await fetch("/api/asesmen/minat-bakat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, kelas, jawaban, skor }),
      })
      if (!res.ok) throw new Error()
      localStorage.removeItem(STORAGE_KEY)
      setHasil(skor)
      toast.success("Asesmen selesai! Lihat hasilnya.")
    } catch {
      toast.error("Gagal menyimpan")
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY)
    setHasil(null); setStep(0); setJawaban({}); setSkipped(new Set()); setShowIntro(true)
  }

  if (hasil) {
    const sorted = Object.entries(hasil).sort(([, a], [, b]) => b - a)
    return (
      <div className="space-y-6">
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Sparkles className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Hasil Asesmen Minat Bakat</h2>
            <p className="mt-1 text-emerald-600 font-medium">{nama} · {kelas}</p>
            <Badge className="mt-3 bg-emerald-500 text-white">{getTipeTeratas(hasil)}</Badge>
          </CardContent>
        </Card>

        {sorted.map(([k, v]) => (
          <Card key={k} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-gray-900">{labelDimensi[k]}</span>
                <span className="text-lg font-bold text-emerald-600">{v}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(v / 30) * 100}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(rekomendasiKarier[k] || []).slice(0, 3).map((karir) => (
                  <Badge key={karir} variant="secondary" className="text-xs">{karir}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-0 bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white">
          <h3 className="font-bold">Rekomendasi Karir</h3>
          <p className="mt-2 text-sm text-emerald-100">
            Berdasarkan minat dominanmu ({sorted[0][0]}), karier yang cocok:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(rekomendasiKarier[sorted[0][0]] || []).map((karir) => (
              <Badge key={karir} className="bg-white/20 text-white border-white/30">{karir}</Badge>
            ))}
          </div>
        </Card>

        <Button variant="outline" className="w-full gap-2" onClick={reset}>
          <Download className="h-4 w-4" /> Ambil Lagi
        </Button>
      </div>
    )
  }

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (existingStatus?.completed) {
    if (existingStatus.retakeStatus === "pending") {
      return (
        <div className="max-w-lg mx-auto space-y-4">
          <Card className="border-0 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                <Clock3 className="h-7 w-7 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Menunggu Persetujuan</h2>
              <p className="mt-2 text-sm text-gray-500">
                Permintaan retake asesmen sedang diproses. Silakan tunggu persetujuan dari guru BK atau Admin.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (existingStatus.retakeStatus !== "approved") {
      return (
        <div className="max-w-lg mx-auto space-y-4">
          <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <ClipboardList className="h-7 w-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Asesmen Sudah Selesai</h2>
              <p className="mt-2 text-sm text-gray-500">
                Kamu sudah mengerjakan asesmen ini. Untuk mengulang, hubungi guru BK atau Admin.
              </p>
              <div className="mt-6 flex gap-3 justify-center">
                <Button onClick={requestRetake} disabled={sendingRetake} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                  {sendingRetake ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sendingRetake ? "Mengirim..." : "Minta Retake"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  if (showIntro || !nama || !kelas) {
    return (
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="border-0 bg-gradient-to-br from-emerald-500 to-teal-600 overflow-hidden shadow-md">
            <CardContent className="p-6 text-center text-white">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <Compass className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Petualangan Potensi</h2>
              <p className="text-emerald-100 leading-relaxed">
                Setiap orang punya bakat unik. Ikuti petualangan ini untuk menemukan
                potensi terpendam dan arah karier yang paling cocok untukmu!
              </p>
              <div className="mt-6 flex items-center justify-center gap-6 text-xs text-emerald-200">
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> {totalSteps} pertanyaan</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~5 menit</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-emerald-600" />
                Identitas Diri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700">
                  {nama || "Mengambil data..."}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Kelas</Label>
                <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700">
                  {kelas || (loadingSiswa ? "Memuat..." : "Kelas belum diatur, hubungi Guru BK")}
                </div>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={() => setShowIntro(false)} disabled={!nama || !kelas || loadingSiswa}>
                {loadingSiswa ? "Memuat..." : "Mulai Petualangan"} <Compass className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const q = questions[step]
  if (!q) {
    setStep(0)
    return null
  }
  const QuestionIcon = dimensiIcons[q.dimensi]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
          <Brain className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900 truncate">Minat Bakat</h1>
            <span className="shrink-0 text-sm font-medium text-gray-400 ml-2">{step + 1}/{totalSteps}</span>
          </div>
          <ProgressDots states={dotStates} onJump={jumpTo} />
          <div className="flex items-center justify-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="h-3 w-3" /> {answeredCount} terjawab
            </span>
            {skippedCount > 0 && (
              <span className="flex items-center gap-1 text-amber-600">
                <SkipForward className="h-3 w-3" /> {skippedCount} dilewati
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-400">
              <Circle className="h-3 w-3" /> {remainingCount} tersisa
            </span>
          </div>
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
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                <QuestionIcon className="h-3.5 w-3.5" />
                <span>Dimensi {q.dimensi}</span>
                {skipped.has(q.id) && (
                  <Badge variant="outline" className="ml-auto text-amber-600 border-amber-300 bg-amber-50 text-[10px]">Dilewati</Badge>
                )}
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
                          ? "border-emerald-500 bg-emerald-50 shadow-md scale-105"
                          : "border-gray-100 bg-gray-50 hover:border-emerald-200 hover:bg-emerald-50/50 hover:scale-[1.02]"
                      }`}
                    >
                      {(() => {
                        const ScaleIcon = skalaMinatIcons[val - 1]
                        return <ScaleIcon className={`h-5 w-5 transition-colors ${isSelected ? "text-emerald-700" : "text-gray-400 group-hover:text-emerald-600"}`} />
                      })()}
                      <span
                        className={`mt-1 text-center text-[10px] leading-tight transition-colors ${
                          isSelected ? "text-emerald-700 font-medium" : "text-gray-400 group-hover:text-emerald-600"
                        }`}
                      >
                        {skalaMinatLabel[val - 1]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={goBack} disabled={step === 0} size="sm">
          <ArrowLeft className="mr-1 h-4 w-4" /> Sebelumnya
        </Button>
        <div className="flex gap-2">
          {!isDone && (
            <Button variant="outline" size="sm" onClick={skipQuestion} className="text-amber-600 border-amber-200 hover:bg-amber-50 gap-1">
              <SkipForward className="h-3.5 w-3.5" /> Lewati
            </Button>
          )}
          <Button onClick={submit} disabled={submitting || !isDone} className="bg-emerald-600 hover:bg-emerald-700 gap-2" size="sm">
            {submitting ? "Menyimpan..." : "Lihat Hasil"} <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
