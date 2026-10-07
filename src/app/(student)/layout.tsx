"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { DesktopNav } from "@/components/desktop-nav"
import { MobileNav } from "@/components/mobile-nav"
import { MobileTopBar } from "@/components/mobile-top-bar"
import { useAuth } from "@/lib/auth-context"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isCurhatPage = pathname === "/curhat"
  const canAccessStudentMenu = Boolean(user)

  useEffect(() => {
    if (loading) return
    if (!user && !isCurhatPage) {
      router.replace("/login")
      return
    }
    // Teachers, staff, and admin are not allowed in student assessment center / beranda
    if (user && user.role !== "siswa" && !isCurhatPage) {
      router.replace("/admin/dashboard")
    }
  }, [isCurhatPage, loading, router, user])

  if (loading && !isCurhatPage) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Memverifikasi...</p>
        </div>
      </div>
    )
  }

  if ((!user || user.role !== "siswa") && !isCurhatPage) {
    return null
  }

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      <MobileTopBar />
      <DesktopNav role={user?.role || "siswa"} authenticated={canAccessStudentMenu} />
      <main className="flex-1 pb-28 md:ml-64 md:pb-8">
        <div className="mx-auto max-w-4xl px-3.5 py-3 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <MobileNav role={user?.role || "siswa"} authenticated={canAccessStudentMenu} />
    </div>
  )
}
