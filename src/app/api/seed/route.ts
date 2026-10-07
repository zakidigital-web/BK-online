import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { getServerSession } from "@/lib/session"

const demoAccounts = [
  { email: "admin", name: "Admin", password: "admin123", role: "admin" },
  { email: "guru", name: "Guru BK", password: "guru123", role: "guru" },
  { email: "gurumapel", name: "Guru Mapel", password: "guru123", role: "guru-mapel" },
  { email: "walas", name: "Wali Kelas", password: "walas123", role: "walas" },
  { email: "siswa", name: "Siswa Demo", password: "siswa123", role: "siswa" },
]

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    const authHeader = req.headers.get("authorization")

    const isAdminSession = session?.role === "admin"
    const hasValidSecret = process.env.SEED_SECRET && authHeader === `Bearer ${process.env.SEED_SECRET}`
    const isDevFallback = process.env.NODE_ENV !== "production" && authHeader === "Bearer bk-seed-local"

    if (!isAdminSession && !hasValidSecret && !isDevFallback) {
      return NextResponse.json({ error: "Unauthorized: Memerlukan sesi admin atau token rahasia valid" }, { status: 401 })
    }

    let created = 0
    let skipped = 0

    for (const acc of demoAccounts) {
      const existing = await prisma.user.findUnique({ where: { email: acc.email } })
      if (existing) {
        skipped++
        continue
      }
      const hashed = await bcrypt.hash(acc.password, 10)
      await prisma.user.create({
        data: {
          email: acc.email,
          name: acc.name,
          password: hashed,
          role: acc.role,
        },
      })
      created++
    }

    return NextResponse.json({ success: true, created, skipped })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
