import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    const normalizedUsername = String(username || "").trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: normalizedUsername } })
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

    return NextResponse.json({
      user: {
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
      },
    })
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
