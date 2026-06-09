"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardList, BookOpen, Brain, Sparkles, UserCircle, GraduationCap, Heart, Plus, Trash2, Pencil, Check, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SoalItem {
  id?: string
  nomor: number
  teks: string
  dimensi: string
}

const jenisConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  "minat-bakat": { icon: Brain, label: "Minat Bakat", color: "text-emerald-600" },
  psikologi: { icon: Heart, label: "Psikologi", color: "text-violet-600" },
  "gaya-belajar": { icon: BookOpen, label: "Gaya Belajar", color: "text-sky-600" },
  karakter: { icon: UserCircle, label: "Karakter Diri", color: "text-pink-600" },
  "guru-mengajar": { icon: GraduationCap, label: "Gaya Mengajar Guru", color: "text-indigo-600" },
  "guru-psikologi": { icon: Sparkles, label: "Psikologi Guru", color: "text-rose-600" },
  "mbti": { icon: Brain, label: "MBTI", color: "text-purple-600" },
}

const jenisList = Object.keys(jenisConfig)

export default function AdminPertanyaanPage() {
  const [grouped, setGrouped] = useState<Record<string, SoalItem[]>>({})
  const [activeTab, setActiveTab] = useState("minat-bakat")
  const [loading, setLoading] = useState(true)

  const [editTarget, setEditTarget] = useState<{ jenis: string; nomor: number } | null>(null)
  const [editTeks, setEditTeks] = useState("")
  const [editDimensi, setEditDimensi] = useState("")
  const [editLoading, setEditLoading] = useState(false)

  const [newTeks, setNewTeks] = useState("")
  const [newDimensi, setNewDimensi] = useState("")
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const res = await fetch("/api/pertanyaan")
      const data = await res.json()
      if (data.grouped) setGrouped(data.grouped)
    } catch { toast.error("Gagal memuat pertanyaan") }
    finally { setLoading(false) }
  }

  function openEdit(item: SoalItem, jenis: string) {
    setEditTarget({ jenis, nomor: item.nomor })
    setEditTeks(item.teks)
    setEditDimensi(item.dimensi)
  }

  async function handleEdit() {
    if (!editTarget || !editTeks.trim()) return
    setEditLoading(true)
    try {
      const soal = grouped[editTarget.jenis]?.find((s) => s.nomor === editTarget.nomor)
      if (!soal) throw new Error("Not found")
      if (soal.id) {
        const res = await fetch("/api/pertanyaan", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: soal.id, teks: editTeks.trim(), dimensi: editDimensi.trim() }),
        })
        if (!res.ok) throw new Error()
      }
      setGrouped((prev) => {
        const updated = { ...prev }
        updated[editTarget.jenis] = (updated[editTarget.jenis] || []).map((s) =>
          s.nomor === editTarget.nomor ? { ...s, teks: editTeks.trim(), dimensi: editDimensi.trim() } : s
        )
        return updated
      })
      toast.success("Pertanyaan diupdate")
      setEditTarget(null)
    } catch { toast.error("Gagal mengupdate") }
    finally { setEditLoading(false) }
  }

  async function handleAdd() {
    if (!newTeks.trim() || !activeTab) return
    try {
      const res = await fetch("/api/pertanyaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jenis: activeTab, teks: newTeks.trim(), dimensi: newDimensi.trim() }),
      })
      if (!res.ok) throw new Error()
      toast.success("Pertanyaan ditambahkan")
      setNewTeks(""); setNewDimensi(""); setAddOpen(false)
      fetchAll()
    } catch { toast.error("Gagal menambah") }
  }

  async function handleDelete(item: SoalItem, jenis: string) {
    if (!item.id) {
      setGrouped((prev) => {
        const updated = { ...prev }
        updated[jenis] = (updated[jenis] || []).filter((s) => s.nomor !== item.nomor)
        return updated
      })
      return
    }
    if (!confirm(`Hapus pertanyaan nomor ${item.nomor}?`)) return
    try {
      const res = await fetch("/api/pertanyaan", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      })
      if (!res.ok) throw new Error()
      toast.success("Pertanyaan dihapus")
      fetchAll()
    } catch { toast.error("Gagal menghapus") }
  }

  const Icon = jenisConfig[activeTab]?.icon || ClipboardList

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
          <ClipboardList className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kelola Pertanyaan</h1>
          <p className="text-sm text-gray-500">Lihat dan edit pertanyaan asesmen siswa & guru</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent">
          {jenisList.map((j) => {
            const cfg = jenisConfig[j]
            const Icon2 = cfg.icon
            const count = grouped[j]?.length || 0
            return (
              <TabsTrigger key={j} value={j}
                className="data-[state=active]:shadow-sm gap-1.5 text-xs sm:text-sm"
              >
                <Icon2 className="h-3.5 w-3.5 hidden sm:inline" />
                {cfg.label}
                <Badge variant="outline" className="text-[10px] ml-1">{count}</Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {jenisList.map((j) => {
          const cfg = jenisConfig[j]
          const Icon2 = cfg.icon
          const soal = grouped[j] || []
          return (
            <TabsContent key={j} value={j} className="mt-4 space-y-3">
              {loading ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center text-gray-400">Memuat...</CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Icon2 className="h-4 w-4" />
                      {soal.length} pertanyaan
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setAddOpen(true)} className="gap-1">
                      <Plus className="h-3.5 w-3.5" /> Tambah
                    </Button>
                  </div>

                  {soal.map((item) => (
                    <Card key={item.nomor} className="border-0 shadow-sm">
                      <CardContent className="flex items-start gap-3 p-4">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                          {item.nomor}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 leading-relaxed">{item.teks}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">{item.dimensi || "-"}</Badge>
                            {item.id && <Badge variant="outline" className="text-[10px] text-green-600">Tersimpan</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEdit(item, j)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-400 hover:bg-sky-100 hover:text-sky-600"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item, j)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600"
                            title="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-sky-600" /> Edit Pertanyaan #{editTarget?.nomor}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Dimensi</label>
              <Input value={editDimensi} onChange={(e) => setEditDimensi(e.target.value)} placeholder="Dimensi/kategori" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Teks Pertanyaan</label>
              <Textarea value={editTeks} onChange={(e) => setEditTeks(e.target.value)} rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditTarget(null)}><X className="h-4 w-4" /> Batal</Button>
              <Button onClick={handleEdit} disabled={editLoading} className="bg-sky-600 hover:bg-sky-700">
                <Check className="h-4 w-4" /> {editLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" /> Tambah Pertanyaan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Dimensi</label>
              <Input value={newDimensi} onChange={(e) => setNewDimensi(e.target.value)} placeholder="Dimensi/kategori" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Teks Pertanyaan</label>
              <Textarea value={newTeks} onChange={(e) => setNewTeks(e.target.value)} rows={3} placeholder="Tulis pertanyaan..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
              <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">Tambah</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
