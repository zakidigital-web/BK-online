import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { siswaId, guruId } = await req.json()

    if (siswaId) {
      await prisma.minatBakat.deleteMany({ where: { siswaId } })
      await prisma.psikologi.deleteMany({ where: { siswaId } })
      await prisma.gayaBelajar.deleteMany({ where: { siswaId } })
      await prisma.karakterDiri.deleteMany({ where: { siswaId } })
      await prisma.mbti.deleteMany({ where: { siswaId } })
      await prisma.retakeRequest.deleteMany({ where: { siswaId } })
      return NextResponse.json({ success: true, message: "Asesmen siswa berhasil direset" })
    }

    if (guruId) {
      await prisma.guruAsesmen.deleteMany({ where: { guruId } })
      return NextResponse.json({ success: true, message: "Asesmen guru berhasil direset" })
    }

    return NextResponse.json({ error: "siswaId atau guruId diperlukan" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Gagal mereset asesmen" }, { status: 500 })
  }
}
