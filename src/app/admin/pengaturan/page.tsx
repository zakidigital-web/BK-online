"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useTheme } from "@/lib/theme-context"
import {
  School, Plus, Trash2, Download, Upload, FileSpreadsheet, KeyRound,
  Database, AlertTriangle, Palette, ShieldCheck, Eye, EyeOff, RefreshCw,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import * as XLSX from "xlsx"

export default function PengaturanPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { preset, setPreset, presets } = useTheme()
  const [showDemo, setShowDemo] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("bk_show_demo_accounts")
    if (stored !== null) setShowDemo(stored === "true")
  }, [])

  function toggleDemo(checked: boolean) {
    setShowDemo(checked)
    localStorage.setItem("bk_show_demo_accounts", String(checked))
  }

  const isSuperAdmin = user?.role === "admin"
  const isGuruBK = user?.role === "guru"

  useEffect(() => {
    if (user && user.role === "siswa") router.push("/curhat")
  }, [user, router])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>

      {/* Tema Aplikasi */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-primary" /> Tema Aplikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Pilih warna utama untuk tampilan aplikasi.</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(presets).map(([key, p]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPreset(key)}
                className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 transition-all ${
                  preset === key ? "border-gray-900 shadow-md scale-105" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="h-6 w-6 rounded-full border border-white/30 shadow-sm" style={{ backgroundColor: p.hex }} />
                <span className="text-sm font-medium text-gray-700">{p.label}</span>
                {preset === key && <Badge className="bg-gray-900 text-white border-0 text-[10px] px-1.5">Dipilih</Badge>}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tampilkan Akun Demo */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <EyeOff className="h-5 w-5 text-primary" /> Tampilkan Akun Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tampilkan akun demo di halaman login untuk memudahkan pengguna baru.</p>
              <p className="text-xs text-gray-400 mt-0.5">Nonaktifkan saat aplikasi sudah digunakan oleh sekolah.</p>
            </div>
            <Switch checked={showDemo} onCheckedChange={toggleDemo} />
          </div>
          {isSuperAdmin && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-gray-400 mb-2">Inisialisasi akun demo jika belum ada (admin, guru, walas, siswa).</p>
              <SeedDemoButton />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Identitas Sekolah */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <School className="h-5 w-5 text-primary" /> Identitas Sekolah
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="font-semibold text-gray-900">SMP Negeri 1 Genteng</p>
            <p className="text-sm text-gray-500">Jl. Raya Genteng No. 1, Genteng, Banyuwangi</p>
            <p className="text-sm text-gray-500">Telp. (0333) 8451234 | Email: smpn1genteng@sch.id</p>
          </div>
        </CardContent>
      </Card>

      {/* Ubah Password */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-5 w-5 text-primary" /> Ubah Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UbahPasswordForm />
        </CardContent>
      </Card>

      {/* Manajemen Kelas */}
      <KelasManager />

      {/* Backup & Restore Database — hanya admin */}
      {isSuperAdmin && <BackupRestoreSection />}

      {/* Reset Data — hanya super admin */}
      {isSuperAdmin && <ResetDataSection />}
    </div>
  )
}

function UbahPasswordForm() {
  const { user } = useAuth()
  const [oldPw, setOldPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newPw || newPw.length < 4) { toast.error("Password minimal 4 karakter"); return }
    if (newPw !== confirmPw) { toast.error("Password tidak cocok"); return }
    setLoading(true)
    try {
      const body = user?.role === "siswa"
        ? { oldPassword: oldPw, newPassword: newPw }
        : { oldPassword: oldPw, newPassword: newPw }
      const res = await fetch("/api/auth/password", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Gagal")
      toast.success("Password berhasil diubah")
      setOldPw(""); setNewPw(""); setConfirmPw("")
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Gagal") }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="relative">
        <Input type={show ? "text" : "password"} placeholder="Password lama" value={oldPw} onChange={(e) => setOldPw(e.target.value)} required />
      </div>
      <div className="relative">
        <Input type={show ? "text" : "password"} placeholder="Password baru (min 4)" value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
      </div>
      <div className="relative">
        <Input type={show ? "text" : "password"} placeholder="Konfirmasi password baru" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required />
      </div>
      <Button type="button" variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setShow(!show)}>
        {show ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />} {show ? "Sembunyikan" : "Tampilkan"}
      </Button>
      <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">{loading ? "Menyimpan..." : "Simpan Password"}</Button>
    </form>
  )
}

function KelasManager() {
  const [kelasList, setKelasList] = useState<string[]>([])
  const [newKelas, setNewKelas] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchKelas() }, [])

  async function fetchKelas() {
    try {
      const res = await fetch("/api/kelas")
      const data = await res.json()
      setKelasList(data.kelas?.map((k: { nama: string }) => k.nama) || [])
    } catch {}
  }

  async function tambahKelas() {
    if (!newKelas.trim()) return
    try {
      const res = await fetch("/api/kelas", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama: newKelas.trim().toUpperCase() }),
      })
      if (!res.ok) throw new Error()
      toast.success("Kelas ditambahkan")
      setNewKelas(""); fetchKelas()
    } catch { toast.error("Gagal") }
  }

  async function hapusKelas(nama: string) {
    if (!confirm(`Hapus kelas ${nama}?`)) return
    try {
      const res = await fetch("/api/kelas", {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama }),
      })
      if (!res.ok) throw new Error()
      toast.success("Kelas dihapus")
      fetchKelas()
    } catch { toast.error("Gagal") }
  }

  function downloadTemplate() {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([["Nama Kelas"], [""]])
    XLSX.utils.book_append_sheet(wb, ws, "Kelas")
    XLSX.writeFile(wb, "template-kelas.xlsx")
  }

  function exportKelas() {
    if (kelasList.length === 0) { toast.error("Tidak ada data kelas"); return }
    const data = kelasList.map((k) => ({ Kelas: k }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, "Kelas")
    XLSX.writeFile(wb, "data-kelas.xlsx")
  }

  async function importKelas(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: "array" })
      const rows = XLSX.utils.sheet_to_json<{ "Nama Kelas"?: string; Kelas?: string }>(wb.Sheets[wb.SheetNames[0]])
      let sukses = 0
      for (const row of rows) {
        const nama = (row["Nama Kelas"] || row["Kelas"] || "").toString().trim().toUpperCase()
        if (!nama) continue
        try {
          await fetch("/api/kelas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama }) })
          sukses++
        } catch {}
      }
      toast.success(`${sukses} kelas diimport`)
      fetchKelas()
    } catch { toast.error("Gagal membaca file") }
    e.target.value = ""
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <School className="h-5 w-5 text-primary" /> Manajemen Kelas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Nama kelas baru (contoh: 7A)" value={newKelas} onChange={(e) => setNewKelas(e.target.value)}
            className="max-w-xs" onKeyDown={(e) => e.key === "Enter" && tambahKelas()} />
          <Button onClick={tambahKelas} className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4" /> Tambah</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="h-4 w-4" /> Template</Button>
          <Button variant="outline" size="sm" onClick={exportKelas}><FileSpreadsheet className="h-4 w-4" /> Export Excel</Button>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Import Excel</Button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={importKelas} />
        </div>

        <div className="flex flex-wrap gap-2">
          {kelasList.map((k) => (
            <Badge key={k} variant="secondary" className="flex items-center gap-1 pl-3">
              {k}
              <button onClick={() => hapusKelas(k)} className="hover:text-red-500 ml-1"><Trash2 className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function BackupRestoreSection() {
  const [restoring, setRestoring] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function backup() {
    try {
      const res = await fetch("/api/admin/backup")
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = `bk-backup-${new Date().toISOString().slice(0, 10)}.db`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Backup database berhasil")
    } catch { toast.error("Gagal backup") }
  }

  async function restore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!confirm("Pulihkan database? Data saat ini akan ditimpa! Backup otomatis akan dibuat.")) { e.target.value = ""; return }
    setRestoring(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/admin/restore", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(data.message || "Database dipulihkan!")
      setTimeout(() => window.location.reload(), 1500)
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Gagal restore") }
    finally { setRestoring(false); e.target.value = "" }
  }

  return (
    <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5 text-amber-600" /> Backup & Restore Database
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">Backup seluruh database atau pulihkan dari file backup sebelumnya.</p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={backup} className="bg-amber-600 hover:bg-amber-700 gap-2"><Download className="h-4 w-4" /> Backup Database</Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={restoring} className="gap-2">
            <Upload className="h-4 w-4" /> {restoring ? "Memulihkan..." : "Restore Database"}
          </Button>
          <input ref={fileRef} type="file" accept=".db" className="hidden" onChange={restore} />
        </div>
      </CardContent>
    </Card>
  )
}

function ResetDataSection() {
  const [loading, setLoading] = useState<string | null>(null)

  async function resetData(target: string) {
    const label: Record<string, string> = {
      asesmen: "semua data asesmen siswa",
      chat: "semua chat",
      siswa: "semua data siswa (termasuk asesmen)",
      kelas: "semua data kelas",
      users: "semua akun (kecuali akun Anda)",
      all: "SEMUA data (tidak bisa dikembalikan!)",
    }
    if (!confirm(`Hapus ${label[target] || target}?`)) return
    setLoading(target)
    try {
      const res = await fetch("/api/admin/reset", {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Data ${target} berhasil direset`)
    } catch { toast.error("Gagal") }
    finally { setLoading(null) }
  }

  const items = [
    { target: "asesmen", label: "Hapus Asesmen", desc: "Asesmen Minat Bakat, Psikologi, Gaya Belajar, Karakter" },
    { target: "chat", label: "Hapus Chat", desc: "Semua percakapan curhat anonim" },
    { target: "siswa", label: "Hapus Siswa", desc: "Data siswa + asesmen (User siswa ikut terhapus)" },
    { target: "kelas", label: "Hapus Kelas", desc: "Daftar kelas" },
    { target: "users", label: "Hapus Akun", desc: "Semua akun (kecuali akun Anda)" },
    { target: "all", label: "Hapus SEMUA", desc: "Semua data termasuk asesmen, chat, siswa, kelas, akun" },
  ]

  return (
    <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-red-600">
          <AlertTriangle className="h-5 w-5" /> Reset Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">Data yang dihapus tidak bisa dikembalikan. Backup database terlebih dahulu jika ragu.</p>
        <div className="flex flex-wrap gap-2">
          {items.map(({ target, label, desc }) => (
            <Button key={target} variant={target === "all" ? "destructive" : "outline"} size="sm"
              onClick={() => resetData(target)} disabled={loading !== null}
              className={target !== "all" ? "border-red-200 text-red-600 hover:bg-red-50" : ""}>
              {loading === target ? "..." : label}
            </Button>
          ))}
        </div>
        <div className="text-xs text-gray-400 space-y-0.5">
          {items.map(({ target, desc }) => (
            <p key={target}><span className="font-medium">{target}</span>: {desc}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SeedDemoButton() {
  const [seeding, setSeeding] = useState(false)

  async function handleSeed() {
    setSeeding(true)
    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { Authorization: "Bearer bk-seed-local" },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Berhasil: ${data.created} akun baru, ${data.skipped} sudah ada`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal seed akun demo")
    } finally {
      setSeeding(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding} className="gap-2 text-xs">
      <RefreshCw className={`h-3.5 w-3.5 ${seeding ? "animate-spin" : ""}`} />
      {seeding ? "Inisialisasi..." : "Inisialisasi Akun Demo"}
    </Button>
  )
}
