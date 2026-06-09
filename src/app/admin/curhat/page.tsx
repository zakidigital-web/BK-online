"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { MessageCircleHeart, Send, Mail, Search, CheckCircle2, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface ChatMessage {
  id: string
  anonymousId: string
  message: string
  senderRole: string
  createdAt: string
}

export default function AdminCurhatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([])
  const [replyText, setReplyText] = useState("")
  const [searchId, setSearchId] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchAllMessages() }, [])

  async function fetchAllMessages() {
    try {
      const res = await fetch("/api/chat")
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (e) { console.error(e) }
  }

  function selectConversation(id: string) {
    setSelectedId(id)
    const filtered = messages.filter((m) => m.anonymousId === id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    setFilteredMessages(filtered)
  }

  async function sendReply() {
    if (!replyText.trim() || !selectedId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/chat/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText, senderRole: "guru" }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages((prev) => [...prev, data.message])
      setFilteredMessages((prev) => [...prev, data.message])
      setReplyText("")
      toast.success("Balasan terkirim!")
    } catch { toast.error("Gagal mengirim") }
    finally { setLoading(false) }
  }

  const uniqueIds = [...new Set(messages.map((m) => m.anonymousId))]
  const filteredIds = searchId
    ? uniqueIds.filter((id) => id.toLowerCase().includes(searchId.toLowerCase()))
    : uniqueIds

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">
          <MessageCircleHeart className="h-6 w-6 text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kelola Curhat</h1>
          <p className="text-sm text-gray-500">Balas curhat siswa — kamu hanya tahu ID anonim</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Cari ID..." value={searchId} onChange={(e) => setSearchId(e.target.value)} className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {filteredIds.map((id) => {
                const convMessages = messages.filter((m) => m.anonymousId === id)
                const count = convMessages.length
                const hasReply = convMessages.some((m) => m.senderRole === "guru")
                const last = convMessages
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
                return (
                  <button key={id} onClick={() => selectConversation(id)}
                    className={`w-full text-left rounded-lg p-3 mb-1 transition-colors ${selectedId === id ? "bg-violet-50" : "hover:bg-gray-50"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {hasReply ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                        )}
                        <code className="font-bold text-sm text-violet-700 truncate">{id}</code>
                      </div>
                      <Badge variant={hasReply ? "secondary" : "default"} className={`text-[10px] shrink-0 ${!hasReply ? "bg-amber-100 text-amber-700" : ""}`}>
                        {count}
                      </Badge>
                    </div>
                    {last && <p className="text-xs text-gray-400 mt-1 truncate ml-6">{last.message}</p>}
                    {last && <p className="text-[10px] text-gray-300 mt-0.5 ml-6">{new Date(last.createdAt).toLocaleDateString("id-ID")}</p>}
                  </button>
                )
              })}
              {filteredIds.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Tidak ada percakapan</p>}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {selectedId ? (
                <span>Percakapan dengan <code className="text-violet-700">{selectedId}</code></span>
              ) : "Pilih percakapan"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedId ? (
              <>
                <ScrollArea className="h-[400px] mb-4 p-2">
                  {filteredMessages.map((msg) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className={`mb-3 flex ${msg.senderRole === "guru" ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.senderRole === "guru" ? "bg-indigo-600 text-white rounded-bl-md" : "bg-gray-100 text-gray-800 rounded-br-md"}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`mt-1 text-[10px] ${msg.senderRole === "guru" ? "text-indigo-200" : "text-gray-400"}`}>
                          {msg.senderRole === "guru" ? "Guru BK" : "Siswa"} · {new Date(msg.createdAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </ScrollArea>
                <div className="flex items-end gap-2">
                  <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Ketik balasan..." className="flex-1 min-h-[60px] resize-none" rows={2}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply() } }} />
                  <Button onClick={sendReply} disabled={loading || !replyText.trim()}
                    className="h-[60px] w-[60px] rounded-xl bg-indigo-600 hover:bg-indigo-700">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Mail className="mb-3 h-12 w-12 text-gray-200" />
                <p className="text-sm text-gray-400">Pilih percakapan dari daftar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
