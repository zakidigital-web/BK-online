"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { DesktopNav } from "@/components/desktop-nav"
import { MobileNav } from "@/components/mobile-nav"
import { MobileTopBar } from "@/components/mobile-top-bar"
import { useAuth } from "@/lib/auth-context"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isCurhatPage = pathname === "/curhat"
  const canAccessStudentMenu = Boolean(user)

  useEffect(() => {
    if (user && user.role !== "siswa") {
      router.replace("/admin/dashboard")
      return
    }
    if (!user && !isCurhatPage) {
      router.replace("/curhat")
    }
  }, [isCurhatPage, router, user])

  if (user && user.role !== "siswa") {
    return null
  }
  if (!user && !isCurhatPage) {
    return null
  }

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      <MobileTopBar />
      <DesktopNav role="siswa" authenticated={canAccessStudentMenu} />
      <main className="flex-1 pb-28 md:ml-64 md:pb-8">
        <div className="mx-auto max-w-4xl px-3.5 py-3 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <MobileNav role="siswa" authenticated={canAccessStudentMenu} />
    </div>
  )
}
