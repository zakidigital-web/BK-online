"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Users, Plus, Trash2, GraduationCap, ShieldCheck, UserCog, KeyRound, Upload, FileSpreadsheet } from "lucide-react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import * as XLSX from "xlsx"

interface GuruData {
  id: string
  name: string
  email: string
  role: string
  nipy: string | null
  kelas: string | null
  mapel: string | null
  createdAt: string
}

const roleLabel: Record<string, string> = {
  admin: "Admin",
  guru: "Guru BK",
  "guru-mapel": "Guru Mapel",
  walas: "Wali Kelas",
  siswa: "Siswa",
}

const roleColor: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  guru: "bg-blue-100 text-blue-700",
  walas: "bg-amber-100 text-amber-700",
  "guru-mapel": "bg-green-100 text-green-700",
}

export default function GuruPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "guru") router.push("/admin/dashboard")
  }, [user, router])

  const [guru, setGuru] = useState<GuruData[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("guru")
  const [nipy, setNipy] = useState("")
  const [kelas, setKelas] = useState("")
  const [mapel, setMapel] = useState("")
  const [kelasList, setKelasList] = useState<string[]>([])
  const [filterRole, setFilterRole] = useState("all")

  const [resetTarget, setResetTarget] = useState<GuruData | null>(null)
  const [resetPassword, setResetPassword] = useState("")
  const [resetLoading, setResetLoading] = useState(false)

  const importFileRef = useRef<HTMLInputElement>(null)
  const [importLoading, setImportLoading] = useState(false)

  function downloadTemplateGuru() {
    const wb = XLSX.utils.book_new()
    const data = [["Nama", "Username", "Password", "Role", "NIPY", "Kelas", "Mapel"],
      ["Contoh Guru BK", "guru.bk", "password123", "guru", "12345", "7A", ""],
      ["Contoh Wali Kelas", "walas", "walas123", "walas", "67890", "7A", ""],
    ]
    const ws = XLSX.utils.aoa_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, "Guru")
    XLSX.writeFile(wb, "template-guru.xlsx")
  }

  async function importGuruExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportLoading(true)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf)
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[wb.SheetNames[0]])
      const guru: { nama: string; username: string; password?: string; role?: string; nipy?: string; kelas?: string; mapel?: string }[] = []
      for (const row of rows) {
        const nama = (row["Nama"] || "").trim()
        const username = (row["Username"] || "").trim()
        if (!nama || !username) continue
        guru.push({
          nama,
          username,
          password: (row["Password"] || "").trim() || undefined,
          role: ["admin", "guru", "guru-mapel", "walas"].includes(row["Role"]?.trim()) ? row["Role"].trim() : "guru",
          nipy: (row["NIPY"] || "").trim() || undefined,
          kelas: (row["Kelas"] || "").trim().toUpperCase() || undefined,
          mapel: (row["Mapel"] || "").trim() || undefined,
        })
      }
      if (guru.length === 0) { toast.error("Tidak ada data guru valid di file"); return }
      const res = await fetch("/api/admin/guru/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guru }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Gagal import")
      toast.success(`${result.berhasil} akun berhasil diimport dari ${result.total} data`)
      fetchGuru()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal import Excel")
    } finally {
      setImportLoading(false)
      if (importFileRef.current) importFileRef.current.value = ""
    }
  }

  useEffect(() => { fetchGuru(); fetchKelas() }, [])

  async function fetchGuru() {
    try {
      const res = await fetch("/api/admin/guru")
      const data = await res.json()
      setGuru(data.guru || [])
    } catch { toast.error("Gagal memuat data guru") }
  }

  async function fetchKelas() {
    try {
      const res = await fetch("/api/kelas")
      const data = await res.json()
      setKelasList((data.kelas || []).map((k: { nama: string }) => k.nama))
    } catch { /* silent */ }
  }

  async function tambahGuru() {
    if (!name.trim() || !username.trim() || !password) {
      toast.error("Nama, username, dan password harus diisi"); return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/admin/guru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          password,
          role,
          nipy: nipy.trim() || undefined,
          kelas: kelas || undefined,
          mapel: mapel.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal")
      toast.success(`${roleLabel[role]} ${data.guru.name} ditambahkan`)
      setName(""); setUsername(""); setPassword(""); setNipy(""); setKelas(""); setMapel(""); setRole("guru")
      fetchGuru()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menambah guru")
    } finally { setLoading(false) }
  }

  async function hapusGuru(id: string, name: string) {
    if (!confirm(`Hapus akun ${name}?`)) return
    try {
      const res = await fetch("/api/admin/guru", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Akun ${name} dihapus`)
      fetchGuru()
    } catch { toast.error("Gagal menghapus guru") }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!resetTarget || !resetPassword) return
    if (resetPassword.length < 4) { toast.error("Password minimal 4 karakter"); return }
    setResetLoading(true)
    try {
      const res = await fetch("/api/auth/password/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: resetTarget.id, newPassword: resetPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal")
      toast.success(`Password ${resetTarget.name} berhasil direset`)
      setResetTarget(null)
      setResetPassword("")
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Gagal mereset password") }
    finally { setResetLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
          <GraduationCap className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kelola Akun Guru, Wali Kelas & Admin</h1>
          <p className="text-sm text-gray-500">
            {guru.length} akun | 
            {[["admin","Admin"],["guru","Guru BK"],["guru-mapel","Guru Mapel"],["walas","Wali Kelas"]]
              .map(([r,l]) => `${guru.filter(g=>g.role===r).length} ${l}`)
              .join(", ")}
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCog className="h-5 w-5 text-blue-600" />
            Tambah Akun Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Input placeholder="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
              <Input placeholder="Username (email)" value={username} onChange={(e) => setUsername(e.target.value)} className="max-w-xs" />
              <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="max-w-[160px]" />
              <Select value={role} onValueChange={(v) => setRole(v ?? "guru")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guru">Guru BK</SelectItem>
                  <SelectItem value="guru-mapel">Guru Mapel</SelectItem>
                  <SelectItem value="walas">Wali Kelas</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input placeholder="NIPY (opsional)" value={nipy} onChange={(e) => setNipy(e.target.value)} className="max-w-[160px]" />
              <Select value={kelas} onValueChange={(v) => setKelas(v ?? "")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Tanpa kelas --</SelectItem>
                  {kelasList.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Mapel (opsional)" value={mapel} onChange={(e) => setMapel(e.target.value)} className="max-w-[160px]" />
              <Button onClick={tambahGuru} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" /> Tambah
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Import Akun dari Excel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">
            Upload file Excel dengan kolom: Nama, Username, Password, Role, NIPY, Kelas, Mapel.
            Password opsional (default = username). Role: <Badge variant="outline" className="text-[10px]">guru</Badge> (Guru BK), <Badge variant="outline" className="text-[10px]">walas</Badge>, <Badge variant="outline" className="text-[10px]">guru-mapel</Badge>, <Badge variant="outline" className="text-[10px]">admin</Badge>.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplateGuru} className="gap-1.5">
              <FileSpreadsheet className="h-4 w-4" /> Download Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => importFileRef.current?.click()} disabled={importLoading} className="gap-1.5">
              <Upload className="h-4 w-4" /> {importLoading ? "Mengimport..." : "Upload Excel"}
            </Button>
            <input ref={importFileRef} type="file" accept=".xlsx,.xls" onChange={importGuruExcel} className="hidden" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg">Daftar Akun ({guru.length})</CardTitle>
            <Select value={filterRole} onValueChange={(v) => setFilterRole(v ?? "all")}>
              <SelectTrigger className="w-[150px] h-8">
                <SelectValue placeholder="Semua role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua role</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="guru">Guru BK</SelectItem>
                <SelectItem value="guru-mapel">Guru Mapel</SelectItem>
                <SelectItem value="walas">Wali Kelas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const filtered = filterRole === "all" ? guru : guru.filter((g) => g.role === filterRole)
            if (filtered.length === 0) {
              return (
                <p className="text-sm text-gray-400 text-center py-8">
                  {filterRole === "all" ? "Belum ada akun guru/admin." : `Tidak ada akun ${roleLabel[filterRole] || filterRole}.`}
                </p>
              )
            }
            return (
              <div className="space-y-2">
                {filtered.map((g, i) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {g.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{g.name}</div>
                      <div className="text-xs text-gray-400 truncate">{g.email}</div>
                    </div>
                    <Badge className={`text-[10px] ${roleColor[g.role] || "bg-gray-100 text-gray-600"}`}>
                      {roleLabel[g.role] || g.role}
                    </Badge>
                    {g.nipy && <span className="text-xs text-gray-400 hidden sm:inline">NIPY: {g.nipy}</span>}
                    {g.kelas && <span className="text-xs text-gray-400 hidden sm:inline">Kelas: {g.kelas}</span>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => { setResetTarget(g); setResetPassword("") }}
                      className="text-blue-400 hover:text-blue-600 hover:bg-blue-50" title="Reset password">
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => hapusGuru(g.id, g.name)}
                      disabled={g.role === "admin"}
                      className={`${g.role === "admin" ? "text-gray-300 cursor-not-allowed" : "text-red-400 hover:text-red-600 hover:bg-red-50"}`}
                      title={g.role === "admin" ? "Akun admin tidak dapat dihapus" : "Hapus akun"}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
          })()}
        </CardContent>
      </Card>

      <Dialog open={!!resetTarget} onOpenChange={(o) => { if (!o) setResetTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-blue-600" />
              Reset Password: {resetTarget?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input type="password" placeholder="Password baru (min 4 karakter)" value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)} required autoFocus />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setResetTarget(null)}>Batal</Button>
              <Button type="submit" disabled={resetLoading} className="bg-blue-600 hover:bg-blue-700">
                {resetLoading ? "Menyimpan..." : "Reset Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
