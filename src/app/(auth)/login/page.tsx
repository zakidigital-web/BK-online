"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Eye, EyeOff, LogIn, KeyRound, GraduationCap, BookOpen, ShieldCheck, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: "", password: "" })
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [showDemo, setShowDemo] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("bk_show_demo_accounts")
    if (stored !== null) setShowDemo(stored === "true")
  }, [])

  const roleAccounts = [
    { role: "Admin", icon: ShieldCheck, username: "admin", password: "admin123", color: "purple" },
    { role: "Guru BK", icon: GraduationCap, username: "guru", password: "guru123", color: "blue" },
    { role: "Wali Kelas", icon: Users, username: "walas", password: "walas123", color: "amber" },
    { role: "Siswa", icon: BookOpen, username: "siswa", password: "siswa123", color: "emerald" },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      toast.success("Berhasil masuk!")
      if (user.role === "siswa") {
        router.push("/curhat")
      } else if (user.role === "guru-mapel") {
        router.push("/guru/laporan")
      } else {
        router.push("/admin/dashboard")
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Login gagal"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 shadow-sm">
            <GraduationCap className="h-7 w-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Masuk ke BK</h1>
          <p className="mt-1 text-sm text-gray-500">SMP Negeri 1 Genteng</p>
        </div>

        <Card className="border-0 shadow-lg bg-white/95">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" type="text" placeholder="Masukkan username atau NISN" required
                  value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="h-11 rounded-xl bg-slate-50 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Masukkan password" required
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 pr-11" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="h-11 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold"
                disabled={loading}>
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            {showDemo && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                  <KeyRound className="h-4 w-4 text-indigo-500" />
                  Pilih peran untuk isi otomatis (demo)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {roleAccounts.map((acc) => {
                    const Icon = acc.icon
                    const isSelected = selectedRole === acc.role
                    return (
                      <button key={acc.role} type="button"
                        onClick={() => {
                          setSelectedRole(acc.role)
                          setForm({ username: acc.username, password: acc.password })
                        }}
                        className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm transition-all ${
                          isSelected ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                        }`}>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          acc.color === "purple" ? "bg-purple-100 text-purple-600" :
                          acc.color === "blue" ? "bg-blue-100 text-blue-600" :
                          acc.color === "amber" ? "bg-amber-100 text-amber-600" :
                          "bg-emerald-100 text-emerald-600"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-xs">{acc.role}</p>
                          <p className="text-[10px] text-gray-400 truncate">@{acc.username}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500 space-y-2">
          <p className="text-xs text-gray-400">
            <strong>Siswa</strong>: Login menggunakan NISN (username & password = NISN).<br />
            <strong>Guru & Admin</strong>: Login menggunakan username yang didaftarkan.
          </p>
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition">
            Belum punya akun? Daftar sekarang
          </Link>
          <div>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition">
              &larr; Kembali ke beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
