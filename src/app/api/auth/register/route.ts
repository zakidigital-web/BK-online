import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { name, username, password } = await req.json()
    const normalizedUsername = String(username || "").trim().toLowerCase()

    const existing = await prisma.user.findUnique({ where: { email: normalizedUsername } })
    if (existing) {
      return NextResponse.json({ error: "NISN sudah terdaftar" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedUsername,
        password: hashedPassword,
        role: "siswa",
        status: "pending",
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.email,
        role: user.role,
        anonymousId: user.anonymousId,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
