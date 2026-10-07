import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySessionToken } from "@/lib/session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Check if route is protected
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin")
  const isGuruRoute = pathname.startsWith("/guru") || pathname.startsWith("/api/guru")

  if (!isAdminRoute && !isGuruRoute) {
    return NextResponse.next()
  }

  // 2. Extract and verify session token from cookie
  const sessionCookie = request.cookies.get("bk_session")?.value
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null

  // 3. Handle unauthorized API requests
  const isApi = pathname.startsWith("/api/")
  if (!session) {
    if (isApi) {
      return NextResponse.json({ error: "Sesi tidak valid atau telah berakhir. Silakan login kembali." }, { status: 401 })
    }
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 4. Role-based authorization
  const isSuperAdminRoute =
    ((pathname === "/admin/guru" ||
      pathname.startsWith("/admin/guru/import") ||
      pathname.startsWith("/api/admin/guru")) &&
      !pathname.startsWith("/admin/guru/laporan")) ||
    pathname.startsWith("/admin/pengaturan") ||
    pathname.startsWith("/api/admin/reset") ||
    pathname.startsWith("/api/admin/backup") ||
    pathname.startsWith("/api/admin/restore")

  if (isSuperAdminRoute && session.role !== "admin") {
    if (isApi) {
      return NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Super Administrator" }, { status: 403 })
    }
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  const staffRoles = ["admin", "guru", "walas", "guru-mapel", "guru_bk", "guru-bk"]
  if (isAdminRoute && !staffRoles.includes(session.role)) {
    if (isApi) {
      return NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Staf/Guru" }, { status: 403 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isGuruRoute && !staffRoles.includes(session.role)) {
    if (isApi) {
      return NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Guru/Staff" }, { status: 403 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/guru/:path*",
    "/api/admin/:path*",
    "/api/guru/:path*",
  ],
}
