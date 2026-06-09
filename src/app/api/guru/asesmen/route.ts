import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hitungSkorGuru } from "@/lib/asesmen/guru"

export async function POST(req: Request) {
  try {
    const { guruId, jawaban } = await req.json()
    if (!guruId || !jawaban) {
      return NextResponse.json({ error: "guruId dan jawaban harus diisi" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: guruId } })
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    const skor = hitungSkorGuru(jawaban)
    const jawabanStr = JSON.stringify(jawaban)
    const skorStr = JSON.stringify(skor)

    const existing = await prisma.guruAsesmen.findUnique({ where: { guruId } })
    let result
    if (existing) {
      result = await prisma.guruAsesmen.update({
        where: { guruId },
        data: { jawaban: jawabanStr, skor: skorStr },
      })
    } else {
      result = await prisma.guruAsesmen.create({
        data: { guruId, jawaban: jawabanStr, skor: skorStr },
      })
    }

    return NextResponse.json({ asesmen: result, skor })
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan asesmen" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const guruId = searchParams.get("guruId")
    const all = searchParams.get("all") === "true"

    if (all) {
      const list = await prisma.guruAsesmen.findMany({
        include: { guru: { select: { id: true, name: true, email: true, mapel: true, nipy: true } } },
        orderBy: { createdAt: "desc" },
      })
      return NextResponse.json({ list })
    }

    if (guruId) {
      const asesmen = await prisma.guruAsesmen.findUnique({
        where: { guruId },
        include: { guru: { select: { id: true, name: true, email: true, mapel: true, nipy: true } } },
      })
      if (!asesmen) return NextResponse.json({ error: "Belum mengerjakan asesmen" }, { status: 404 })
      return NextResponse.json({ asesmen })
    }

    return NextResponse.json({ error: "Parameter guruId atau all diperlukan" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 })
  }
}
