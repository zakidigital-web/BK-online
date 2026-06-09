import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const pending = await prisma.user.findMany({
      where: { status: "pending" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ users: pending })
  } catch {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId, status } = await req.json()
    if (!userId || !["active", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    if (status === "rejected") {
      await prisma.user.delete({ where: { id: userId } })
      return NextResponse.json({ success: true, message: "Pendaftaran ditolak dan akun dihapus" })
    }

    await prisma.user.update({ where: { id: userId }, data: { status: "active" } })
    return NextResponse.json({ success: true, message: "Akun diaktifkan" })
  } catch {
    return NextResponse.json({ error: "Gagal memproses" }, { status: 500 })
  }
}
