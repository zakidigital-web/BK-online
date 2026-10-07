"use client"

import { useState, type ComponentType } from "react"
import {
  LayoutDashboard,
  MessageCircleHeart,
  FileText,
  Users,
  Settings,
  LogOut,
  GraduationCap,
  ClipboardList,
  BookOpen,
  Brain,
  Sparkles,
  UserCircle,
  Home,
  HelpCircle,
  RotateCcw,
  BarChart3,
  MoreHorizontal,
  Compass,
} from "lucide-react"
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
  { href: "/beranda", icon: Home, label: "Beranda" },
  { href: "/asesmen", icon: Compass, label: "Asesmen" },
  { href: "/curhat", icon: MessageCircleHeart, label: "Curhat" },
  { href: "/karakter", icon: UserCircle, label: "Karakter" },
  { href: "/asesmen/minat-bakat", icon: Brain, label: "Minat" },
  { href: "/asesmen/gaya-belajar", icon: BookOpen, label: "Belajar" },
  { href: "/asesmen/psikologi", icon: Sparkles, label: "Psikologi" },
  { href: "/asesmen/mbti", icon: Brain, label: "MBTI" },
]

const adminItems: NavItem[] = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Beranda" },
  { href: "/admin/siswa", icon: Users, label: "Siswa" },
  { href: "/admin/guru", icon: GraduationCap, label: "Guru" },
  { href: "/admin/curhat", icon: MessageCircleHeart, label: "Curhat" },
  { href: "/admin/laporan", icon: FileText, label: "Laporan" },
  { href: "/admin/retake", icon: RotateCcw, label: "Retake" },
  { href: "/admin/pertanyaan", icon: HelpCircle, label: "Soal" },
  { href: "/admin/banner", icon: LayoutDashboard, label: "Banner" },
  { href: "/admin/analisa", icon: BarChart3, label: "Analisa" },
  { href: "/admin/guru/laporan", icon: FileText, label: "Lap.Guru" },
  { href: "/admin/pengaturan", icon: Settings, label: "Atur" },
]

const guruBKItems: NavItem[] = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Beranda" },
  { href: "/admin/curhat", icon: MessageCircleHeart, label: "Curhat" },
  { href: "/admin/laporan", icon: FileText, label: "Laporan" },
  { href: "/admin/siswa", icon: Users, label: "Siswa" },
  { href: "/admin/retake", icon: RotateCcw, label: "Retake" },
  { href: "/admin/analisa", icon: BarChart3, label: "Analisa" },
  { href: "/guru/asesmen", icon: ClipboardList, label: "Mengajar" },
  { href: "/guru/psikologi", icon: BookOpen, label: "Psikologi" },
  { href: "/guru/mbti", icon: Brain, label: "MBTI" },
  { href: "/admin/guru/laporan", icon: FileText, label: "Lap.Guru" },
]

const walasItems: NavItem[] = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Beranda" },
  { href: "/admin/laporan", icon: FileText, label: "Laporan" },
  { href: "/admin/siswa", icon: Users, label: "Siswa" },
  { href: "/admin/analisa", icon: BarChart3, label: "Analisa" },
  { href: "/guru/asesmen", icon: ClipboardList, label: "Mengajar" },
]

const guruMapelItems: NavItem[] = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Beranda" },
  { href: "/admin/laporan", icon: FileText, label: "Murid" },
  { href: "/guru/asesmen", icon: ClipboardList, label: "Mengajar" },
  { href: "/guru/psikologi", icon: BookOpen, label: "Psikologi" },
  { href: "/guru/mbti", icon: Brain, label: "MBTI" },
  { href: "/guru/laporan", icon: FileText, label: "Laporan" },
]

const MAX_VISIBLE = 5

function NavItemLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isExact = pathname === item.href
  const isNested = item.href !== "/" && pathname.startsWith(item.href + "/")
  const isActive = isExact || isNested

  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 px-2 transition-all min-w-0 flex-1 tap-bounce select-none",
        isActive
          ? "text-indigo-600 font-bold"
          : "text-slate-400 hover:text-slate-600 font-medium"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
          isActive
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-105"
            : "text-slate-400 hover:bg-slate-100/80"
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
      </div>
      <span className="text-[10px] leading-tight truncate max-w-full tracking-tight">
        {item.label}
      </span>
      {isActive && (
        <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-indigo-600" />
      )}
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

  const allItems: NavItem[] =
    role === "siswa"
      ? studentItems
      : role === "walas"
      ? walasItems
      : role === "guru-mapel"
      ? guruMapelItems
      : role === "guru"
      ? guruBKItems
      : adminItems

  const items =
    !authenticated && role === "siswa"
      ? studentItems.filter((item) => item.href === "/curhat")
      : allItems

  const primary = items.length <= MAX_VISIBLE ? items : items.slice(0, MAX_VISIBLE - 1)
  const overflow = items.length <= MAX_VISIBLE ? [] : items.slice(MAX_VISIBLE - 1)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/70 bg-white/92 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:hidden safe-area-bottom select-none">
      <div className="flex items-center justify-around gap-1 px-2 pt-1 pb-1">
        {primary.map((item) => (
          <NavItemLink key={item.href} item={item} pathname={pathname} />
        ))}

        {overflow.length > 0 && (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger render={
              <button className="flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 px-2 transition-all min-w-0 flex-1 tap-bounce text-slate-400 hover:text-slate-600 font-medium select-none" />
            }>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-all">
                <MoreHorizontal className="h-5 w-5" />
              </div>
              <span className="text-[10px] leading-tight truncate tracking-tight">Menu</span>
            </SheetTrigger>
            <SheetContent side="bottom" showCloseButton={false} className="px-0 pb-12 rounded-t-3xl border-slate-200/80 bg-white/95 backdrop-blur-2xl">
              {/* Native iOS / Android Grab Handle */}
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300" />

              <SheetHeader className="px-5 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="text-base font-extrabold text-slate-900">
                      Menu Lengkap
                    </SheetTitle>
                    <p className="text-xs text-slate-500">Akses cepat seluruh fitur BK</p>
                  </div>
                  {authUser && (
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-100">
                      {authUser.name.split(" ")[0]}
                    </span>
                  )}
                </div>
              </SheetHeader>

              <div className="grid grid-cols-4 gap-2 px-4 pt-4">
                {overflow.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-2xl p-3 text-[11px] font-semibold transition-all tap-bounce",
                        isActive
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs"
                          : "text-slate-600 bg-slate-50/70 hover:bg-slate-100"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                        isActive ? "bg-indigo-600 text-white shadow-xs" : "bg-white text-slate-500 border border-slate-200/60"
                      )}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="text-center leading-tight truncate w-full">{item.label}</span>
                    </Link>
                  )
                })}

                <button
                  type="button"
                  onClick={() => {
                    logout()
                    router.push("/login")
                    setSheetOpen(false)
                  }}
                  className="flex flex-col items-center gap-1.5 rounded-2xl p-3 text-[11px] font-semibold text-rose-600 bg-rose-50/70 hover:bg-rose-100 transition-all tap-bounce"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-rose-600 border border-rose-200/60">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span className="text-center leading-tight">Keluar</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {overflow.length === 0 && (
          <button
            type="button"
            onClick={() => {
              logout()
              router.push("/login")
            }}
            className="flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 px-2 text-[10px] font-medium text-slate-400 hover:text-rose-500 transition-all tap-bounce min-w-0 flex-1"
            title="Keluar"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="truncate leading-tight">Keluar</span>
          </button>
        )}
      </div>
    </nav>
  )
}
