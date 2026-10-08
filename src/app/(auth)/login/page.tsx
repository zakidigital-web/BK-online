"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Eye, EyeOff, LogIn, KeyRound, GraduationCap, ShieldCheck, Users, Info, HelpCircle } from "lucide-react"
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

  // Pengaturan Penjelasan Login (Dapat diubah oleh Admin)
  const [guideEnabled, setGuideEnabled] = useState(true)
  const [guideTitle, setGuideTitle] = useState("Informasi & Panduan Masuk Akun")
  const [guideText, setGuideText] = useState(
    "• Siswa: Masuk menggunakan NISN (sebagai username dan password awal).\n• Guru & Wali Kelas: Masuk menggunakan NIP atau Username terdaftar.\n• Kendala login: Silakan hubungi Guru BK atau Admin sekolah."
  )
  const [showDemo, setShowDemo] = useState(false)

  useEffect(() => {
    // Ambil konfigurasi penjelasan login dari API Setting
    fetch("/api/setting")
      .then((res) => res.json())
      .then((data) => {
        const s = data.settings || {}
        if (s.login_guide_enabled !== undefined) {
          setGuideEnabled(s.login_guide_enabled === "true")
        }
        if (s.login_guide_title) {
          setGuideTitle(s.login_guide_title)
        }
        if (s.login_guide_text) {
          setGuideText(s.login_guide_text)
        }
        if (s.login_demo_enabled !== undefined) {
          setShowDemo(s.login_demo_enabled === "true")
        } else {
          // Fallback lokal jika belum diatur
          const stored = localStorage.getItem("bk_show_demo_accounts")
          if (stored !== null) setShowDemo(stored === "true")
        }
      })
      .catch(() => {})
  }, [])

  const roleAccounts = [
    { role: "Admin", icon: ShieldCheck, username: "admin", password: "admin123", color: "purple" },
    { role: "Guru BK", icon: GraduationCap, username: "lutfia", password: "guru123", color: "blue" },
    { role: "Wali Kelas 7A", icon: Users, username: "walas7a", password: "walas123", color: "amber" },
    { role: "Wali Kelas 8A", icon: Users, username: "walas8a", password: "walas123", color: "amber" },
    { role: "Siswa (Contoh)", icon: GraduationCap, username: "0127470516", password: "0127470516", color: "emerald" },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      toast.success("Berhasil masuk!")
      if (user.role === "siswa") {
        router.push("/beranda")
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
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 shadow-sm ring-4 ring-indigo-50">
            <GraduationCap className="h-7 w-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Masuk ke BK Online</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">SMP Negeri 1 Genteng</p>
        </div>

        <Card className="border-0 shadow-lg bg-white/95">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username / NISN</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username atau NISN"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="h-11 rounded-xl bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold shadow-md shadow-indigo-600/20"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Masuk ke Sistem"}
              </Button>
            </form>

            {/* Kotak Demo Cepat (Jika diaktifkan oleh admin) */}
            {showDemo && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-gray-700">
                  <KeyRound className="h-3.5 w-3.5 text-indigo-500" />
                  Isi Otomatis Akun Peran (Demo Cepat)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {roleAccounts.map((acc, idx) => {
                    const Icon = acc.icon
                    const isSelected = selectedRole === acc.role
                    const isLastOdd = idx === roleAccounts.length - 1 && roleAccounts.length % 2 !== 0
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => {
                          setSelectedRole(acc.role)
                          setForm({ username: acc.username, password: acc.password })
                        }}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-sm transition-all ${
                          isLastOdd ? "col-span-2" : ""
                        } ${
                          isSelected ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-400" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
                            acc.color === "purple"
                              ? "bg-purple-100 text-purple-600"
                              : acc.color === "blue"
                              ? "bg-blue-100 text-blue-600"
                              : acc.color === "amber"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-[11px] truncate">{acc.role}</p>
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

        {/* Kotak Penjelasan / Panduan Akun Login (Dapat Diaktifkan / Dinonaktifkan & Diedit oleh Admin) */}
        {guideEnabled && (
          <div className="rounded-2xl border border-blue-200/80 bg-blue-50/70 p-4 text-xs text-slate-700 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-blue-900 mb-2">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <span>{guideTitle}</span>
            </div>
            <div className="whitespace-pre-line leading-relaxed text-slate-600 font-normal">
              {guideText}
            </div>
          </div>
        )}

        <div className="text-center text-sm text-gray-500 space-y-2">
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition block">
            Belum punya akun? Daftar sebagai Siswa Baru
          </Link>
          <div>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition">
              &larr; Kembali ke Beranda Sekolah
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
