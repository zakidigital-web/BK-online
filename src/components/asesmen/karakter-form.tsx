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
import { motion } from "framer-motion"
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
    setCheckingStatus(true)
    fetch(`/api/siswa/asesmen/status?nisn=${encodeURIComponent(user.username)}&jenis=karakter`)
      .then((r) => r.json())
      .then((data) => setExistingStatus(data))
      .catch(() => {})
      .finally(() => setCheckingStatus(false))
  }, [nama, kelas, user?.username])

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
        <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
              <Sparkles className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Profil Karakter</h2>
            <p className="mt-1 text-indigo-600 font-medium">{nama} · {kelas}</p>
            <p className="mt-2 text-sm text-gray-500">{getTipeKarakter(hasil)}</p>
          </CardContent>
        </Card>

        {Object.entries(hasil).map(([k, v]) => (
          <Card key={k} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-gray-900">{labelDimensiKarakter[k]}</span>
                <span className={`text-lg font-bold ${v >= 60 ? "text-indigo-600" : v >= 40 ? "text-amber-500" : "text-gray-400"}`}>{v}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div className={`h-full rounded-full transition-all ${v >= 60 ? "bg-indigo-500" : v >= 40 ? "bg-amber-400" : "bg-gray-300"}`}
                  style={{ width: `${v}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}

        {selectedValues.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <h3 className="mb-3 font-semibold text-gray-900">Nilai Personalmu</h3>
              <div className="flex flex-wrap gap-2">
                {selectedValues.map((id) => {
                  const v = nilaiPersonal.find((n) => n.id === id)
                  if (!v) return null
                  const ValueIcon = nilaiIcons[v.iconKey as keyof typeof nilaiIcons] ?? Circle
                  return (
                    <Badge key={id} className="bg-indigo-100 text-indigo-700 text-sm">
                      <ValueIcon className="mr-1 h-3.5 w-3.5" />
                      {v.label}
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

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
                <Compass className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Eksplorasi Dirimu</h2>
              <p className="text-indigo-100 leading-relaxed">
                Siapa dirimu sebenarnya? Yuk ikuti petualangan ini untuk mengenali
                karakter, nilai-nilai personal, dan kekuatan unik dalam dirimu!
              </p>
              <div className="mt-6 flex items-center justify-center gap-6 text-xs text-indigo-200">
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> {totalSteps + 1} tahap</span>
                <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> ~7 menit</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-indigo-600" />
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
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2" onClick={() => { setShowIntro(false); setMode("kuesioner") }}
                disabled={!nama || !kelas || loadingSiswa}>
                {loadingSiswa ? "Memuat..." : "Mulai Eksplorasi"} <Compass className="h-4 w-4" />
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
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <Sparkles className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Nilai Personal</h1>
            <p className="text-xs text-gray-500">Pilih 5 nilai yang paling mewakilimu</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {nilaiPersonal.map((n) => (
            (() => {
              const ValueIcon = nilaiIcons[n.iconKey as keyof typeof nilaiIcons] ?? Circle
              return (
            <Button key={n.id} variant={selectedValues.includes(n.id) ? "default" : "outline"}
              className={`flex flex-col items-center h-20 ${selectedValues.includes(n.id) ? "bg-indigo-600" : ""}`}
              onClick={() => toggleValue(n.id)}>
              <ValueIcon className="h-5 w-5" />
              <span className="text-[10px] mt-1">{n.label}</span>
            </Button>
              )
            })()
          ))}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">{selectedValues.length}/5 dipilih</span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setMode("kuesioner")} size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
            </Button>
            <Button onClick={submit} disabled={submitting || selectedValues.length === 0} className="bg-indigo-600 hover:bg-indigo-700 gap-2" size="sm">
              {submitting ? "Menyimpan..." : "Lihat Hasil"} <Check className="h-4 w-4" />
            </Button>
          </div>
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
          <UserCircle className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900 truncate">Karakter Diri</h1>
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
                  <span className="text-[10px] mt-1 leading-tight">{skalaLabel[val - 1]}</span>
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
          else setMode("nilai")
        }}>
          Lewati <ArrowDown className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
