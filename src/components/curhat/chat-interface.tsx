"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Send, Key, Copy, Check, RefreshCw, MessageCircleHeart, Shield,
  LogIn, LogOut, User, Sparkles, Smile, Frown, Heart, Brain,
  Lightbulb, BookOpen, ChevronRight, Eye, EyeOff, CheckCheck,
  Save, Trash2, Link
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
  createdAt: string
}

const suggestedTopics = [
  { icon: Heart, label: "Patah hati", color: "text-rose-500", bg: "bg-rose-50" },
  { icon: Brain, label: "Stres belajar", color: "text-amber-500", bg: "bg-amber-50" },
  { icon: Smile, label: "Percaya diri", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: Frown, label: "Cemas", color: "text-violet-500", bg: "bg-violet-50" },
  { icon: Lightbulb, label: "Bingung masa depan", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: BookOpen, label: "Masalah pertemanan", color: "text-indigo-500", bg: "bg-indigo-50" },
]

const quotes = [
  "Kamu berani curhat, itu langkah besar. Kami di sini untukmu.",
  "Tidak ada cerita yang salah. Semua yang kamu rasa itu valid.",
  "Kamu tidak sendiri. Banyak yang merasakan hal yang sama.",
  "Bicara itu obat. Yuk, ceritakan apa yang kamu rasakan.",
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
  const stored = localStorage.getItem("bk_anon_id")
  if (stored) return stored
  const newId = createAnonymousId()
  localStorage.setItem("bk_anon_id", newId)
  return newId
}

