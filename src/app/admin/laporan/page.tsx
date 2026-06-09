"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { FileText, Download, Printer, ChevronRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { RiasecBarChart, VarkPieChart, PsikologiRadarChart, BigFiveRadarChart } from "@/components/charts"

interface LaporanKelas {
  kelas: string
  totalSiswa: number
  tanggal: string
  distribusiRiasec: { tipe: string; jumlah: number; persen: number }[]
  distribusiVark: { tipe: string; jumlah: number; persen: number }[]
  psikologiRerata: Record<string, number>
  bigFiveRerata: Record<string, number>
  detailSiswa: any[]
}

export default function AdminLaporanPage() {
  const [kelasList, setKelasList] = useState<string[]>([])
  const [selectedKelas, setSelectedKelas] = useState("")
  const [laporan, setLaporan] = useState<LaporanKelas | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState("ringkasan")

  useEffect(() => {
    fetch("/api/siswa").then((r) => r.json()).then((data) => {
      const kelas = [...new Set((data.siswa || []).map((s: any) => s.kelas))].sort() as string[]
      setKelasList(kelas)
    }).catch(() => {})
  }, [])

  async function loadLaporan() {
    if (!selectedKelas) { toast.error("Pilih kelas dulu"); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/laporan?kelas=${selectedKelas}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLaporan(data.laporan)
      toast.success("Laporan siap!")
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const riasecColors: Record<string, string> = {
    R: "bg-red-500", I: "bg-blue-500", A: "bg-purple-500",
    S: "bg-green-500", E: "bg-orange-500", C: "bg-yellow-500",
  }

  const dimensiLabels: Record<string, string> = {
    somatisasi: "Somatisasi", cemas: "Kecemasan", depresi: "Depresi",
    sensitif: "Sensitivitas", musuh: "Permusuhan",
    O: "Openness", C: "Conscientiousness", E: "Extraversion",
    A: "Agreeableness", N: "Neuroticism",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Laporan Asesmen</h1>
          <p className="text-sm text-gray-500">Generate laporan kelas format psikolog profesional</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <Select value={selectedKelas} onValueChange={(v) => setSelectedKelas(v ?? "")}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Pilih kelas" />
            </SelectTrigger>
            <SelectContent>
              {kelasList.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={loadLaporan} disabled={loading || !selectedKelas} className="gap-2">
            <FileText className="h-4 w-4" /> {loading ? "Memproses..." : "Generate Laporan"}
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Cetak
          </Button>
        </CardContent>
      </Card>

      {laporan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4" id="laporan-container">
          <Card className="border-0 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white print:bg-white print:text-black">
            <div className="text-center">
              <h2 className="text-2xl font-bold">LAPORAN HASIL ASESMEN</h2>
              <p className="text-blue-200 print:text-gray-600">SMP Negeri 1 Genteng</p>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-blue-200">Kelas</span><br />{laporan.kelas}</div>
                <div><span className="text-blue-200">Jumlah Siswa</span><br />{laporan.totalSiswa}</div>
                <div><span className="text-blue-200">Tanggal</span><br />{laporan.tanggal}</div>
              </div>
            </div>
          </Card>

          <Tabs value={tab} onValueChange={(v) => setTab(v)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
              <TabsTrigger value="minat">Minat Bakat</TabsTrigger>
              <TabsTrigger value="psikologi">Psikologi</TabsTrigger>
              <TabsTrigger value="karakter">Karakter</TabsTrigger>
            </TabsList>

            <TabsContent value="ringkasan" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle className="text-sm">Distribusi Minat (RIASEC)</CardTitle></CardHeader>
                  <CardContent>
                    <RiasecBarChart data={laporan.distribusiRiasec.slice(0, 6)} />
                    <div className="mt-4 space-y-1">
                      {laporan.distribusiRiasec.slice(0, 6).map((item) => (
                        <div key={item.tipe} className="flex items-center justify-between text-xs text-gray-500">
                          <span className="font-medium">{item.tipe}</span>
                          <span>{item.jumlah} siswa ({item.persen}%)</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle className="text-sm">Distribusi Gaya Belajar (VARK)</CardTitle></CardHeader>
                  <CardContent>
                    <VarkPieChart data={laporan.distribusiVark.slice(0, 4)} />
                    <div className="mt-4 space-y-1">
                      {laporan.distribusiVark.slice(0, 4).map((item) => (
                        <div key={item.tipe} className="flex items-center justify-between text-xs text-gray-500">
                          <span className="font-medium">{item.tipe}</span>
                          <span>{item.jumlah} siswa ({item.persen}%)</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-sm">Daftar Siswa & Progress Asesmen</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-gray-500">
                          <th className="pb-2 font-medium">Nama</th>
                          <th className="pb-2 font-medium">Minat</th>
                          <th className="pb-2 font-medium">VARK</th>
                          <th className="pb-2 font-medium">Psi</th>
                          <th className="pb-2 font-medium">Karakter</th>
                          <th className="pb-2 font-medium">Laporan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {laporan.detailSiswa.map((s: any) => (
                          <tr key={s.id} className="border-b last:border-0">
                            <td className="py-2 font-medium">{s.nama}</td>
                            <td className="py-2">{s.riasec ? <Badge className="bg-emerald-100 text-emerald-700">✓</Badge> : <Badge variant="outline">-</Badge>}</td>
                            <td className="py-2">{s.vark ? <Badge className="bg-blue-100 text-blue-700">✓</Badge> : <Badge variant="outline">-</Badge>}</td>
                            <td className="py-2">{s.psikologi ? <Badge className="bg-orange-100 text-orange-700">✓</Badge> : <Badge variant="outline">-</Badge>}</td>
                            <td className="py-2">{s.karakter ? <Badge className="bg-purple-100 text-purple-700">✓</Badge> : <Badge variant="outline">-</Badge>}</td>
                            <td className="py-2">
                              <Link href={`/admin/laporan/siswa?id=${s.id}`}>
                                <Button variant="ghost" size="sm"><ChevronRight className="h-4 w-4" /></Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="minat" className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-sm">Distribusi Minat Bakat (RIASEC) — {laporan.kelas}</CardTitle></CardHeader>
                <CardContent>
                  <RiasecBarChart data={laporan.distribusiRiasec} />
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {laporan.distribusiRiasec.map((item) => (
                      <div key={item.tipe} className="rounded-xl bg-gray-50 p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">{item.persen}%</div>
                        <div className="text-sm font-medium">{item.tipe}</div>
                        <div className="text-xs text-gray-400">{item.jumlah} siswa</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="psikologi" className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-sm">Skor Psikologi Rata-rata Kelas</CardTitle></CardHeader>
                <CardContent>
                  <PsikologiRadarChart
                    data={Object.entries(laporan.psikologiRerata).map(([k, v]) => ({
                      label: dimensiLabels[k] || k,
                      skor: Math.round(v),
                    }))}
                  />
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(laporan.psikologiRerata).map(([k, v]) => (
                      <div key={k} className="rounded-xl bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{dimensiLabels[k] || k}</span>
                          <span className={`text-lg font-bold ${v >= 60 ? "text-red-500" : v >= 40 ? "text-amber-500" : "text-green-500"}`}>{Math.round(v)}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div className={`h-full rounded-full ${v >= 60 ? "bg-red-500" : v >= 40 ? "bg-amber-500" : "bg-green-500"}`}
                            style={{ width: `${v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-gray-500">Catatan: Screening psikologi bersifat indikatif. Bukan diagnosis klinis.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="karakter" className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-sm">Profil Karakter Big Five Rata-rata Kelas</CardTitle></CardHeader>
                <CardContent>
                  <BigFiveRadarChart
                    data={Object.entries(laporan.bigFiveRerata).map(([k, v]) => ({
                      label: dimensiLabels[k] || k,
                      skor: Math.round(v),
                    }))}
                  />
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(laporan.bigFiveRerata).map(([k, v]) => (
                      <div key={k} className="rounded-xl bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{dimensiLabels[k] || k}</span>
                          <span className={`text-lg font-bold ${v >= 60 ? "text-indigo-500" : v >= 40 ? "text-amber-500" : "text-gray-400"}`}>{Math.round(v)}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div className={`h-full rounded-full ${v >= 60 ? "bg-indigo-500" : v >= 40 ? "bg-amber-400" : "bg-gray-300"}`}
                            style={{ width: `${v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 print:hidden">
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Cetak PDF
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => {
              const el = document.getElementById("laporan-container")
              if (el) {
                const blob = new Blob([el.innerText], { type: "text/plain" })
                const a = document.createElement("a")
                a.href = URL.createObjectURL(blob)
                a.download = `Laporan_${laporan.kelas}.txt`
                a.click()
              }
            }}>
              <Download className="h-4 w-4" /> Export TXT
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
