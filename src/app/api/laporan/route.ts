import { NextResponse } from "next/server"
import { generateLaporanKelas } from "@/lib/asesmen/laporan"
import { getServerSession } from "@/lib/session"

const staffRoles = ["admin", "guru", "walas", "guru-mapel", "guru_bk", "guru-bk"]

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session || !staffRoles.includes(session.role)) {
    return NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Guru/Staff" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const kelas = searchParams.get("kelas")

  if (!kelas) {
    return NextResponse.json({ error: "Parameter kelas diperlukan" }, { status: 400 })
  }

  try {
    const laporan = await generateLaporanKelas(kelas)
    return NextResponse.json({ laporan })
  } catch (error) {
    return NextResponse.json({ error: "Gagal generate laporan" }, { status: 500 })
  }
}
