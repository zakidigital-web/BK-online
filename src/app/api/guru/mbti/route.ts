import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hitungSkor } from "@/lib/asesmen/mbti"

export async function POST(req: Request) {
  try {
    const { guruId, jawaban } = await req.json()
    if (!guruId || !jawaban) {
      return NextResponse.json({ error: "guruId dan jawaban harus diisi" }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { id: guruId } })
    if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })

    const skor = hitungSkor(jawaban)
    const jawabanStr = JSON.stringify(jawaban)
    const skorStr = JSON.stringify(skor)

    const existing = await prisma.guruAsesmen.findUnique({ where: { guruId } })
    if (existing) {
      await prisma.guruAsesmen.update({
        where: { guruId },
        data: { jawabanMbti: jawabanStr, skorMbti: skorStr },
      })
    } else {
      await prisma.guruAsesmen.create({
        data: { guruId, jawaban: "{}", skor: "{}", jawabanMbti: jawabanStr, skorMbti: skorStr },
      })
    }

    return NextResponse.json({ skor })
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan MBTI" }, { status: 500 })
  }
}
