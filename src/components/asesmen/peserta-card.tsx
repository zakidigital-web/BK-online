"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserCircle, LogIn, CheckCircle2, ShieldCheck } from "lucide-react"
import { User } from "@/lib/auth-context"

interface PesertaCardProps {
  nama: string
  setNama: (v: string) => void
  kelas: string
  setKelas: (v: string) => void
  user: User | null
  loadingSiswa?: boolean
  buttonLabel: string
  buttonIcon?: React.ReactNode
  tipsText?: React.ReactNode
  colorTheme?: "emerald" | "blue" | "rose" | "amber" | "indigo"
  onStart: () => void
}

const themeStyles = {
  emerald: {
    iconColor: "text-emerald-600",
    tipsBg: "bg-emerald-50/70 border-emerald-100 text-emerald-800",
    buttonBg: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
  },
  blue: {
    iconColor: "text-blue-600",
    tipsBg: "bg-blue-50/70 border-blue-100 text-blue-800",
    buttonBg: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
  },
  rose: {
    iconColor: "text-rose-500",
    tipsBg: "bg-rose-50/70 border-rose-100 text-rose-800",
    buttonBg: "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700",
  },
  amber: {
    iconColor: "text-amber-600",
    tipsBg: "bg-amber-50/70 border-amber-100 text-amber-800",
    buttonBg: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
  },
  indigo: {
    iconColor: "text-indigo-600",
    tipsBg: "bg-indigo-50/70 border-indigo-100 text-indigo-800",
    buttonBg: "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700",
  },
}

export function PesertaCard({
  nama,
  setNama,
  kelas,
  setKelas,
  user,
  loadingSiswa = false,
  buttonLabel,
  buttonIcon,
  tipsText,
  colorTheme = "emerald",
  onStart,
}: PesertaCardProps) {
  const [daftarKelas, setDaftarKelas] = useState<string[]>([])
  const theme = themeStyles[colorTheme]

  useEffect(() => {
    // Ambil daftar kelas dari sistem
    fetch("/api/kelas")
      .then((r) => r.json())
      .then((d) => {
        if (d.kelas && Array.isArray(d.kelas) && d.kelas.length > 0) {
          setDaftarKelas(d.kelas.map((k: { nama: string }) => k.nama))
        } else {
          buatFallbackKelas()
        }
      })
      .catch(() => {
        buatFallbackKelas()
      })

    function buatFallbackKelas() {
      const fallback: string[] = []
      for (const j of [7, 8, 9]) {
        for (const l of ["A", "B", "C", "D", "E", "F", "G", "H", "I"]) {
          fallback.push(`${j}${l}`)
        }
      }
      setDaftarKelas(fallback)
    }
  }, [])

  const isLoggedIn = Boolean(user)
  const isSiswa = user?.role === "siswa"
  const isStaff = user && user.role !== "siswa"

  const canStart = Boolean(nama.trim() && kelas.trim() && !loadingSiswa)

  return (
    <Card className="border-0 shadow-sm bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-slate-800">
            <UserCircle className={`h-5 w-5 ${theme.iconColor}`} />
            Data Peserta Asesmen
          </CardTitle>
          {isLoggedIn ? (
            <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isStaff ? `Akun Pendidik (${user?.role})` : `Akun Siswa: ${user?.username}`}
            </Badge>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              <LogIn className="h-3.5 w-3.5" /> Sudah punya akun? Masuk
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kolom Nama */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500 font-medium">Nama Lengkap *</Label>
            {isLoggedIn ? (
              <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-800">
                {nama || user?.name || "Memuat..."}
              </div>
            ) : (
              <Input
                placeholder="Ketik nama lengkapmu..."
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="h-11 rounded-xl bg-white border-slate-200 text-sm font-medium"
              />
            )}
          </div>

          {/* Kolom Kelas / Posisi */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500 font-medium">
              {isStaff ? "Peran / Posisi" : "Kelas *"}
            </Label>
            {isLoggedIn ? (
              <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-800">
                {kelas || (loadingSiswa ? "Memuat data kelas..." : isStaff ? "Guru / Staff" : "Kelas belum terhubung")}
              </div>
            ) : (
              <Select value={kelas} onValueChange={(val) => setKelas(val || "")}>
                <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 text-sm font-medium">
                  <SelectValue placeholder="Pilih kelas (misal: 7A, 8B, 9A)..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {daftarKelas.map((k) => (
                    <SelectItem key={k} value={k}>
                      Kelas {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Notifikasi Akun Tamu jika belum login */}
        {!isLoggedIn && (
          <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-200/80 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span>
                Kamu dapat langsung mengerjakan asesmen tanpa login. Data asesmen akan disimpan berdasarkan{" "}
                <strong>Nama & Kelas</strong> yang kamu pilih.
              </span>
            </div>
          </div>
        )}

        {/* Tips Maskot */}
        {tipsText && (
          <div className={`rounded-xl p-3.5 text-xs border flex items-start gap-2.5 ${theme.tipsBg}`}>
            {tipsText}
          </div>
        )}

        {/* Tombol Mulai */}
        <Button
          className={`w-full h-11 text-white font-semibold rounded-xl shadow-md gap-2 transition-all hover:scale-[1.01] ${theme.buttonBg}`}
          onClick={onStart}
          disabled={!canStart}
        >
          {loadingSiswa ? "Memuat Data..." : buttonLabel} {buttonIcon}
        </Button>
      </CardContent>
    </Card>
  )
}
