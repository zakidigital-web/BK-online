import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const nisn = searchParams.get("nisn")
    const jenis = searchParams.get("jenis")

    if (!nisn) {
      return NextResponse.json({ error: "nisn diperlukan" }, { status: 400 })
    }

    const siswa = await prisma.siswa.findFirst({ where: { nisn } })
    if (!siswa) {
      return NextResponse.json({ completed: false, retakeStatus: "none" })
    }

    if (!jenis || jenis === "all") {
      const [mb, psi, gb, kd, mb_tipe] = await Promise.all([
        prisma.minatBakat.findFirst({ where: { siswaId: siswa.id }, orderBy: { createdAt: "desc" } }),
        prisma.psikologi.findFirst({ where: { siswaId: siswa.id }, orderBy: { createdAt: "desc" } }),
        prisma.gayaBelajar.findFirst({ where: { siswaId: siswa.id }, orderBy: { createdAt: "desc" } }),
        prisma.karakterDiri.findFirst({ where: { siswaId: siswa.id }, orderBy: { createdAt: "desc" } }),
        prisma.mbti.findFirst({ where: { siswaId: siswa.id }, orderBy: { createdAt: "desc" } }),
      ])

      return NextResponse.json({
        siswa: { id: siswa.id, nama: siswa.nama, kelas: siswa.kelas, nisn: siswa.nisn },
        assessments: {
          minatBakat: mb ? { completed: true, skor: JSON.parse(mb.skor), createdAt: mb.createdAt } : { completed: false },
          psikologi: psi ? { completed: true, skor: JSON.parse(psi.skor), createdAt: psi.createdAt } : { completed: false },
          gayaBelajar: gb ? { completed: true, skor: JSON.parse(gb.skor), createdAt: gb.createdAt } : { completed: false },
          karakterDiri: kd ? { completed: true, skor: JSON.parse(kd.skor), createdAt: kd.createdAt } : { completed: false },
          mbti: mb_tipe ? { completed: true, skor: JSON.parse(mb_tipe.skor), createdAt: mb_tipe.createdAt } : { completed: false },
        },
      })
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
