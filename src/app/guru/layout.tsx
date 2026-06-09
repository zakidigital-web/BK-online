"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DesktopNav } from "@/components/desktop-nav"
import { MobileNav } from "@/components/mobile-nav"
import { useAuth } from "@/lib/auth-context"

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.replace("/login")
      return
    }
    if (user.role === "siswa") {
      router.replace("/curhat")
    }
  }, [user, router])

  if (!user) return null
  if (user.role === "siswa") return null

  return (
    <div className="min-h-dvh bg-gray-50">
      <DesktopNav role={user.role} />
      <main className="md:ml-64 pb-20 md:pb-0 safe-area-bottom">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <MobileNav role={user.role} />
    </div>
  )
}
