import { NextResponse } from "next/server"
import { generateLaporanKelas } from "@/lib/asesmen/laporan"

export async function GET(req: Request) {
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
