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
import { questions, hitungSkor, getTipeKarakter, labelDimensiKarakter, nilaiPersonal } from "@/lib/asesmen/karakter"
import { motion, AnimatePresence } from "framer-motion"
import { AssessmentMascot } from "@/components/asesmen/assessment-mascot"
import {
  ArrowDown,
  ArrowLeft,
  Bird,
  BookOpen,
  Brain,
  Check,
  Circle,
  ClipboardList,
  Clock3,
  Compass,
  Crown,
  Flag,
  Frown,
  Gem,
  Handshake,
  Heart,
  HeartPulse,
  House,
  Leaf,
  Lightbulb,
  Link2,
  Loader2,
  Meh,
  Minus,
  Palette,
  Scale,
  Send,
  Shield,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Sun,
  Target,
  Trophy,
  UserCircle,
  Users,
  CheckCircle2,
} from "lucide-react"


const skalaLabel = ["Sgt Tdk Setuju", "Tidak Setuju", "Netral", "Setuju", "Sgt Setuju"]
const skalaIcons = [Frown, Meh, Minus, Smile, Sparkles]

const nilaiIcons = {
  bird: Bird,
  scale: Scale,
  house: House,
  trophy: Trophy,
  palette: Palette,
  users: Users,
  gem: Gem,
  compass: Compass,
  shield: Shield,
  book: BookOpen,
  crown: Crown,
  lightbulb: Lightbulb,
  star: Star,
  heartPulse: HeartPulse,
  sparkles: Sparkles,
  link: Link2,
  leaf: Leaf,
  shieldCheck: ShieldCheck,
  heart: Heart,
  smile: Smile,
  clock: Clock3,
  handshake: Handshake,
  flag: Flag,
  brain: Brain,
  clipboard: ClipboardList,
  sun: Sun,
  target: Target,
} as const

const STORAGE_KEY = "bk_asesmen_karakter"

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

