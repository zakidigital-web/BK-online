"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ArrowLeft, Download, Printer, RotateCcw, UserCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useSearchParams, useRouter } from "next/navigation"

interface SiswaDetail {
  id: string
  nama: string
  kelas: string
}

function LaporanSiswaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get("id")
  const [narasi, setNarasi] = useState<string[]>([])
  const [siswa, setSiswa] = useState<SiswaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    fetch(`/api/laporan/siswa?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        setNarasi(data.narasi || [])
        setSiswa(data.siswa)
      })
      .catch(() => toast.error("Gagal memuat laporan"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-12 text-gray-400">Memuat laporan...</div>
  if (!siswa) return (
    <div className="text-center py-12">
      <UserCircle className="mx-auto h-12 w-12 text-gray-200" />
      <p className="mt-3 text-gray-400">Siswa tidak ditemukan</p>
      <Link href="/admin/laporan"><Button variant="outline" className="mt-4">Kembali</Button></Link>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/laporan">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            {siswa.nama.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{siswa.nama}</h1>
            <p className="text-sm text-gray-400">Kelas {siswa.kelas}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Cetak
        </Button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4" id="laporan-siswa">
        <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-sm">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">LAPORAN HASIL ASESMEN PESERTA DIDIK</h2>
            <p className="text-sm text-indigo-600 mt-1">SMP Negeri 1 Genteng</p>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div><span className="font-medium">Nama:</span> {siswa.nama}</div>
              <div><span className="font-medium">Kelas:</span> {siswa.kelas}</div>
              <div><span className="font-medium">Tanggal:</span> {new Date().toLocaleDateString("id-ID")}</div>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            {narasi.map((line, i) => {
              if (line.startsWith("—")) return <p key={i} className="text-center text-xs text-gray-400 mt-4">{line}</p>
              if (line.startsWith("LAPORAN") || line.startsWith("A.") || line.startsWith("B.") || line.startsWith("C.") || line.startsWith("D."))
                return <h3 key={i} className="font-bold text-gray-900 mt-4 mb-2">{line}</h3>
              if (line.startsWith("Nama:") || line.startsWith("Tanggal:"))
                return <p key={i} className="text-sm text-gray-500">{line}</p>
              if (line.startsWith("•"))
                return <p key={i} className="text-sm text-gray-700 ml-4">{line}</p>
              if (line === "") return <div key={i} className="h-2" />
              return <p key={i} className="text-sm text-gray-700">{line}</p>
            })}
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex gap-3 print:hidden">
        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Cetak PDF
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => {
          const el = document.getElementById("laporan-siswa")
          if (el) {
            const blob = new Blob([el.innerText], { type: "text/plain" })
            const a = document.createElement("a")
            a.href = URL.createObjectURL(blob)
            a.download = `Laporan_${siswa.nama.replace(/\s+/g, "_")}.txt`
            a.click()
          }
        }}>
          <Download className="h-4 w-4" /> Export TXT
        </Button>
        <Button variant="outline" className="gap-2 text-red-500 border-red-200 hover:bg-red-50 ml-auto"
          disabled={resetting}
          onClick={async () => {
            if (!window.confirm(`Reset semua asesmen untuk ${siswa.nama}? Siswa dapat mengisi ulang asesmen.`)) return
            setResetting(true)
            try {
              const res = await fetch("/api/admin/reset/asesmen", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ siswaId: id }),
              })
              if (!res.ok) throw new Error()
              toast.success("Asesmen berhasil direset")
              router.refresh()
              window.location.reload()
            } catch {
              toast.error("Gagal mereset asesmen")
            } finally {
              setResetting(false)
            }
          }}>
          <RotateCcw className="h-4 w-4" /> {resetting ? "Meriset..." : "Reset Asesmen"}
        </Button>
      </div>
    </div>
  )
}

export default function LaporanSiswaPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400">Memuat...</div>}>
      <LaporanSiswaContent />
    </Suspense>
  )
}
