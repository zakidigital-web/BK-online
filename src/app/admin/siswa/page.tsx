"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, ChevronRight, BarChart3, Upload, FileSpreadsheet, Plus, Trash2, UserPlus, Pencil, KeyRound, RotateCcw, School, ArrowLeft, GraduationCap, FolderPlus, Clock, Check, X, CheckSquare, Square, ArrowRightLeft, Sparkles, Layers, FileText } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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

  // State Batch Pindah Siswa
  const [selectedSiswaIds, setSelectedSiswaIds] = useState<string[]>([])
  const [batchTargetKelas, setBatchTargetKelas] = useState<string>("")
  const [batchMoveLoading, setBatchMoveLoading] = useState(false)

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
  const [allSiswa, setAllSiswa] = useState<SiswaData[]>([])
  const [showUnmatched, setShowUnmatched] = useState(false)

  const massalFileRef = useRef<HTMLInputElement>(null)
  const [massalLoading, setMassalLoading] = useState(false)

  // State Modal Tambah Siswa Terstruktur & Efisien
  const [tambahSiswaModalOpen, setTambahSiswaModalOpen] = useState(false)
  const [modalTargetKelas, setModalTargetKelas] = useState("")
  const [modalSingleNama, setModalSingleNama] = useState("")
  const [modalSingleNisn, setModalSingleNisn] = useState("")
  const [modalMultiText, setModalMultiText] = useState("")
  const [modalActiveTab, setModalActiveTab] = useState<"single" | "multi" | "excel">("single")
  const [modalSubmitting, setModalSubmitting] = useState(false)
  const modalExcelRef = useRef<HTMLInputElement>(null)

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
    setSelectedSiswaIds([])
    setBatchTargetKelas("")
    if (selectedKelas) fetchSiswa(selectedKelas)
    else setSiswa([])
  }, [selectedKelas, showUnmatched])

  function toggleSelectSiswa(id: string) {
    setSelectedSiswaIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleSelectAllSiswa(list: SiswaData[]) {
    const ids = list.map(s => s.id)
    const isAllSelected = ids.length > 0 && ids.every(id => selectedSiswaIds.includes(id))
    if (isAllSelected) {
      setSelectedSiswaIds(prev => prev.filter(id => !ids.includes(id)))
    } else {
      setSelectedSiswaIds(prev => Array.from(new Set([...prev, ...ids])))
    }
  }

  async function handleBatchMoveSiswa() {
    if (selectedSiswaIds.length === 0) return
    if (!batchTargetKelas) {
      toast.error("Pilih kelas tujuan terlebih dahulu")
      return
    }
    setBatchMoveLoading(true)
    try {
      const res = await fetch("/api/siswa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedSiswaIds,
          targetKelas: batchTargetKelas,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal memindahkan siswa")

      toast.success(`${data.count || selectedSiswaIds.length} siswa berhasil dipindahkan ke Kelas ${batchTargetKelas}`)
      setSelectedSiswaIds([])
      setBatchTargetKelas("")
      await fetchKelas()
      if (selectedKelas) await fetchSiswa(selectedKelas)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memindahkan siswa")
    } finally {
      setBatchMoveLoading(false)
    }
  }

  async function fetchKelas() {
    try {
      const res = await fetch("/api/kelas")
      const data = await res.json()
      const list = (data.kelas || []).map((k: { id: string; nama: string }) => ({ id: k.id, nama: k.nama }))
      setKelasList(list)
      const res2 = await fetch("/api/siswa")
      const data2 = await res2.json()
      const all = data2.siswa || []
      setAllSiswa(all)
      const counts: Record<string, number> = {}
      for (const s of all) {
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

  function bukaModalTambahSiswa(defaultKelas?: string) {
    setModalTargetKelas(defaultKelas || selectedKelas || (kelasList[0]?.nama ?? ""))
    setModalSingleNama("")
    setModalSingleNisn("")
    setModalMultiText("")
    setModalActiveTab("single")
    setTambahSiswaModalOpen(true)
  }

  async function handleSimpanSingleSiswa(e: React.FormEvent) {
    e.preventDefault()
    if (!modalTargetKelas) { toast.error("Pilih kelas tujuan"); return }
    if (!modalSingleNama.trim()) { toast.error("Nama siswa harus diisi"); return }
    setModalSubmitting(true)
    try {
      const res = await fetch("/api/siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: modalSingleNama.trim(),
          kelas: modalTargetKelas,
          nisn: modalSingleNisn.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal menambah siswa")
      toast.success(`Siswa ${modalSingleNama.trim()} berhasil ditambahkan ke Kelas ${modalTargetKelas}`)
      setTambahSiswaModalOpen(false)
      fetchKelas()
      if (selectedKelas) fetchSiswa(selectedKelas)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menambah siswa")
    } finally {
      setModalSubmitting(false)
    }
  }

  async function handleSimpanMultiSiswa(e: React.FormEvent) {
    e.preventDefault()
    if (!modalTargetKelas) { toast.error("Pilih kelas tujuan"); return }
    const lines = modalMultiText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)

    if (lines.length === 0) {
      toast.error("Tempelkan minimal 1 baris nama siswa"); return
    }

    const items = lines.map((line) => {
      const parts = line.split(/[,\t]+/).map((p) => p.trim())
      const nama = parts[0]
      const nisn = parts[1] || undefined
      return { nama, kelas: modalTargetKelas, nisn }
    }).filter((x) => Boolean(x.nama))

    if (items.length === 0) {
      toast.error("Tidak ada data siswa yang valid"); return
    }

    setModalSubmitting(true)
    try {
      const res = await fetch("/api/siswa/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswa: items }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal menambah siswa")
      toast.success(`${result.berhasil || items.length} siswa berhasil ditambahkan ke Kelas ${modalTargetKelas}`)
      setTambahSiswaModalOpen(false)
      fetchKelas()
      if (selectedKelas) fetchSiswa(selectedKelas)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menambah daftar siswa")
    } finally {
      setModalSubmitting(false)
    }
  }

  async function importModalExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !modalTargetKelas) return
    setModalSubmitting(true)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })
      const items: { nama: string; kelas: string; nisn?: string }[] = []
      for (let i = 1; i < data.length; i++) {
        const row = data[i]
        if (row && row[0] && String(row[0]).trim()) {
          items.push({
            nama: String(row[0]).trim(),
            kelas: modalTargetKelas,
            nisn: row[1] ? String(row[1]).trim() : undefined,
          })
        }
      }
      if (items.length === 0) { toast.error("Tidak ada data siswa di file Excel"); return }
      const res = await fetch("/api/siswa/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswa: items }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal import")
      toast.success(`${result.berhasil || items.length} siswa berhasil ditambahkan ke Kelas ${modalTargetKelas}`)
      setTambahSiswaModalOpen(false)
      fetchKelas()
      if (selectedKelas) fetchSiswa(selectedKelas)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal import Excel")
    } finally {
      setModalSubmitting(false)
      if (modalExcelRef.current) modalExcelRef.current.value = ""
    }
  }

  async function tambahKelas() {
    if (!newKelasName.trim()) { toast.error("Nama kelas harus diisi"); return }
    const items = newKelasName
      .split(/[,;\n]+/)
      .map((k) => k.trim().toUpperCase())
      .filter(Boolean)

    if (items.length === 0) return
    setKelasLoading(true)
    try {
      let sukses = 0
      for (const nama of items) {
        const res = await fetch("/api/kelas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nama }),
        })
        if (res.ok) sukses++
      }
      toast.success(`${sukses} kelas berhasil ditambahkan`)
      setNewKelasName("")
      setKelasDialogOpen(false)
      fetchKelas()
    } catch {
      toast.error("Gagal menambah kelas")
    } finally {
      setKelasLoading(false)
    }
  }

  async function generateJenjangKelas(jenjang: number) {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
    const targets = letters.map((l) => `${jenjang}${l}`)
    const existingNames = new Set(kelasList.map((k) => k.nama))
    const belumAda = targets.filter((k) => !existingNames.has(k))

    if (belumAda.length === 0) {
      toast.info(`Semua kelas ${jenjang}A–${jenjang}I sudah ada.`)
      return
    }

    setKelasLoading(true)
    try {
      let sukses = 0
      for (const nama of belumAda) {
        const res = await fetch("/api/kelas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nama }),
        })
        if (res.ok) sukses++
      }
      toast.success(`${sukses} kelas baru (${jenjang}A–${jenjang}I) berhasil dibuat`)
      setKelasDialogOpen(false)
      fetchKelas()
    } catch {
      toast.error("Gagal membuat rombel kelas")
    } finally {
      setKelasLoading(false)
    }
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

  const kelasNames = new Set(kelasList.map((k) => k.nama))
  const unmatchedSiswa = allSiswa.filter((s) => !kelasNames.has(s.kelas))

  const filtered = (showUnmatched ? unmatchedSiswa : siswa).filter((s) =>
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
            {selectedKelas ? `Kelas ${selectedKelas} — ${siswa.length} siswa` :
             showUnmatched ? "Siswa tanpa kelas" :
             `${kelasList.length} kelas terdaftar${unmatchedSiswa.length > 0 ? ` · ${unmatchedSiswa.length} siswa tanpa kelas` : ""}`}
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

      {!selectedKelas && !showUnmatched ? (
        <>
          {/* Toolbar kelas */}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => bukaModalTambahSiswa()} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm">
              <UserPlus className="h-4 w-4" /> Tambah Siswa
            </Button>
            <Button size="sm" onClick={() => setKelasDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm">
              <FolderPlus className="h-4 w-4" /> Tambah Rombel Kelas
            </Button>
            <Button size="sm" variant="outline" onClick={downloadTemplate} className="gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Unduh Template Siswa
            </Button>
            <Button size="sm" variant="outline" onClick={() => massalFileRef.current?.click()} disabled={massalLoading} className="gap-1.5">
              <Upload className="h-4 w-4" /> {massalLoading ? "Mengimport..." : "Import Massal (Excel)"}
            </Button>
            <input ref={massalFileRef} type="file" accept=".xlsx,.xls" onChange={importMassal} className="hidden" />
            <span className="text-xs text-gray-400 ml-auto">{kelasList.length} kelas terdaftar</span>
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

            {/* Kartu siswa tanpa kelas */}
            {unmatchedSiswa.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5 border-l-4 border-l-orange-400"
                  onClick={() => setShowUnmatched(true)}
                >
                  <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-red-500 text-white mb-3">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Tanpa Kelas</h3>
                    <p className="text-sm text-orange-600 mt-0.5 font-medium">
                      {unmatchedSiswa.length} siswa tidak terdaftar di kelas mana pun
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-orange-600 group-hover:gap-2 transition-all">
                      Atur <ChevronRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {kelasList.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <School className="mx-auto h-12 w-12 text-gray-200" />
                <p className="mt-3 text-gray-400">Belum ada kelas. Tambah rombel kelas terlebih dahulu.</p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <>
          {/* Header kelas / unmatched */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="ghost" onClick={() => { setSelectedKelas(null); setShowUnmatched(false) }} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Kelas
            </Button>
            {showUnmatched ? (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-red-500 text-white text-xs font-bold">
                  ?
                </div>
                <span className="font-semibold text-gray-900">Siswa Tanpa Kelas</span>
                <Badge variant="secondary" className="text-xs">{unmatchedSiswa.length} siswa</Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
                  {selectedKelas}
                </div>
                <span className="font-semibold text-gray-900">Kelas {selectedKelas}</span>
                <Badge variant="secondary" className="text-xs">{siswa.length} siswa</Badge>
              </div>
            )}
          </div>

          {/* Action Bar Kelas (bersih & efisien) */}
          {!showUnmatched && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => bukaModalTambahSiswa(selectedKelas || undefined)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm font-medium"
                >
                  <UserPlus className="h-4 w-4" /> Tambah Siswa ke {selectedKelas}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={importLoading}
                  className="gap-1.5 text-xs text-slate-700"
                >
                  <Upload className="h-4 w-4" /> {importLoading ? "Mengimport..." : "Import Excel"}
                </Button>
                <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={importFromExcel} className="hidden" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={downloadTemplate}
                  className="gap-1.5 text-xs text-slate-600 hover:text-emerald-700"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Template Excel
                </Button>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Users className="h-3.5 w-3.5 text-emerald-600" />
                <span>Terdaftar: <strong>{siswa.length}</strong> siswa</span>
              </div>
            </div>
          )}

          {/* Info unmatched */}
          {showUnmatched && (
            <Card className="border-0 shadow-sm border-l-4 border-l-orange-400 bg-orange-50/30">
              <CardContent className="p-4 flex items-start gap-3">
                <Users className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Siswa ini memiliki kelas yang tidak terdaftar di sistem</p>
                  <p className="text-xs text-orange-600 mt-1">
                    Gunakan tombol edit <Pencil className="inline h-3 w-3" /> untuk mengubah kelas siswa ke kelas yang valid.
                    Kelas bisa ditambahkan melalui tombol "Tambah Kelas" di halaman sebelumnya.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Batch Transfer Toolbar */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex-wrap">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSelectAllSiswa(filtered)}
                  className="h-8 px-2.5 text-xs font-medium text-slate-700 hover:text-emerald-700 gap-1.5"
                >
                  {filtered.length > 0 && filtered.every(s => selectedSiswaIds.includes(s.id)) ? (
                    <CheckSquare className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-400" />
                  )}
                  <span>
                    {filtered.length > 0 && filtered.every(s => selectedSiswaIds.includes(s.id))
                      ? "Batal Pilih Semua"
                      : "Pilih Semua Siswa"}
                  </span>
                </Button>
                {selectedSiswaIds.length > 0 && (
                  <Badge className="bg-emerald-600 text-white font-medium text-xs px-2 py-0.5">
                    {selectedSiswaIds.length} siswa dipilih
                  </Badge>
                )}
              </div>

              {selectedSiswaIds.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Select value={batchTargetKelas} onValueChange={(v) => setBatchTargetKelas(v ?? "")}>
                    <SelectTrigger className="w-[140px] h-8 text-xs bg-white">
                      <SelectValue placeholder="Pilih Kelas Tujuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {kelasList
                        .filter(k => k.nama !== selectedKelas)
                        .map(k => (
                          <SelectItem key={k.id} value={k.nama}>
                            Kelas {k.nama}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    disabled={!batchTargetKelas || batchMoveLoading}
                    onClick={handleBatchMoveSiswa}
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    <span>
                      {batchMoveLoading
                        ? "Memindahkan..."
                        : batchTargetKelas
                        ? `Pindah ke ${batchTargetKelas}`
                        : "Pindahkan Siswa"}
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelectedSiswaIds([]); setBatchTargetKelas("") }}
                    className="h-8 text-xs px-2.5 text-slate-600"
                  >
                    Batal
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Cari nama..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          {/* Daftar siswa */}
          <div className="space-y-2">
            {filtered.map((s, i) => {
              const isSelected = selectedSiswaIds.includes(s.id)

              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
                  <div
                    onClick={() => router.push(`/admin/laporan/siswa?id=${s.id}`)}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") router.push(`/admin/laporan/siswa?id=${s.id}`) }}
                  >
                    <Card className={`border shadow-sm hover:shadow-md transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-400"
                        : "border-slate-200 hover:border-emerald-200"
                    }`}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleSelectSiswa(s.id)
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-emerald-100/60 transition-colors shrink-0"
                            title={isSelected ? "Batal pilih" : "Pilih siswa"}
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-400" />
                            )}
                          </button>

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
            )
          })}
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

      {/* Dialog Tambah Rombel Kelas */}
      <Dialog open={kelasDialogOpen} onOpenChange={setKelasDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-indigo-600" /> Tambah Rombel Kelas
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Nama Kelas / Rombel Baru
              </label>
              <Input
                placeholder="Contoh: 7A atau beberapa: 7A, 7B, 7C"
                value={newKelasName}
                onChange={(e) => setNewKelasName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && tambahKelas()}
                autoFocus
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Bisa masukkan satu atau beberapa nama kelas sekaligus dipisahkan koma.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-900 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                Generator Cepat Rombel SMP (A – I)
              </p>
              <p className="text-[11px] text-indigo-700/80 mb-2.5">
                Buat otomatis 9 rombel sekaligus tanpa mengetik satu per satu:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={kelasLoading}
                  onClick={() => generateJenjangKelas(7)}
                  className="bg-white hover:bg-indigo-100/60 text-indigo-700 text-xs h-8 border-indigo-200 shadow-sm"
                >
                  + Rombel 7A–7I
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={kelasLoading}
                  onClick={() => generateJenjangKelas(8)}
                  className="bg-white hover:bg-indigo-100/60 text-indigo-700 text-xs h-8 border-indigo-200 shadow-sm"
                >
                  + Rombel 8A–8I
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={kelasLoading}
                  onClick={() => generateJenjangKelas(9)}
                  className="bg-white hover:bg-indigo-100/60 text-indigo-700 text-xs h-8 border-indigo-200 shadow-sm"
                >
                  + Rombel 9A–9I
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setKelasDialogOpen(false)}>Batal</Button>
              <Button onClick={tambahKelas} disabled={kelasLoading || !newKelasName.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                {kelasLoading ? "Menyimpan..." : "Tambah Kelas"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog Tambah Siswa Efisien & Terstruktur */}
      <Dialog open={tambahSiswaModalOpen} onOpenChange={setTambahSiswaModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <UserPlus className="h-4 w-4" />
              </div>
              <span>Tambah Siswa Baru</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Target Kelas Selector */}
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Target Kelas Siswa
              </label>
              <div className="flex items-center gap-2">
                <Select value={modalTargetKelas} onValueChange={(val) => setModalTargetKelas(val ?? "")}>
                  <SelectTrigger className="bg-white h-9">
                    <SelectValue placeholder="Pilih Kelas Tujuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {kelasList.map((k) => (
                      <SelectItem key={k.id} value={k.nama}>
                        Kelas {k.nama} ({kelasCounts[k.nama] || 0} siswa)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {modalTargetKelas && (
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap h-8 px-2.5">
                    Kelas {modalTargetKelas}
                  </Badge>
                )}
              </div>
            </div>

            {/* Tab Navigasi Cara Input */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setModalActiveTab("single")}
                className={`py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  modalActiveTab === "single"
                    ? "bg-white text-emerald-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Satu Siswa</span>
              </button>
              <button
                type="button"
                onClick={() => setModalActiveTab("multi")}
                className={`py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  modalActiveTab === "multi"
                    ? "bg-white text-emerald-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Tempel Daftar (Teks)</span>
              </button>
              <button
                type="button"
                onClick={() => setModalActiveTab("excel")}
                className={`py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  modalActiveTab === "excel"
                    ? "bg-white text-emerald-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Upload Excel</span>
              </button>
            </div>

            {/* Tab 1: Single Siswa */}
            {modalActiveTab === "single" && (
              <form onSubmit={handleSimpanSingleSiswa} className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Nama Lengkap Siswa *</label>
                  <Input
                    placeholder="Contoh: Ahmad Rizki Pratama"
                    value={modalSingleNama}
                    onChange={(e) => setModalSingleNama(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">NISN (Nomor Induk Siswa Nasional)</label>
                  <Input
                    placeholder="Contoh: 0081234567 (opsional / username login)"
                    value={modalSingleNisn}
                    onChange={(e) => setModalSingleNisn(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Bila NISN diisi, siswa dapat login langsung menggunakan NISN sebagai username dan password awal.
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button type="button" variant="outline" onClick={() => setTambahSiswaModalOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={modalSubmitting || !modalSingleNama.trim()} className="bg-emerald-600 hover:bg-emerald-700">
                    {modalSubmitting ? "Menyimpan..." : "Simpan Siswa"}
                  </Button>
                </div>
              </form>
            )}

            {/* Tab 2: Multi-Line Paste */}
            {modalActiveTab === "multi" && (
              <form onSubmit={handleSimpanMultiSiswa} className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Tempelkan Daftar Siswa (1 Baris = 1 Siswa)
                  </label>
                  <textarea
                    rows={6}
                    className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder={`Ahmad Rizki Pratama, 0081234567\nBudi Santoso\nCitra Lestari Dewi, 0087654321`}
                    value={modalMultiText}
                    onChange={(e) => setModalMultiText(e.target.value)}
                  />
                  <div className="mt-1.5 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-800 space-y-1">
                    <p className="font-semibold">Format Baris:</p>
                    <p>• <code>Nama Siswa</code> saja (NISN kosong)</p>
                    <p>• <code>Nama Siswa, NISN</code> (pisahkan dengan koma atau tab dari copy Excel/Word)</p>
                    <p>Semua baris di atas otomatis masuk ke <strong>Kelas {modalTargetKelas || "yang dipilih"}</strong>.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button type="button" variant="outline" onClick={() => setTambahSiswaModalOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={modalSubmitting || !modalMultiText.trim()} className="bg-emerald-600 hover:bg-emerald-700">
                    {modalSubmitting ? "Memproses..." : "Simpan Semua Siswa"}
                  </Button>
                </div>
              </form>
            )}

            {/* Tab 3: Upload Excel */}
            {modalActiveTab === "excel" && (
              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center space-y-3">
                  <FileSpreadsheet className="h-10 w-10 text-emerald-600 mx-auto" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Import Siswa untuk Kelas {modalTargetKelas}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Format kolom Excel: Kolom A = <strong>Nama Siswa</strong>, Kolom B = <strong>NISN</strong> (opsional).
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                      className="text-xs gap-1.5"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Unduh Template Excel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={modalSubmitting}
                      onClick={() => modalExcelRef.current?.click()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" /> {modalSubmitting ? "Mengimport..." : "Pilih File Excel"}
                    </Button>
                    <input
                      ref={modalExcelRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={importModalExcel}
                      className="hidden"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" onClick={() => setTambahSiswaModalOpen(false)}>
                    Tutup
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