export function ChatInterface() {
  const { user, login, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [anonymousId, setAnonymousId] = useState<string>("")
  const [inputId, setInputId] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])

  useEffect(() => {
    setAnonymousId(getStoredOrCreateAnonymousId())
  }, [])

  useEffect(() => {
    if (anonymousId) fetchMessages(anonymousId)
  }, [anonymousId])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function generateNewId() {
    const newId = createAnonymousId()
    setAnonymousId(newId)
    localStorage.setItem("bk_anon_id", newId)
    setMessages([])
    toast.success("ID anonim baru dibuat!")
  }

  async function fetchMessages(id: string) {
    try {
      const res = await fetch(`/api/chat?id=${encodeURIComponent(id)}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch {
      // silent
    }
  }

  async function sendMessage() {
    const text = newMessage.trim()
    if (!text || !anonymousId) return
    setSending(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymousId,
          message: text,
          senderRole: "siswa",
          userId: user?.id || null,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages((prev) => [...prev, data.message])
      setNewMessage("")
    } catch {
      toast.error("Gagal mengirim pesan")
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
    setAnonymousId(inputId)
    localStorage.setItem("bk_anon_id", inputId)
    await fetchMessages(inputId)
    setInputId("")
    toast.success("Memuat percakapan...")
  }

  async function copyId() {
    await navigator.clipboard.writeText(anonymousId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
    if (!user || !anonymousId) return
    try {
      const res = await fetch("/api/user/anonymous-id", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, anonymousId }),
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

  const savedAnonymousId = user?.anonymousId || null
  const isIdSaved = savedAnonymousId === anonymousId

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
      toast.success("Berhasil masuk sebagai siswa!")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Login gagal"))
    } finally {
      setLoginLoading(false)
    }
  }

  const hasMessages = messages.length > 0
  const hasGuruReply = messages.some((m) => m.senderRole === "guru")

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
            <MessageCircleHeart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Curhat Anonim</h1>
            <p className="text-xs text-gray-500">Cerita tanpa beban • 100% anonim</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!authLoading && (
            user ? (
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 pl-2 pr-3 py-1.5 ring-1 ring-emerald-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-medium text-emerald-700 max-w-[100px] truncate">{user.name}</span>
                <button onClick={logout} className="ml-1 text-emerald-400 hover:text-emerald-600 transition-colors">
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowLogin(true)}
                className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800">
                <LogIn className="h-3.5 w-3.5" /> Login Siswa
              </button>
            )
          )}
        </div>
      </div>

      {/* ONLINE STATUS */}
      <div className="flex justify-end">
        <OnlineIndicator minimal />
      </div>

      {/* ID BANNER */}
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg">
        <div className="relative p-4 sm:p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-white/5" />
          <div className="relative flex flex-wrap items-center gap-2 sm:gap-3">
            <Shield className="h-5 w-5 text-violet-200 shrink-0" />
            <span className="text-sm font-medium text-violet-100">ID Anonim:</span>
            <code className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-bold tracking-wide text-white backdrop-blur">
              {anonymousId}
            </code>
            <div className="flex gap-1">
              <button onClick={copyId}
                className="rounded-lg bg-white/10 p-1.5 text-violet-200 transition-colors hover:bg-white/20">
                {copied ? <Check className="h-4 w-4 text-green-300" /> : <Copy className="h-4 w-4" />}
              </button>
              <button onClick={generateNewId}
                className="rounded-lg bg-white/10 p-1.5 text-violet-200 transition-colors hover:bg-white/20">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-violet-200 sm:ml-8">
            Simpan ID ini! Guru BK hanya melihat ID, bukan nama atau kelasmu.
          </p>
          {user && (
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:ml-8">
              {isIdSaved ? (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">
                    <Check className="h-3 w-3" /> Tersimpan di akun
                  </span>
                  <button onClick={removeAnonymousId}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-violet-200 transition-colors hover:bg-red-500/30 hover:text-red-200">
                    <Trash2 className="h-3 w-3" /> Hapus
                  </button>
                </>
              ) : savedAnonymousId ? (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-200">
                    <Link className="h-3 w-3" /> ID akun: {savedAnonymousId}
                  </span>
                  <button onClick={saveAnonymousId}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-violet-200 transition-colors hover:bg-white/20">
                    <Save className="h-3 w-3" /> Ganti ke ID ini
                  </button>
                  <button onClick={removeAnonymousId}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-violet-200 transition-colors hover:bg-red-500/30 hover:text-red-200">
                    <Trash2 className="h-3 w-3" /> Hapus
                  </button>
                </>
              ) : (
                <button onClick={saveAnonymousId}
                  className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/25">
                  <Save className="h-3 w-3" /> Simpan ID ke akun
                </button>
              )}
            </div>
          )}
        </div>
      </Card>

      {!user && !authLoading && (
        <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 p-3 ring-1 ring-blue-200/60">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div>
            <p className="text-xs font-medium text-blue-900">Akses tanpa login hanya untuk Curhat Online</p>
            <p className="text-xs text-blue-800">
              Jika ingin membuka asesmen minat bakat, psikologi, gaya belajar, atau karakter diri, silakan masuk
              terlebih dahulu.
            </p>
          </div>
        </div>
      )}

      {/* SEARCH ID */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari percakapan via ID..."
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={lookupId} className="gap-2 shrink-0">
          <Key className="h-4 w-4" /> Cari
        </Button>
      </div>

      {/* CHAT AREA */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <ScrollArea className="h-[420px]">
          <div className="p-4">
            {!hasMessages ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-50">
                  <Sparkles className="h-10 w-10 text-violet-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Mulai Curhat</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
                  {quote}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {suggestedTopics.map((topic) => (
                    <button
                      key={topic.label}
                      onClick={() => {
                        setNewMessage(`Aku ingin cerita tentang ${topic.label.toLowerCase()}...`)
                        inputRef.current?.focus()
                      }}
                      className={`flex items-center gap-2 rounded-xl ${topic.bg} px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:shadow-sm hover:scale-[1.02]`}
                    >
                      <topic.icon className={`h-4 w-4 ${topic.color} shrink-0`} />
                      <span className="text-left leading-tight">{topic.label}</span>
                      <ChevronRight className={`h-3 w-3 ${topic.color} ml-auto shrink-0`} />
                    </button>
                  ))}
                </div>

                <p className="mt-6 text-xs text-gray-400">
                  Ketik pesan di bawah atau pilih topik di atas
                </p>
              </motion.div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-3 flex ${msg.senderRole === "siswa" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        msg.senderRole === "siswa"
                          ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-md shadow-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                      }`}
                    >
                                            <div className={`text-sm whitespace-pre-wrap leading-relaxed [&>a:first-child]:mt-0 [&>div:first-child]:mt-0`}>{renderMessage(msg.message)}</div>
                      <p className={`mt-1 text-[10px] ${msg.senderRole === "siswa" ? "text-violet-200" : "text-gray-400"}`}>
                        {msg.senderRole === "siswa" ? "Kamu" : "Guru BK"} <span className="mx-1">·</span>{" "}
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {hasGuruReply && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex justify-center">
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-medium text-emerald-600 border border-emerald-200">
                      <CheckCheck className="h-3 w-3" /> Guru BK telah membalas
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
            placeholder="Ceritakan apa yang kamu rasakan..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] resize-none pr-12 rounded-2xl bg-gray-50 border-gray-200 focus:bg-white"
            rows={2}
          />
          <span className="absolute bottom-3 right-3 text-[10px] text-gray-300">
            {newMessage.length}
          </span>
        </div>
        <Button
          onClick={sendMessage}
          disabled={sending || !newMessage.trim()}
          className="h-[60px] w-[60px] shrink-0 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md transition-all disabled:opacity-50 disabled:shadow-none"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* EMERGENCY */}
      <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200/50">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <p className="text-xs font-medium text-amber-800">Butuh bantuan darurat?</p>
          <p className="text-xs text-amber-700">
            Hubungi guru BK langsung atau hubungi hotline kesehatan mental Kemenkes di <strong>119 ext 8</strong>.
          </p>
        </div>
      </div>

      {/* LOGIN DIALOG */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                <LogIn className="h-4 w-4 text-indigo-600" />
              </div>
              Login Siswa
            </DialogTitle>
            <DialogDescription>
              Masuk dengan akun siswa untuk melacak percakapanmu. Identitasmu tetap anonim di mata Guru BK.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-username">Username</Label>
              <Input
                id="login-username"
                type="text"
                placeholder="Masukkan username siswa"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loginLoading}>
              {loginLoading ? "Memproses..." : "Masuk"}
            </Button>
            <p className="text-center text-xs text-gray-400">
              Belum punya akun?{" "}
              <button type="button" onClick={() => { setShowLogin(false); router.push("/register") }}
                className="font-medium text-indigo-600 hover:text-indigo-700">
                Daftar di sini
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
          <a key={i} href={part.content} target="_blank" rel="noopener noreferrer"
            className="block mt-1 rounded-lg overflow-hidden border border-gray-200">
            <img src={part.content} alt="Gambar" className="max-h-64 w-full object-cover" loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
          </a>
        )
      case "video":
        return (
          <video key={i} controls className="w-full max-h-64 mt-1 rounded-lg border border-gray-200"
            onError={(e) => { (e.target as HTMLVideoElement).style.display = "none" }}>
            <source src={part.content} type="video/mp4" />
          </video>
        )
      case "youtube":
        return (
          <div key={i} className="relative w-full mt-1" style={{ paddingBottom: "56.25%" }}>
            <iframe src={`https://www.youtube.com/embed/${part.content}`} title="YouTube video"
              className="absolute inset-0 w-full h-full rounded-lg border border-gray-200"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        )
      case "link":
        return (
          <a key={i} href={part.content} target="_blank" rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-700 break-all">{part.content}</a>
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