export function KarakterForm() {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [showIntro, setShowIntro] = useState(true)
  const [mode, setMode] = useState<"identitas" | "kuesioner" | "nilai" | "hasil">("identitas")
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
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [hasil, setHasil] = useState<Record<string, number> | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const restored = useRef(false)

  useEffect(() => {
    if (!nama || !kelas || restored.current) return
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return
      const data = JSON.parse(saved)
      if (data.nama === nama && data.kelas === kelas && (Object.keys(data.jawaban || {}).length > 0 || (data.selectedValues || []).length > 0)) {
        setJawaban(data.jawaban || {})
        setSelectedValues(data.selectedValues || [])
        setStep(Math.min(data.step || 0, totalSteps - 1))
        setShowIntro(false)
        setMode("kuesioner")
        restored.current = true
      }
    } catch {}
  }, [nama, kelas])

  useEffect(() => {
    if (!nama || !kelas || hasil) return
    if (Object.keys(jawaban).length === 0 && selectedValues.length === 0) return
    try {
      const data = { jawaban, selectedValues, step, nama, kelas, savedAt: Date.now() }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, [jawaban, selectedValues, step, nama, kelas, hasil])

  const [existingStatus, setExistingStatus] = useState<{completed: boolean; retakeStatus: string} | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [sendingRetake, setSendingRetake] = useState(false)

  useEffect(() => {
    if (!nama || !kelas || !user?.username) return
    if (user.role !== "siswa") return
    setCheckingStatus(true)
    fetch(`/api/siswa/asesmen/status?nisn=${encodeURIComponent(user.username)}&jenis=karakter`)
      .then((r) => r.json())
      .then((data) => setExistingStatus(data))
      .catch(() => {})
      .finally(() => setCheckingStatus(false))
  }, [nama, kelas, user?.username, user?.role])

  const checkStatus = useCallback(async () => {
    if (!nama || !kelas || !user?.username) return
    try {
      const r = await fetch(`/api/siswa/asesmen/status?nisn=${encodeURIComponent(user.username)}&jenis=karakter`)
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
        body: JSON.stringify({ nisn: user.username, jenis: "karakter" }),
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

  const dotStates: DotState[] = questions.map((q, i) => {
    if (jawaban[q.id] !== undefined) return "answered"
    if (i === step) return "current"
    return "unreached"
  })

  function answer(value: number) {
    setJawaban((prev) => ({ ...prev, [questions[step].id]: value }))
    if (step < totalSteps - 1) setTimeout(() => setStep((s) => s + 1), 200)
    else setMode("nilai")
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1)
  }

  function jumpTo(index: number) {
    setStep(index)
  }

  function toggleValue(id: string) {
    setSelectedValues((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : prev.length < 5 ? [...prev, id] : prev
    )
  }

  async function submit() {
    if (!nama.trim()) { toast.error("Isi nama dulu"); return }
    if (selectedValues.length === 0) { toast.error("Pilih minimal 1 nilai personal"); return }
    setSubmitting(true)
    const skor = hitungSkor(jawaban)
    try {
      const res = await fetch("/api/karakter", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, kelas, jawaban, skor, nilaiPersonal: selectedValues }),
      })
      if (!res.ok) throw new Error()
      localStorage.removeItem(STORAGE_KEY)
      setHasil(skor)
      setMode("hasil")
      toast.success("Profil karakter tersimpan!")
    } catch { toast.error("Gagal menyimpan") }
    finally { setSubmitting(false) }
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY)
    setHasil(null); setMode("identitas"); setStep(0); setJawaban({}); setShowIntro(true); setSelectedValues([])
  }

  if (mode === "hasil" && hasil) {
    return (
      <div className="space-y-6">
        <Card className="border-0 bg-gradient-to-br from-amber-50 via-orange-50 to-white shadow-md overflow-hidden relative">
          <CardContent className="p-6 text-center flex flex-col items-center">
            <AssessmentMascot
              character="sparky"
              mood="cheering"
              size={110}
              showSpeechBubble
              message={`Luar biasa, ${nama || "kamu"}! Karakter hebatmu terpancar! 🦊⭐`}
              className="mb-2"
            />
            <h2 className="text-2xl font-bold text-gray-900 mt-2">Profil Karakter Diri</h2>
            <p className="mt-1 text-amber-600 font-medium">{nama} · {kelas}</p>
            <Badge className="mt-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm px-3.5 py-1 shadow-sm font-semibold">
              {getTipeKarakter(hasil)}
            </Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(hasil).map(([k, v]) => (
            <Card key={k} className="border-0 shadow-sm bg-white rounded-2xl">
              <CardContent className="p-4 sm:p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-sm">{labelDimensiKarakter[k]}</span>
                  <span className={`text-base font-extrabold ${v >= 60 ? "text-amber-600" : v >= 40 ? "text-orange-500" : "text-slate-400"}`}>
                    {v}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      v >= 60 ? "bg-amber-500" : v >= 40 ? "bg-orange-400" : "bg-slate-300"
                    }`}
                    style={{ width: `${v}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedValues.length > 0 && (
          <Card className="border-0 shadow-sm bg-white rounded-2xl p-5">
            <h3 className="mb-3 font-bold text-gray-900 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" /> Nilai Personal Utamamu
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((id) => {
                const v = nilaiPersonal.find((n) => n.id === id)
                if (!v) return null
                const ValueIcon = nilaiIcons[v.iconKey as keyof typeof nilaiIcons] ?? Circle
                return (
                  <Badge key={id} className="bg-amber-100/80 text-amber-800 border-amber-200 text-xs px-3 py-1 font-semibold rounded-xl flex items-center gap-1.5">
                    <ValueIcon className="h-3.5 w-3.5 text-amber-600" />
                    {v.label}
                  </Badge>
                )
              })}
            </div>
          </Card>
        )}

        <Button variant="outline" className="w-full h-11 rounded-xl font-medium" onClick={reset}>
          Ulangi Asesmen Karakter
        </Button>
      </div>
    )
  }

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
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
                character="sparky"
                mood="thinking"
                size={100}
                showSpeechBubble
                message="Sparky setia menunggumu di sini ya!"
                className="mb-2"
              />
              <div className="mx-auto my-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Clock3 className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Menunggu Persetujuan Retake</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-sm">
                Permintaan retake asesmen karakter sedang ditinjau oleh guru BK. Silakan tunggu konfirmasi.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (existingStatus.retakeStatus !== "approved") {
      return (
        <div className="max-w-lg mx-auto space-y-4">
          <Card className="border-0 bg-gradient-to-br from-amber-50 via-orange-50 to-white shadow-sm overflow-hidden">
            <CardContent className="p-6 text-center flex flex-col items-center">
              <AssessmentMascot
                character="sparky"
                mood="happy"
                size={100}
                showSpeechBubble
                message="Karakter dirimu sudah tercatat!"
                className="mb-2"
              />
              <div className="mx-auto my-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <ClipboardList className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Asesmen Karakter Selesai</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-sm">
                Kamu sudah melengkapi profil karakter diri. Jika ingin merefleksikan kembali nilaimu, kamu dapat mengajukan retake.
              </p>
              <div className="mt-6 flex gap-3 justify-center">
                <Button onClick={requestRetake} disabled={sendingRetake} className="bg-amber-600 hover:bg-amber-700 gap-2 shadow-sm rounded-xl text-white">
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
          <Card className="border-0 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 overflow-hidden shadow-lg text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <CardContent className="p-6 sm:p-8 text-center flex flex-col items-center relative z-10">
              <AssessmentMascot
                character="sparky"
                mood="excited"
                size={130}
                showSpeechBubble
                message="Halo! Aku Sparky, yuk temukan keunikan karaktermu! 🦊🔥"
                className="mb-3"
              />
              <Badge className="bg-white/20 text-white border-white/30 text-xs px-3 py-1 font-semibold mb-2">
                Asesmen Karakter Diri & Nilai Personal
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Eksplorasi Karakter Diri</h2>
              <p className="text-amber-100 leading-relaxed max-w-md text-sm sm:text-base">
                Siapakah dirimu sebenarnya? Kenali 5 dimensi kepribadian dan pilih nilai-nilai hidup yang paling menggambarkan prinsipmu!
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-amber-100 bg-black/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-yellow-300" /> {totalSteps + 1} Tahap</span>
                <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-cyan-300" /> ~5 Menit Seru</span>
                <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-orange-200" /> Nilai Personal</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-slate-800">
                <UserCircle className="h-5 w-5 text-amber-600" />
                Identitas Peserta
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
                  <Label className="text-xs text-slate-500 font-medium">
                    {user?.role !== "siswa" ? "Peran / Posisi" : "Kelas"}
                  </Label>
                  <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-sm font-semibold text-slate-800">
                    {kelas || (loadingSiswa ? "Memuat..." : user?.role !== "siswa" ? "Guru / Staff" : "Kelas belum diatur, hubungi Guru BK")}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50/80 p-3.5 text-xs text-amber-800 border border-amber-100 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Tips dari Sparky:</strong> Karakter adalah kekuatan unikmu. Percaya diri dan pilih yang paling mewakili dirimu yang sesungguhnya!
                </span>
              </div>

              <Button
                className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-md gap-2 transition-all hover:scale-[1.01]"
                onClick={() => { setShowIntro(false); setMode("kuesioner") }}
                disabled={!nama || !kelas || loadingSiswa}
              >
                {loadingSiswa ? "Memuat..." : "Mulai Bersama Sparky"} <Compass className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (mode === "nilai") {
    return (
      <div className="space-y-4">
        {/* Companion Header */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <AssessmentMascot
            character="sparky"
            mood={selectedValues.length === 5 ? "cheering" : "excited"}
            size={58}
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Pilih 5 Nilai Personal Utama
            </h1>
            <p className="text-xs text-slate-500">
              {selectedValues.length === 5
                ? "Hebat! 5 nilai terpilih, yuk simpan hasilnya!"
                : `Pilih nilai yang paling penting bagimu (${selectedValues.length}/5 terpilih)`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {nilaiPersonal.map((n) => {
            const ValueIcon = nilaiIcons[n.iconKey as keyof typeof nilaiIcons] ?? Circle
            const isSelected = selectedValues.includes(n.id)
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => toggleValue(n.id)}
                className={`group flex items-center gap-2.5 rounded-2xl border-2 p-3 transition-all cursor-pointer ${
                  isSelected
                    ? "border-amber-500 bg-amber-50/80 text-amber-900 shadow-sm scale-[1.02]"
                    : "border-slate-100 bg-white hover:border-amber-200 hover:bg-amber-50/30 text-slate-700"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                    isSelected ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400 group-hover:text-amber-500"
                  }`}
                >
                  <ValueIcon className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold leading-tight text-left">
                  {n.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button variant="ghost" onClick={() => setMode("kuesioner")} size="sm" className="rounded-xl text-slate-600">
            <ArrowLeft className="mr-1 h-4 w-4" /> Pertanyaan Karakter
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || selectedValues.length === 0}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2 rounded-xl shadow-sm px-4"
            size="sm"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {submitting ? "Menyimpan..." : "Lihat Profil Karakter"}
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
      ? "Santai saja, jawab sesuai dirimu yang sejati~"
      : progressPercent < 40
      ? "Semangat! Karaktermu unik dan hebat! ⭐"
      : progressPercent < 80
      ? "Keren! Menuju tahap nilai-nilai personal! 🦊"
      : "Satu langkah lagi menuju nilai personal! ✨"

  return (
    <div className="space-y-4">
      {/* Top Header Card with Companion Bar */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <AssessmentMascot
            character="sparky"
            mood={progressPercent > 50 ? "excited" : "happy"}
            size={58}
            className="shrink-0"
          />
          <div className="flex-1 sm:hidden">
            <p className="text-xs font-semibold text-amber-700">Sparky Sahabat Karakter</p>
            <p className="text-[11px] text-slate-500 line-clamp-1">{encouragementText}</p>
          </div>
        </div>

        <div className="flex-1 w-full min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500" />
                Asesmen Karakter Diri
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">{encouragementText}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-amber-600">{progressPercent}%</span>
              <span className="text-xs font-medium text-slate-400 ml-1.5">({step + 1}/{totalSteps})</span>
            </div>
          </div>

          <ProgressDots states={dotStates} onJump={jumpTo} />

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1 text-amber-600 font-medium">
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
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500" />
            <CardContent className="p-5 sm:p-7">
              <div className="mb-4">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Pernyataan Karakter
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
                          ? "border-amber-500 bg-amber-50/80 text-amber-900 shadow-md scale-[1.03]"
                          : "border-slate-100 bg-slate-50/70 hover:border-amber-200 hover:bg-amber-50/30 hover:scale-[1.02] text-slate-500"
                      }`}
                    >
                      <ScaleIcon
                        className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:scale-110 ${
                          isSelected ? "text-amber-600" : "text-slate-400 group-hover:text-amber-500"
                        }`}
                      />
                      <span
                        className={`mt-1.5 text-center text-[10px] sm:text-xs leading-tight font-medium ${
                          isSelected ? "text-amber-800 font-bold" : "text-slate-500 group-hover:text-slate-800"
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
            else setMode("nilai")
          }}
          className="rounded-xl text-amber-700 border-amber-200 hover:bg-amber-50"
        >
          {step === totalSteps - 1 ? "Ke Tahap Nilai" : "Lewati"} <ArrowDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
