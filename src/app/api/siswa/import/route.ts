import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { syncUserFromSiswa } from "@/lib/siswa-sync"

export async function POST(req: Request) {
  try {
    const { siswa } = await req.json()
    if (!Array.isArray(siswa) || siswa.length === 0) {
      return NextResponse.json({ error: "Data siswa tidak valid" }, { status: 400 })
    }

    const results: { nama: string; kelas: string; status: string; pesan?: string }[] = []

    for (const s of siswa) {
      const nama = String(s.nama || "").trim()
      const kelas = String(s.kelas || "").trim().toUpperCase()
      const nisn = s.nisn ? String(s.nisn).trim() : undefined

      if (!nama || !kelas) {
        results.push({ nama, kelas, status: "gagal", pesan: "Nama atau kelas kosong" })
        continue
      }

      try {
        const siswa = await prisma.siswa.create({
          data: { nama, kelas, nisn },
        })
        await syncUserFromSiswa(siswa.id, nama, nisn || null)
        results.push({ nama, kelas, status: "berhasil" })

        await prisma.kelas.upsert({
          where: { nama: kelas },
          update: {},
          create: { nama: kelas },
        })
      } catch (e: unknown) {
        const pesan = e instanceof Error && e.message.includes("Unique") ? "Siswa sudah ada" : "Gagal menyimpan"
        results.push({ nama, kelas, status: "gagal", pesan })
      }
    }

    return NextResponse.json({ results, total: results.length, berhasil: results.filter((r) => r.status === "berhasil").length })
  } catch {
    return NextResponse.json({ error: "Gagal memproses import" }, { status: 500 })
  }
}
