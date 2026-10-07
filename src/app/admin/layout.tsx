"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DesktopNav } from "@/components/desktop-nav"
import { MobileNav } from "@/components/mobile-nav"
import { useAuth } from "@/lib/auth-context"
import { useHeartbeat } from "@/lib/use-heartbeat"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  useHeartbeat(user?.id)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (user.role === "siswa") {
      router.replace("/beranda")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-medium text-gray-500">Memverifikasi sesi...</p>
        </div>
      </div>
    )
  }
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
