import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hitungSkorPsikologi } from "@/lib/asesmen/guru"
import { getServerSession } from "@/lib/session"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid atau telah berakhir" }, { status: 401 })
    }

    const { guruId, jawaban } = await req.json()
    if (!guruId || !jawaban) {
      return NextResponse.json({ error: "guruId dan jawaban harus diisi" }, { status: 400 })
    }

    // IDOR protection: cannot submit assessment for another teacher unless admin
    if (session.id !== guruId && session.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat mengisi asesmen untuk akun sendiri" }, { status: 403 })
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
