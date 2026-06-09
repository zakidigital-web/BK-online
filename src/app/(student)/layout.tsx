"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { DesktopNav } from "@/components/desktop-nav"
import { MobileNav } from "@/components/mobile-nav"
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
    <div className="min-h-dvh bg-gray-50">
      <DesktopNav role="siswa" authenticated={canAccessStudentMenu} />
      <main className="pb-20 md:ml-64 md:pb-0">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <MobileNav role="siswa" authenticated={canAccessStudentMenu} />
    </div>
  )
}
