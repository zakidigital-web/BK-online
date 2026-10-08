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
import { Users, Plus, Trash2, GraduationCap, ShieldCheck, UserCog, KeyRound, Upload, FileSpreadsheet, Pencil, Search, CheckSquare, Square } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
  const [searchQuery, setSearchQuery] = useState("")

  // State untuk batch selection & edit
  const [selectedGuruIds, setSelectedGuruIds] = useState<string[]>([])
  const [batchRoleModalOpen, setBatchRoleModalOpen] = useState(false)
  const [batchRole, setBatchRole] = useState("guru")
  const [batchKelas, setBatchKelas] = useState("")
  const [batchMapel, setBatchMapel] = useState("")
  const [batchLoading, setBatchLoading] = useState(false)

  // State untuk edit akun guru & role
  const [editTarget, setEditTarget] = useState<GuruData | null>(null)
  const [editName, setEditName] = useState("")
  const [editRole, setEditRole] = useState("guru")
  const [editKelas, setEditKelas] = useState("")
  const [editMapel, setEditMapel] = useState("")
  const [editNipy, setEditNipy] = useState("")
  const [editLoading, setEditLoading] = useState(false)

  const [resetTarget, setResetTarget] = useState<GuruData | null>(null)
  const [resetPassword, setResetPassword] = useState("")
  const [resetLoading, setResetLoading] = useState(false)

  const importFileRef = useRef<HTMLInputElement>(null)
  const [importLoading, setImportLoading] = useState(false)

  function toggleSelectGuru(id: string) {
    setSelectedGuruIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  function toggleSelectAll(filteredList: GuruData[]) {
    const nonAdminList = filteredList.filter(g => g.role !== "admin")
    const nonAdminIds = nonAdminList.map(g => g.id)
    const isAllSelected = nonAdminIds.length > 0 && nonAdminIds.every(id => selectedGuruIds.includes(id))
    if (isAllSelected) {
      setSelectedGuruIds(prev => prev.filter(id => !nonAdminIds.includes(id)))
    } else {
      setSelectedGuruIds(prev => Array.from(new Set([...prev, ...nonAdminIds])))
    }
  }

  async function handleBatchUpdateRole(e: React.FormEvent) {
    e.preventDefault()
    if (selectedGuruIds.length === 0) return
    setBatchLoading(true)
    try {
      const res = await fetch("/api/admin/guru", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedGuruIds,
          role: batchRole,
          kelas: batchRole === "walas" ? batchKelas || null : null,
          mapel: batchRole === "guru-mapel" ? batchMapel.trim() || null : (batchRole === "guru" ? "BK" : null),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal mengubah role")
      toast.success(`${data.count || selectedGuruIds.length} akun guru berhasil diperbarui menjadi ${roleLabel[batchRole] || batchRole}`)
      setSelectedGuruIds([])
      setBatchRoleModalOpen(false)
      fetchGuru()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal batch update role")
    } finally {
      setBatchLoading(false)
    }
  }

  function bukaEditModal(g: GuruData) {
    setEditTarget(g)
    setEditName(g.name || "")
    setEditRole(g.role || "guru")
    setEditKelas(g.kelas || "")
    setEditMapel(g.mapel || "")
    setEditNipy(g.nipy || "")
  }

  async function handleUpdateGuru(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    if (!editName.trim()) {
      toast.error("Nama lengkap tidak boleh kosong")
      return
    }

    setEditLoading(true)
    try {
      const res = await fetch("/api/admin/guru", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editTarget.id,
          name: editName.trim(),
          role: editRole,
          kelas: editRole === "walas" ? editKelas || null : null,
          mapel: editRole === "guru-mapel" || editRole === "guru" ? editMapel.trim() || (editRole === "guru" ? "BK" : null) : null,
          nipy: editNipy.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui akun")

      toast.success(`Data akun ${data.guru.name} berhasil diperbarui (${roleLabel[editRole] || editRole})`)
      setEditTarget(null)
      fetchGuru()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memperbarui akun")
    } finally {
      setEditLoading(false)
    }
  }

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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-lg">Daftar Akun Guru & Staf ({guru.length})</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Kelola peran Guru BK, Guru Biasa/Mapel, dan Wali Kelas</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-48 sm:w-60">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Cari nama, NIP, mapel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-slate-50 border-slate-200"
                />
              </div>
              <Select value={filterRole} onValueChange={(v) => setFilterRole(v ?? "all")}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
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
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const q = searchQuery.toLowerCase().trim()
            const filtered = guru.filter((g) => {
              const matchesRole = filterRole === "all" || g.role === filterRole
              const matchesSearch =
                !q ||
                g.name.toLowerCase().includes(q) ||
                g.email.toLowerCase().includes(q) ||
                (g.nipy && g.nipy.toLowerCase().includes(q)) ||
                (g.kelas && g.kelas.toLowerCase().includes(q)) ||
                (g.mapel && g.mapel.toLowerCase().includes(q))
              return matchesRole && matchesSearch
            })

            if (filtered.length === 0) {
              return (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-400">
                    {searchQuery
                      ? `Tidak ada akun yang cocok dengan pencarian "${searchQuery}".`
                      : filterRole === "all"
                      ? "Belum ada akun guru/staf."
                      : `Tidak ada akun ${roleLabel[filterRole] || filterRole}.`}
                  </p>
                </div>
              )
            }

            const nonAdminFiltered = filtered.filter(g => g.role !== "admin")
            const isAllFilteredSelected = nonAdminFiltered.length > 0 && nonAdminFiltered.every(g => selectedGuruIds.includes(g.id))

            return (
              <div className="space-y-3">
                {/* Batch Action Toolbar */}
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSelectAll(filtered)}
                      className="h-7 px-2 text-xs font-medium text-slate-700 hover:text-blue-600 gap-1.5"
                    >
                      {isAllFilteredSelected ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400" />
                      )}
                      <span>{isAllFilteredSelected ? "Batal Pilih Semua" : "Pilih Semua (Non-Admin)"}</span>
                    </Button>
                    {selectedGuruIds.length > 0 && (
                      <Badge className="bg-blue-600 text-white font-medium text-[11px]">
                        {selectedGuruIds.length} dipilih
                      </Badge>
                    )}
                  </div>

                  {selectedGuruIds.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => {
                          setBatchRole("guru")
                          setBatchKelas("")
                          setBatchMapel("")
                          setBatchRoleModalOpen(true)
                        }}
                        className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1 shadow-sm"
                      >
                        <UserCog className="h-3.5 w-3.5" />
                        <span>Batch Ubah Role ({selectedGuruIds.length})</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedGuruIds([])}
                        className="h-7 text-xs px-2 text-slate-600"
                      >
                        Batal
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {filtered.map((g, i) => {
                    const isSelected = selectedGuruIds.includes(g.id)
                    const isAdmin = g.role === "admin"

                    return (
                      <motion.div
                        key={g.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.02, 0.3) }}
                        className={`flex items-center justify-between gap-3 rounded-xl border p-3 sm:px-4 shadow-sm transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-400"
                            : "border-slate-200 bg-white hover:border-blue-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Checkbox selector */}
                          <div className="shrink-0 flex items-center">
                            {isAdmin ? (
                              <div className="w-5 h-5 flex items-center justify-center text-slate-300" title="Akun Admin dilindungi">
                                <ShieldCheck className="h-4 w-4" />
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleSelectGuru(g.id)}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 transition-colors"
                              >
                                {isSelected ? (
                                  <CheckSquare className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-400" />
                                )}
                              </button>
                            )}
                          </div>

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                            {g.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900 text-sm">{g.name}</span>
                              <Badge className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleColor[g.role] || "bg-gray-100 text-gray-600"}`}>
                                {roleLabel[g.role] || g.role}
                              </Badge>
                              {g.kelas && (
                                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">
                                  Kelas {g.kelas}
                                </Badge>
                              )}
                              {g.mapel && (
                                <Badge variant="outline" className="text-[10px] bg-sky-50 text-sky-800 border-sky-200">
                                  {g.mapel}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                              <span>User: <strong className="text-gray-700">{g.email}</strong></span>
                              {g.nipy && <span>NIP: {g.nipy}</span>}
                            </div>
                          </div>
                        </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => bukaEditModal(g)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2"
                        title="Edit Peran & Data Akun"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="hidden md:inline ml-1 text-xs">Edit Role</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setResetTarget(g); setResetPassword("") }}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-8 w-8 p-0"
                        title="Reset password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => hapusGuru(g.id, g.name)}
                        disabled={g.role === "admin"}
                        className={`h-8 w-8 p-0 ${g.role === "admin" ? "text-gray-300 cursor-not-allowed" : "text-red-500 hover:text-red-700 hover:bg-red-50"}`}
                        title={g.role === "admin" ? "Akun admin tidak dapat dihapus" : "Hapus akun"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
                </div>
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Modal Edit Guru & Role */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <UserCog className="h-5 w-5 text-blue-600" />
              Edit Akun: {editTarget?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateGuru} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Nama Lengkap & Gelar</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nama lengkap"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Username Login</label>
              <Input
                value={editTarget?.email || ""}
                disabled
                className="bg-slate-100 text-gray-500 cursor-not-allowed"
              />
              <span className="text-[11px] text-gray-400">Username login tidak dapat diubah</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Peran / Role Akun</label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v ?? "guru")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guru">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-700 text-[10px]">Guru BK</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="guru-mapel">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 text-[10px]">Guru Mapel (Guru Biasa)</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="walas">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-100 text-amber-700 text-[10px]">Wali Kelas</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-700 text-[10px]">Administrator</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-gray-500">
                {editRole === "guru" && "Guru BK memiliki hak akses ke modul bimbingan konseling, curhat, asesmen guru, dan laporan psikologi siswa."}
                {editRole === "guru-mapel" && "Guru Biasa / Mapel memiliki hak akses modul asesmen kompetensi guru dan data pengajaran."}
                {editRole === "walas" && "Wali Kelas dapat memantau data perkembangan siswa di kelas binaannya."}
                {editRole === "admin" && "Super Administrator dengan akses penuh ke seluruh pengaturan sekolah."}
              </p>
            </div>

            {editRole === "walas" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Kelas Binaan</label>
                <Select value={editKelas} onValueChange={(v) => setEditKelas(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kelas binaan..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectItem value="">-- Pilih Kelas --</SelectItem>
                    {kelasList.map((k) => (
                      <SelectItem key={k} value={k}>Kelas {k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(editRole === "guru-mapel" || editRole === "guru") && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Mata Pelajaran (Mapel)</label>
                <Input
                  value={editMapel}
                  onChange={(e) => setEditMapel(e.target.value)}
                  placeholder={editRole === "guru" ? "Contoh: BK / Bimbingan Konseling" : "Contoh: Matematika, Bahasa Indonesia, IPA"}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">NIP / NIPY (Opsional)</label>
              <Input
                value={editNipy}
                onChange={(e) => setEditNipy(e.target.value)}
                placeholder="Nomor Induk Pegawai / Yayasan"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>
                Batal
              </Button>
              <Button type="submit" disabled={editLoading} className="bg-blue-600 hover:bg-blue-700">
                {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Reset Password */}
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

      {/* Modal Batch Edit Role */}
      <Dialog open={batchRoleModalOpen} onOpenChange={setBatchRoleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <UserCog className="h-5 w-5 text-blue-600" />
              Batch Ubah Peran ({selectedGuruIds.length} Akun Terpilih)
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBatchUpdateRole} className="space-y-4 pt-1">
            <div className="rounded-lg bg-blue-50/70 p-3 border border-blue-100 text-xs text-blue-800">
              Peran dari <strong>{selectedGuruIds.length} akun guru terpilih</strong> akan diubah secara serentak.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Pilih Peran Baru</label>
              <Select value={batchRole} onValueChange={(v) => setBatchRole(v ?? "guru")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guru">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-700 text-[10px]">Guru BK</Badge>
                      <span className="text-xs text-gray-500">- Akses konseling, asesmen BK</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="guru-mapel">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 text-[10px]">Guru Mapel</Badge>
                      <span className="text-xs text-gray-500">- Guru biasa mata pelajaran</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="walas">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-100 text-amber-700 text-[10px]">Wali Kelas</Badge>
                      <span className="text-xs text-gray-500">- Akses pantau kelas binaan</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {batchRole === "walas" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Tetapkan Kelas Binaan (Opsional)</label>
                <Select value={batchKelas} onValueChange={(v) => setBatchKelas(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kelas (atau kosongkan)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-- Kosongkan / Atur Nanti --</SelectItem>
                    {kelasList.map((k) => (
                      <SelectItem key={k} value={k}>Kelas {k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {batchRole === "guru-mapel" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Mata Pelajaran (Opsional)</label>
                <Input
                  value={batchMapel}
                  onChange={(e) => setBatchMapel(e.target.value)}
                  placeholder="Contoh: Matematika, IPA (kosongkan jika berbeda-beda)"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setBatchRoleModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={batchLoading} className="bg-blue-600 hover:bg-blue-700">
                {batchLoading ? "Memproses..." : `Terapkan ke ${selectedGuruIds.length} Guru`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
