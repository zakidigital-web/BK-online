"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { UserPlus, ArrowLeft, Sparkles, GraduationCap, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const onboardingPoints = [
  {
    icon: GraduationCap,
    title: "Khusus siswa",
    desc: "Pendaftaran ini untuk siswa. Guru dan staf akan didaftarkan oleh admin.",
  },
  {
    icon: Clock,
    title: "Aktivasi oleh admin",
    desc: "Setelah daftar, akunmu akan diaktifkan oleh admin BK sebelum bisa digunakan.",
  },
  {
    icon: Sparkles,
    title: "Ikuti asesmen",
    desc: "Setelah aktif, kamu bisa mengisi asesmen minat bakat, psikologi, dan lainnya.",
  },
]

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Daftar gagal")
      toast.success("Akun berhasil dibuat! Silakan masuk.")
      router.push("/login")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Daftar gagal"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_28%),linear-gradient(180deg,#f8faff_0%,#ffffff_100%)]">
      <div className="mx-auto grid min-h-dvh max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_1fr]">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:text-emerald-700">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke beranda
            </Link>
            <div className="mt-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Pendaftaran akun siswa
              </span>
              <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-slate-950">
                Daftar akun siswa untuk mengikuti asesmen BK.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Buat akun dengan NISN sebagai username. Setelah diverifikasi admin, kamu bisa mengakses
                asesmen minat bakat, psikologi, gaya belajar, dan karakter.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {onboardingPoints.map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">
                      <item.icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-900">{item.title}</h2>
                      <p className="mt-1 text-sm leading-7 text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full">
          <Card className="mx-auto w-full max-w-xl border border-slate-200 bg-white/95 py-0 shadow-[0_30px_80px_-40px_rgba(16,185,129,0.4)]">
            <CardHeader className="space-y-4 border-b border-slate-100 px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between gap-3">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800 lg:hidden">
                  <ArrowLeft className="h-4 w-4" />
                  Beranda
                </Link>
                <div className="ml-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100">
                  <UserPlus className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <CardTitle className="text-3xl font-bold tracking-tight text-slate-950">Daftar Siswa</CardTitle>
                <p className="text-sm leading-6 text-slate-500">
                  Daftar dengan NISN sebagai username. Akun akan diaktifkan oleh admin setelah verifikasi.
                </p>
              </div>
            </CardHeader>

            <CardContent className="px-6 py-6 sm:px-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      required
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="Buat username unik"
                      className="h-11 rounded-xl bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="h-11 rounded-xl bg-slate-50"
                    />
                  </div>
                </div>



                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold hover:bg-indigo-700"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Buat akun"}
                </Button>
              </form>

              <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
                Akun siswa perlu diaktifkan oleh admin sebelum bisa masuk. Harap tunggu konfirmasi dari guru BK.
              </div>

              <p className="mt-5 text-center text-sm text-slate-500">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-semibold text-indigo-600 transition hover:text-indigo-700">
                  Masuk sekarang
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
