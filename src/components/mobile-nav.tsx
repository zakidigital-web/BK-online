"use client"

import { LayoutDashboard, MessageCircleHeart, FileText, Users, Settings, LogOut, GraduationCap, ClipboardList, BookOpen, Brain, Sparkles, UserCircle, Home, HelpCircle, RotateCcw } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const studentItems = [
  { href: "/curhat", icon: MessageCircleHeart, label: "Curhat" },
  { href: "/asesmen/minat-bakat", icon: Brain, label: "Minat" },
  { href: "/asesmen/psikologi", icon: Sparkles, label: "Psikologi" },
  { href: "/karakter", icon: UserCircle, label: "Karakter" },
  { href: "/asesmen/gaya-belajar", icon: Home, label: "Belajar" },
  { href: "/asesmen/mbti", icon: Brain, label: "MBTI*" },
]

const adminItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/curhat", icon: MessageCircleHeart, label: "Curhat" },
  { href: "/admin/laporan", icon: FileText, label: "Laporan" },
  { href: "/admin/retake", icon: RotateCcw, label: "Retake" },
  { href: "/admin/banner", icon: LayoutDashboard, label: "Banner" },
  { href: "/admin/pengaturan", icon: Settings, label: "Atur" },
]

const guruBKItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/curhat", icon: MessageCircleHeart, label: "Curhat" },
  { href: "/admin/siswa", icon: Users, label: "Siswa" },
  { href: "/admin/laporan", icon: FileText, label: "Laporan" },
]

const walasItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/laporan", icon: FileText, label: "Laporan" },
  { href: "/admin/siswa", icon: Users, label: "Siswa" },
]

const guruMapelItems = [
  { href: "/guru/asesmen", icon: ClipboardList, label: "Mengajar" },
  { href: "/guru/psikologi", icon: BookOpen, label: "Psikologi" },
  { href: "/guru/laporan", icon: FileText, label: "Laporan" },
]

export function MobileNav({
  role = "siswa",
  authenticated = true,
}: {
  role?: string
  authenticated?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user: authUser, logout } = useAuth()

  const raw = role === "siswa" ? studentItems
    : role === "walas" ? walasItems
    : role === "guru-mapel" ? guruMapelItems
    : role === "guru" ? guruBKItems
    : adminItems

  const items =
    !authenticated && role === "siswa" ? studentItems.filter((item) => item.href === "/curhat") : raw

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/90 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden safe-area-bottom">
      {authUser && (
        <div className="border-b border-slate-100 px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
              {authUser.name.charAt(0).toUpperCase()}
            </div>
            <p className="truncate text-xs font-medium text-gray-700">{authUser.name}</p>
          </div>
          <span className="shrink-0 text-[10px] font-medium rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
            {authUser.role === "admin" ? "Admin" :
             authUser.role === "guru" ? "BK" :
             authUser.role === "walas" ? "Walas" :
             authUser.role === "guru-mapel" ? "Guru" : "Siswa"}
          </span>
        </div>
      )}
      <div className="mx-auto flex max-w-sm items-center justify-between gap-1 px-3 py-1.5">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-all min-w-0",
                isActive
                  ? "bg-indigo-100 text-indigo-700 shadow-sm"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-all",
                  isActive ? "bg-white text-indigo-600 shadow-xs" : "text-slate-400"
                )}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <span className="truncate leading-tight">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => { logout(); router.push("/") }}
          className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 min-w-0"
          title="Keluar"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="truncate leading-tight">Keluar</span>
        </button>
      </div>
    </nav>
  )
}
