import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hitungSkorPsikologi } from "@/lib/asesmen/guru"

export async function POST(req: Request) {
  try {
    const { guruId, jawaban } = await req.json()
    if (!guruId || !jawaban) {
      return NextResponse.json({ error: "guruId dan jawaban harus diisi" }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { id: guruId } })
    if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })

    const skor = hitungSkorPsikologi(jawaban)
    const jawabanStr = JSON.stringify(jawaban)
    const skorStr = JSON.stringify(skor)

    const existing = await prisma.guruAsesmen.findUnique({ where: { guruId } })
    if (existing) {
      await prisma.guruAsesmen.update({
        where: { guruId },
        data: { jawabanPsikologi: jawabanStr, skorPsikologi: skorStr },
      })
    } else {
      await prisma.guruAsesmen.create({
        data: { guruId, jawaban: "{}", skor: "{}", jawabanPsikologi: jawabanStr, skorPsikologi: skorStr },
      })
    }

    return NextResponse.json({ skor })
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan psikologi" }, { status: 500 })
  }
}
