"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import {
  MessageCircleHeart, Send, Mail, Search, CheckCircle2, Clock,
  UserCheck, Shield, Users, Filter, CheckCheck, Sparkles, ArrowLeft
} from "lucide-react"
import { OnlineIndicator } from "@/components/online-indicator"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"

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
  user?: { id: string; name: string; kelas?: string; email?: string; role?: string } | null
  createdAt: string
}

interface ConversationSummary {
  id: string
  count: number
  hasReply: boolean
  lastMessage: ChatMessage
  isAnonymous: boolean
  studentName: string | null
  studentKelas: string | null
  targetGuru: { id: string; name: string; role: string; mapel?: string | null } | null
}

export default function AdminCurhatPage() {
  const { user: authUser } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"semua" | "saya" | "nama" | "anonim">("semua")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAllMessages()
  }, [])

  useEffect(() => {
    const interval = setInterval(fetchAllMessages, 3000)
    return () => clearInterval(interval)
  }, [])

  async function fetchAllMessages() {
    try {
      const res = await fetch("/api/chat")
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (e) {
      console.error("Gagal memuat pesan curhat:", e)
    }
  }

  // Ringkasan per percakapan (diklasifikasi berdasarkan anonymousId)
  const conversations = useMemo<ConversationSummary[]>(() => {
    const map = new Map<string, ChatMessage[]>()
    for (const msg of messages) {
      const list = map.get(msg.anonymousId) || []
      list.push(msg)
      map.set(msg.anonymousId, list)
    }

    const summaries: ConversationSummary[] = []
    map.forEach((convMessages, id) => {
      // Urutkan dari terlama ke terbaru
      const sorted = [...convMessages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      const last = sorted[sorted.length - 1]
      const hasReply = sorted.some((m) => m.senderRole === "guru" || m.senderRole === "admin")

      // Cek apakah ada pesan siswa dengan identitas terbuka
      const studentMsgWithRealName = sorted.find(
        (m) => m.senderRole === "siswa" && m.isAnonymous === false && (m.senderName || m.user?.name)
      )

      const isAnonymous = !studentMsgWithRealName
      const studentName = studentMsgWithRealName
        ? (studentMsgWithRealName.senderName || studentMsgWithRealName.user?.name || null)
        : null
      const studentKelas = studentMsgWithRealName
        ? (studentMsgWithRealName.senderKelas || studentMsgWithRealName.user?.kelas || null)
        : null

      // Target Guru
      const targetGuru = sorted.find((m) => m.targetGuru)?.targetGuru || null

      summaries.push({
        id,
        count: convMessages.length,
        hasReply,
        lastMessage: last,
        isAnonymous,
        studentName,
        studentKelas,
        targetGuru,
      })
    })

    // Urutkan percakapan berdasarkan waktu pesan terakhir (terbaru di atas)
    return summaries.sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    )
  }, [messages])

  // Filter percakapan berdasarkan tab dan pencarian
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // Tab filter
      if (activeTab === "saya") {
        if (!authUser) return true
        const isTargetedToMe = conv.targetGuru?.id === authUser.id
        const isGeneral = !conv.targetGuru
        if (!isTargetedToMe && !isGeneral) return false
      } else if (activeTab === "nama") {
        if (conv.isAnonymous) return false
      } else if (activeTab === "anonim") {
        if (!conv.isAnonymous) return false
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchId = conv.id.toLowerCase().includes(query)
        const matchName = conv.studentName ? conv.studentName.toLowerCase().includes(query) : false
        const matchKelas = conv.studentKelas ? conv.studentKelas.toLowerCase().includes(query) : false
        const matchGuru = conv.targetGuru ? conv.targetGuru.name.toLowerCase().includes(query) : false
        const matchMsg = conv.lastMessage.message.toLowerCase().includes(query)
        if (!matchId && !matchName && !matchKelas && !matchGuru && !matchMsg) {
          return false
        }
      }

      return true
    })
  }, [conversations, activeTab, searchQuery, authUser])

  // Pesan untuk percakapan yang sedang dipilih
  const currentMessages = useMemo(() => {
    if (!selectedId) return []
    return messages
      .filter((m) => m.anonymousId === selectedId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [messages, selectedId])

  const selectedConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedId) || null
  }, [conversations, selectedId])

  async function sendReply() {
    if (!replyText.trim() || !selectedId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/chat/${encodeURIComponent(selectedId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages((prev) => [...prev, data.message])
      setReplyText("")
      toast.success("Balasan konseling terkirim!")
    } catch {
      toast.error("Gagal mengirim balasan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-200">
            <MessageCircleHeart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Kelola Curhat & Konseling</h1>
            <p className="text-xs text-gray-500">
              Daftar sesi curhat masuk dari siswa (dengan nama asli maupun anonim)
            </p>
          </div>
        </div>
        <OnlineIndicator minimal />
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xs">
        <button
          onClick={() => setActiveTab("semua")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            activeTab === "semua"
              ? "bg-violet-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Semua Sesi
          <Badge variant="secondary" className={`ml-1 text-[10px] px-1.5 py-0 ${activeTab === "semua" ? "bg-white/20 text-white" : ""}`}>
            {conversations.length}
          </Badge>
        </button>

        {authUser?.role === "guru" && (
          <button
            onClick={() => setActiveTab("saya")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "saya"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            🎯 Khusus Untuk Saya
            <Badge variant="secondary" className={`ml-1 text-[10px] px-1.5 py-0 ${activeTab === "saya" ? "bg-white/20 text-white" : ""}`}>
              {conversations.filter((c) => c.targetGuru?.id === authUser.id || !c.targetGuru).length}
            </Badge>
          </button>
        )}

        <button
          onClick={() => setActiveTab("nama")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            activeTab === "nama"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-emerald-700 hover:bg-emerald-50"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" /> Nama Asli
          <Badge variant="secondary" className={`ml-1 text-[10px] px-1.5 py-0 ${activeTab === "nama" ? "bg-white/20 text-white" : ""}`}>
            {conversations.filter((c) => !c.isAnonymous).length}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab("anonim")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            activeTab === "anonim"
              ? "bg-slate-800 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Shield className="h-3.5 w-3.5" /> Anonim
          <Badge variant="secondary" className={`ml-1 text-[10px] px-1.5 py-0 ${activeTab === "anonim" ? "bg-white/20 text-white" : ""}`}>
            {conversations.filter((c) => c.isAnonymous).length}
          </Badge>
        </button>
      </div>

      {/* MOBILE LAYOUT: TAMPILKAN LIST ATAU CHAT */}
      <div className="block lg:hidden">
        {selectedId && selectedConversation ? (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedId(null)}
              className="gap-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke daftar percakapan
            </Button>
            <Card className="border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden bg-white">
              <ChatHeader conversation={selectedConversation} />
              <CardContent className="p-4">
                <ScrollArea className="h-[50vh] mb-4 p-2">
                  <ChatMessageList messages={currentMessages} />
                </ScrollArea>
                <ChatInput
                  replyText={replyText}
                  setReplyText={setReplyText}
                  sendReply={sendReply}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari nama siswa, kelas, guru, atau ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-xl text-xs"
                />
              </div>
            </div>
            <ScrollArea className="h-[60vh] p-2">
              <ConversationList
                conversations={filteredConversations}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(id)}
              />
            </ScrollArea>
          </Card>
        )}
      </div>

      {/* DESKTOP LAYOUT: 2 KOLOM SIDE-BY-SIDE */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4">
        {/* KOLOM KIRI: DAFTAR PERCAKAPAN */}
        <Card className="border border-slate-200/80 shadow-sm lg:col-span-5 rounded-2xl bg-white overflow-hidden flex flex-col h-[650px]">
          <div className="p-3 border-b border-slate-100 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari siswa, kelas, guru, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl text-xs"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Menampilkan {filteredConversations.length} percakapan</span>
            </div>
          </div>
          <ScrollArea className="flex-1 p-2">
            <ConversationList
              conversations={filteredConversations}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
            />
          </ScrollArea>
        </Card>

        {/* KOLOM KANAN: JENDELA PERCAKAPAN */}
        <Card className="border border-slate-200/80 shadow-sm lg:col-span-7 rounded-2xl bg-white overflow-hidden flex flex-col h-[650px]">
          {selectedId && selectedConversation ? (
            <>
              <ChatHeader conversation={selectedConversation} />
              <div className="flex-1 overflow-hidden p-4 flex flex-col">
                <ScrollArea className="flex-1 pr-3">
                  <ChatMessageList messages={currentMessages} />
                </ScrollArea>
                <div className="pt-3 border-t border-slate-100">
                  <ChatInput
                    replyText={replyText}
                    setReplyText={setReplyText}
                    sendReply={sendReply}
                    loading={loading}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-3 text-slate-400">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-700">Pilih Percakapan Siswa</h3>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
                Pilih salah satu sesi percakapan di sebelah kiri untuk melihat isi curhat dan memberikan balasan bimbingan.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: ConversationSummary[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  if (conversations.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        Tidak ada percakapan yang sesuai dengan filter
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {conversations.map((conv) => {
        const isSelected = selectedId === conv.id
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full text-left rounded-xl p-3 transition-all border ${
              isSelected
                ? "bg-violet-50/80 border-violet-300 shadow-xs ring-1 ring-violet-300"
                : "border-transparent hover:bg-slate-50 hover:border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {conv.hasReply ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                )}
                <div className="min-w-0">
                  {conv.studentName ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {conv.studentName}
                      </span>
                      {conv.studentKelas && (
                        <span className="rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-bold text-emerald-800">
                          {conv.studentKelas}
                        </span>
                      )}
                    </div>
                  ) : (
                    <code className="font-bold text-xs text-violet-700 truncate block">
                      {conv.id}
                    </code>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!conv.isAnonymous ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                    Nama Asli
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                    Anonim
                  </span>
                )}
              </div>
            </div>

            {/* Target Guru badge */}
            <div className="mt-1 flex items-center gap-1.5 text-[10px]">
              {conv.targetGuru ? (
                <span className="text-indigo-600 font-semibold truncate">
                  🎯 Ke: {conv.targetGuru.name}
                </span>
              ) : (
                <span className="text-slate-400">
                  🌐 BK Umum
                </span>
              )}
              <span className="text-slate-300">·</span>
              <span className="text-slate-400">{conv.count} pesan</span>
            </div>

            {/* Pesan terakhir */}
            <p className="mt-1 text-xs text-slate-500 truncate line-clamp-1">
              {conv.lastMessage.message}
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              {new Date(conv.lastMessage.createdAt).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </button>
        )
      })}
    </div>
  )
}

function ChatHeader({ conversation }: { conversation: ConversationSummary }) {
  return (
    <div className="border-b border-slate-100 bg-slate-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          {conversation.studentName ? (
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {conversation.studentName}
              </h2>
              {conversation.studentKelas && (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs font-bold">
                  Kelas {conversation.studentKelas}
                </Badge>
              )}
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                <UserCheck className="h-3 w-3 mr-1" /> Siswa Terbuka
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-violet-900">
                Percakapan Anonim
              </h2>
              <code className="rounded bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-800">
                {conversation.id}
              </code>
              <Badge className="bg-slate-100 text-slate-700 text-[10px]">
                <Shield className="h-3 w-3 mr-1" /> Rahasia
              </Badge>
            </div>
          )}
          <p className="mt-1 text-xs text-slate-500">
            Tujuan Konseling:{" "}
            <strong className="text-slate-700">
              {conversation.targetGuru
                ? `${conversation.targetGuru.name} (${conversation.targetGuru.mapel || "Guru BK"})`
                : "Semua Guru BK (Bimbingan Konseling Umum)"}
            </strong>
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">
            {conversation.count} Pesan Tersimpan
          </span>
        </div>
      </div>
    </div>
  )
}

function ChatMessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="space-y-3">
      {messages.map((msg) => {
        const isFromStudent = msg.senderRole === "siswa"
        const displayName = isFromStudent
          ? (msg.isAnonymous === false && msg.senderName
              ? `${msg.senderName} (${msg.senderKelas || "Siswa"})`
              : "Siswa (Anonim)")
          : (msg.senderName ? `Guru BK (${msg.senderName})` : "Guru BK")

        return (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isFromStudent ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                isFromStudent
                  ? "bg-slate-100 text-slate-800 rounded-bl-md border border-slate-200/60"
                  : "bg-indigo-600 text-white rounded-br-md shadow-sm"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
              <p
                className={`mt-1.5 flex items-center gap-1.5 text-[10px] ${
                  isFromStudent ? "text-slate-500" : "text-indigo-200"
                }`}
              >
                <span className="font-semibold">{displayName}</span>
                <span>·</span>
                <span>
                  {new Date(msg.createdAt).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function ChatInput({
  replyText,
  setReplyText,
  sendReply,
  loading,
}: {
  replyText: string
  setReplyText: (val: string) => void
  sendReply: () => void
  loading: boolean
}) {
  return (
    <div className="flex items-end gap-2">
      <Textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Ketik balasan konseling untuk siswa ini..."
        className="flex-1 min-h-[64px] resize-none rounded-2xl border-slate-200 text-xs sm:text-sm"
        rows={2}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendReply()
          }
        }}
      />
      <Button
        onClick={sendReply}
        disabled={loading || !replyText.trim()}
        className="h-[64px] w-[64px] shrink-0 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-md text-white disabled:opacity-50"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  )
}
