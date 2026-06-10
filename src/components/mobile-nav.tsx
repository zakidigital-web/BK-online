"use client"

import { useState, type ComponentType } from "react"
import { LayoutDashboard, MessageCircleHeart, FileText, Users, Settings, LogOut, GraduationCap, ClipboardList, BookOpen, Brain, Sparkles, UserCircle, Home, HelpCircle, RotateCcw, BarChart3, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface NavItem {
  href: string
  icon: ComponentType<{ className?: string }>
  label: string
}

const studentItems: NavItem[] = [
  { href: "/curhat", icon: MessageCircleHeart, label: "Curhat" },
  { href: "/asesmen/minat-bakat", icon: Brain, label: "Minat" },
  { href: "/asesmen/psikologi", icon: Sparkles, label: "Psikologi" },
  { href: "/karakter", icon: UserCircle, label: "Karakter" },
  { href: "/asesmen/gaya-belajar", icon: Home, label: "Belajar" },
  { href: "/asesmen/mbti", icon: Brain, label: "MBTI*" },
]

const adminItems: NavItem[] = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/curhat", icon: MessageCircleHeart, label: "Curhat" },
  { href: "/admin/laporan", icon: FileText, label: "Laporan" },
  { href: "/admin/siswa", icon: Users, label: "Siswa" },
  { href: "/admin/guru", icon: GraduationCap, label: "Guru" },
  { href: "/admin/pertanyaan", icon: HelpCircle, label: "Soal" },
  { href: "/admin/retake", icon: RotateCcw, label: "Retake" },
  { href: "/admin/analisa", icon: BarChart3, label: "Analisa" },
  { href: "/admin/guru/laporan", icon: FileText, label: "Lap.Guru" },
  { href: "/admin/banner", icon: LayoutDashboard, label: "Banner" },
  { href: "/admin/pengaturan", icon: Settings, label: "Atur" },
]

const guruBKItems: NavItem[] = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/curhat", icon: MessageCircleHeart, label: "Curhat" },
  { href: "/admin/siswa", icon: Users, label: "Siswa" },
  { href: "/admin/laporan", icon: FileText, label: "Laporan" },
  { href: "/admin/retake", icon: RotateCcw, label: "Retake" },
  { href: "/admin/analisa", icon: BarChart3, label: "Analisa" },
  { href: "/guru/asesmen", icon: ClipboardList, label: "Mengajar" },
  { href: "/guru/psikologi", icon: BookOpen, label: "Psikologi" },
  { href: "/guru/mbti", icon: Brain, label: "MBTI" },
  { href: "/admin/guru/laporan", icon: FileText, label: "Lap.Guru" },
]

const walasItems: NavItem[] = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/laporan", icon: FileText, label: "Laporan" },
  { href: "/admin/siswa", icon: Users, label: "Siswa" },
  { href: "/admin/analisa", icon: BarChart3, label: "Analisa" },
]

const guruMapelItems: NavItem[] = [
  { href: "/guru/asesmen", icon: ClipboardList, label: "Mengajar" },
  { href: "/guru/psikologi", icon: BookOpen, label: "Psikologi" },
  { href: "/guru/mbti", icon: Brain, label: "MBTI" },
  { href: "/guru/laporan", icon: FileText, label: "Laporan" },
]

const MAX_VISIBLE = 5

function NavItemLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-all min-w-0 flex-1",
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
      <span className="truncate leading-tight max-w-full">{item.label}</span>
    </Link>
  )
}

export function MobileNav({
  role = "siswa",
  authenticated = true,
}: {
  role?: string
  authenticated?: boolean
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user: authUser, logout } = useAuth()

  const allItems: NavItem[] = role === "siswa" ? studentItems
    : role === "walas" ? walasItems
    : role === "guru-mapel" ? guruMapelItems
    : role === "guru" ? guruBKItems
    : adminItems

  const items = !authenticated && role === "siswa"
    ? studentItems.filter((item) => item.href === "/curhat")
    : allItems

  const primary = items.length <= MAX_VISIBLE ? items : items.slice(0, MAX_VISIBLE - 1)
  const overflow = items.length <= MAX_VISIBLE ? [] : items.slice(MAX_VISIBLE - 1)

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
      <div className="flex items-center justify-around gap-1 px-2 py-1.5">
        {primary.map((item) => (
          <NavItemLink key={item.href} item={item} pathname={pathname} />
        ))}
        {overflow.length > 0 && (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger render={
              <button className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 min-w-0 flex-1" />
            }>
              <div className="flex h-7 w-7 items-center justify-center rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </div>
              <span className="truncate leading-tight">Lainnya</span>
            </SheetTrigger>
            <SheetContent side="bottom" showCloseButton={false} className="px-0 pb-10">
              <SheetHeader className="px-4 pb-2">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-4 gap-1 px-3">
                {overflow.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-[10px] font-medium transition-all",
                        isActive
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      )}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-center leading-tight">{item.label}</span>
                    </Link>
                  )
                })}
                <button
                  onClick={() => { logout(); router.push("/"); setSheetOpen(false) }}
                  className="flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-[10px] font-medium text-red-400 transition-all hover:bg-red-50 hover:text-red-500"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span className="text-center leading-tight">Keluar</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        )}
        {overflow.length === 0 && (
          <button
            onClick={() => { logout(); router.push("/") }}
            className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 min-w-0 flex-1"
            title="Keluar"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="truncate leading-tight">Keluar</span>
          </button>
        )}
      </div>
    </nav>
  )
}
