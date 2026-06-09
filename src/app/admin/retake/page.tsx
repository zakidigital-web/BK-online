"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { RefreshCw, CheckCircle2, XCircle, Clock, Brain, Sparkles, BookOpen, UserCircle, RotateCcw, Fingerprint } from "lucide-react"
import { motion } from "framer-motion"

const jenisConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  "minat-bakat": { icon: Brain, label: "Minat Bakat", color: "text-emerald-600", bg: "bg-emerald-50" },
  "psikologi": { icon: Sparkles, label: "Psikologi", color: "text-orange-600", bg: "bg-orange-50" },
  "gaya-belajar": { icon: BookOpen, label: "Gaya Belajar", color: "text-blue-600", bg: "bg-blue-50" },
  "karakter": { icon: UserCircle, label: "Karakter", color: "text-indigo-600", bg: "bg-indigo-50" },
  "mbti": { icon: Fingerprint, label: "MBTI", color: "text-purple-600", bg: "bg-purple-50" },
}

interface RetakeRequest {
  id: string
  siswaId: string
  jenis: string
  status: string
  createdAt: string
  siswa: { nama: string; nisn: string; kelas: string }
}

export default function AdminRetakePage() {
  const [requests, setRequests] = useState<RetakeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterJenis, setFilterJenis] = useState("all")
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => { fetchRequests() }, [])

  async function fetchRequests() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/retake")
      const data = await res.json()
      setRequests(data.requests || [])
    } catch {
      toast.error("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(id: string, action: "approve" | "reject") {
    setProcessing(id)
    try {
      const res = await fetch("/api/admin/retake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(data.message)
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: action === "approve" ? "approved" : "rejected" } : r))
      )
    } catch (e: any) {
      toast.error(e.message || "Gagal memproses")
    } finally {
      setProcessing(null)
    }
  }

  const filtered = requests.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false
    if (filterJenis !== "all" && r.jenis !== filterJenis) return false
    return true
  })

  const statusCounts = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
          <RotateCcw className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Retake Asesmen</h1>
          <p className="text-sm text-gray-500">Kelola permintaan retake dari siswa</p>
        </div>
        <Button variant="outline" size="icon" className="ml-auto" onClick={fetchRequests} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending", count: statusCounts.pending, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Disetujui", count: statusCounts.approved, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Ditolak", count: statusCounts.rejected, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Disetujui</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterJenis} onValueChange={(v) => v && setFilterJenis(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Semua jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            <SelectItem value="minat-bakat">Minat Bakat</SelectItem>
            <SelectItem value="psikologi">Psikologi</SelectItem>
            <SelectItem value="gaya-belajar">Gaya Belajar</SelectItem>
            <SelectItem value="karakter">Karakter</SelectItem>
            <SelectItem value="mbti">MBTI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Daftar Permintaan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              Tidak ada permintaan retake
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((req, i) => {
                const config = jenisConfig[req.jenis] || { icon: RotateCcw, label: req.jenis, color: "text-gray-600", bg: "bg-gray-50" }
                const Icon = config.icon
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 rounded-xl border p-4"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{req.siswa.nama}</span>
                        <Badge variant="secondary" className="text-[10px]">{req.siswa.kelas}</Badge>
                        <code className="text-[10px] text-gray-400">{req.siswa.nisn}</code>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-gray-500">{config.label}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-400">
                          {new Date(req.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                        {req.status === "pending" && (
                          <Badge className="bg-amber-100 text-amber-700 text-[10px]">Pending</Badge>
                        )}
                        {req.status === "approved" && (
                          <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Disetujui</Badge>
                        )}
                        {req.status === "rejected" && (
                          <Badge className="bg-red-100 text-red-700 text-[10px]">Ditolak</Badge>
                        )}
                      </div>
                    </div>
                    {req.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 gap-1"
                          onClick={() => handleAction(req.id, "approve")}
                          disabled={processing === req.id}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleAction(req.id, "reject")}
                          disabled={processing === req.id}
                        >
                          <XCircle className="h-4 w-4" />
                          Tolak
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
