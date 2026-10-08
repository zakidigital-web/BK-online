"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { questions, hitungSkor, getTipeMBTI, getPersentase, labelDimensi, getDeskripsi } from "@/lib/asesmen/mbti"
import { motion, AnimatePresence } from "framer-motion"
import { AssessmentMascot } from "@/components/asesmen/assessment-mascot"
import { ThreeMascot3D } from "@/components/asesmen/three-mascot-3d"
import { PesertaCard } from "@/components/asesmen/peserta-card"
import {
  ArrowDown, ArrowLeft, Brain, Check, Circle, Clock3, Compass, Frown, Loader2, Meh, Minus, Send, Smile, Sparkles, UserCircle, CheckCircle2, ClipboardList, Star,
} from "lucide-react"


const skalaLabel = ["Sgt Tdk Setuju", "Tidak Setuju", "Netral", "Setuju", "Sgt Setuju"]
const skalaIcons = [Frown, Meh, Minus, Smile, Sparkles]

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
    if (user.role !== "siswa") {
      const roleKelas =
        user.role === "guru" ? "Guru BK" :
        user.role === "walas" ? (user.kelas ? `Kelas ${user.kelas} (Walas)` : "Wali Kelas") :
        user.role === "guru-mapel" ? (user.mapel ? `Guru ${user.mapel}` : "Guru Mapel") :
        user.role === "admin" ? "Administrator" : "Guru / Staff"
      setKelas(roleKelas)
      setLoadingSiswa(false)
      return
    }
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
    if (user.role !== "siswa") return
    setCheckingStatus(true)
    fetch(`/api/siswa/asesmen/status?nisn=${encodeURIComponent(user.username)}&jenis=mbti`)
      .then((r) => r.json())
      .then((data) => setExistingStatus(data))
      .catch(() => {})
      .finally(() => setCheckingStatus(false))
  }, [nama, kelas, user?.username, user?.role])

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
    if (!nama.trim()) { toast.error("Isi nama dulu"); return }
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
        <Card className="border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-white shadow-md overflow-hidden relative">
          <CardContent className="p-6 text-center flex flex-col items-center">
            <ThreeMascot3D
              character="zen"
              mood="cheering"
              size={140}
              interactive={true}
              showParticles={true}
              showSpeechBubble={true}
              message={`Analisis selesai, ${nama || "kamu"}! Tipe MBTI-mu adalah ${tipe}! 🤖✨`}
              className="mb-2"
            />
            <h2 className="text-2xl font-bold text-gray-900 mt-2">Hasil Kepribadian MBTI</h2>
            <p className="mt-1 text-indigo-600 font-medium">{nama} · {kelas}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-2xl font-extrabold text-white tracking-widest shadow-md">
              {tipe}
            </div>
            <p className="mt-3 text-xl sm:text-2xl font-extrabold text-slate-800">{deskripsi.title}</p>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">{deskripsi.desc}</p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {Object.entries(persentase).map(([d, v]) => {
            const lb = labelDimensi[d]
            const isKiriDominan = v.kiri >= v.kanan
            return (
              <Card key={d} className="border-0 shadow-sm bg-white rounded-2xl">
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-2 flex items-center justify-between text-xs sm:text-sm font-bold">
                    <span className={isKiriDominan ? "text-indigo-600" : "text-slate-400"}>
                      {lb.kiri} ({v.kiri}%)
                    </span>
                    <span className={!isKiriDominan ? "text-purple-600" : "text-slate-400"}>
                      ({v.kanan}%) {lb.kanan}
                    </span>
                  </div>
                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 flex">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-500 rounded-l-full"
                      style={{ width: `${v.kiri}%` }}
                    />
                    <div
                      className="h-full bg-purple-500 transition-all duration-500 rounded-r-full"
                      style={{ width: `${v.kanan}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>Dimensi {d[0]}</span>
                    <span>Dimensi {d[1]}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="border-0 shadow-sm bg-white rounded-2xl p-5">
          <h3 className="mb-2 font-bold text-gray-900 text-sm">Peran Utama Kepribadian</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{deskripsi.role}</p>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm bg-emerald-50/50 border-emerald-100/60 rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-bold text-emerald-800 flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-600" /> Kekuatan Alami
            </h3>
            <ul className="space-y-2">
              {deskripsi.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2 text-xs text-emerald-900/90 leading-snug">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-0 shadow-sm bg-amber-50/50 border-amber-100/60 rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-bold text-amber-800 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-600" /> Area Pengembangan
            </h3>
            <ul className="space-y-2">
              {deskripsi.weaknesses.map((s) => (
                <li key={s} className="flex items-start gap-2 text-xs text-amber-900/90 leading-snug">
                  <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Button variant="outline" className="w-full h-11 rounded-xl font-medium" onClick={reset}>
          Ulangi Tes MBTI
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
          <Card className="border-0 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm overflow-hidden">
            <CardContent className="p-6 text-center flex flex-col items-center">
              <AssessmentMascot
                character="zen"
                mood="thinking"
                size={100}
                showSpeechBubble
                message="Zen sedang memonitor verifikasi retake ya!"
                className="mb-2"
              />
              <div className="mx-auto my-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Clock3 className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Menunggu Persetujuan Retake</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-sm">
                Permintaan retake MBTI sedang dalam proses peninjauan guru BK. Silakan periksa kembali nanti.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (existingStatus.retakeStatus !== "approved") {
      return (
        <div className="max-w-lg mx-auto space-y-4">
          <Card className="border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-white shadow-sm overflow-hidden">
            <CardContent className="p-6 text-center flex flex-col items-center">
              <AssessmentMascot
                character="zen"
                mood="happy"
                size={100}
                showSpeechBubble
                message="Tipe MBTI-mu sudah tersimpan rapi!"
                className="mb-2"
              />
              <div className="mx-auto my-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                <ClipboardList className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Tes MBTI Sudah Selesai</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-sm">
                Kamu sudah menyelesaikan tes ini. Untuk mengerjakan ulang, kamu dapat mengajukan permintaan retake kepada guru BK.
              </p>
              <div className="mt-6 flex gap-3 justify-center">
                <Button onClick={requestRetake} disabled={sendingRetake} className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-sm rounded-xl">
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
          <Card className="border-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 overflow-hidden shadow-lg text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <CardContent className="p-6 sm:p-8 text-center flex flex-col items-center relative z-10">
              <ThreeMascot3D
                character="zen"
                mood="happy"
                size={140}
                interactive={true}
                showParticles={true}
                showSpeechBubble={true}
                message="Halo! Aku Zen, mari analisis kepribadian MBTI-mu! 🤖⚡"
                className="mb-3"
              />
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/20 text-white border-white/30 text-xs px-3 py-1 font-semibold">
                  Tes 16 Tipe Kepribadian MBTI
                </Badge>
                <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Opsional
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Kenali Potensi Kognitif MBTI</h2>
              <p className="text-indigo-100 leading-relaxed max-w-md text-sm sm:text-base">
                Temukan kode 4-huruf kepribadianmu! Apakah kamu seorang INTJ sang Ahli Strategi, ENFP sang Inspirator, atau INFP sang Idealis?
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-indigo-100 bg-black/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-yellow-300" /> {totalSteps} Pertanyaan</span>
                <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-cyan-300" /> ~5 Menit Santai</span>
                <span className="flex items-center gap-1.5"><Brain className="h-3.5 w-3.5 text-purple-200" /> Analisis Lengkap</span>
              </div>
            </CardContent>
          </Card>

          <PesertaCard
            nama={nama}
            setNama={setNama}
            kelas={kelas}
            setKelas={setKelas}
            user={user}
            loadingSiswa={loadingSiswa}
            colorTheme="indigo"
            buttonLabel="Mulai Bersama Zen"
            buttonIcon={<Brain className="h-4 w-4" />}
            tipsText={
              <>
                <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Tips dari Zen:</strong> Jangan terlalu lama berpikir pada satu pertanyaan. Jawaban pertama yang melintas biasanya adalah preferensi alamimu!
                </span>
              </>
            }
            onStart={() => {
              setShowIntro(false)
              setMode("kuesioner")
            }}
          />
        </motion.div>
      </div>
    )
  }

  if (mode === "review") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <AssessmentMascot
            character="zen"
            mood="thinking"
            size={58}
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-indigo-600" />
              Review Jawaban Kuesioner
            </h1>
            <p className="text-xs text-slate-500">
              Periksa kembali seluruh pilihanmu sebelum Zen mengkalkulasi tipe MBTI
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {questions.map((q, i) => (
            <Card key={q.id} className="border-0 shadow-sm bg-white rounded-xl">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-3">
                  <span className="text-xs font-bold text-indigo-500">{i + 1}.</span>
                  <span className="text-sm text-slate-700 ml-1.5">{q.text}</span>
                </div>
                <Badge variant={jawaban[q.id] ? "default" : "outline"} className="shrink-0 text-xs rounded-lg">
                  {jawaban[q.id] ? skalaLabel[jawaban[q.id] - 1] : "Belum diisi"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button variant="ghost" onClick={goBack} size="sm" className="rounded-xl text-slate-600">
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
          </Button>
          <Button
            onClick={submit}
            disabled={submitting}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2 rounded-xl shadow-sm px-4"
            size="sm"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {submitting ? "Menganalisis..." : "Kalkulasi & Lihat Hasil MBTI"}
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

  const progressPercent = Math.round((answeredCount / totalSteps) * 100)
  const encouragementText =
    progressPercent === 0
      ? "Pilih respon yang paling mendekati kebiasaanmu~"
      : progressPercent < 40
      ? "Analisis pola berpikirmu sedang diproses! 🤖⚡"
      : progressPercent < 80
      ? "Hebat! Profil MBTI-mu semakin terbentuk! 🔮"
      : "Langkah terakhir sebelum review jawaban! ✨"

  return (
    <div className="space-y-4">
      {/* Top Header Card with Companion Bar */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <AssessmentMascot
            character="zen"
            mood={progressPercent > 50 ? "excited" : "happy"}
            size={58}
            className="shrink-0"
          />
          <div className="flex-1 sm:hidden">
            <p className="text-xs font-semibold text-indigo-700">Zen Sahabat MBTI</p>
            <p className="text-[11px] text-slate-500 line-clamp-1">{encouragementText}</p>
          </div>
        </div>

        <div className="flex-1 w-full min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-indigo-600" />
                Tes Kepribadian MBTI
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">{encouragementText}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-indigo-600">{progressPercent}%</span>
              <span className="text-xs font-medium text-slate-400 ml-1.5">({step + 1}/{totalSteps})</span>
            </div>
          </div>

          <ProgressDots states={dotStates} onJump={jumpTo} />

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1 text-indigo-600 font-medium">
              <CheckCircle2 className="h-3 w-3" /> {answeredCount} terjawab
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Circle className="h-3 w-3" /> {totalSteps - answeredCount} tersisa
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
            <div className="h-1.5 bg-gradient-to-r from-indigo-400 via-purple-500 to-violet-500" />
            <CardContent className="p-5 sm:p-7">
              <div className="mb-4">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Dimensi {dimensiLabel[q.dimensi] || q.dimensi}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed mb-6">
                {q.text}
              </h2>

              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isSelected = jawaban[q.id] === val
                  const ScaleIcon = skalaIcons[val - 1]
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => answer(val)}
                      className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 p-2.5 sm:p-3.5 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50/80 text-indigo-900 shadow-md scale-[1.03]"
                          : "border-slate-100 bg-slate-50/70 hover:border-indigo-200 hover:bg-indigo-50/30 hover:scale-[1.02] text-slate-500"
                      }`}
                    >
                      <ScaleIcon
                        className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:scale-110 ${
                          isSelected ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"
                        }`}
                      />
                      <span
                        className={`mt-1.5 text-center text-[10px] sm:text-xs leading-tight font-medium ${
                          isSelected ? "text-indigo-800 font-bold" : "text-slate-500 group-hover:text-slate-800"
                        }`}
                      >
                        {skalaLabel[val - 1]}
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (step < totalSteps - 1) setStep((s) => s + 1)
            else setMode("review")
          }}
          className="rounded-xl text-indigo-700 border-indigo-200 hover:bg-indigo-50"
        >
          {step === totalSteps - 1 ? "Review Jawaban" : "Lewati"} <ArrowDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
