"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  Brain, Sparkles, BookOpen, UserCircle, BarChart3, ArrowLeft,
  Target, Lightbulb, AlertTriangle, CheckCircle, TrendingUp, Search, Users
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { StudentRadarChart } from "@/components/charts"

interface SkorItem {
  kode: string
  label: string
  skor: number
}

interface AnalisaData {
  siswa: { id: string; nama: string; kelas: string; nisn: string | null }
  asesmen: {
    minatBakat?: { skor: Record<string, number>; urutan: SkorItem[]; dominan: SkorItem & { rekomendasiKarier?: string[] }; rekomendasiKarier?: string[] }
    gayaBelajar?: { skor: Record<string, number>; urutan: SkorItem[]; dominan: SkorItem }
    psikologi?: { skor: Record<string, number>; dimensi: { label: string; skor: number; interpretasi: string }[]; catatan: string[] }
    karakter?: { skor: Record<string, number>; urutan: (SkorItem & { tingkat: string })[] }
  }
}

interface SiswaItem {
  id: string
  nama: string
  kelas: string
  nisn: string | null
  _count: { minatBakat: number; psikologi: number; gayaBelajar: number; karakterDiri: number }
}

const riasecMaxSkor: Record<string, number> = {
  R: 30, I: 30, A: 30, S: 30, E: 30, C: 30,
}

function getMaxSkor(kode: string): number {
  return riasecMaxSkor[kode] || 100
}

