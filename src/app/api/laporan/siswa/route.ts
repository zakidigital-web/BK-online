import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateNarasiLaporanSiswa } from "@/lib/asesmen/laporan"
import { getServerSession } from "@/lib/session"

const staffRoles = ["admin", "guru", "walas", "guru-mapel", "guru_bk", "guru-bk"]

export async function GET(req: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid atau telah berakhir" }, { status: 401 })
    }

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

    if (session.role === "siswa" && session.username !== siswa.nisn) {
      return NextResponse.json({ error: "Akses ditolak: Anda hanya dapat melihat laporan Anda sendiri" }, { status: 403 })
    }

    let riasec = null
    let vark = null
    let psikologi = null
    let karakter = null

    try { if (siswa.minatBakat[0]?.skor) riasec = JSON.parse(siswa.minatBakat[0].skor) } catch {}
    try { if (siswa.gayaBelajar[0]?.skor) vark = JSON.parse(siswa.gayaBelajar[0].skor) } catch {}
    try { if (siswa.psikologi[0]?.skor) psikologi = JSON.parse(siswa.psikologi[0].skor) } catch {}
    try { if (siswa.karakterDiri[0]?.skor) karakter = JSON.parse(siswa.karakterDiri[0].skor) } catch {}

    const narasi = generateNarasiLaporanSiswa({
      nama: siswa.nama,
      kelas: siswa.kelas,
      riasec,
      vark,
      psikologi,
      karakter,
    })

    return NextResponse.json({ narasi, siswa })
  } catch (error) {
    console.error("Error generating laporan siswa:", error)
    return NextResponse.json({ error: "Gagal membuat laporan siswa" }, { status: 500 })
  }
}
