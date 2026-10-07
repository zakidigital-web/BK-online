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
import { questions, hitungSkor, interpretasi } from "@/lib/asesmen/psikologi"
import { motion, AnimatePresence } from "framer-motion"
import { AssessmentMascot } from "@/components/asesmen/assessment-mascot"
import { Sparkles, ArrowLeft, Check, Heart, Shield, SkipForward, Compass, Star, CheckCircle2, Circle, Clock, UserCircle, Loader2, Send, Clock3, ClipboardList } from "lucide-react"


const skalaLabel = ["Tidak Pernah", "Jarang", "Kadang", "Sering", "Hampir Selalu"]

const skalaColors = [
  { bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-700", active: "bg-emerald-500" },
  { bg: "bg-green-100", border: "border-green-300", text: "text-green-700", active: "bg-green-500" },
  { bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-700", active: "bg-amber-500" },
  { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-700", active: "bg-orange-500" },
  { bg: "bg-red-100", border: "border-red-300", text: "text-red-700", active: "bg-red-500" },
]

const STORAGE_KEY = "bk_asesmen_psikologi"

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
            s === "current" ? "h-7 w-7 ring-2 ring-orange-400 ring-offset-1 scale-110" :
            s === "answered" ? "h-6 w-6 bg-orange-500 text-white" :
            s === "skipped" ? "h-6 w-6 border-2 border-amber-400 text-amber-500 bg-amber-50" :
            "h-5 w-5 border border-gray-300 text-gray-300"
          } ${onJump ? "cursor-pointer hover:opacity-80" : ""}`}
        >
          {s === "answered" ? <Check className="h-3 w-3" /> :
           s === "skipped" ? <span className="text-xs font-bold">&ndash;</span> :
           s === "current" ? <span className="h-2.5 w-2.5 rounded-full bg-orange-600" /> :
           <Circle className="h-2.5 w-2.5" />}
        </button>
      ))}
    </div>
  )
}

export function PsikologiForm() {
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
    fetch(`/api/siswa/asesmen/status?nisn=${encodeURIComponent(user.username)}&jenis=psikologi`)
      .then((r) => r.json())
      .then((data) => setExistingStatus(data))
      .catch(() => {})
      .finally(() => setCheckingStatus(false))
  }, [nama, kelas, user?.username])

  const checkStatus = useCallback(async () => {
    if (!nama || !kelas || !user?.username) return
    try {
      const r = await fetch(`/api/siswa/asesmen/status?nisn=${encodeURIComponent(user.username)}&jenis=psikologi`)
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
        body: JSON.stringify({ nisn: user.username, jenis: "psikologi" }),
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
    if (step < totalSteps - 1) setTimeout(() => setStep((s) => s + 1), 200)
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1)
  }

  function skipQuestion() {
    setSkipped((prev) => new Set(prev).add(questions[step].id))
    if (step < totalSteps - 1) setStep((s) => s + 1)
  }

  function jumpTo(index: number) {
    setStep(index)
  }

  async function submit() {
    if (!nama.trim()) { toast.error("Isi nama dulu"); return }
    setSubmitting(true)
    const skor = hitungSkor(jawaban)
    try {
      const res = await fetch("/api/asesmen/psikologi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, kelas, jawaban, skor }),
      })
      if (!res.ok) throw new Error()
      localStorage.removeItem(STORAGE_KEY)
      setHasil(skor)
      toast.success("Asesmen selesai!")
    } catch { toast.error("Gagal menyimpan") }
    finally { setSubmitting(false) }
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY)
    setHasil(null); setStep(0); setJawaban({}); setSkipped(new Set()); setShowIntro(true)
  }

  if (hasil) {
    const interpretasiArr = interpretasi(hasil)
    return (
      <div className="space-y-6">
        <Card className="border-0 bg-gradient-to-br from-rose-50 via-orange-50 to-white shadow-md overflow-hidden relative">
          <CardContent className="p-6 text-center flex flex-col items-center">
            <AssessmentMascot
              character="mimi"
              mood="cheering"
              size={110}
              showSpeechBubble
              message={`Terima kasih, ${nama || "kamu"}! Selalu sayangi dirimu ya! 💖✨`}
              className="mb-2"
            />
            <h2 className="text-2xl font-bold text-gray-900 mt-2">Hasil Evaluasi Emosional</h2>
            <p className="mt-1 text-rose-600 font-medium">{nama} · {kelas}</p>
            <Badge className={`mt-3 text-white text-sm px-3.5 py-1 shadow-sm font-semibold ${
              interpretasiArr.length <= 1 ? "bg-emerald-600" : "bg-rose-500"
            }`}>
              {interpretasiArr.length <= 1 ? "Kondisi Stabil & Positif" : "Perlu Pendampingan Nyaman"}
            </Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(hasil).map(([k, v]) => (
            <Card key={k} className="border-0 shadow-sm bg-white rounded-2xl">
              <CardContent className="p-4 sm:p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold text-gray-900 capitalize text-sm">{k}</span>
                  <span className={`text-base font-extrabold ${v >= 60 ? "text-rose-600" : v >= 40 ? "text-amber-500" : "text-emerald-600"}`}>
                    {v}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      v >= 60 ? "bg-rose-500" : v >= 40 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${v}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 p-6 text-white rounded-2xl shadow-md">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-200" /> Catatan Refleksi dari Mimi
          </h3>
          <ul className="mt-3 space-y-2.5">
            {interpretasiArr.map((i, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-rose-50 leading-relaxed">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-rose-100 bg-black/10 p-3 rounded-xl border border-white/10">
            💡 <strong>Pesan Sahabat:</strong> Instrumen ini bersifat reflektif dan suportif. Jika sedang menghadapi rasa cemas, beban belajar, atau butuh teman bicara, ruang konseling BK dan Mimi selalu terbuka dengan hangat untukmu.
          </p>
        </Card>

        <Button variant="outline" className="w-full h-11 rounded-xl font-medium" onClick={reset}>
          Ulangi Evaluasi
        </Button>
      </div>
    )
  }

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    )
  }

  if (existingStatus?.completed) {
    if (existingStatus.retakeStatus === "pending") {
      return (
        <div className="max-w-lg mx-auto space-y-4">
          <Card className="border-0 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm overflow-hidden">
            <CardContent className="p-6 text-center flex flex-col items-center">
              <AssessmentMascot
                character="mimi"
                mood="thinking"
                size={100}
                showSpeechBubble
                message="Mimi temani tunggu persetujuan guru BK ya~"
                className="mb-2"
              />
              <div className="mx-auto my-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Clock3 className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Menunggu Persetujuan Retake</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-sm">
                Permintaan retake asesmen psikologi sedang diproses oleh guru BK. Silakan berkunjung kembali nanti.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (existingStatus.retakeStatus !== "approved") {
      return (
        <div className="max-w-lg mx-auto space-y-4">
          <Card className="border-0 bg-gradient-to-br from-rose-50 via-orange-50 to-white shadow-sm overflow-hidden">
            <CardContent className="p-6 text-center flex flex-col items-center">
              <AssessmentMascot
                character="mimi"
                mood="happy"
                size={100}
                showSpeechBubble
                message="Hasil refleksi emosimu sudah tercatat!"
                className="mb-2"
              />
              <div className="mx-auto my-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                <ClipboardList className="h-6 w-6 text-rose-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Asesmen Sudah Dikerjakan</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-sm">
                Kamu sudah mengisi asesmen emosional ini. Jika merasa kondisi hatimu berubah dan ingin mengisinya kembali, ajukan permohonan retake.
              </p>
              <div className="mt-6 flex gap-3 justify-center">
                <Button onClick={requestRetake} disabled={sendingRetake} className="bg-rose-600 hover:bg-rose-700 gap-2 shadow-sm rounded-xl">
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
          <Card className="border-0 bg-gradient-to-br from-rose-500 via-pink-500 to-orange-500 overflow-hidden shadow-lg text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <CardContent className="p-6 sm:p-8 text-center flex flex-col items-center relative z-10">
              <AssessmentMascot
                character="mimi"
                mood="calm"
                size={130}
                showSpeechBubble
                message="Halo! Aku Mimi, ceritakan apa yang kamu rasakan ya~ 🧸💖"
                className="mb-3"
              />
              <Badge className="bg-white/20 text-white border-white/30 text-xs px-3 py-1 font-semibold mb-2">
                Asesmen Kesejahteraan Psikologi & Emosi
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Cek Suasana Hati & Kesejahteraan</h2>
              <p className="text-rose-100 leading-relaxed max-w-md text-sm sm:text-base">
                Terkadang kita terlalu sibuk hingga lupa menyapa perasaan sendiri. Luangkan waktu sejenak untuk mengenali kondisi mental dan emosimu hari ini.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-rose-100 bg-black/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-300" /> {totalSteps} Pertanyaan</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-cyan-300" /> ~3 Menit Tenang</span>
                <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-rose-300" /> Aman & Terjaga</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-slate-800">
                <UserCircle className="h-5 w-5 text-rose-600" />
                Data Peserta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 font-medium">Nama Lengkap</Label>
                  <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-sm font-semibold text-slate-800">
                    {nama || "Mengambil data..."}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 font-medium">Kelas</Label>
                  <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-sm font-semibold text-slate-800">
                    {kelas || (loadingSiswa ? "Memuat..." : "Kelas belum diatur, hubungi Guru BK")}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-rose-50/80 p-3.5 text-xs text-rose-800 border border-rose-100 flex items-start gap-2.5">
                <Heart className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Pesan Hangat Mimi:</strong> Jawablah dengan jujur sesuai apa yang benar-benar kamu rasakan belakangan ini. Tidak ada penilaian baik ataupun buruk!
                </span>
              </div>

              <Button
                className="w-full h-11 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 hover:opacity-95 text-white font-semibold rounded-xl shadow-md gap-2 transition-all hover:scale-[1.01]"
                onClick={() => setShowIntro(false)}
                disabled={!nama || !kelas || loadingSiswa}
              >
                {loadingSiswa ? "Memuat..." : "Mulai Bersama Mimi"} <Heart className="h-4 w-4" />
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

  const progressPercent = Math.round((answeredCount / totalSteps) * 100)
  const encouragementText =
    progressPercent === 0
      ? "Bernapas perlahan, dengarkan hatimu~"
      : progressPercent < 40
      ? "Mimi mendengarkan setiap ceritamu dengan hangat 🌸"
      : progressPercent < 80
      ? "Kamu sangat hebat & jujur pada dirimu sendiri! 💖"
      : "Terima kasih sudah berbagi perasaanmu dengan tulus! ✨"

  return (
    <div className="space-y-4">
      {/* Top Header Card with Companion Bar */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <AssessmentMascot
            character="mimi"
            mood={isDone ? "cheering" : progressPercent > 50 ? "excited" : "calm"}
            size={58}
            className="shrink-0"
          />
          <div className="flex-1 sm:hidden">
            <p className="text-xs font-semibold text-rose-700">Mimi Sahabat Hati</p>
            <p className="text-[11px] text-slate-500 line-clamp-1">{encouragementText}</p>
          </div>
        </div>

        <div className="flex-1 w-full min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-rose-500" />
                Refleksi Psikologi & Emosi
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">{encouragementText}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-rose-600">{progressPercent}%</span>
              <span className="text-xs font-medium text-slate-400 ml-1.5">({step + 1}/{totalSteps})</span>
            </div>
          </div>

          <ProgressDots states={dotStates} onJump={jumpTo} />

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1 text-rose-600 font-medium">
              <CheckCircle2 className="h-3 w-3" /> {answeredCount} terjawab
            </span>
            {skippedCount > 0 && (
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <SkipForward className="h-3 w-3" /> {skippedCount} dilewati
              </span>
            )}
            <span className="flex items-center gap-1 text-slate-400">
              <Circle className="h-3 w-3" /> {remainingCount} tersisa
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -25 }}
          transition={{ duration: 0.18 }}
        >
          <Card className="border-0 shadow-sm overflow-hidden bg-white rounded-2xl">
            <div className="h-1.5 bg-gradient-to-r from-rose-400 via-pink-500 to-orange-400" />
            <CardContent className="p-5 sm:p-7">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Pengalaman Sehari-hari
                </span>
                {skipped.has(q.id) && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-[10px]">
                    Dilewati
                  </Badge>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed mb-6">
                {q.text}
              </h2>

              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {[0, 1, 2, 3, 4].map((val) => {
                  const isSelected = jawaban[q.id] === val
                  const c = skalaColors[val]
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => answer(val)}
                      className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 p-2.5 sm:p-3.5 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? `${c.border} ${c.bg} shadow-md scale-[1.03]`
                          : "border-slate-100 bg-slate-50/70 hover:border-rose-200 hover:bg-rose-50/30 hover:scale-[1.02]"
                      }`}
                    >
                      <div
                        className={`mb-1.5 h-1.5 w-6 sm:w-8 rounded-full transition-all duration-300 ${
                          isSelected ? c.active : "bg-slate-300 group-hover:bg-rose-300"
                        }`}
                      />
                      <span
                        className={`text-[10px] sm:text-xs font-semibold text-center leading-tight transition-colors ${
                          isSelected ? c.text : "text-slate-500 group-hover:text-rose-700"
                        }`}
                      >
                        {skalaLabel[val]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center pt-2">
        <Button variant="ghost" onClick={goBack} disabled={step === 0} size="sm" className="rounded-xl text-slate-600">
          <ArrowLeft className="mr-1 h-4 w-4" /> Sebelumnya
        </Button>
        <div className="flex gap-2">
          {!isDone && (
            <Button
              variant="outline"
              size="sm"
              onClick={skipQuestion}
              className="text-amber-600 border-amber-200 hover:bg-amber-50 gap-1 rounded-xl"
            >
              <SkipForward className="h-3.5 w-3.5" /> Lewati
            </Button>
          )}
          <Button
            onClick={submit}
            disabled={submitting || !isDone}
            className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 hover:opacity-95 text-white gap-2 rounded-xl shadow-sm px-4"
            size="sm"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {submitting ? "Menyimpan..." : isDone ? "Lihat Hasil Refleksi" : `${answeredCount}/${totalSteps} Selesai`}
          </Button>
        </div>
      </div>
    </div>
  )
}
