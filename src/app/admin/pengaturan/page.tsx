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
  Info, HelpCircle, Layers, Sparkles,
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

      {/* Pengaturan Penjelasan & Panduan Login */}
      <PengaturanLoginSection />

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
            <p className="text-sm text-gray-500">Jl. Bromo No. 49, Genteng Kulon, Kec. Genteng, Banyuwangi, Jawa Timur 68465</p>
            <p className="text-sm text-gray-500">NPSN: 20525726 | Akreditasi: A | Web: www.smpn1genteng.sch.id</p>
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

function PengaturanLoginSection() {
  const [enabled, setEnabled] = useState(true)
  const [title, setTitle] = useState("Informasi & Panduan Masuk Akun")
  const [text, setText] = useState(
    "• Siswa: Masuk menggunakan NISN (sebagai username dan password awal).\n• Guru & Wali Kelas: Masuk menggunakan NIP atau Username terdaftar.\n• Kendala login: Silakan hubungi Guru BK atau Admin sekolah."
  )
  const [demoEnabled, setDemoEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/setting")
      .then((res) => res.json())
      .then((data) => {
        const s = data.settings || {}
        if (s.login_guide_enabled !== undefined) setEnabled(s.login_guide_enabled === "true")
        if (s.login_guide_title) setTitle(s.login_guide_title)
        if (s.login_guide_text) setText(s.login_guide_text)
        if (s.login_demo_enabled !== undefined) setDemoEnabled(s.login_demo_enabled === "true")
      })
      .catch(() => {})
  }, [])

  async function handleSave() {
    setLoading(true)
    try {
      const res = await fetch("/api/setting", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            login_guide_enabled: String(enabled),
            login_guide_title: title.trim(),
            login_guide_text: text.trim(),
            login_demo_enabled: String(demoEnabled),
          },
        }),
      })
      if (!res.ok) throw new Error()
      localStorage.setItem("bk_show_demo_accounts", String(demoEnabled))
      toast.success("Pengaturan informasi login berhasil disimpan")
    } catch {
      toast.error("Gagal menyimpan pengaturan login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5 text-primary" /> Pengaturan Informasi & Panduan Login
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <p className="text-sm font-semibold text-slate-800">Tampilkan Kotak Penjelasan di Halaman Login</p>
            <p className="text-xs text-slate-500">
              {enabled ? "Kotak panduan sedang AKTIF dan dapat dibaca oleh siswa/guru." : "Kotak panduan saat ini DINONAKTIFKAN (disembunyikan)."}
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Judul Kotak Penjelasan</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Informasi & Panduan Masuk Akun"
                className="bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Teks Penjelasan / Petunjuk Akun</Label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tuliskan petunjuk login siswa, guru, wali kelas..."
              />
              <p className="text-[11px] text-slate-400">Tekan Enter untuk membuat baris baru atau poin baru.</p>
            </div>

            {/* Live Preview Box */}
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 text-xs">
              <p className="text-[10px] uppercase font-bold tracking-wider text-blue-700 mb-1.5">Pratinjau di Halaman Login:</p>
              <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-blue-600" />
                <span>{title || "Panduan Masuk Akun"}</span>
              </div>
              <div className="whitespace-pre-line text-slate-600 leading-relaxed font-normal">
                {text || "Belum ada teks petunjuk."}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <p className="text-sm font-semibold text-slate-800">Tombol Otomatis Akun Demo</p>
            <p className="text-xs text-slate-500">Tampilkan pilihan tombol klik peran (Admin, Guru BK, Walas, Siswa) untuk pengujian.</p>
          </div>
          <Switch checked={demoEnabled} onCheckedChange={setDemoEnabled} />
        </div>

        <div className="flex justify-end pt-1">
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            {loading ? "Menyimpan..." : "Simpan Pengaturan Login"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function KelasManager() {
  const [kelasList, setKelasList] = useState<string[]>([])
  const [newKelas, setNewKelas] = useState("")
  const [addingBatch, setAddingBatch] = useState(false)
  const [filterJenjang, setFilterJenjang] = useState<string>("all")
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
    // Mendukung pemisahan koma: "7A, 7B, 7C"
    const items = newKelas
      .split(/[,;\n]+/)
      .map((k) => k.trim().toUpperCase())
      .filter(Boolean)

    if (items.length === 0) return

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
      setNewKelas("")
      fetchKelas()
    } catch {
      toast.error("Gagal menambah kelas")
    }
  }

  async function generateJenjang(jenjang: number) {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
    const targets = letters.map((l) => `${jenjang}${l}`)
    const belumAda = targets.filter((k) => !kelasList.includes(k))

    if (belumAda.length === 0) {
      toast.info(`Semua kelas ${jenjang}A–${jenjang}I sudah ada.`)
      return
    }

    setAddingBatch(true)
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
      fetchKelas()
    } catch {
      toast.error("Gagal membuat rentang kelas")
    } finally {
      setAddingBatch(false)
    }
  }

  async function hapusKelas(nama: string) {
    if (!confirm(`Hapus kelas ${nama}? Siswa di kelas ini tidak terhapus namun akan berstatus tanpa kelas.`)) return
    try {
      const res = await fetch("/api/kelas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Kelas ${nama} dihapus`)
      fetchKelas()
    } catch {
      toast.error("Gagal menghapus kelas")
    }
  }

  function downloadTemplate() {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([["Nama Kelas"], ["7A"], ["7B"], ["8A"], ["9A"]])
    XLSX.utils.book_append_sheet(wb, ws, "Kelas")
    XLSX.writeFile(wb, "template-kelas.xlsx")
  }

  function exportKelas() {
    if (kelasList.length === 0) { toast.error("Tidak ada data kelas"); return }
    const data = kelasList.map((k) => ({ "Nama Kelas": k }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, "Kelas")
    XLSX.writeFile(wb, "daftar-kelas-smpn1genteng.xlsx")
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
          const res = await fetch("/api/kelas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nama }),
          })
          if (res.ok) sukses++
        } catch {}
      }
      toast.success(`${sukses} kelas berhasil diimport`)
      fetchKelas()
    } catch {
      toast.error("Gagal membaca file excel")
    }
    e.target.value = ""
  }

  const filteredKelas = kelasList.filter((k) => {
    if (filterJenjang === "all") return true
    return k.startsWith(filterJenjang)
  })

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <School className="h-5 w-5 text-primary" /> Manajemen & Penambahan Kelas
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Kelola total {kelasList.length} rombel kelas SMP Negeri 1 Genteng</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="text-xs h-8">
              <Download className="h-3.5 w-3.5 mr-1" /> Template
            </Button>
            <Button variant="outline" size="sm" onClick={exportKelas} className="text-xs h-8">
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="text-xs h-8">
              <Upload className="h-3.5 w-3.5 mr-1" /> Import
            </Button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={importKelas} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form Tambah Efisien */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <Label className="text-xs font-semibold text-slate-700">Tambah Kelas Manual (Bisa Satu atau Banyak Dipisah Koma)</Label>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Contoh: 7J atau 7A, 7B, 7C, 7D"
              value={newKelas}
              onChange={(e) => setNewKelas(e.target.value)}
              className="max-w-md bg-white"
              onKeyDown={(e) => e.key === "Enter" && tambahKelas()}
            />
            <Button onClick={tambahKelas} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" /> Tambah Kelas
            </Button>
          </div>

          {/* Quick Generator Rombel Standar */}
          <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2 flex-wrap text-xs">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Generator Cepat:
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={addingBatch}
              onClick={() => generateJenjang(7)}
              className="h-7 text-xs bg-white hover:bg-blue-50 hover:text-blue-700"
            >
              + Rombel 7A–7I
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={addingBatch}
              onClick={() => generateJenjang(8)}
              className="h-7 text-xs bg-white hover:bg-blue-50 hover:text-blue-700"
            >
              + Rombel 8A–8I
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={addingBatch}
              onClick={() => generateJenjang(9)}
              className="h-7 text-xs bg-white hover:bg-blue-50 hover:text-blue-700"
            >
              + Rombel 9A–9I
            </Button>
          </div>
        </div>

        {/* Filter Tab & List Kelas */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 mr-1">Filter:</span>
            {[
              { id: "all", label: `Semua (${kelasList.length})` },
              { id: "7", label: `Kelas 7 (${kelasList.filter(k => k.startsWith("7")).length})` },
              { id: "8", label: `Kelas 8 (${kelasList.filter(k => k.startsWith("8")).length})` },
              { id: "9", label: `Kelas 9 (${kelasList.filter(k => k.startsWith("9")).length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterJenjang(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterJenjang === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {filteredKelas.map((k) => (
            <Badge
              key={k}
              variant="outline"
              className="flex items-center gap-1.5 pl-3 pr-2 py-1 text-xs font-semibold bg-white border-slate-200 hover:border-slate-300 shadow-sm"
            >
              <span>Kelas {k}</span>
              <button
                onClick={() => hapusKelas(k)}
                className="text-slate-400 hover:text-red-600 rounded p-0.5 transition-colors"
                title={`Hapus kelas ${k}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filteredKelas.length === 0 && (
            <p className="text-xs text-gray-400 py-3">Tidak ada kelas dalam kategori ini.</p>
          )}
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
