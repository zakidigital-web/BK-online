"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { questions, hitungSkor, getTipeMBTI, getPersentase, labelDimensi, getDeskripsi } from "@/lib/asesmen/mbti"
import { motion } from "framer-motion"
import {
  ArrowDown, ArrowLeft, ArrowUp, Brain, Check, ChevronDown, ChevronUp, Circle, Clock3, Compass, Loader2, Minus, Send, Sparkles, UserCircle, CheckCircle2, ClipboardList, Star,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const skalaLabel = ["Sangat Tidak Setuju", "Tidak Setuju", "Netral", "Setuju", "Sangat Setuju"]
const skalaIcons = [ArrowDown, ChevronDown, Minus, ChevronUp, ArrowUp]

const STORAGE_KEY = "bk_asesmen_mbti"

type DotState = "answered" | "current" | "unreached"

function ProgressDots({ states, onJump }: { states: DotState[]; onJump?: (i: number) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 py-2">
      {states.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onJump?.(i)}
          className={`flex items-center justify-center rounded-full transition-all duration-200 ${
            s === "current" ? "h-7 w-7 ring-2 ring-indigo-400 ring-offset-1 scale-110" :
            s === "answered" ? "h-6 w-6 bg-indigo-500 text-white" :
            "h-5 w-5 border border-gray-300 text-gray-300"
          } ${onJump ? "cursor-pointer hover:opacity-80" : ""}`}
        >
          {s === "answered" ? <Check className="h-3 w-3" /> :
           s === "current" ? <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> :
           <Circle className="h-2.5 w-2.5" />}
        </button>
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

export function MbtiForm() {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [showIntro, setShowIntro] = useState(true)
  const [mode, setMode] = useState<"identitas" | "kuesioner" | "review" | "hasil">("identitas")
  const [nama, setNama] = useState("")
  const [kelas, setKelas] = useState("")
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

  const [jawaban, setJawaban] = useState<Record<number, number>>({})
  const [hasil, setHasil] = useState<Record<string, number> | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const restored = useRef(false)

  useEffect(() => {
    if (!nama || !kelas || restored.current) return
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return
      const data = JSON.parse(saved)
      if (data.nama === nama && data.kelas === kelas && Object.keys(data.jawaban || {}).length > 0) {
        setJawaban(data.jawaban || {})
        setStep(Math.min(data.step || 0, totalSteps - 1))
        setShowIntro(false)
        setMode("kuesioner")
        restored.current = true
      }
    } catch {}
  }, [nama, kelas])

  useEffect(() => {
    if (!nama || !kelas || hasil) return
    if (Object.keys(jawaban).length === 0) return
    try {
      const data = { jawaban, step, nama, kelas, savedAt: Date.now() }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, [jawaban, step, nama, kelas, hasil])

  const [existingStatus, setExistingStatus] = useState<{completed: boolean; retakeStatus: string} | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [sendingRetake, setSendingRetake] = useState(false)

  useEffect(() => {
    if (!nama || !kelas || !user?.username) return
    setCheckingStatus(true)
    fetch(`/api/siswa/asesmen/status?nisn=${encodeURIComponent(user.username)}&jenis=mbti`)
      .then((r) => r.json())
      .then((data) => setExistingStatus(data))
      .catch(() => {})
      .finally(() => setCheckingStatus(false))
  }, [nama, kelas, user?.username])

  const checkStatus = useCallback(async () => {
    if (!nama || !kelas || !user?.username) return
    try {
      const r = await fetch(`/api/siswa/asesmen/status?nisn=${encodeURIComponent(user.username)}&jenis=mbti`)
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
        body: JSON.stringify({ nisn: user.username, jenis: "mbti" }),
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
  const isComplete = answeredCount === totalSteps

  const dotStates: DotState[] = questions.map((q, i) => {
    if (jawaban[q.id] !== undefined) return "answered"
    if (i === step) return "current"
    return "unreached"
  })

  function answer(value: number) {
    setJawaban((prev) => ({ ...prev, [questions[step].id]: value }))
    if (step < totalSteps - 1) setTimeout(() => setStep((s) => s + 1), 200)
    else setMode("review")
  }

  function goBack() {
    if (mode === "review") { setMode("kuesioner"); return }
    if (step > 0) setStep((s) => s - 1)
  }

  function jumpTo(index: number) {
    setStep(index)
  }

  async function submit() {
    if (!nama.trim() || !kelas.trim()) { toast.error("Isi nama dan kelas dulu"); return }
    setSubmitting(true)
    const skor = hitungSkor(jawaban)
    try {
      const res = await fetch("/api/mbti", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, kelas, jawaban, skor }),
      })
      if (!res.ok) throw new Error()
      localStorage.removeItem(STORAGE_KEY)
      setHasil(skor)
      setMode("hasil")
      toast.success("Tipe kepribadian tersimpan!")
    } catch { toast.error("Gagal menyimpan") }
    finally { setSubmitting(false) }
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY)
    setHasil(null); setMode("identitas"); setStep(0); setJawaban({}); setShowIntro(true)
  }

  if (mode === "hasil" && hasil) {
    const tipe = getTipeMBTI(hasil)
    const persentase = getPersentase(hasil)
    const deskripsi = getDeskripsi(tipe)
    return (
      <div className="space-y-6">
        <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
              <Brain className="h-10 w-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Tipe Kepribadian</h2>
            <p className="mt-1 text-indigo-600 font-medium">{nama} · {kelas}</p>
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

        <Button variant="outline" className="w-full" onClick={reset}>
          Ambil Lagi
        </Button>
      </div>
    )
  }

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
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
          <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                <ClipboardList className="h-7 w-7 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Asesmen Sudah Selesai</h2>
              <p className="mt-2 text-sm text-gray-500">
                Kamu sudah mengerjakan asesmen ini. Untuk mengulang, hubungi guru BK atau Admin.
              </p>
              <div className="mt-6 flex gap-3 justify-center">
                <Button onClick={requestRetake} disabled={sendingRetake} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
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
          <Card className="border-0 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden shadow-md">
            <CardContent className="p-6 text-center text-white">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <Brain className="h-10 w-10" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">Kenali Kepribadianmu</h2>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-medium text-white">Opsional</span>
              </div>
              <p className="text-indigo-100 leading-relaxed">
                Temukan tipe kepribadian MBTI-mu! INTJ, INFP, ENFJ, atau yang lainnya?
                Yuk cari tahu siapa dirimu yang sebenarnya.
              </p>
              <div className="mt-6 flex items-center justify-center gap-6 text-xs text-indigo-200">
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> {totalSteps} pertanyaan</span>
                <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> ~5 menit</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-semibold text-gray-900">Identitas Diri</span>
              </div>
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700">
                  {nama || "Mengambil data..."}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Kelas</Label>
                <Select value={kelas} onValueChange={(v) => setKelas(v ?? "")}>
                  <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                  <SelectContent>
                    {["7A","7B","7C","7D","8A","8B","8C","8D","9A","9B","9C","9D"].map((k) => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2" onClick={() => { setShowIntro(false); setMode("kuesioner") }}
                disabled={!nama || !kelas || loadingSiswa}>
                {loadingSiswa ? "Memuat..." : "Mulai Tes"} <Brain className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (mode === "review") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <ClipboardList className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Review Jawaban</h1>
            <p className="text-sm text-gray-500">Periksa kembali jawaban sebelum menyimpan</p>
          </div>
        </div>
        <div className="space-y-2">
          {questions.map((q, i) => (
            <Card key={q.id} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-3">
                  <span className="text-xs font-medium text-gray-400">{i + 1}.</span>
                  <span className="text-sm text-gray-700 ml-1">{q.text}</span>
                </div>
                <Badge variant={jawaban[q.id] ? "default" : "outline"} className="shrink-0 text-xs">
                  {jawaban[q.id] ? skalaLabel[jawaban[q.id] - 1] : "—"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-between">
          <Button variant="ghost" onClick={goBack} size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
          </Button>
          <Button onClick={submit} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 gap-2" size="sm">
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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
          <Brain className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900 truncate">Tes Kepribadian MBTI</h1>
            <span className="shrink-0 text-sm font-medium text-gray-400 ml-2">{step + 1}/{totalSteps}</span>
          </div>
          <ProgressDots states={dotStates} onJump={jumpTo} />
          <div className="flex items-center justify-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-indigo-600">
              <CheckCircle2 className="h-3 w-3" /> {answeredCount} terjawab
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <Circle className="h-3 w-3" /> {totalSteps - answeredCount} tersisa
            </span>
          </div>
        </div>
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-indigo-400 to-purple-500" />
          <CardContent className="p-6 text-center">
            <Badge variant="secondary" className="mb-3 text-xs">
              {dimensiLabel[q.dimensi] || q.dimensi}
            </Badge>
            <h2 className="mb-6 text-lg font-semibold text-gray-900">{q.text}</h2>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <Button key={val} variant={jawaban[q.id] === val ? "default" : "outline"}
                  className={`flex flex-col items-center h-20 ${jawaban[q.id] === val ? "bg-indigo-600" : ""}`}
                  onClick={() => answer(val)}>
                  {(() => {
                    const ScaleIcon = skalaIcons[val - 1]
                    return <ScaleIcon className="h-5 w-5" />
                  })()}
                  <span className="text-[10px] mt-1">{skalaLabel[val - 1]}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={goBack} disabled={step === 0} size="sm">
          <ArrowLeft className="mr-1 h-4 w-4" /> Sebelumnya
        </Button>
        <Button variant="outline" size="sm" onClick={() => {
          if (step < totalSteps - 1) setStep((s) => s + 1)
          else setMode("review")
        }}>
          Lewati <ArrowDown className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
