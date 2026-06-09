"use client"

import { MessageCircleHeart, Brain, Sparkles, UserCircle, Home, LayoutDashboard, FileText, Users, Settings, BarChart3, LogOut, GraduationCap, ClipboardList, BookOpen, HelpCircle, RotateCcw } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const studentItems = [
  { href: "/curhat", icon: MessageCircleHeart, label: "Curhat Anonim" },
  { href: "/asesmen/minat-bakat", icon: Brain, label: "Minat Bakat" },
  { href: "/asesmen/psikologi", icon: Sparkles, label: "Psikologi" },
  { href: "/asesmen/gaya-belajar", icon: Home, label: "Gaya Belajar" },
  { href: "/karakter", icon: UserCircle, label: "Karakter Diri" },
  { href: "/asesmen/mbti", icon: Brain, label: "MBTI (Opsional)" },
]

const adminFullItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/curhat", icon: MessageCircleHeart, label: "Kelola Curhat" },
  { href: "/admin/laporan", icon: FileText, label: "Laporan" },
  { href: "/admin/siswa", icon: Users, label: "Data Siswa" },
  { href: "/admin/guru", icon: GraduationCap, label: "Akun Guru" },
  { href: "/admin/pertanyaan", icon: HelpCircle, label: "Pertanyaan" },
  { href: "/admin/retake", icon: RotateCcw, label: "Retake" },
  { href: "/admin/analisa", icon: BarChart3, label: "Analisa" },
  { href: "/admin/guru/laporan", icon: FileText, label: "Laporan Guru" },
  { href: "/admin/banner", icon: LayoutDashboard, label: "Banner" },
  { href: "/admin/pengaturan", icon: Settings, label: "Pengaturan" },
]

const guruBKItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/curhat", icon: MessageCircleHeart, label: "Kelola Curhat" },
  { href: "/admin/laporan", icon: FileText, label: "Laporan" },
  { href: "/admin/siswa", icon: Users, label: "Data Siswa" },
  { href: "/admin/retake", icon: RotateCcw, label: "Retake" },
  { href: "/admin/analisa", icon: BarChart3, label: "Analisa" },
  { href: "/guru/asesmen", icon: ClipboardList, label: "Gaya Mengajar" },
  { href: "/guru/psikologi", icon: BookOpen, label: "Psikologi Guru" },
  { href: "/guru/mbti", icon: Brain, label: "MBTI (Opsional)" },
  { href: "/admin/guru/laporan", icon: FileText, label: "Laporan Guru" },
]

const walasItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/laporan", icon: FileText, label: "Laporan" },
  { href: "/admin/siswa", icon: Users, label: "Data Siswa" },
  { href: "/admin/analisa", icon: BarChart3, label: "Analisa" },
]

const guruMapelItems = [
  { href: "/guru/asesmen", icon: ClipboardList, label: "Gaya Mengajar" },
  { href: "/guru/psikologi", icon: BookOpen, label: "Psikologi Guru" },
  { href: "/guru/mbti", icon: Brain, label: "MBTI (Opsional)" },
  { href: "/guru/laporan", icon: FileText, label: "Laporan Saya" },
]

export function DesktopNav({
  role = "siswa",
  authenticated = true,
}: {
  role?: string
  authenticated?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user: authUser, logout } = useAuth()
  const items = role === "siswa" ? studentItems
    : role === "walas" ? walasItems
    : role === "guru-mapel" ? guruMapelItems
    : role === "guru" ? guruBKItems
    : adminFullItems
  const visibleItems = !authenticated && role === "siswa"
    ? studentItems.filter((item) => item.href === "/curhat")
    : items

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r z-40">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white text-sm font-bold">
          BK
        </div>
        <div>
          <div className="font-bold text-gray-900">BK Online</div>
          <div className="text-[10px] text-gray-400">Bimbingan Konseling</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {role === "siswa" && (
          <div className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Menu Siswa
          </div>
        )}
        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-gray-400")} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t p-4 space-y-3">
        {(() => {
          const roleLabel =
            authUser?.role === "admin" ? "Admin" :
            authUser?.role === "guru" ? "Guru BK" :
            authUser?.role === "walas" ? "Wali Kelas" :
            authUser?.role === "guru-mapel" ? "Guru" :
            authUser?.role === "siswa" ? "Siswa" : authUser?.role || ""
          const roleColor =
            authUser?.role === "admin" ? "bg-purple-100 text-purple-700" :
            authUser?.role === "guru" ? "bg-blue-100 text-blue-700" :
            authUser?.role === "walas" ? "bg-amber-100 text-amber-700" :
            authUser?.role === "guru-mapel" ? "bg-cyan-100 text-cyan-700" :
            "bg-emerald-100 text-emerald-700"
          return authUser ? (
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {authUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{authUser.name}</p>
                <span className={`inline-block text-[10px] font-medium ${roleColor} rounded px-1.5 py-0.5`}>
                  {roleLabel}
                </span>
              </div>
            </div>
          ) : null
        })()}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-gray-500"
          onClick={() => { logout(); router.push("/") }}
        >
          <LogOut className="h-4 w-4" /> Keluar
        </Button>
      </div>
    </aside>
  )
}
