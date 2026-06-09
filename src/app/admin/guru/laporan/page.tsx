"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { GraduationCap, Eye, Search, UserCheck, Users, Heart, ClipboardList } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { dimensiWarna, getTipeGuruUtama, getStatusPsikologi } from "@/lib/asesmen/guru"

interface GuruLaporan {
  id: string
  guruId: string
  skor: Record<string, number>
  skorPsikologi: Record<string, number>
  createdAt: string
  guru: { id: string; name: string; email: string; mapel: string | null; nipy: string | null }
}

export default function AdminGuruLaporanPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [list, setList] = useState<GuruLaporan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "guru") router.push("/admin/dashboard")
  }, [user, router])

  useEffect(() => {
    fetch("/api/guru/asesmen?all=true")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        const parsed = (data.list || []).map((l: Record<string, unknown>) => ({
          ...l,
          skor: l.skor && l.skor !== "{}" ? JSON.parse(l.skor as string) : {},
          skorPsikologi: l.skorPsikologi && l.skorPsikologi !== "{}" ? JSON.parse(l.skorPsikologi as string) : {},
        }))
        setList(parsed)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = list.filter((l) =>
    l.guru.name.toLowerCase().includes(search.toLowerCase()) ||
    l.guru.email.toLowerCase().includes(search.toLowerCase()) ||
    (l.guru.mapel || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Laporan Asesmen Guru</h1>
            <p className="text-sm text-gray-500">Pantau hasil asesmen gaya mengajar & psikologi guru</p>
          </div>
        </div>
        <Badge className="bg-indigo-100 text-indigo-700 border-0">{list.length} guru</Badge>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Cari guru..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center"><Users className="mx-auto h-12 w-12 text-gray-200" /></CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-200" />
            <p className="mt-3 text-gray-400">
              {list.length === 0 ? "Belum ada guru yang mengerjakan asesmen." : "Pencarian tidak ditemukan."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => {
            const hasGaya = Object.keys(l.skor).length > 0
            const hasPsi = Object.keys(l.skorPsikologi).length > 0
            const tipeGaya = hasGaya ? getTipeGuruUtama(l.skor) : null
            const statusPsi = hasPsi ? getStatusPsikologi(l.skorPsikologi) : null

            return (
              <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-sm h-full cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/admin/laporan/guru?id=${l.guruId}`)}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                        <UserCheck className="h-5 w-5 text-indigo-600" />
                      </div>
                      <Eye className="h-4 w-4 text-gray-300" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{l.guru.name}</h3>
                    <p className="text-xs text-gray-500">{l.guru.email}{l.guru.mapel ? ` · ${l.guru.mapel}` : ""}</p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {hasGaya && Object.entries(l.skor).sort(([, a], [, b]) => b - a).slice(0, 3).map(([d, n]) => (
                        <Badge key={d} className="text-[10px] font-normal border-0" style={{ backgroundColor: `${dimensiWarna[d] || "#6366f1"}20`, color: dimensiWarna[d] || "#6366f1" }}>
                          {d}: {n}%
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {hasGaya && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                          <ClipboardList className="h-3 w-3" />
                          {tipeGaya?.label.split(" —")[0]}
                        </span>
                      )}
                      {hasPsi && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                          <Heart className="h-3 w-3" />
                          {statusPsi?.label.split(" —")[0]}
                        </span>
                      )}
                      {!hasGaya && !hasPsi && (
                        <span className="text-[10px] text-gray-400">Belum mengisi asesmen</span>
                      )}
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
