import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { userId, oldPassword, newPassword } = await req.json()

    if (!userId || !oldPassword || !newPassword) {
      return NextResponse.json({ error: "ID user, password lama, dan password baru harus diisi" }, { status: 400 })
    }
    if (newPassword.length < 4) {
      return NextResponse.json({ error: "Password baru minimal 4 karakter" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    const valid = await bcrypt.compare(oldPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: "Password lama salah" }, { status: 401 })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Gagal mengubah password" }, { status: 500 })
  }
}
