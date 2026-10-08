"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Send, Key, Copy, Check, RefreshCw, MessageCircleHeart, Shield,
  LogIn, LogOut, User, Sparkles, Smile, Frown, Heart, Brain,
  Lightbulb, BookOpen, ChevronRight, Eye, EyeOff, CheckCheck,
  Save, Trash2, Link as LinkIcon, Users, UserCheck, ShieldCheck,
  Sparkle, Info
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
  { icon: Heart, label: "Patah hati / Percintaan", color: "text-rose-500", bg: "bg-rose-50" },
  { icon: Brain, label: "Stres & Tekanan Belajar", color: "text-amber-500", bg: "bg-amber-50" },
  { icon: Smile, label: "Percaya Diri & Mental", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: Frown, label: "Cemas & Ketakutan", color: "text-violet-500", bg: "bg-violet-50" },
  { icon: Lightbulb, label: "Bingung Cita-Cita / Masa Depan", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: BookOpen, label: "Masalah Pertemanan / Bullying", color: "text-indigo-500", bg: "bg-indigo-50" },
]

const quotes = [
  "Kamu berani curhat, itu langkah besar. Guru BK selalu siap mendengarkan tanpa menghakimi.",
  "Tidak ada cerita yang salah. Semua yang kamu rasakan itu penting dan valid.",
  "Kamu tidak sendirian. Setiap masalah pasti ada jalan keluarnya bersama.",
  "Bicara itu obat yang menenangkan jiwa. Yuk, ceritakan apa yang mengganjal di hatimu.",
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

  // Base anonymous ID (for guest or stored)
  const [baseAnonId, setBaseAnonId] = useState<string>("")
  const [inputId, setInputId] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)

  // Guru BK list & target selection
  const [guruList, setGuruList] = useState<GuruBK[]>([])
  const [selectedGuruId, setSelectedGuruId] = useState<string>("") // "" = Semua Guru BK

  // Identity mode for logged in student: "nama" | "anonim"
  const [identityMode, setIdentityMode] = useState<"nama" | "anonim">("nama")

  // Login modal
  const [showLogin, setShowLogin] = useState(false)
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])

  // Fetch daftar Guru BK
  useEffect(() => {
    async function loadGuruBK() {
      try {
        const res = await fetch("/api/guru/bk")
        if (res.ok) {
          const data = await res.json()
          setGuruList(data.guruBK || [])
        }
      } catch (e) {
        console.error("Gagal mengambil daftar guru BK:", e)
      }
    }
    loadGuruBK()
  }, [])

  // Inisialisasi anonymousId dasar
  useEffect(() => {
    setBaseAnonId(getStoredOrCreateAnonymousId())
  }, [])

  // Tentukan active thread ID
  // Jika siswa login:
  // - Mode nama: SISWA_{userId}_{guruId || 'umum'}
  // - Mode anonim: ANON_{userId.slice(-6)}_{guruId || 'umum'}
  // Jika belum login:
  // - baseAnonId
  const getActiveThreadId = useCallback(() => {
    if (!user || user.role !== "siswa") {
      return baseAnonId || "BK-GUEST-0000"
    }
    const targetTag = selectedGuruId ? selectedGuruId : "umum"
    if (identityMode === "nama") {
      return `SISWA_${user.id}_${targetTag}`
    } else {
      const anonCode = user.anonymousId || baseAnonId || `USER_${user.id.slice(-6)}`
      return selectedGuruId ? `${anonCode}_${targetTag}` : anonCode
    }
  }, [user, identityMode, selectedGuruId, baseAnonId])

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

  function generateNewId() {
    const newId = createAnonymousId()
    setBaseAnonId(newId)
    localStorage.setItem("bk_anon_id", newId)
    setMessages([])
    toast.success("ID anonim baru dibuat!")
  }

  async function sendMessage() {
    const text = newMessage.trim()
    if (!text || !activeThreadId) return
    setSending(true)
    try {
      const isAnon = user && user.role === "siswa" ? identityMode === "anonim" : true
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
    setBaseAnonId(target)
    localStorage.setItem("bk_anon_id", target)
    await fetchMessages(target)
    setInputId("")
    toast.success(`Memuat percakapan ID ${target}...`)
  }

  async function copyId() {
    await navigator.clipboard.writeText(activeThreadId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("ID percakapan disalin!")
  }

  function updateStoredUser(updates: Record<string, unknown>) {
    const stored = localStorage.getItem("bk_user")
    if (!stored) return
    try {
      const current = JSON.parse(stored)
      const updated = { ...current, ...updates }
      localStorage.setItem("bk_user", JSON.stringify(updated))
      window.dispatchEvent(new Event("bk-auth-change"))
    } catch { /* silent */ }
  }

  async function saveAnonymousId() {
    if (!user || !baseAnonId) return
    try {
      const res = await fetch("/api/user/anonymous-id", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, anonymousId: baseAnonId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Gagal menyimpan")
      }
      const data = await res.json()
      updateStoredUser({ anonymousId: data.user.anonymousId })
      toast.success("ID anonim tersimpan di akun!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan")
    }
  }

  async function removeAnonymousId() {
    if (!user) return
    try {
      const res = await fetch("/api/user/anonymous-id", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })
      if (!res.ok) throw new Error()
      updateStoredUser({ anonymousId: null })
      toast.success("ID anonim dihapus dari akun")
    } catch {
      toast.error("Gagal menghapus")
    }
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
  const isStudent = user && user.role === "siswa"

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-20 md:pb-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200">
            <MessageCircleHeart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Curhat & Konseling BK</h1>
            <p className="text-xs text-gray-500">Ruang aman untuk berbagi cerita & bimbingan</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!authLoading && (
            user ? (
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 pl-2 pr-3 py-1.5 ring-1 ring-emerald-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-emerald-800 max-w-[120px] truncate">{user.name}</span>
                  {user.kelas && <span className="text-[10px] text-emerald-600">Kelas {user.kelas}</span>}
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

      {/* JIKA SISWA SUDAH LOGIN: KONTROL PILIH GURU BK & MODE IDENTITAS */}
      {isStudent ? (
        <Card className="border border-indigo-100 bg-white p-4 sm:p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Pengaturan Konseling Kamu</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
              Akun Siswa Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PILIH GURU BK */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-indigo-600" />
                Pilih Guru BK Tujuan Curhat:
              </Label>
              <select
                value={selectedGuruId}
                onChange={(e) => setSelectedGuruId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/70 p-2.5 text-xs font-medium text-gray-800 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                <option value="">🌟 Semua Guru BK (Bimbingan Konseling Umum)</option>
                {guruList.map((g) => (
                  <option key={g.id} value={g.id}>
                    👩‍🏫 {g.name} {g.mapel ? `(${g.mapel})` : "(Guru BK)"}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400">
                {selectedGuruObj
                  ? `Pesanmu akan ditujukan khusus ke ${selectedGuruObj.name}.`
                  : "Pesanmu akan masuk ke ruang BK umum dan dapat dibalas oleh semua Guru BK."}
              </p>
            </div>

            {/* PILIH MODE IDENTITAS (ANONIM ATAU NAMA ASLI) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                Pilih Mode Identitas Siswa:
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIdentityMode("nama")}
                  className={`flex flex-col items-start gap-1 rounded-xl p-2.5 text-left border transition-all ${
                    identityMode === "nama"
                      ? "border-emerald-500 bg-emerald-50/70 text-emerald-900 shadow-xs ring-1 ring-emerald-500"
                      : "border-gray-200 bg-gray-50/60 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Nama Asli
                    </span>
                    {identityMode === "nama" && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                  </div>
                  <span className="text-[10px] text-gray-500 line-clamp-1">
                    {user.name} ({user.kelas || "Siswa"})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIdentityMode("anonim")}
                  className={`flex flex-col items-start gap-1 rounded-xl p-2.5 text-left border transition-all ${
                    identityMode === "anonim"
                      ? "border-violet-500 bg-violet-50/70 text-violet-900 shadow-xs ring-1 ring-violet-500"
                      : "border-gray-200 bg-gray-50/60 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-violet-600" /> Mode Anonim
                    </span>
                    {identityMode === "anonim" && <Check className="h-3.5 w-3.5 text-violet-600" />}
                  </div>
                  <span className="text-[10px] text-gray-500">
                    100% Rahasia (Tanpa Nama)
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                {identityMode === "nama"
                  ? "Guru BK akan melihat nama dan kelasmu untuk bimbingan langsung."
                  : "Identitasmu disamarkan sepenuhnya. Guru BK hanya melihat ID percakapan."}
              </p>
            </div>
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
                  {baseAnonId}
                </code>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Kamu saat ini curhat sebagai tamu anonim umum. Ingin <strong>memilih Guru BK favorit</strong> atau curhat menggunakan <strong>nama aslimu</strong>?
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

      {/* ID BANNER INFO UNTUK PENYIMPANAN / TRACKING */}
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md">
        <div className="relative p-4 sm:p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-white/5" />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Shield className="h-5 w-5 text-violet-200 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-violet-100">Kode Sesi Percakapan:</span>
              <code className="rounded-lg bg-white/15 px-3 py-1.5 text-xs sm:text-sm font-bold tracking-wide text-white backdrop-blur">
                {activeThreadId}
              </code>
              <div className="flex gap-1">
                <button
                  onClick={copyId}
                  title="Salin Kode Percakapan"
                  className="rounded-lg bg-white/10 p-1.5 text-violet-200 transition-colors hover:bg-white/20"
                >
                  {copied ? <Check className="h-4 w-4 text-green-300" /> : <Copy className="h-4 w-4" />}
                </button>
                {!user && (
                  <button
                    onClick={generateNewId}
                    title="Buat Sesi Baru"
                    className="rounded-lg bg-white/10 p-1.5 text-violet-200 transition-colors hover:bg-white/20"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="text-right">
              {isStudent && identityMode === "nama" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11px] font-bold text-emerald-100 border border-emerald-300/30">
                  <UserCheck className="h-3 w-3" /> Identitas Terbuka
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-400/20 px-2.5 py-1 text-[11px] font-bold text-violet-100 border border-violet-300/30">
                  <Shield className="h-3 w-3" /> 100% Rahasia Anonim
                </span>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-violet-200">
            {isStudent && identityMode === "nama"
              ? `Tersambung sebagai ${user.name} (Kelas ${user.kelas || "-"}). Kamu dapat membuka kembali obrolan ini kapan saja.`
              : "Simpan kode ini jika ingin membuka obrolan ini kembali dari perangkat lain."}
          </p>
        </div>
      </Card>

      {/* PENCARIAN SESI VIA ID */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Punya kode sesi lain? Masukkan di sini..."
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            className="pl-9 rounded-xl border-gray-200 text-xs"
          />
        </div>
        <Button variant="outline" size="sm" onClick={lookupId} className="gap-1.5 shrink-0 rounded-xl text-xs">
          <Key className="h-3.5 w-3.5" /> Buka Obrolan
        </Button>
      </div>

      {/* CHAT AREA */}
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
                  ? selectedGuruObj.mapel || "Guru Bimbingan Konseling"
                  : "Ditujukan ke seluruh Tim Konselor BK"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isStudent && identityMode === "nama" ? (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 text-[10px]">
                👤 {user.name.split(" ")[0]} ({user.kelas || "-"})
              </Badge>
            ) : (
              <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100 border-0 text-[10px]">
                🕵️ Anonim
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
                        setNewMessage(`Halo, aku ingin bercerita tentang ${topic.label.toLowerCase()}...`)
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
                    ? (msg.isAnonymous === false && msg.senderName
                        ? `${msg.senderName} (${msg.senderKelas || "Siswa"})`
                        : "Kamu (Anonim)")
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

      {/* INPUT AREA */}
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            ref={inputRef}
            placeholder={
              selectedGuruObj
                ? `Tulis pesanmu untuk ${selectedGuruObj.name}...`
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
            Jika kamu mengalami situasi krisis yang mengancam keselamatan diri atau orang lain, temui Guru BK secara langsung di ruang BK SMPN 1 Genteng atau hubungi hotline darurat kesehatan mental Kemenkes RI di <strong>119 ext 8</strong>.
          </p>
        </div>
      </div>

      {/* LOGIN SISWA MODAL */}
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
              Masuk dengan akun siswa untuk memilih Guru BK favoritmu dan memilih curhat dengan nama asli atau anonim.
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
