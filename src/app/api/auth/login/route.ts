import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { createSessionToken } from "@/lib/session"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    const rawUsername = String(username || "").trim()
    const normalizedUsername = rawUsername.toLowerCase()

    // Map common aliases to their official user emails
    let targetEmail = normalizedUsername
    if (normalizedUsername === "gurubk" || normalizedUsername === "guru-bk" || normalizedUsername === "guru_bk") {
      targetEmail = "guru"
    } else if (normalizedUsername === "walikelas" || normalizedUsername === "wali-kelas" || normalizedUsername === "wali_kelas") {
      targetEmail = "walas"
    } else if (normalizedUsername === "guru-mapel" || normalizedUsername === "guru_mapel") {
      targetEmail = "gurumapel"
    }

    let user = await prisma.user.findUnique({ where: { email: targetEmail } })
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: normalizedUsername },
            { nipy: rawUsername },
            { name: { equals: rawUsername, mode: "insensitive" } },
          ],
        },
      })
    }

    if (!user) {
      return NextResponse.json({ error: "Username tidak terdaftar" }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 })
    }

    if (user.status === "pending") {
      return NextResponse.json({ error: "Akun belum diaktifkan oleh admin. Silakan hubungi Guru BK." }, { status: 403 })
    }

    const userData = {
      id: user.id,
      name: user.name,
      username: user.email,
      role: user.role,
      anonymousId: user.anonymousId,
      nipy: user.nipy,
      kelas: user.kelas,
      mapel: user.mapel,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      username: user.email,
      role: user.role,
      anonymousId: user.anonymousId,
    })

    const response = NextResponse.json({ user: userData })

    // Set secure httpOnly cookie
    response.cookies.set("bk_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
