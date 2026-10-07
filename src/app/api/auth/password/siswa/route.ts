import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { getServerSession } from "@/lib/session"

const staffRoles = ["admin", "guru", "walas", "guru-mapel", "guru_bk", "guru-bk"]

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || !staffRoles.includes(session.role)) {
      return NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Guru/Staff" }, { status: 403 })
    }

    const { siswaId } = await req.json()
    if (!siswaId) {
      return NextResponse.json({ error: "ID siswa diperlukan" }, { status: 400 })
    }

    const siswa = await prisma.siswa.findUnique({ where: { id: siswaId } })
    if (!siswa) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 })
    }
    if (!siswa.nisn) {
      return NextResponse.json({ error: "Siswa belum memiliki NISN. Isi NISN terlebih dahulu." }, { status: 400 })
    }

    const hashed = await bcrypt.hash(siswa.nisn, 10)

    await prisma.user.upsert({
      where: { email: siswa.nisn },
      update: { password: hashed, name: siswa.nama },
      create: { name: siswa.nama, email: siswa.nisn, password: hashed, role: "siswa", status: "active" },
    })

    return NextResponse.json({ success: true, message: `Password ${siswa.nama} direset ke NISN` })
  } catch {
    return NextResponse.json({ error: "Gagal mereset password siswa" }, { status: 500 })
  }
}
