"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, MessageCircleHeart, Brain, Sparkles, UserCircle, Users, FileText, ChevronRight, Clock } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalRiasec: 0,
    totalPsikologi: 0,
    totalVark: 0,
    totalKarakter: 0,
    totalChat: 0,
    pendingUsers: 0,
    kelasList: [] as string[],
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [siswaRes, chatRes, pendingRes] = await Promise.all([
          fetch("/api/siswa"),
          fetch("/api/chat"),
          fetch("/api/admin/user-status"),
        ])
        const siswaData = await siswaRes.json()
        const chatData = await chatRes.json()
        const pendingData = await pendingRes.json()

        const kelasSet = new Set<string>()
        let r = 0, p = 0, v = 0, k = 0
        siswaData.siswa?.forEach((s: any) => {
          kelasSet.add(s.kelas)
          if (s._count.minatBakat > 0) r++
          if (s._count.psikologi > 0) p++
          if (s._count.gayaBelajar > 0) v++
          if (s._count.karakterDiri > 0) k++
        })

        setStats({
          totalSiswa: siswaData.siswa?.length || 0,
          totalRiasec: r,
          totalPsikologi: p,
          totalVark: v,
          totalKarakter: k,
          totalChat: chatData.messages?.length || 0,
          pendingUsers: pendingData.users?.length || 0,
          kelasList: Array.from(kelasSet).sort(),
        })
      } catch (e) {
        console.error(e)
      }
    }
    fetchData()
  }, [])

  const menuItems = [
    { icon: MessageCircleHeart, label: "Kelola Curhat", href: "/admin/curhat", count: stats.totalChat, color: "text-violet-600", bg: "bg-violet-50" },
    { icon: FileText, label: "Laporan Kelas", href: "/admin/laporan", count: stats.kelasList.length, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Users, label: "Data Siswa", href: "/admin/siswa", count: stats.totalSiswa, color: "text-emerald-600", bg: "bg-emerald-50" },
    ...(stats.pendingUsers > 0 ? [{ icon: Clock, label: "Pendaftaran Baru", href: "/admin/siswa", count: stats.pendingUsers, color: "text-amber-600", bg: "bg-amber-50" }] : []),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
          <LayoutDashboard className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard BK</h1>
          <p className="text-sm text-gray-500">Overview data Bimbingan Konseling</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {menuItems.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Link href={item.href}>
              <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                  <div className="text-sm text-gray-500">{item.label}</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Progress Asesmen</span>
            <Badge variant="secondary">Total {stats.totalRiasec + stats.totalPsikologi + stats.totalVark + stats.totalKarakter} asesmen</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Brain, label: "Minat Bakat", count: stats.totalRiasec, color: "text-emerald-600" },
              { icon: Sparkles, label: "Psikologi", count: stats.totalPsikologi, color: "text-orange-600" },
              { icon: UserCircle, label: "Karakter", count: stats.totalKarakter, color: "text-indigo-600" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-gray-50 p-4 text-center">
                <item.icon className={`mx-auto h-8 w-8 ${item.color}`} />
                <div className="mt-2 text-lg font-bold text-gray-900">{item.count}</div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {stats.kelasList.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Kelas Terdaftar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.kelasList.map((kelas) => (
                <Link key={kelas} href={`/admin/laporan?kelas=${kelas}`}>
                  <Badge className="cursor-pointer bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 text-sm">
                    {kelas} <ChevronRight className="ml-1 h-3 w-3" />
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
