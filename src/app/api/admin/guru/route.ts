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

export async function PUT(req: Request) {
  try {
    const { id, name, role, kelas, mapel, nipy } = await req.json()
    if (!id) {
      return NextResponse.json({ error: "ID guru diperlukan" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 })
    }

    const validRoles = ["admin", "guru", "guru-mapel", "walas"]
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name !== undefined ? String(name).trim() : undefined,
        role: role !== undefined ? role : undefined,
        kelas: kelas !== undefined ? (kelas ? String(kelas).trim().toUpperCase() : null) : undefined,
        mapel: mapel !== undefined ? (mapel ? String(mapel).trim() : null) : undefined,
        nipy: nipy !== undefined ? (nipy ? String(nipy).trim() : null) : undefined,
      },
      select: { id: true, name: true, email: true, role: true, nipy: true, kelas: true, mapel: true, createdAt: true },
    })

    return NextResponse.json({ guru: updated })
  } catch (error: any) {
    console.error("[UPDATE_GURU_ERROR]:", error)
    return NextResponse.json({ error: "Gagal memperbarui data akun guru" }, { status: 500 })
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
