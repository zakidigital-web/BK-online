import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/session"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Super Administrator" }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file terlalu besar (maksimal 10MB)" }, { status: 400 })
    }

    const text = await file.text()
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: "Format file tidak valid. Wajib berupa file backup JSON dari sistem ini." }, { status: 400 })
    }

    if (!parsed?.data) {
      return NextResponse.json({ error: "Struktur data backup tidak valid" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `File backup terverifikasi (Timestamp: ${parsed.timestamp || "N/A"}). Untuk integritas data Neon PostgreSQL, gunakan console Neon untuk restore snapshot penuh.`,
    })
  } catch {
    return NextResponse.json({ error: "Gagal memproses file backup" }, { status: 500 })
  }
}
