"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Send, Key, Copy, Check, RefreshCw, MessageCircleHeart, Shield,
  LogIn, LogOut, User, Sparkles, Smile, Frown, Heart, Brain,
  Lightbulb, BookOpen, ChevronRight, Eye, EyeOff, CheckCheck,
  Users, UserCheck, CheckCircle2, Info
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { OnlineIndicator } from "@/components/online-indicator"
import { useRouter } from "next/navigation"

interface ChatMessage {
  id: string
  anonymousId: string
  message: string
  senderRole: string
  userId?: string | null
  targetGuruId?: string | null
  targetGuru?: { id: string; name: string; role: string; mapel?: string | null } | null
  isAnonymous: boolean
  senderName?: string | null
  senderKelas?: string | null
  createdAt: string
}

interface GuruBK {
  id: string
  name: string
  role: string
  mapel?: string | null
  nipy?: string | null
}

const suggestedTopics = [
  { icon: Heart, label: "Patah hati / Masalah Percintaan", color: "text-rose-500", bg: "bg-rose-50" },
  { icon: Brain, label: "Stres & Beban Pelajaran", color: "text-amber-500", bg: "bg-amber-50" },
  { icon: Smile, label: "Percaya Diri & Menghadapi Masalah", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: Frown, label: "Cemas, Takut & Tekanan Emosi", color: "text-violet-500", bg: "bg-violet-50" },
  { icon: Lightbulb, label: "Bingung Cita-Cita & Sekolah Lanjutan", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: BookOpen, label: "Masalah Pertemanan / Relasi Sosial", color: "text-indigo-500", bg: "bg-indigo-50" },
]

const quotes = [
  "Curhat adalah langkah bijak untuk menemukan solusi. Guru BK selalu siap mendengarkanmu.",
  "Tidak ada cerita yang salah. Semua yang kamu rasakan penting untuk didengarkan.",
  "Kamu tidak sendirian menghadapi tantangan belajar atau masalah pribadi.",
  "Menceritakan apa yang mengganjal di hati adalah awal dari kelegaan dan ketenangan jiwa.",
]

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function createAnonymousId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const randomLetters = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * 26)]).join("")
  const randomNumbers = Math.floor(1000 + Math.random() * 9000)
  return `BK-${randomLetters}-${randomNumbers}`
}

function getStoredOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return "BK-UMUM-1000"
  const stored = localStorage.getItem("bk_anon_id")
  if (stored) return stored
  const newId = createAnonymousId()
  localStorage.setItem("bk_anon_id", newId)
  return newId
}

