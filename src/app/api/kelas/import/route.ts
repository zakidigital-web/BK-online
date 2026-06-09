import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { kelas } = await req.json()
    if (!Array.isArray(kelas) || kelas.length === 0) {
      return NextResponse.json({ error: "Data kelas tidak valid" }, { status: 400 })
    }

    const results: { nama: string; status: string; pesan?: string }[] = []

    for (const nama of kelas) {
      const trimmed = String(nama || "").trim().toUpperCase()
      if (!trimmed) {
        results.push({ nama: String(nama), status: "gagal", pesan: "Nama kelas kosong" })
        continue
      }

      try {
        await prisma.kelas.create({ data: { nama: trimmed } })
        results.push({ nama: trimmed, status: "berhasil" })
      } catch (e: unknown) {
        const pesan = e instanceof Error && e.message.includes("Unique") ? "Kelas sudah ada" : "Gagal menyimpan"
        results.push({ nama: trimmed, status: "gagal", pesan })
      }
    }

    return NextResponse.json({ results, total: results.length, berhasil: results.filter((r) => r.status === "berhasil").length })
  } catch {
    return NextResponse.json({ error: "Gagal memproses import" }, { status: 500 })
  }
}
