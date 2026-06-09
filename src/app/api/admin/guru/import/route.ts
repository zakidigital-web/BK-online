import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

const validRoles = ["admin", "guru", "guru-mapel", "walas"]

export async function POST(req: Request) {
  try {
    const { guru } = await req.json()
    if (!Array.isArray(guru) || guru.length === 0) {
      return NextResponse.json({ error: "Data guru tidak valid" }, { status: 400 })
    }

    const results: { nama: string; username: string; status: string; pesan?: string }[] = []

    for (const g of guru) {
      const nama = String(g.nama || "").trim()
      const username = String(g.username || "").trim().toLowerCase()
      const password = g.password ? String(g.password) : username
      const role = validRoles.includes(g.role) ? g.role : "guru"
      const nipy = g.nipy ? String(g.nipy).trim() : undefined
      const kelas = g.kelas ? String(g.kelas).trim().toUpperCase() : undefined
      const mapel = g.mapel ? String(g.mapel).trim() : undefined

      if (!nama || !username) {
        results.push({ nama, username, status: "gagal", pesan: "Nama atau username kosong" })
        continue
      }

      try {
        const existing = await prisma.user.findUnique({ where: { email: username } })
        if (existing) {
          results.push({ nama, username, status: "gagal", pesan: "Username sudah digunakan" })
          continue
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.create({
          data: { name: nama, email: username, password: hashedPassword, role, nipy, kelas, mapel },
        })
        results.push({ nama, username, status: "berhasil" })
      } catch {
        results.push({ nama, username, status: "gagal", pesan: "Gagal menyimpan" })
      }
    }

    return NextResponse.json({
      results,
      total: results.length,
      berhasil: results.filter((r) => r.status === "berhasil").length,
    })
  } catch {
    return NextResponse.json({ error: "Gagal memproses import guru" }, { status: 500 })
  }
}