export function ChatInterface() {
  const { user, login, logout, loading: authLoading } = useAuth()
  const router = useRouter()

  // Base anonymous ID (only for unauthenticated guest)
  const [guestAnonId, setGuestAnonId] = useState<string>("")
  const [inputId, setInputId] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)

  // Guru BK list & target selection
  const [guruList, setGuruList] = useState<GuruBK[]>([])
  const [selectedGuruId, setSelectedGuruId] = useState<string>("") // "" = Semua Guru BK

  // Login modal (for guests)
  const [showLogin, setShowLogin] = useState(false)
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])

  const [guruLoading, setGuruLoading] = useState(true)

  // Fetch daftar Guru BK yang terdaftar di sistem
  useEffect(() => {
    let isMounted = true
    async function loadGuruBK() {
      try {
        setGuruLoading(true)
        const res = await fetch("/api/guru/bk", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          if (isMounted) {
            if (Array.isArray(data.guruBK) && data.guruBK.length > 0) {
              setGuruList(data.guruBK)
            } else {
              // Fallback guru BK resmi SMPN 1 Genteng jika respon kosong
              setGuruList([
                { id: "cmuysiyjv001uw1b8yoenlugn", name: "SRI WINARTI, S.Pd", role: "guru", mapel: "Guru BK" },
                { id: "cmuysizrn0020w1b8cvxmzogv", name: "SITI ALVIAH, S.Pd", role: "guru", mapel: "Guru BK" },
                { id: "cmuysizxk0023w1b8n31b7wk4", name: "SUWARNI, S.Pd", role: "guru", mapel: "Guru BK" },
                { id: "cmuysizt60021w1b8h2avlsmm", name: "HERU WARSIDIANTO, S.Kom", role: "guru", mapel: "Guru BK" },
                { id: "cmuysj03l0026w1b89loim3yk", name: "AFIN MASYHURI, S.Pd.I", role: "guru", mapel: "Guru BK" },
              ])
            }
          }
        } else {
          throw new Error("Gagal load API")
        }
      } catch (e) {
        console.error("Gagal mengambil daftar guru BK:", e)
        if (isMounted) {
          setGuruList([
            { id: "cmuysiyjv001uw1b8yoenlugn", name: "SRI WINARTI, S.Pd", role: "guru", mapel: "Guru BK" },
            { id: "cmuysizrn0020w1b8cvxmzogv", name: "SITI ALVIAH, S.Pd", role: "guru", mapel: "Guru BK" },
            { id: "cmuysizxk0023w1b8n31b7wk4", name: "SUWARNI, S.Pd", role: "guru", mapel: "Guru BK" },
            { id: "cmuysizt60021w1b8h2avlsmm", name: "HERU WARSIDIANTO, S.Kom", role: "guru", mapel: "Guru BK" },
            { id: "cmuysj03l0026w1b89loim3yk", name: "AFIN MASYHURI, S.Pd.I", role: "guru", mapel: "Guru BK" },
          ])
        }
      } finally {
        if (isMounted) setGuruLoading(false)
      }
    }
    loadGuruBK()
    return () => {
      isMounted = false
    }
  }, [])

  // Inisialisasi guest ID
  useEffect(() => {
    setGuestAnonId(getStoredOrCreateAnonymousId())
  }, [])

  const isStudent = Boolean(user && user.role === "siswa")

  // Tentukan active thread ID:
  // - Jika siswa LOGIN: SISWA_{userId}_{guruId || 'umum'} (TIDAK PERLU ANONIM, selalu nama asli)
  // - Jika siswa BELUM LOGIN (Tamu): guestAnonId
  const getActiveThreadId = useCallback(() => {
    if (isStudent && user) {
      const targetTag = selectedGuruId ? selectedGuruId : "umum"
      return `SISWA_${user.id}_${targetTag}`
    }
    return guestAnonId || "BK-GUEST-0000"
  }, [isStudent, user, selectedGuruId, guestAnonId])

  const activeThreadId = getActiveThreadId()

  const fetchMessages = useCallback(async (id: string) => {
    if (!id) return
    try {
      const res = await fetch(`/api/chat?id=${encodeURIComponent(id)}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    if (activeThreadId) {
      fetchMessages(activeThreadId)
    }
  }, [activeThreadId, fetchMessages])

  // Polling pesan setiap 3 detik
  useEffect(() => {
    if (!activeThreadId) return
    const interval = setInterval(() => {
      fetchMessages(activeThreadId)
    }, 3000)
    return () => clearInterval(interval)
  }, [activeThreadId, fetchMessages])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function generateNewGuestId() {
    const newId = createAnonymousId()
    setGuestAnonId(newId)
    localStorage.setItem("bk_anon_id", newId)
    setMessages([])
    toast.success("Sesi anonim baru dibuat!")
  }

  async function sendMessage() {
    const text = newMessage.trim()
    if (!text || !activeThreadId) return
    setSending(true)
    try {
      // Siswa login: isAnonymous = false (selalu nama asli)
      // Tamu belum login: isAnonymous = true
      const isAnon = !isStudent

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymousId: activeThreadId,
          message: text,
          targetGuruId: selectedGuruId || null,
          isAnonymous: isAnon,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Gagal mengirim pesan")
      }

      const data = await res.json()
      setMessages((prev) => [...prev, data.message])
      setNewMessage("")
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal mengirim pesan"))
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  async function lookupId() {
    if (!inputId.trim()) return
    const target = inputId.trim()
    setGuestAnonId(target)
    localStorage.setItem("bk_anon_id", target)
    await fetchMessages(target)
    setInputId("")
    toast.success(`Memuat percakapan ID ${target}...`)
  }

  async function copyGuestId() {
    await navigator.clipboard.writeText(activeThreadId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("ID percakapan disalin!")
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true)
    try {
      const loggedInUser = await login(loginUsername, loginPassword)
      setShowLogin(false)
      setLoginUsername("")
      setLoginPassword("")
      if (loggedInUser.role !== "siswa") {
        toast.success("Berhasil masuk!")
        router.push("/admin/dashboard")
        return
      }
      toast.success(`Selamat datang, ${loggedInUser.name}!`)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Login gagal"))
    } finally {
      setLoginLoading(false)
    }
  }

  const selectedGuruObj = guruList.find((g) => g.id === selectedGuruId)
  const hasMessages = messages.length > 0
  const hasGuruReply = messages.some((m) => m.senderRole === "guru" || m.senderRole === "admin")

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-20 md:pb-6">
      {/* 1. HEADER UTAMA */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200">
            <MessageCircleHeart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Curhat & Konseling Siswa</h1>
            <p className="text-xs text-gray-500">Ruang bimbingan konseling resmi SMP Negeri 1 Genteng</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!authLoading && (
            user ? (
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 pl-2 pr-3 py-1.5 ring-1 ring-emerald-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-emerald-800 max-w-[120px] truncate">{user.name}</span>
                  {user.kelas && <span className="text-[10px] text-emerald-600 font-semibold">Kelas {user.kelas}</span>}
                </div>
                <button
                  onClick={async () => {
                    await logout()
                    router.push("/login")
                  }}
                  className="ml-1 text-emerald-500 hover:text-emerald-700 transition-colors"
                  title="Keluar Akun"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
              >
                <LogIn className="h-3.5 w-3.5" /> Masuk Akun Siswa
              </button>
            )
          )}
        </div>
      </div>

      {/* ONLINE STATUS */}
      <div className="flex justify-end">
        <OnlineIndicator minimal />
      </div>

      {/* 2. JIKA SISWA SUDAH LOGIN: IDENTITAS RESMI & PILIH GURU BK TERDAFTAR */}
      {isStudent && user ? (
        <Card className="border border-indigo-100 bg-white p-4 sm:p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900">{user.name}</span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                    Kelas {user.kelas || "-"}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  NISN: <code className="font-semibold text-slate-700">{user.username}</code> · Identitas resmi terverifikasi
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 self-start sm:self-auto flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Curhat dengan Nama Asli
            </span>
          </div>

        </Card>
      ) : (
        /* JIKA SISWA BELUM LOGIN (TAMU) */
        <Card className="overflow-hidden border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                  Mode Tamu Anonim
                </span>
                <code className="text-xs font-bold text-amber-900 bg-white/70 px-2 py-0.5 rounded border border-amber-200">
                  {guestAnonId}
                </code>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Kamu saat ini dalam mode anonim. Kamu tetap bisa memilih Guru BK tujuan di bawah atau masuk dengan akun siswa agar identitasmu (nama dan kelas) otomatis tersambung.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/login?callbackUrl=/curhat")}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs shrink-0"
            >
              <LogIn className="h-4 w-4 mr-1.5" /> Masuk Akun Siswa
            </Button>
          </div>
        </Card>
      )}

      {/* PILIH GURU BK TERDAFTAR (UNTUK SEMUA PENGGUNA: SISWA & TAMU) */}
      <Card className="border border-indigo-100/80 bg-white p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-indigo-600" />
            Pilih Guru BK Tujuan Curhat / Konseling:
          </Label>
          <span className="text-[11px] font-semibold text-slate-500">
            {guruList.length} Guru BK Terdaftar
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedGuruId}
            onChange={(e) => setSelectedGuruId(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs font-semibold text-slate-800 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
          >
            <option value="">🌟 Semua Guru BK (Ruang Bimbingan Konseling Umum)</option>
            {guruList.map((g) => (
              <option key={g.id} value={g.id}>
                👩‍🏫 {g.name} {g.mapel ? `· ${g.mapel}` : "· Guru BK"}
              </option>
            ))}
          </select>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          {selectedGuruObj
            ? `Pesanmu akan ditujukan khusus ke ${selectedGuruObj.name}. Hanya beliau dan Anda yang berada di sesi konseling ini.`
            : "Pesanmu akan masuk ke Ruang BK Umum dan dapat dibaca serta dibalas oleh seluruh Tim Guru BK SMPN 1 Genteng."}
        </p>
      </Card>

      {/* JIKA TAMU: KOTAK BANTUAN ID ANONIM & CARI SESI */}
      {!isStudent && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Punya kode sesi anonim sebelumnya? Masukkan di sini..."
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              className="pl-9 rounded-xl border-gray-200 text-xs"
            />
          </div>
          <Button variant="outline" size="sm" onClick={lookupId} className="gap-1.5 shrink-0 rounded-xl text-xs">
            <Key className="h-3.5 w-3.5" /> Buka Obrolan
          </Button>
        </div>
      )}

      {/* 3. CHAT AREA */}
      <Card className="border border-slate-200/80 shadow-sm overflow-hidden rounded-2xl bg-white">
        {/* CHAT BANNER HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs">
              {selectedGuruObj ? selectedGuruObj.name.charAt(0) : "BK"}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {selectedGuruObj ? selectedGuruObj.name : "Ruang Bimbingan Konseling Umum"}
              </p>
              <p className="text-[10px] text-slate-500">
                {selectedGuruObj
                  ? selectedGuruObj.mapel || "Guru Bimbingan Konseling Terdaftar"
                  : "Ditujukan ke seluruh Tim Konselor BK"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isStudent && user ? (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 text-[10px] font-bold">
                👤 {user.name} ({user.kelas || "Siswa"})
              </Badge>
            ) : (
              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-0 text-[10px]">
                🕵️ Tamu Anonim
              </Badge>
            )}
          </div>
        </div>

        <ScrollArea className="h-[50vh] sm:h-[420px]">
          <div className="p-4">
            {!hasMessages ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-purple-50 text-violet-600 shadow-inner">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h2 className="text-base font-bold text-gray-800">
                  {selectedGuruObj ? `Mulai Curhat dengan ${selectedGuruObj.name}` : "Mulai Curhat dengan Guru BK"}
                </h2>
                <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-gray-500">
                  {quote}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 max-w-lg w-full">
                  {suggestedTopics.map((topic) => (
                    <button
                      key={topic.label}
                      onClick={() => {
                        setNewMessage(`Halo, saya ingin bercerita tentang ${topic.label.toLowerCase()}...`)
                        inputRef.current?.focus()
                      }}
                      className={`flex items-center gap-1.5 rounded-xl ${topic.bg} p-2 text-xs font-semibold text-gray-700 transition-all hover:shadow-xs hover:scale-[1.01]`}
                    >
                      <topic.icon className={`h-3.5 w-3.5 ${topic.color} shrink-0`} />
                      <span className="text-left leading-tight truncate">{topic.label}</span>
                    </button>
                  ))}
                </div>

                <p className="mt-5 text-[11px] text-gray-400">
                  Ketik pesan di bawah atau pilih salah satu topik di atas untuk memulai
                </p>
              </motion.div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isFromStudent = msg.senderRole === "siswa"
                  const displayName = isFromStudent
                    ? (msg.senderName
                        ? `${msg.senderName} (${msg.senderKelas || "Siswa"})`
                        : (user ? `${user.name} (${user.kelas || "Siswa"})` : "Tamu Anonim"))
                    : (msg.senderName ? `Guru BK: ${msg.senderName}` : "Guru BK")

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-3.5 flex ${isFromStudent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          isFromStudent
                            ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-md shadow-sm"
                            : "bg-slate-100 text-slate-800 rounded-bl-md border border-slate-200/60"
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                          {renderMessage(msg.message)}
                        </div>
                        <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] ${
                          isFromStudent ? "text-violet-200" : "text-slate-500"
                        }`}>
                          <span className="font-semibold">{displayName}</span>
                          <span>·</span>
                          <span>{formatTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                {hasGuruReply && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center my-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                      <CheckCheck className="h-3.5 w-3.5" /> Guru BK telah merespons percakapan ini
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </Card>

      {/* 4. INPUT AREA */}
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            ref={inputRef}
            placeholder={
              selectedGuruObj
                ? `Tulis pesan untuk ${selectedGuruObj.name}...`
                : "Ceritakan apa yang sedang kamu rasakan..."
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[64px] resize-none pr-12 rounded-2xl bg-white border-slate-200 focus:border-indigo-500 text-sm"
            rows={2}
          />
          <span className="absolute bottom-3 right-3 text-[10px] text-gray-400">
            {newMessage.length} / 2000
          </span>
        </div>
        <Button
          onClick={sendMessage}
          disabled={sending || !newMessage.trim()}
          className="h-[64px] w-[64px] shrink-0 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md transition-all disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* BANTUAN DARURAT */}
      <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 p-3.5 border border-amber-200/70">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <p className="text-xs font-bold text-amber-900">Butuh Bantuan Darurat?</p>
          <p className="text-xs text-amber-800 leading-relaxed">
            Jika kamu mengalami situasi krisis yang mendesak, temui Guru BK secara langsung di ruang BK SMPN 1 Genteng atau hubungi hotline darurat kesehatan mental Kemenkes RI di <strong>119 ext 8</strong>.
          </p>
        </div>
      </div>

      {/* LOGIN SISWA MODAL (UNTUK PENGGUNA BELUM LOGIN) */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <LogIn className="h-4 w-4" />
              </div>
              Masuk Akun Siswa
            </DialogTitle>
            <DialogDescription className="text-xs">
              Masuk dengan akun siswa untuk curhat menggunakan nama aslimu dan memilih Guru BK terdaftar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="login-username" className="text-xs font-semibold">Username / NISN</Label>
              <Input
                id="login-username"
                type="text"
                placeholder="Masukkan NISN atau username siswa"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-xs font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="rounded-xl text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              disabled={loginLoading}
            >
              {loginLoading ? "Memproses..." : "Masuk Sekarang"}
            </Button>
            <p className="text-center text-xs text-gray-500">
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => { setShowLogin(false); router.push("/register") }}
                className="font-bold text-indigo-600 hover:underline"
              >
                Daftar Akun Baru
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function renderMessage(text: string) {
  const urlRegex = /(https?:\/\/[^\s<]+)/g
  const parts: { type: "text" | "img" | "video" | "youtube" | "link"; content: string }[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ type: "text", content: text.slice(lastIndex, match.index) })

    const url = match[1]
    const lower = url.toLowerCase()

    if (/\.(jpg|jpeg|png|gif|webp)(\?|#|$)/i.test(lower)) {
      parts.push({ type: "img", content: url })
    } else if (/\.mp4(\?|#|$)/i.test(lower)) {
      parts.push({ type: "video", content: url })
    } else if (/youtube\.com\/watch\?v=/.test(lower) || /youtu\.be\//.test(lower)) {
      const ytId = lower.includes("youtu.be")
        ? url.split("youtu.be/")[1]?.split(/[?#]/)[0]
        : new URL(url).searchParams.get("v")
      if (ytId) parts.push({ type: "youtube", content: ytId })
      else parts.push({ type: "link", content: url })
    } else {
      parts.push({ type: "link", content: url })
    }
    lastIndex = urlRegex.lastIndex
  }

  if (lastIndex < text.length) parts.push({ type: "text", content: text.slice(lastIndex) })

  return parts.map((part, i) => {
    switch (part.type) {
      case "img":
        return (
          <a
            key={i}
            href={part.content}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-1.5 rounded-xl overflow-hidden border border-white/20 shadow-xs"
          >
            <img
              src={part.content}
              alt="Gambar terlampir"
              className="max-h-64 w-full object-cover"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
            />
          </a>
        )
      case "video":
        return (
          <video
            key={i}
            controls
            className="w-full max-h-64 mt-1.5 rounded-xl border border-white/20 shadow-xs"
            onError={(e) => { (e.target as HTMLVideoElement).style.display = "none" }}
          >
            <source src={part.content} type="video/mp4" />
          </video>
        )
      case "youtube":
        return (
          <div key={i} className="relative w-full mt-1.5 rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={`https://www.youtube.com/embed/${part.content}`}
              title="YouTube video"
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      case "link":
        return (
          <a
            key={i}
            href={part.content}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 break-all opacity-90 hover:opacity-100"
          >
            {part.content}
          </a>
        )
      default:
        return <span key={i} className="break-words">{part.content}</span>
    }
  })
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const hours = Math.floor(diff / 3600000)

  if (hours < 24) {
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  }
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}
