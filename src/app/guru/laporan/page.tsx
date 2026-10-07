"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import {
  GraduationCap,
  Sparkles,
  FileText,
  Printer,
  Heart,
  Brain,
  Check,
  Circle,
  BookOpen,
  ArrowRight,
  ClipboardList,
  Compass,
  Star,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { dimensiWarna, getTipeGuruUtama, getStatusPsikologi, dimensiLabels } from "@/lib/asesmen/guru"
import { getTipeMBTI, getPersentase, labelDimensi, getDeskripsi } from "@/lib/asesmen/mbti"
import { RiasecBarChart } from "@/components/charts"
import { AssessmentMascot } from "@/components/asesmen/assessment-mascot"
import { motion } from "framer-motion"

export default function GuruLaporanPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [skor, setSkor] = useState<Record<string, number> | null>(null)
  const [skorPsi, setSkorPsi] = useState<Record<string, number> | null>(null)
  const [skorMbti, setSkorMbti] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    if (user.role === "siswa") {
      router.push("/curhat")
      return
    }
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <AssessmentMascot character="kimi" mood="thinking" size={80} />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          Memuat portofolio asesmen guru...
        </p>
      </div>
    )
  }

  const hasAny = Boolean(skor || skorPsi || skorMbti)

  // Empty state if nothing taken yet
  if (!hasAny) {
    return (
      <div className="max-w-2xl mx-auto space-y-5 pb-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 bg-gradient-to-br from-indigo-50 via-violet-50 to-white shadow-md overflow-hidden rounded-3xl">
            <CardContent className="p-6 sm:p-8 text-center flex flex-col items-center">
              <AssessmentMascot
                character="kimi"
                mood="excited"
                size={130}
                showSpeechBubble
                message={`Halo ${user?.name || "Bapak/Ibu"}! Mulai kenali potensi dan keunikan mengajar Anda yuk! ✨`}
                className="mb-3"
              />
              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs px-3 py-1 font-semibold mb-2">
                Portofolio Asesmen Guru
              </Badge>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Belum Ada Asesmen yang Dikerjakan
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-md leading-relaxed">
                Asesmen ini dirancang khusus untuk memetakan gaya mengajar, stabilitas emosi pendidik, dan tipe kepribadian dalam memimpin ruang kelas.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-6">
                <button
                  type="button"
                  onClick={() => router.push("/guru/asesmen")}
                  className="flex flex-col items-center p-4 rounded-2xl bg-white border border-indigo-100 shadow-2xs hover:border-indigo-300 hover:shadow-sm transition-all tap-bounce"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-2">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-xs text-slate-800">Gaya Mengajar</span>
                  <span className="text-[10px] text-indigo-600 font-semibold mt-1">Mulai Tes &rarr;</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/guru/psikologi")}
                  className="flex flex-col items-center p-4 rounded-2xl bg-white border border-rose-100 shadow-2xs hover:border-rose-300 hover:shadow-sm transition-all tap-bounce"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-2">
                    <Heart className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-xs text-slate-800">Psikologi Guru</span>
                  <span className="text-[10px] text-rose-600 font-semibold mt-1">Mulai Tes &rarr;</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/guru/mbti")}
                  className="flex flex-col items-center p-4 rounded-2xl bg-white border border-purple-100 shadow-2xs hover:border-purple-300 hover:shadow-sm transition-all tap-bounce"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 mb-2">
                    <Brain className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-xs text-slate-800">MBTI Kepribadian</span>
                  <span className="text-[10px] text-purple-600 font-semibold mt-1">Mulai Tes &rarr;</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const chartData = skor
    ? Object.entries(skor)
        .filter(([d]) => ["Tradisional", "Modern", "Praktis"].includes(d))
        .map(([tipe, jumlah]) => ({
          tipe,
          jumlah,
          persen: jumlah,
        }))
    : []

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16">
      {/* Header Profile Hero Card */}
      <Card className="border-0 bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 text-white shadow-xl overflow-hidden rounded-3xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-5 sm:p-7 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative shrink-0">
              <AssessmentMascot character="kimi" mood="cheering" size={68} animated={false} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 text-white text-[11px] font-bold px-3 py-0.5 mb-1.5 backdrop-blur-sm">
                <Award className="h-3.5 w-3.5 text-amber-300" />
                Portofolio Asesmen Guru
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{user?.name}</h1>
              <p className="text-xs text-indigo-200 mt-0.5">
                {user?.mapel ? `Guru ${user.mapel}` : "Tenaga Pendidik"} · SMPN 1 Genteng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-xl bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2 font-semibold print:hidden"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" /> Cetak Laporan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Status Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
        <div
          onClick={() => router.push("/guru/asesmen")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer tap-bounce flex items-center justify-between ${
            skor ? "bg-white border-indigo-200 shadow-2xs" : "bg-slate-50 border-dashed border-slate-200 text-slate-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${skor ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"}`}>
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Gaya Mengajar</p>
              <p className="text-[10px] text-slate-500">{skor ? "Sudah Dikerjakan" : "Belum Diisi"}</p>
            </div>
          </div>
          <Badge className={`text-[10px] ${skor ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}>
            {skor ? "Selesai" : "Mulai"}
          </Badge>
        </div>

        <div
          onClick={() => router.push("/guru/psikologi")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer tap-bounce flex items-center justify-between ${
            skorPsi ? "bg-white border-rose-200 shadow-2xs" : "bg-slate-50 border-dashed border-slate-200 text-slate-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${skorPsi ? "bg-rose-100 text-rose-600" : "bg-slate-200 text-slate-500"}`}>
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Psikologi Guru</p>
              <p className="text-[10px] text-slate-500">{skorPsi ? "Sudah Dikerjakan" : "Belum Diisi"}</p>
            </div>
          </div>
          <Badge className={`text-[10px] ${skorPsi ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-500"}`}>
            {skorPsi ? "Selesai" : "Mulai"}
          </Badge>
        </div>

        <div
          onClick={() => router.push("/guru/mbti")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer tap-bounce flex items-center justify-between ${
            skorMbti ? "bg-white border-purple-200 shadow-2xs" : "bg-slate-50 border-dashed border-slate-200 text-slate-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${skorMbti ? "bg-purple-100 text-purple-600" : "bg-slate-200 text-slate-500"}`}>
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Tes MBTI</p>
              <p className="text-[10px] text-slate-500">{skorMbti ? "Sudah Dikerjakan" : "Belum Diisi"}</p>
            </div>
          </div>
          <Badge className={`text-[10px] ${skorMbti ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-500"}`}>
            {skorMbti ? "Selesai" : "Mulai"}
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue={skor ? "gaya-mengajar" : skorPsi ? "psikologi" : "mbti"}>
        <TabsList className="bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 w-full justify-start gap-1">
          {skor && (
            <TabsTrigger value="gaya-mengajar" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-xs">
              <BookOpen className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
              Gaya Mengajar
            </TabsTrigger>
          )}
          {skorPsi && (
            <TabsTrigger value="psikologi" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-xs">
              <Heart className="h-3.5 w-3.5 mr-1.5 text-rose-500" />
              Psikologi
            </TabsTrigger>
          )}
          {skorMbti && (
            <TabsTrigger value="mbti" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-xs">
              <Brain className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
              MBTI
            </TabsTrigger>
          )}
        </TabsList>

        {skor && (
          <TabsContent value="gaya-mengajar" className="space-y-4 mt-4">
            <Card className="border-0 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-sm rounded-3xl p-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600 text-white px-5 py-1.5 text-sm font-bold shadow-sm">
                <Sparkles className="h-4 w-4 text-amber-300" />
                {getTipeGuruUtama(skor).label}
              </div>
              <p className="mt-3 text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
                {getTipeGuruUtama(skor).desc}
              </p>
            </Card>

            <Card className="border-0 shadow-xs bg-white rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-800">
                  Grafik Tiga Orientasi Mengajar Utama
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RiasecBarChart data={chartData} />
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(skor)
                .filter(([d]) => !["Tradisional", "Modern", "Praktis"].includes(d))
                .map(([dimensi, nilai]) => (
                  <Card key={dimensi} className="border-0 shadow-xs bg-white rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">
                        {dimensiLabels[dimensi] || dimensi}
                      </span>
                      <span className="text-sm font-extrabold" style={{ color: dimensiWarna[dimensi] || "#6366f1" }}>
                        {nilai}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${nilai}%`, backgroundColor: dimensiWarna[dimensi] || "#6366f1" }}
                      />
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>
        )}

        {skorPsi && (
          <TabsContent value="psikologi" className="space-y-4 mt-4">
            <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-sm rounded-3xl p-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-500 text-white px-5 py-1.5 text-sm font-bold shadow-sm">
                <Heart className="h-4 w-4" />
                {getStatusPsikologi(skorPsi).label}
              </div>
              <p className="mt-3 text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
                {getStatusPsikologi(skorPsi).desc}
              </p>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(skorPsi)
                .sort(([, a], [, b]) => b - a)
                .map(([dimensi, nilai]) => (
                  <Card key={dimensi} className="border-0 shadow-xs bg-white rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">
                        {dimensiLabels[dimensi] || dimensi}
                      </span>
                      <span className="text-sm font-extrabold" style={{ color: dimensiWarna[dimensi] || "#e11d48" }}>
                        {nilai}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${nilai}%`, backgroundColor: dimensiWarna[dimensi] || "#e11d48" }}
                      />
                    </div>
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
                  <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm rounded-3xl p-6 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2 text-xl font-black text-white tracking-widest shadow-sm">
                      {tipe}
                    </div>
                    <p className="mt-3 text-xl font-extrabold text-slate-900">{deskripsi.title}</p>
                    <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                      {deskripsi.desc}
                    </p>
                  </Card>

                  <div className="grid gap-3">
                    {Object.entries(persentase).map(([d, v]) => {
                      const lb = labelDimensi[d]
                      const isKiriDominan = v.kiri >= v.kanan
                      return (
                        <Card key={d} className="border-0 shadow-xs bg-white rounded-2xl p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className={`text-xs font-bold ${isKiriDominan ? "text-indigo-600 font-extrabold" : "text-slate-400"}`}>
                              {lb.kiri} ({v.kiri}%)
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              {d}
                            </span>
                            <span className={`text-xs font-bold ${!isKiriDominan ? "text-purple-600 font-extrabold" : "text-slate-400"}`}>
                              ({v.kanan}%) {lb.kanan}
                            </span>
                          </div>
                          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div className="absolute inset-y-0 left-0 rounded-full bg-indigo-500 transition-all" style={{ width: `${v.kiri}%` }} />
                            <div className="absolute inset-y-0 right-0 rounded-full bg-purple-500 transition-all" style={{ width: `${v.kanan}%` }} />
                          </div>
                        </Card>
                      )
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Card className="border-0 shadow-xs bg-white rounded-2xl p-4">
                      <h3 className="mb-2 text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                        <Check className="h-4 w-4" /> Kekuatan Utama di Kelas
                      </h3>
                      <ul className="space-y-1.5">
                        {deskripsi.strengths.map((s) => (
                          <li key={s} className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="border-0 shadow-xs bg-white rounded-2xl p-4">
                      <h3 className="mb-2 text-sm font-bold text-amber-700 flex items-center gap-1.5">
                        <Circle className="h-4 w-4" /> Area Pengembangan
                      </h3>
                      <ul className="space-y-1.5">
                        {deskripsi.weaknesses.map((s) => (
                          <li key={s} className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </>
              )
            })()}
          </TabsContent>
        )}
      </Tabs>

      <p className="text-xs text-slate-400 text-center print:hidden pt-4">
        Laporan asesmen pendidik ini bersifat rahasia dan diperuntukkan bagi pengembangan profesional guru.
      </p>
    </div>
  )
}
