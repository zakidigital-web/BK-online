"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, ChevronRight, BarChart3, Upload, FileSpreadsheet, Plus, Trash2, UserPlus, Pencil, KeyRound, RotateCcw, School, ArrowLeft, GraduationCap, FolderPlus, Clock, Check, X } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SiswaData {
  id: string
  nama: string
  kelas: string
  nisn: string | null
  createdAt: string
  _count: { minatBakat: number; psikologi: number; gayaBelajar: number; karakterDiri: number }
}

export default function AdminSiswaPage() {
  const router = useRouter()
  const [siswa, setSiswa] = useState<SiswaData[]>([])
  const [kelasList, setKelasList] = useState<{ id: string; nama: string }[]>([])
  const [kelasCounts, setKelasCounts] = useState<Record<string, number>>({})
  const [selectedKelas, setSelectedKelas] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [importLoading, setImportLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newNama, setNewNama] = useState("")
  const [newNisn, setNewNisn] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const [editTarget, setEditTarget] = useState<SiswaData | null>(null)
  const [editNama, setEditNama] = useState("")
  const [editKelas, setEditKelas] = useState("")
  const [editNisn, setEditNisn] = useState("")
  const [editLoading, setEditLoading] = useState(false)

  const [kelasDialogOpen, setKelasDialogOpen] = useState(false)
  const [newKelasName, setNewKelasName] = useState("")
  const [kelasLoading, setKelasLoading] = useState(false)

  const [pendingUsers, setPendingUsers] = useState<{ id: string; name: string; email: string; createdAt: string }[]>([])
  const [pendingLoading, setPendingLoading] = useState(false)

  const massalFileRef = useRef<HTMLInputElement>(null)
  const [massalLoading, setMassalLoading] = useState(false)

  useEffect(() => { fetchKelas(); fetchPending() }, [])

  async function fetchPending() {
    try {
      const res = await fetch("/api/admin/user-status")
      const data = await res.json()
      setPendingUsers(data.users || [])
    } catch {}
  }

  async function approveUser(userId: string) {
    try {
      const res = await fetch("/api/admin/user-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: "active" }),
      })
      if (!res.ok) throw new Error()
      toast.success("Akun diaktifkan")
      fetchPending()
    } catch { toast.error("Gagal mengaktifkan akun") }
  }

  async function rejectUser(userId: string) {
    if (!confirm("Tolak pendaftaran ini? Akun akan dihapus.")) return
    try {
      const res = await fetch("/api/admin/user-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: "rejected" }),
      })
      if (!res.ok) throw new Error()
      toast.success("Pendaftaran ditolak")
      fetchPending()
    } catch { toast.error("Gagal menolak pendaftaran") }
  }

  useEffect(() => {
    if (selectedKelas) fetchSiswa(selectedKelas)
    else setSiswa([])
  }, [selectedKelas])

  async function fetchKelas() {
    try {
      const res = await fetch("/api/kelas")
      const data = await res.json()
      const list = (data.kelas || []).map((k: { id: string; nama: string }) => ({ id: k.id, nama: k.nama }))
      setKelasList(list)
      const res2 = await fetch("/api/siswa")
      const data2 = await res2.json()
      const counts: Record<string, number> = {}
      for (const s of (data2.siswa || [])) {
        counts[s.kelas] = (counts[s.kelas] || 0) + 1
      }
      setKelasCounts(counts)
    } catch {}
  }

  async function fetchSiswa(kelas: string) {
    try {
      const res = await fetch(`/api/siswa?kelas=${kelas}`)
      const data = await res.json()
      setSiswa(data.siswa || [])
    } catch {}
  }

  function openEdit(s: SiswaData) {
    setEditTarget(s); setEditNama(s.nama); setEditKelas(s.kelas); setEditNisn(s.nisn || "")
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    if (!editNama.trim() || !editKelas.trim()) { toast.error("Nama dan kelas harus diisi"); return }
    setEditLoading(true)
    try {
      const res = await fetch("/api/siswa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editTarget.id, nama: editNama.trim(), kelas: editKelas.trim(), nisn: editNisn.trim() || null }),
      })
      if (!res.ok) throw new Error()
      toast.success("Data siswa diupdate")
      setEditTarget(null)
      fetchKelas()
      if (selectedKelas) fetchSiswa(selectedKelas)
    } catch { toast.error("Gagal mengupdate siswa") }
    finally { setEditLoading(false) }
  }

  async function tambahSiswa() {
    if (!selectedKelas) return
    const trimmedNama = newNama.trim()
    if (!trimmedNama) { toast.error("Nama harus diisi"); return }
    setAdding(true)
    try {
      const res = await fetch("/api/siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: trimmedNama, kelas: selectedKelas, nisn: newNisn.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal")
      toast.success(`Siswa ${trimmedNama} ditambahkan`)
      setNewNama(""); setNewNisn("")
      fetchSiswa(selectedKelas); fetchKelas()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menambah siswa")
    } finally { setAdding(false) }
  }

  async function hapusSiswa(id: string, nama: string) {
    if (!confirm(`Hapus siswa ${nama}? Semua data asesmen akan ikut terhapus.`)) return
    try {
      const res = await fetch("/api/siswa", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Siswa ${nama} dihapus`)
      if (selectedKelas) fetchSiswa(selectedKelas)
    } catch { toast.error("Gagal menghapus siswa") }
  }

  async function resetPasswordSiswa(id: string, nama: string) {
    if (!confirm(`Reset password ${nama} ke NISN?`)) return
    try {
      const res = await fetch("/api/auth/password/siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswaId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal")
      toast.success(data.message || "Password direset")
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Gagal reset password") }
  }

  async function resetAsesmenSiswa(id: string, nama: string) {
    if (!confirm(`Reset semua asesmen ${nama}? Siswa dapat mengisi ulang.`)) return
    try {
      const res = await fetch("/api/admin/reset/asesmen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswaId: id }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Asesmen ${nama} direset`)
      if (selectedKelas) fetchSiswa(selectedKelas)
    } catch { toast.error("Gagal mereset asesmen") }
  }

  async function tambahKelas() {
    if (!newKelasName.trim()) { toast.error("Nama kelas harus diisi"); return }
    setKelasLoading(true)
    try {
      const res = await fetch("/api/kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: newKelasName.trim().toUpperCase() }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Gagal")
      toast.success(`Kelas ${newKelasName.trim().toUpperCase()} ditambahkan`)
      setNewKelasName(""); setKelasDialogOpen(false)
      fetchKelas()
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Gagal menambah kelas") }
    finally { setKelasLoading(false) }
  }

  async function hapusKelas(nama: string) {
    if (!confirm(`Hapus kelas ${nama}? Semua data siswa di kelas ini TIDAK ikut terhapus.`)) return
    try {
      const res = await fetch("/api/kelas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Kelas ${nama} dihapus`)
      fetchKelas()
    } catch { toast.error("Gagal menghapus kelas") }
  }

  async function importMassal(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMassalLoading(true)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })
      const siswa: { nama: string; kelas: string; nisn?: string }[] = []
      for (let i = 1; i < data.length; i++) {
        const row = data[i]
        if (row && row[0] && String(row[0]).trim()) {
          siswa.push({
            nama: String(row[0]).trim(),
            kelas: String(row[1] || "").trim().toUpperCase() || "X",
            nisn: row[2] ? String(row[2]).trim() : undefined,
          })
        }
      }
      if (siswa.length === 0) { toast.error("Tidak ada data siswa di file"); return }
      const res = await fetch("/api/siswa/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswa }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal import")
      toast.success(`${result.berhasil} siswa berhasil diimport dari ${result.total} data`)
      fetchKelas()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal import Excel")
    } finally {
      setMassalLoading(false)
      if (massalFileRef.current) massalFileRef.current.value = ""
    }
  }

  function downloadTemplate() {
    const wb = XLSX.utils.book_new()
    const isMassal = !selectedKelas
    const header = isMassal ? ["Nama", "Kelas", "NISN"] : ["Nama", "NISN"]
    const example = isMassal ? ["Contoh Siswa", "7A", "1234567890"] : ["Contoh Siswa", "1234567890"]
    const data = [header, example]
    const ws = XLSX.utils.aoa_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, "Siswa")
    XLSX.writeFile(wb, `template-siswa-${selectedKelas || "massal"}.xlsx`)
  }

  async function importFromExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !selectedKelas) return
    setImportLoading(true)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })
      const siswa: { nama: string; kelas: string; nisn?: string }[] = []
      for (let i = 1; i < data.length; i++) {
        const row = data[i]
        if (row && row[0] && String(row[0]).trim()) {
          siswa.push({
            nama: String(row[0]).trim(),
            kelas: selectedKelas,
            nisn: row[1] ? String(row[1]).trim() : undefined,
          })
        }
      }
      if (siswa.length === 0) { toast.error("Tidak ada data siswa di file"); return }
      const res = await fetch("/api/siswa/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswa }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal import")
      toast.success(`${result.berhasil} siswa berhasil diimport dari ${result.total} data`)
      fetchSiswa(selectedKelas); fetchKelas()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal import Excel")
    } finally {
      setImportLoading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const filtered = siswa.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase())
  )

  const totalAsesmen = (s: SiswaData) =>
    s._count.minatBakat + s._count.psikologi + s._count.gayaBelajar + s._count.karakterDiri

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
          <Users className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-sm text-gray-500">
            {selectedKelas ? `Kelas ${selectedKelas} — ${siswa.length} siswa` : `${kelasList.length} kelas terdaftar`}
          </p>
        </div>
      </div>

      {/* Pending registrations */}
      {!selectedKelas && pendingUsers.length > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-l-amber-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700">
              <Clock className="h-4 w-4" /> Pendaftaran Baru ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg bg-amber-50 p-3">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{u.name}</p>
                    <p className="text-xs text-gray-400">NISN: {u.email} · {new Date(u.createdAt).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => approveUser(u.id)}
                      className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => rejectUser(u.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedKelas ? (
        <>
          {/* Toolbar kelas */}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => setKelasDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-1">
              <FolderPlus className="h-4 w-4" /> Tambah Kelas
            </Button>
            <Button size="sm" variant="outline" onClick={() => massalFileRef.current?.click()} disabled={massalLoading} className="gap-1.5">
              <Upload className="h-4 w-4" /> {massalLoading ? "Mengimport..." : "Import Massal (Excel)"}
            </Button>
            <input ref={massalFileRef} type="file" accept=".xlsx,.xls" onChange={importMassal} className="hidden" />
            <span className="text-xs text-gray-400">{kelasList.length} kelas terdaftar</span>
          </div>

          {/* Grid kelas */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {kelasList.map((k) => {
              const count = kelasCounts[k.nama] || 0
              return (
                <motion.div
                  key={k.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group/card"
                >
                  <Card
                    className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
                    onClick={() => setSelectedKelas(k.nama)}
                  >
                    <CardContent className="p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-3">
                        <School className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">Kelas {k.nama}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {count} siswa
                      </p>
                      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600 group-hover:gap-2 transition-all">
                        Kelola <ChevronRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                  <button
                    onClick={(e) => { e.stopPropagation(); hapusKelas(k.nama) }}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-400 opacity-0 group-hover/card:opacity-100 hover:bg-red-200 hover:text-red-600 transition-all"
                    title="Hapus kelas"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </motion.div>
              )
            })}
          </div>

          {kelasList.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <School className="mx-auto h-12 w-12 text-gray-200" />
                <p className="mt-3 text-gray-400">Belum ada kelas. Tambah kelas di Pengaturan.</p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <>
          {/* Header kelas */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="ghost" onClick={() => setSelectedKelas(null)} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Kelas
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
                {selectedKelas}
              </div>
              <span className="font-semibold text-gray-900">Kelas {selectedKelas}</span>
              <Badge variant="secondary" className="text-xs">{siswa.length} siswa</Badge>
            </div>
          </div>

          {/* Tambah & Import */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-600" />
                Tambah Siswa ke Kelas {selectedKelas}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Input placeholder="Nama lengkap" value={newNama} onChange={(e) => setNewNama(e.target.value)}
                  className="max-w-xs" onKeyDown={(e) => e.key === "Enter" && tambahSiswa()} />
                <Input placeholder="NISN (opsional)" value={newNisn} onChange={(e) => setNewNisn(e.target.value)}
                  className="max-w-[160px]" onKeyDown={(e) => e.key === "Enter" && tambahSiswa()} />
                <Button onClick={tambahSiswa} disabled={adding} className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                  <Plus className="h-4 w-4" /> Tambah
                </Button>
                <Button variant="outline" onClick={downloadTemplate} className="gap-1.5" size="sm">
                  <FileSpreadsheet className="h-4 w-4" /> Template
                </Button>
                <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importLoading} size="sm" className="gap-1.5">
                  <Upload className="h-4 w-4" /> Import
                </Button>
                <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={importFromExcel} className="hidden" />
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Cari nama..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          {/* Daftar siswa */}
          <div className="space-y-2">
            {filtered.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <div
                  onClick={() => router.push(`/admin/laporan/siswa?id=${s.id}`)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") router.push(`/admin/laporan/siswa?id=${s.id}`) }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                          {s.nama.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{s.nama}</div>
                          <div className="text-xs text-gray-400">{s.nisn ? `NISN ${s.nisn}` : "Tanpa NISN"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden sm:flex items-center gap-2">
                          <Badge variant={s._count.minatBakat > 0 ? "default" : "outline"} className="text-[10px]">
                            {s._count.minatBakat > 0 ? "✓" : "○"} Minat
                          </Badge>
                          <Badge variant={s._count.psikologi > 0 ? "default" : "outline"} className="text-[10px]">
                            {s._count.psikologi > 0 ? "✓" : "○"} Psi
                          </Badge>
                          <Badge variant={s._count.gayaBelajar > 0 ? "default" : "outline"} className="text-[10px]">
                            {s._count.gayaBelajar > 0 ? "✓" : "○"} VARK
                          </Badge>
                          <Badge variant={s._count.karakterDiri > 0 ? "default" : "outline"} className="text-[10px]">
                            {s._count.karakterDiri > 0 ? "✓" : "○"} Kar
                          </Badge>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/admin/analisa?id=${s.id}`) }}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          title="Analisa"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(s) }}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-400 hover:bg-sky-100 hover:text-sky-600"
                          title="Edit siswa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); resetAsesmenSiswa(s.id, s.nama) }}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-400 hover:bg-orange-100 hover:text-orange-600"
                          title="Reset asesmen"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); resetPasswordSiswa(s.id, s.nama) }}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-400 hover:bg-amber-100 hover:text-amber-600"
                          title="Reset password"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); hapusSiswa(s.id, s.nama) }}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-bold text-emerald-600 shrink-0">{totalAsesmen(s)}</span>
                        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-200" />
                  <p className="mt-3 text-gray-400">
                    {search ? "Tidak ada siswa dengan nama tersebut." : "Belum ada siswa di kelas ini."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Edit Dialog */}
          <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null) }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-sky-600" /> Edit Siswa
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEdit} className="space-y-4">
                <Input placeholder="Nama lengkap" value={editNama} onChange={(e) => setEditNama(e.target.value)} required />
                <Input placeholder="Kelas" value={editKelas} onChange={(e) => setEditKelas(e.target.value)} required />
                <Input placeholder="NISN (opsional)" value={editNisn} onChange={(e) => setEditNisn(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Batal</Button>
                  <Button type="submit" disabled={editLoading} className="bg-sky-600 hover:bg-sky-700">
                    {editLoading ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Dialog Tambah Kelas */}
      <Dialog open={kelasDialogOpen} onOpenChange={setKelasDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-indigo-600" /> Tambah Kelas Baru
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nama kelas (contoh: 7A)" value={newKelasName}
              onChange={(e) => setNewKelasName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && tambahKelas()} autoFocus />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setKelasDialogOpen(false)}>Batal</Button>
              <Button onClick={tambahKelas} disabled={kelasLoading} className="bg-indigo-600 hover:bg-indigo-700">
                {kelasLoading ? "Menambah..." : "Tambah"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
