import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySessionToken } from "@/lib/session"

// In-memory rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function isLoginRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = loginAttempts.get(ip)
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 60_000 }) // 1 minute window
    return false
  }
  record.count++
  return record.count > 15 // Max 15 login attempts per minute per IP
}

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("X-Frame-Options", "SAMEORIGIN")
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  return res
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Rate limiting for login
  if (pathname === "/api/auth/login" && request.method === "POST") {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    if (isLoginRateLimited(ip)) {
      const res = NextResponse.json(
        { error: "Terlalu banyak percobaan login. Silakan tunggu 1 menit sebelum mencoba lagi." },
        { status: 429 }
      )
      return applySecurityHeaders(res)
    }
    return applySecurityHeaders(NextResponse.next())
  }

  // 2. Student assessment routes: strictly for siswa role!
  const isStudentAssessmentRoute =
    pathname === "/asesmen" ||
    pathname.startsWith("/asesmen/") ||
    pathname === "/karakter" ||
    pathname === "/beranda"

  // 3. Admin / Guru routes
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin")
  const isGuruRoute = pathname.startsWith("/guru") || pathname.startsWith("/api/guru")

  if (!isStudentAssessmentRoute && !isAdminRoute && !isGuruRoute) {
    return applySecurityHeaders(NextResponse.next())
  }

  // 4. Extract and verify session token from cookie
  const sessionCookie = request.cookies.get("bk_session")?.value
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null

  // 5. Handle student assessment route access
  if (isStudentAssessmentRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return applySecurityHeaders(NextResponse.redirect(loginUrl))
    }
    // Teachers / staff / admin are strictly forbidden from student assessment center
    if (session.role !== "siswa") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/admin/dashboard", request.url)))
    }
    return applySecurityHeaders(NextResponse.next())
  }

  // 6. Handle unauthorized API requests
  const isApi = pathname.startsWith("/api/")
  if (!session) {
    if (isApi) {
      const res = NextResponse.json({ error: "Sesi tidak valid atau telah berakhir. Silakan login kembali." }, { status: 401 })
      return applySecurityHeaders(res)
    }
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return applySecurityHeaders(NextResponse.redirect(loginUrl))
  }

  // 7. Role-based authorization
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
      const res = NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Super Administrator" }, { status: 403 })
      return applySecurityHeaders(res)
    }
    return applySecurityHeaders(NextResponse.redirect(new URL("/admin/dashboard", request.url)))
  }

  const staffRoles = ["admin", "guru", "walas", "guru-mapel", "guru_bk", "guru-bk"]
  if (isAdminRoute && !staffRoles.includes(session.role)) {
    if (isApi) {
      const res = NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Staf/Guru" }, { status: 403 })
      return applySecurityHeaders(res)
    }
    return applySecurityHeaders(NextResponse.redirect(new URL("/login", request.url)))
  }

  if (isGuruRoute && !staffRoles.includes(session.role)) {
    if (isApi) {
      const res = NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Guru/Staff" }, { status: 403 })
      return applySecurityHeaders(res)
    }
    return applySecurityHeaders(NextResponse.redirect(new URL("/login", request.url)))
  }

  return applySecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/guru/:path*",
    "/api/admin/:path*",
    "/api/guru/:path*",
    "/api/auth/login",
    "/asesmen/:path*",
    "/asesmen",
    "/karakter",
    "/beranda",
  ],
}

