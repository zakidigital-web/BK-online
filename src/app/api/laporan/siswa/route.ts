import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateNarasiLaporanSiswa } from "@/lib/asesmen/laporan"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Parameter id diperlukan" }, { status: 400 })
  }

  const siswa = await prisma.siswa.findUnique({
    where: { id },
    include: {
      minatBakat: { orderBy: { createdAt: "desc" }, take: 1 },
      psikologi: { orderBy: { createdAt: "desc" }, take: 1 },
      gayaBelajar: { orderBy: { createdAt: "desc" }, take: 1 },
      karakterDiri: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })

  if (!siswa) {
    return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 })
  }

  const narasi = generateNarasiLaporanSiswa({
    nama: siswa.nama,
    kelas: siswa.kelas,
    riasec: siswa.minatBakat[0] ? JSON.parse(siswa.minatBakat[0].skor) : null,
    vark: siswa.gayaBelajar[0] ? JSON.parse(siswa.gayaBelajar[0].skor) : null,
    psikologi: siswa.psikologi[0] ? JSON.parse(siswa.psikologi[0].skor) : null,
    karakter: siswa.karakterDiri[0] ? JSON.parse(siswa.karakterDiri[0].skor) : null,
  })

  return NextResponse.json({ narasi, siswa })
}
