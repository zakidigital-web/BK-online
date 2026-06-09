"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { GraduationCap, Sparkles, ArrowLeft, Printer, Heart, RotateCcw } from "lucide-react"
import { dimensiWarna, getTipeGuruUtama, getStatusPsikologi, dimensiLabels } from "@/lib/asesmen/guru"
import { RiasecBarChart } from "@/components/charts"

interface GuruDetail {
  skor: Record<string, number>
  skorPsikologi: Record<string, number>
  createdAt: string
  guru: { id: string; name: string; email: string; mapel: string | null; nipy: string | null }
}

export default function AdminLaporanGuruDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const guruId = searchParams.get("id")
  const [data, setData] = useState<GuruDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    if (user && user.role === "siswa") { router.push("/curhat"); return }
    if (!guruId) { setLoading(false); return }
    fetch(`/api/guru/asesmen?guruId=${guruId}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => {
        const a = d.asesmen
        setData({
          skor: a?.skor ? JSON.parse(a.skor) : {},
          skorPsikologi: a?.skorPsikologi ? JSON.parse(a.skorPsikologi) : {},
          createdAt: a?.createdAt || "",
          guru: a?.guru || { id: "", name: "", email: "", mapel: null, nipy: null },
        })
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [user, guruId, router])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]" />

  const hasGaya = data?.skor && Object.keys(data.skor).length > 0
  const hasPsi = data?.skorPsikologi && Object.keys(data.skorPsikologi).length > 0
  if (!hasGaya && !hasPsi) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-200" />
          <p className="mt-3 text-gray-400">Data tidak ditemukan atau belum mengerjakan asesmen</p>
          <Button className="mt-4" variant="outline" onClick={() => router.back()}>Kembali</Button>
        </CardContent>
      </Card>
    )
  }



  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/guru/laporan")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{data.guru.name}</h1>
            <p className="text-sm text-gray-500">{data.guru.email}{data.guru.mapel ? ` · ${data.guru.mapel}` : ""}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-red-500 border-red-200 hover:bg-red-50"
            disabled={resetting}
            onClick={async () => {
              if (!window.confirm(`Reset semua asesmen untuk ${data.guru.name}? Guru dapat mengisi ulang.`)) return
              setResetting(true)
              try {
                const res = await fetch("/api/admin/reset/asesmen", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ guruId }),
                })
                if (!res.ok) throw new Error()
                toast.success("Asesmen guru berhasil direset")
                setData(null)
                setLoading(true)
                window.location.reload()
              } catch {
                toast.error("Gagal mereset asesmen")
              } finally {
                setResetting(false)
              }
            }}>
            <RotateCcw className="h-4 w-4" /> {resetting ? "Meriset..." : "Reset"}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Cetak
          </Button>
        </div>
      </div>

      <Tabs defaultValue={hasGaya ? "gaya-mengajar" : "psikologi"}>
        <TabsList>
          {hasGaya && <TabsTrigger value="gaya-mengajar">Gaya Mengajar</TabsTrigger>}
          {hasPsi && <TabsTrigger value="psikologi">Psikologi</TabsTrigger>}
        </TabsList>

        {hasGaya && (
          <TabsContent value="gaya-mengajar" className="space-y-4 mt-4">
            <Card className="border-0 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-1.5 text-sm font-semibold text-white">
                  <Sparkles className="h-4 w-4" />
                  {getTipeGuruUtama(data.skor).label}
                </div>
                <p className="mt-3 text-sm text-gray-600 max-w-lg mx-auto">{getTipeGuruUtama(data.skor).desc}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base">Gaya Mengajar</CardTitle></CardHeader>
              <CardContent>
                <RiasecBarChart data={Object.entries(data.skor).filter(([d]) => ["Tradisional", "Modern", "Praktis"].includes(d)).map(([tipe, jumlah]) => ({ tipe, jumlah, persen: jumlah }))} />
              </CardContent>
            </Card>
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(data.skor).filter(([d]) => !["Tradisional", "Modern", "Praktis"].includes(d)).map(([dimensi, nilai]) => (
                <Card key={dimensi} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{dimensiLabels[dimensi] || dimensi}</span>
                      <span className="text-lg font-bold" style={{ color: dimensiWarna[dimensi] || "#6366f1" }}>{nilai}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full transition-all" style={{ width: `${nilai}%`, backgroundColor: dimensiWarna[dimensi] || "#6366f1" }} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        {hasPsi && (
          <TabsContent value="psikologi" className="space-y-4 mt-4">
            <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-1.5 text-sm font-semibold text-white">
                  <Heart className="h-4 w-4" />
                  {getStatusPsikologi(data.skorPsikologi).label}
                </div>
                <p className="mt-3 text-sm text-gray-600 max-w-lg mx-auto">{getStatusPsikologi(data.skorPsikologi).desc}</p>
              </CardContent>
            </Card>
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(data.skorPsikologi).sort(([, a], [, b]) => b - a).map(([dimensi, nilai]) => (
                <Card key={dimensi} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{dimensiLabels[dimensi] || dimensi}</span>
                      <span className="text-lg font-bold" style={{ color: dimensiWarna[dimensi] || "#e11d48" }}>{nilai}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full transition-all" style={{ width: `${nilai}%`, backgroundColor: dimensiWarna[dimensi] || "#e11d48" }} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
