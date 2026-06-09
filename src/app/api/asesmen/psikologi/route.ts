import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { nama, kelas, jawaban, skor } = await req.json()
    let siswa = await prisma.siswa.findFirst({ where: { nama, kelas } })
    if (!siswa) {
      siswa = await prisma.siswa.create({ data: { nama, kelas } })
    }
    const result = await prisma.psikologi.create({
      data: {
        siswaId: siswa.id,
        jawaban: JSON.stringify(jawaban),
        skor: JSON.stringify(skor),
      },
    })
    await prisma.retakeRequest.deleteMany({ where: { siswaId: siswa.id, jenis: "psikologi" } })
    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const kelas = searchParams.get("kelas")
  const where = kelas ? { siswa: { kelas } } : {}
  const data = await prisma.psikologi.findMany({
    where,
    include: { siswa: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ data })
}