export default function AnalisaSiswaPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get("id")

  const [data, setData] = useState<AnalisaData | null>(null)
  const [allSiswa, setAllSiswa] = useState<SiswaItem[]>([])
  const [kelasList, setKelasList] = useState<string[]>([])
  const [filterKelas, setFilterKelas] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingSiswa, setLoadingSiswa] = useState(true)
  const [activeTab, setActiveTab] = useState("minat-bakat")

  useEffect(() => {
    async function fetchAll() {
      setLoadingSiswa(true)
      try {
        const [siswaRes, kelasRes] = await Promise.all([
          fetch("/api/siswa"),
          fetch("/api/kelas"),
        ])
        const siswaData = await siswaRes.json()
        const kelasData = await kelasRes.json()
        setAllSiswa(siswaData.siswa || [])
        setKelasList((kelasData.kelas || []).map((k: { nama: string }) => k.nama))
      } catch { toast.error("Gagal memuat data siswa") }
      finally { setLoadingSiswa(false) }
    }
    fetchAll()
  }, [])

  useEffect(() => {
    if (!id) return
    fetch(`/api/analisa/siswa?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { toast.error(d.error); return }
        setData(d)
        const first = d.asesmen.minatBakat ? "minat-bakat"
          : d.asesmen.gayaBelajar ? "gaya-belajar"
          : d.asesmen.psikologi ? "psikologi"
          : d.asesmen.karakter ? "karakter"
          : ""
        setActiveTab(first)
      })
      .catch(() => toast.error("Gagal memuat analisa"))
  }, [id])

  const filtered = allSiswa.filter((s) => {
    if (filterKelas && s.kelas !== filterKelas) return false
    if (searchQuery && !s.nama.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  function pindahSiswa(siswaId: string) {
    router.push(`/admin/analisa?id=${siswaId}`)
  }

  if (!id) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Analisa Siswa</h1>
            <p className="text-sm text-gray-500">Pilih siswa untuk melihat analisa</p>
          </div>
        </div>
        <PilihSiswa
          filtered={filtered}
          kelasList={kelasList}
          filterKelas={filterKelas}
          setFilterKelas={setFilterKelas}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onPilih={pindahSiswa}
          loading={loadingSiswa}
        />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Analisa Siswa</h1>
            <p className="text-sm text-gray-500">Memuat analisa...</p>
          </div>
        </div>
      </div>
    )
  }

  const { siswa, asesmen } = data
  const hasAny = asesmen.minatBakat || asesmen.gayaBelajar || asesmen.psikologi || asesmen.karakter

  return (
    <div className="space-y-6">
      {/* Header with student selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/siswa">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
            <UserCircle className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{siswa.nama}</h1>
            <p className="text-sm text-gray-500">
              Kelas {siswa.kelas} {siswa.nisn ? `· NISN ${siswa.nisn}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari siswa..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Select value={filterKelas} onValueChange={(v) => setFilterKelas(v === "all" ? "" : v ?? "")}>
            <SelectTrigger className="w-24 h-9 text-sm">
              <SelectValue placeholder="Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {kelasList.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Student list dropdown */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filtered.slice(0, 20).map((s) => (
            <button key={s.id}
              onClick={() => pindahSiswa(s.id)}
              className={`text-xs rounded-full px-2.5 py-1 transition-all ${
                s.id === id
                  ? "bg-indigo-600 text-white font-medium"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.nama}
              <span className="ml-1 opacity-60">{s.kelas}</span>
            </button>
          ))}
          {filtered.length > 20 && (
            <span className="text-xs text-gray-400 self-center">+{filtered.length - 20} lainnya</span>
          )}
        </div>
      )}

      {!hasAny ? (
        <Card className="border-0 shadow-sm bg-amber-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
            <p className="mt-2 font-semibold text-amber-800">Belum ada asesmen</p>
            <p className="text-sm text-amber-600">Siswa ini belum mengisi asesmen apapun.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Compact summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {asesmen.minatBakat && (
              <SummaryCard
                icon={<Brain className="h-4 w-4" />}
                label="Minat Bakat"
                value={asesmen.minatBakat.dominan.kode}
                sub={asesmen.minatBakat.dominan.label.split(" —")[0]}
                color="emerald"
              />
            )}
            {asesmen.gayaBelajar && (
              <SummaryCard
                icon={<BookOpen className="h-4 w-4" />}
                label="Gaya Belajar"
                value={asesmen.gayaBelajar.dominan.kode}
                sub={asesmen.gayaBelajar.dominan.label.split(" —")[0]}
                color="sky"
              />
            )}
            {asesmen.psikologi && (
              (() => {
                const tertinggi = [...asesmen.psikologi.dimensi].sort((a, b) => b.skor - a.skor)[0]
                return (
                  <SummaryCard
                    icon={<Sparkles className="h-4 w-4" />}
                    label="Psikologi"
                    value={`${tertinggi.skor}%`}
                    sub={tertinggi.label}
                    color={tertinggi.skor >= 60 ? "rose" : tertinggi.skor >= 40 ? "amber" : "emerald"}
                  />
                )
              })()
            )}
            {asesmen.karakter && (
              (() => {
                const tertinggi = [...asesmen.karakter.urutan].sort((a, b) => b.skor - a.skor)[0]
                return (
                  <SummaryCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Karakter"
                    value={`${tertinggi.skor}%`}
                    sub={tertinggi.label.split(" —")[0]}
                    color={tertinggi.tingkat === "Tinggi" ? "emerald" : tertinggi.tingkat === "Sedang" ? "amber" : "rose"}
                  />
                )
              })()
            )}
          </div>

          {/* Radar chart */}
          <StudentRadarChart
            riasec={asesmen.minatBakat ? { urutan: asesmen.minatBakat.urutan } : undefined}
            vark={asesmen.gayaBelajar ? { urutan: asesmen.gayaBelajar.urutan } : undefined}
            psikologi={asesmen.psikologi ? { dimensi: asesmen.psikologi.dimensi } : undefined}
            karakter={asesmen.karakter ? { urutan: asesmen.karakter.urutan } : undefined}
          />

          {/* Detail tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="flex-wrap">
              {asesmen.minatBakat && <TabsTrigger value="minat-bakat">Minat Bakat</TabsTrigger>}
              {asesmen.gayaBelajar && <TabsTrigger value="gaya-belajar">Gaya Belajar</TabsTrigger>}
              {asesmen.psikologi && <TabsTrigger value="psikologi">Psikologi</TabsTrigger>}
              {asesmen.karakter && <TabsTrigger value="karakter">Karakter</TabsTrigger>}
            </TabsList>

            {asesmen.minatBakat && (
              <TabsContent value="minat-bakat">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-emerald-600" />
                        Minat Bakat (RIASEC)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {asesmen.minatBakat.urutan.map((item) => (
                          <div key={item.kode} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{item.kode} — {item.label}</span>
                              <span className="text-gray-500">{item.skor}</span>
                            </div>
                            <Progress value={(item.skor / getMaxSkor(item.kode)) * 100} className="h-2" />
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                          <Target className="h-4 w-4" />
                          Tipe Dominan: {asesmen.minatBakat.dominan.kode} — {asesmen.minatBakat.dominan.label}
                        </div>
                        {asesmen.minatBakat.rekomendasiKarier && asesmen.minatBakat.rekomendasiKarier.length > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center gap-1 text-sm font-medium text-emerald-700">
                              <Lightbulb className="h-4 w-4" /> Rekomendasi Karir:
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {asesmen.minatBakat.rekomendasiKarier.map((r, i) => (
                                <Badge key={i} variant="secondary" className="bg-white text-emerald-700">{r}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            )}

            {asesmen.gayaBelajar && (
              <TabsContent value="gaya-belajar">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-sky-600" />
                        Gaya Belajar (VARK)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {asesmen.gayaBelajar.urutan.map((item) => (
                          <div key={item.kode} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{item.kode} — {item.label}</span>
                              <span className="text-gray-500">{item.skor}</span>
                            </div>
                            <Progress value={(item.skor / 10) * 100} className="h-2 [&>[data-slot=progress-indicator]]:bg-sky-500" />
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl bg-sky-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-sky-800">
                          <Target className="h-4 w-4" />
                          Gaya Dominan: {asesmen.gayaBelajar.dominan.kode} — {asesmen.gayaBelajar.dominan.label}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            )}

            {asesmen.psikologi && (
              <TabsContent value="psikologi">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-orange-600" />
                        Screening Psikologi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {asesmen.psikologi.dimensi.map((item) => (
                          <div key={item.label} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{item.label}</span>
                              <span className="text-gray-500">{item.skor}%</span>
                            </div>
                            <Progress
                              value={item.skor}
                              className={`h-2 ${
                                item.skor >= 70 ? "[&>[data-slot=progress-indicator]]:bg-red-500" :
                                item.skor >= 50 ? "[&>[data-slot=progress-indicator]]:bg-amber-500" :
                                "[&>[data-slot=progress-indicator]]:bg-emerald-500"
                              }`}
                            />
                            <p className="text-xs text-gray-400">{item.interpretasi}</p>
                          </div>
                        ))}
                      </div>
                      {asesmen.psikologi.catatan.length > 0 && (
                        <div className="rounded-xl bg-orange-50 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-orange-800">
                            <AlertTriangle className="h-4 w-4" /> Catatan
                          </div>
                          <ul className="mt-2 space-y-1">
                            {asesmen.psikologi.catatan.map((c, i) => (
                              <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                                <span>•</span> {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            )}

            {asesmen.karakter && (
              <TabsContent value="karakter">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                        Karakter (Big Five)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {asesmen.karakter.urutan.map((item) => (
                          <div key={item.kode} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{item.label}</span>
                              <span className="flex items-center gap-1.5">
                                <span className="text-gray-500">{item.skor}%</span>
                                <Badge
                                  variant="secondary"
                                  className={`text-[10px] ${
                                    item.tingkat === "Tinggi" ? "bg-emerald-100 text-emerald-700" :
                                    item.tingkat === "Sedang" ? "bg-amber-100 text-amber-700" :
                                    "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {item.tingkat}
                                </Badge>
                              </span>
                            </div>
                            <Progress
                              value={item.skor}
                              className={`h-2 ${
                                item.tingkat === "Tinggi" ? "[&>[data-slot=progress-indicator]]:bg-emerald-500" :
                                item.tingkat === "Sedang" ? "[&>[data-slot=progress-indicator]]:bg-amber-500" :
                                "[&>[data-slot=progress-indicator]]:bg-red-500"
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl bg-indigo-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-800">
                          <CheckCircle className="h-4 w-4" /> Ringkasan
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-indigo-700">
                          {asesmen.karakter.urutan.slice(0, 2).map((item) => (
                            <p key={item.kode}>
                              • {item.label}: {item.tingkat} ({item.skor}%)
                            </p>
                          ))}
                          {asesmen.karakter.urutan.slice(-1).map((item) => (
                            <p key={item.kode}>
                              • {item.label}: {item.tingkat} ({item.skor}%)
                            </p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            )}
          </Tabs>
        </>
      )}
    </div>
  )
}

function SummaryCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  color: "emerald" | "sky" | "amber" | "rose" | "indigo"
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    sky: "bg-sky-50 text-sky-700 border-sky-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  }
  return (
    <Card className={`border ${colors[color]} shadow-sm`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className={colors[color].split(" ")[1]}>{icon}</span>
          <span className="text-xs font-medium text-gray-500">{label}</span>
        </div>
        <div className="text-lg font-bold text-gray-900">{value}</div>
        <p className="text-[10px] text-gray-400 truncate">{sub}</p>
      </CardContent>
    </Card>
  )
}

function PilihSiswa({
  filtered, kelasList, filterKelas, setFilterKelas, searchQuery, setSearchQuery, onPilih, loading,
}: {
  filtered: SiswaItem[]
  kelasList: string[]
  filterKelas: string
  setFilterKelas: (v: string) => void
  searchQuery: string
  setSearchQuery: (v: string) => void
  onPilih: (id: string) => void
  loading: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Cari nama siswa..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterKelas} onValueChange={(v) => setFilterKelas(v === "all" ? "" : v ?? "")}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelas</SelectItem>
            {kelasList.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center"><Users className="mx-auto h-12 w-12 text-gray-200" /></CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-200" />
            <p className="mt-3 text-gray-400">Tidak ada siswa ditemukan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => {
            const total = s._count.minatBakat + s._count.psikologi + s._count.gayaBelajar + s._count.karakterDiri
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-all"
                  onClick={() => onPilih(s.id)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                      {s.nama.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{s.nama}</p>
                      <p className="text-xs text-gray-400">Kelas {s.kelas}{s.nisn ? ` · ${s.nisn}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {[s._count.minatBakat, s._count.psikologi, s._count.gayaBelajar, s._count.karakterDiri].map((c, i) => (
                        <div key={i} className={`h-2 w-2 rounded-full ${c > 0 ? "bg-emerald-400" : "bg-gray-200"}`} />
                      ))}
                      <span className="ml-1.5 text-xs font-bold text-indigo-600">{total}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
