import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const kelas = await prisma.kelas.findMany({ orderBy: { nama: "asc" } })
    return NextResponse.json({ kelas })
  } catch {
    return NextResponse.json({ error: "Gagal memuat data kelas" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { nama } = await req.json()
    const trimmed = String(nama || "").trim().toUpperCase()
    if (!trimmed) {
      return NextResponse.json({ error: "Nama kelas tidak boleh kosong" }, { status: 400 })
    }

    const existing = await prisma.kelas.findUnique({ where: { nama: trimmed } })
    if (existing) {
      return NextResponse.json({ error: "Kelas sudah ada" }, { status: 400 })
    }

    const kelas = await prisma.kelas.create({ data: { nama: trimmed } })
    return NextResponse.json({ kelas }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Gagal menambah kelas" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id, nama } = await req.json()
    if (!id && !nama) {
      return NextResponse.json({ error: "ID atau nama kelas diperlukan" }, { status: 400 })
    }
    if (id) {
      await prisma.kelas.delete({ where: { id } })
    } else {
      await prisma.kelas.delete({ where: { nama } })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Gagal menghapus kelas" }, { status: 500 })
  }
}
