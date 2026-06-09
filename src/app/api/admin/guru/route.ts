import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const guru = await prisma.user.findMany({
      where: { role: { not: "siswa" } },
      select: { id: true, name: true, email: true, role: true, nipy: true, kelas: true, mapel: true, createdAt: true },
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ guru })
  } catch {
    return NextResponse.json({ error: "Gagal memuat data guru" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, username, password, role, nipy, kelas, mapel } = await req.json()
    const normalizedUsername = String(username || "").trim().toLowerCase()
    const trimmedName = String(name || "").trim()

    if (!trimmedName || !normalizedUsername || !password) {
      return NextResponse.json({ error: "Nama, username, dan password harus diisi" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedUsername } })
    if (existing) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedUsername,
        password: hashedPassword,
        role: role || "guru",
        nipy: nipy || undefined,
        kelas: kelas || undefined,
        mapel: mapel || undefined,
      },
      select: { id: true, name: true, email: true, role: true, nipy: true, kelas: true, mapel: true, createdAt: true },
    })

    return NextResponse.json({ guru: user }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Gagal menambah guru" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: "ID guru diperlukan" }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 })
    }
    if (user.role === "admin") {
      return NextResponse.json({ error: "Akun admin tidak dapat dihapus" }, { status: 403 })
    }
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Gagal menghapus akun" }, { status: 500 })
  }
}
