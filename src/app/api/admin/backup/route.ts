import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Super Administrator" }, { status: 403 })
    }

    const [users, siswa, kelas, settings, banners] = await Promise.all([
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, nipy: true, kelas: true, mapel: true, status: true, createdAt: true } }),
      prisma.siswa.findMany(),
      prisma.kelas.findMany(),
      prisma.setting.findMany(),
      prisma.banner.findMany(),
    ])

    const backupData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      data: { users, siswa, kelas, settings, banners },
    }

    const buffer = Buffer.from(JSON.stringify(backupData, null, 2))
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="bk-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Gagal membackup database" }, { status: 500 })
  }
}
