import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const nisn = searchParams.get("nisn")
    const jenis = searchParams.get("jenis")

    if (!nisn || !jenis) {
      return NextResponse.json({ error: "nisn dan jenis diperlukan" }, { status: 400 })
    }

    const siswa = await prisma.siswa.findFirst({ where: { nisn } })
    if (!siswa) {
      return NextResponse.json({ completed: false, retakeStatus: "none" })
    }

    const models: Record<string, string> = {
      "minat-bakat": "minatBakat",
      "psikologi": "psikologi",
      "gaya-belajar": "gayaBelajar",
      "karakter": "karakterDiri",
      "mbti": "mbti",
    }
    const modelName = models[jenis]
    if (!modelName) {
      return NextResponse.json({ error: "jenis tidak valid" }, { status: 400 })
    }

    const existing = await (prisma as any)[modelName].findFirst({ where: { siswaId: siswa.id } })

    const retakeRequest = await prisma.retakeRequest.findUnique({
      where: { siswaId_jenis: { siswaId: siswa.id, jenis } },
    })

    return NextResponse.json({
      completed: !!existing,
      retakeStatus: retakeRequest?.status || "none",
    })
  } catch (error) {
    return NextResponse.json({ error: "Gagal memeriksa status" }, { status: 500 })
  }
}
