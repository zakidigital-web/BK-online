"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { GraduationCap, Sparkles, FileText, Printer, Heart, Brain, Check, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { dimensiWarna, getTipeGuruUtama, getStatusPsikologi, dimensiLabels } from "@/lib/asesmen/guru"
import { getTipeMBTI, getPersentase, labelDimensi, getDeskripsi } from "@/lib/asesmen/mbti"
import { RiasecBarChart } from "@/components/charts"

export default function GuruLaporanPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [skor, setSkor] = useState<Record<string, number> | null>(null)
  const [skorPsi, setSkorPsi] = useState<Record<string, number> | null>(null)
  const [skorMbti, setSkorMbti] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    if (user.role === "siswa" || user.role === "walas") { router.push("/"); return }
    fetch(`/api/guru/asesmen?guruId=${user.id}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        const a = data.asesmen
        if (a?.skor && a.skor !== "{}") setSkor(JSON.parse(a.skor))
        if (a?.skorPsikologi && a.skorPsikologi !== "{}") setSkorPsi(JSON.parse(a.skorPsikologi))
        if (a?.skorMbti && a.skorMbti !== "{}") setSkorMbti(JSON.parse(a.skorMbti))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><FileText className="h-12 w-12 text-gray-200" /></div>
  }

  if (!skor && !skorPsi && !skorMbti) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Card className="border-0 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-sm">
          <CardContent className="p-8 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-200" />
            <h2 className="mt-4 text-lg font-bold text-gray-900">Belum Ada Asesmen</h2>
            <p className="mt-2 text-sm text-gray-500">Anda belum mengerjakan asesmen. Silakan isi terlebih dahulu.</p>
            <div className="mt-4 flex gap-3 justify-center flex-wrap">
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => router.push("/guru/asesmen")}>Gaya Mengajar</Button>
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => router.push("/guru/psikologi")}>Psikologi</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => router.push("/guru/mbti")}>MBTI</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const chartData = skor ? Object.entries(skor).filter(([d]) => ["Tradisional", "Modern", "Praktis"].includes(d)).map(([tipe, jumlah]) => ({
    tipe, jumlah, persen: jumlah,
  })) : []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Laporan Asesmen Guru</h1>
            <p className="text-sm text-gray-500">{user?.name}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Cetak
        </Button>
      </div>

      <Tabs defaultValue={skor ? "gaya-mengajar" : skorPsi ? "psikologi" : "mbti"}>
        <TabsList>
          {skor && <TabsTrigger value="gaya-mengajar">Gaya Mengajar</TabsTrigger>}
          {skorPsi && <TabsTrigger value="psikologi">Psikologi</TabsTrigger>}
          {skorMbti && <TabsTrigger value="mbti">MBTI</TabsTrigger>}
        </TabsList>

        {skor && (
          <TabsContent value="gaya-mengajar" className="space-y-4 mt-4">
            <Card className="border-0 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-1.5 text-sm font-semibold text-white">
                  <Sparkles className="h-4 w-4" />
                  {getTipeGuruUtama(skor).label}
                </div>
                <p className="mt-3 text-sm text-gray-600 max-w-lg mx-auto">{getTipeGuruUtama(skor).desc}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base">Gaya Mengajar</CardTitle></CardHeader>
              <CardContent><RiasecBarChart data={chartData} /></CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(skor).filter(([d]) => !["Tradisional", "Modern", "Praktis"].includes(d)).map(([dimensi, nilai]) => (
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

        {skorPsi && (
          <TabsContent value="psikologi" className="space-y-4 mt-4">
            <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-1.5 text-sm font-semibold text-white">
                  <Heart className="h-4 w-4" />
                  {getStatusPsikologi(skorPsi).label}
                </div>
                <p className="mt-3 text-sm text-gray-600 max-w-lg mx-auto">{getStatusPsikologi(skorPsi).desc}</p>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(skorPsi).sort(([, a], [, b]) => b - a).map(([dimensi, nilai]) => (
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

        {skorMbti && (
          <TabsContent value="mbti" className="space-y-4 mt-4">
            {(() => {
              const tipe = getTipeMBTI(skorMbti)
              const persentase = getPersentase(skorMbti)
              const deskripsi = getDeskripsi(tipe)
              return (
                <>
                  <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2 text-xl font-bold text-white tracking-widest">
                        {tipe}
                      </div>
                      <p className="mt-3 text-2xl font-bold text-gray-800">{deskripsi.title}</p>
                      <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">{deskripsi.desc}</p>
                    </CardContent>
                  </Card>

                  {Object.entries(persentase).map(([d, v]) => {
                    const lb = labelDimensi[d]
                    const isKiriDominan = v.kiri >= v.kanan
                    return (
                      <Card key={d} className="border-0 shadow-sm">
                        <CardContent className="p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className={`text-xs font-semibold ${isKiriDominan ? "text-indigo-600" : "text-gray-400"}`}>{lb.kiri}</span>
                            <span className={`text-xs font-semibold ${!isKiriDominan ? "text-indigo-600" : "text-gray-400"}`}>{lb.kanan}</span>
                          </div>
                          <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
                            <div className="absolute inset-y-0 left-0 rounded-full bg-indigo-500 transition-all" style={{ width: `${v.kiri}%` }} />
                            <div className="absolute inset-y-0 right-0 rounded-full bg-purple-500 transition-all" style={{ width: `${v.kanan}%` }} />
                          </div>
                          <div className="mt-1 flex justify-between text-xs text-gray-400">
                            <span>{v.kiri}%</span>
                            <span>{d}</span>
                            <span>{v.kanan}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <h3 className="mb-2 font-semibold text-gray-900">Peran</h3>
                      <p className="text-sm text-gray-600">{deskripsi.role}</p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-3">
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <h3 className="mb-2 text-sm font-semibold text-emerald-700">Kekuatan</h3>
                        <ul className="space-y-1">
                          {deskripsi.strengths.map((s) => (
                            <li key={s} className="flex items-start gap-1.5 text-xs text-gray-600">
                              <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" /> {s}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <h3 className="mb-2 text-sm font-semibold text-amber-700">Kelemahan</h3>
                        <ul className="space-y-1">
                          {deskripsi.weaknesses.map((s) => (
                            <li key={s} className="flex items-start gap-1.5 text-xs text-gray-600">
                              <Circle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" /> {s}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )
            })()}
          </TabsContent>
        )}
      </Tabs>

      <p className="text-xs text-gray-400 text-center print:hidden">
        Laporan ini hanya bisa dilihat oleh Anda dan Admin.
      </p>
    </div>
  )
}
