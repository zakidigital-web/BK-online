"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff } from "lucide-react"

type Banner = {
  id: string
  judul: string
  deskripsi: string
  tombol: string
  link: string
  aktif: boolean
  urutan: number
}

export default function BannerPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [judul, setJudul] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [tombol, setTombol] = useState("")
  const [link, setLink] = useState("")
  const [aktif, setAktif] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchBanners() }, [])

  async function fetchBanners() {
    try {
      const res = await fetch("/api/admin/banner")
      const data = await res.json()
      setBanners(data.banners || [])
    } catch { toast.error("Gagal memuat banner") }
  }

  function resetForm() {
    setJudul("")
    setDeskripsi("")
    setTombol("")
    setLink("")
    setAktif(true)
    setEditing(null)
    setShowForm(false)
  }

  function edit(b: Banner) {
    setJudul(b.judul)
    setDeskripsi(b.deskripsi)
    setTombol(b.tombol)
    setLink(b.link)
    setAktif(b.aktif)
    setEditing(b)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!judul.trim()) { toast.error("Judul harus diisi"); return }
    setLoading(true)
    try {
      if (editing) {
        const res = await fetch("/api/admin/banner", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, judul, deskripsi, tombol, link, aktif, urutan: editing.urutan }),
        })
        if (!res.ok) throw new Error()
        toast.success("Banner diperbarui")
      } else {
        const res = await fetch("/api/admin/banner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ judul, deskripsi, tombol, link, aktif, urutan: banners.length }),
        })
        if (!res.ok) throw new Error()
        toast.success("Banner ditambahkan")
      }
      resetForm()
      fetchBanners()
    } catch { toast.error("Gagal menyimpan") }
    finally { setLoading(false) }
  }

  async function hapus(id: string) {
    if (!confirm("Hapus banner ini?")) return
    try {
      const res = await fetch("/api/admin/banner", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      toast.success("Banner dihapus")
      fetchBanners()
    } catch { toast.error("Gagal menghapus") }
  }

  async function toggleAktif(b: Banner) {
    try {
      await fetch("/api/admin/banner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...b, aktif: !b.aktif }),
      })
      fetchBanners()
    } catch { toast.error("Gagal mengubah status") }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Banner</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="h-4 w-4" /> Tambah Banner
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{editing ? "Edit Banner" : "Banner Baru"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Judul banner" required />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsi banner (opsional)" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Teks Tombol</Label>
                <Input value={tombol} onChange={(e) => setTombol(e.target.value)} placeholder="Coba Sekarang" />
              </div>
              <div className="space-y-2">
                <Label>Link Tombol</Label>
                <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/asesmen/minat-bakat" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={aktif} onCheckedChange={setAktif} />
                <Label className="cursor-pointer">Aktif</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                  {loading ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Banner"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {banners.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center text-gray-400">
              Belum ada banner. Klik &quot;Tambah Banner&quot; untuk memulai.
            </CardContent>
          </Card>
        )}
        {banners.map((b) => (
          <Card key={b.id} className="border-0 shadow-sm">
            <CardContent className="flex items-start gap-4 py-4">
              <div className="flex items-center text-gray-300 cursor-move"><GripVertical className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{b.judul}</span>
                  <Badge variant={b.aktif ? "default" : "secondary"} className="text-[10px]">
                    {b.aktif ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
                {b.deskripsi && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{b.deskripsi}</p>}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  {b.tombol && <span>Tombol: {b.tombol}</span>}
                  {b.link && <span>Link: {b.link}</span>}
                  <span>Urutan: {b.urutan}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleAktif(b)} title={b.aktif ? "Nonaktifkan" : "Aktifkan"}>
                  {b.aktif ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => edit(b)} title="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => hapus(b.id)} title="Hapus">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
