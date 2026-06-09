import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { urutan: "asc" } })
    return NextResponse.json({ banners })
  } catch {
    return NextResponse.json({ error: "Gagal memuat banner" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { judul, deskripsi, tombol, link, aktif, urutan } = await req.json()
    if (!judul) {
      return NextResponse.json({ error: "Judul harus diisi" }, { status: 400 })
    }
    const banner = await prisma.banner.create({
      data: {
        judul,
        deskripsi: deskripsi || "",
        tombol: tombol || "",
        link: link || "",
        aktif: aktif ?? true,
        urutan: urutan ?? 0,
      },
    })
    return NextResponse.json({ banner }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Gagal menambah banner" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { id, judul, deskripsi, tombol, link, aktif, urutan } = await req.json()
    if (!id || !judul) {
      return NextResponse.json({ error: "ID dan judul diperlukan" }, { status: 400 })
    }
    const banner = await prisma.banner.update({
      where: { id },
      data: { judul, deskripsi, tombol, link, aktif, urutan },
    })
    return NextResponse.json({ banner })
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate banner" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 })
    }
    await prisma.banner.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Gagal menghapus banner" }, { status: 500 })
  }
}
