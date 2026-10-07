"use client"

import React from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Sparkles, MessageCircleHeart, LogOut, Compass, Brain, Heart, Star, BookOpen } from "lucide-react"
import { AssessmentMascot } from "@/components/asesmen/assessment-mascot"
import { Badge } from "@/components/ui/badge"

const routeTitles: Record<string, { title: string; subtitle: string; icon: React.ElementType; character?: "kimi" | "piko" | "mimi" | "sparky" | "zen" }> = {
  "/asesmen": { title: "Pusat Asesmen", subtitle: "Eksplorasi Potensi", icon: Compass, character: "kimi" },
  "/asesmen/minat-bakat": { title: "Minat & Bakat", subtitle: "Holland RIASEC", icon: Compass, character: "kimi" },
  "/asesmen/gaya-belajar": { title: "Gaya Belajar", subtitle: "Metode VARK", icon: BookOpen, character: "piko" },
  "/asesmen/psikologi": { title: "Refleksi Emosi", subtitle: "Kesejahteraan Diri", icon: Heart, character: "mimi" },
  "/karakter": { title: "Karakter Diri", subtitle: "18 Nilai Luhur", icon: Star, character: "sparky" },
  "/asesmen/mbti": { title: "Tes MBTI", subtitle: "16 Kepribadian", icon: Brain, character: "zen" },
  "/curhat": { title: "Curhat Anonim", subtitle: "Ruang Konseling Nyaman", icon: MessageCircleHeart, character: "mimi" },
}

export function MobileTopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const currentRoute = routeTitles[pathname] || {
    title: "BK SMPN 1 Genteng",
    subtitle: "Sahabat Siswa",
    icon: Sparkles,
    character: "kimi",
  }

  const IconComponent = currentRoute.icon

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-xs md:hidden safe-area-top select-none transition-all">
      <div className="flex h-14 items-center justify-between px-3.5">
        {/* Left: Mascot & Current Screen */}
        <Link href="/asesmen" className="flex items-center gap-2.5 min-w-0 tap-bounce">
          <div className="relative shrink-0">
            <AssessmentMascot
              character={currentRoute.character || "kimi"}
              mood="happy"
              size={36}
              animated={false}
            />
            {/* Live Indicator */}
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xs font-extrabold text-slate-900 tracking-tight truncate flex items-center gap-1">
              {currentRoute.title}
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate">
              {currentRoute.subtitle}
            </span>
          </div>
        </Link>

        {/* Right: Student Profile Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          {user ? (
            <div className="flex items-center gap-1.5 rounded-full bg-slate-100/90 pl-2.5 pr-1 py-1 border border-slate-200/60 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-700 max-w-[85px] truncate">
                {user.name.split(" ")[0]}
              </span>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-[10px] font-extrabold text-white shadow-2xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm tap-bounce"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
