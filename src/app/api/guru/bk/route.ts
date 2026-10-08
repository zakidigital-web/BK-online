import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const guruBK = await prisma.user.findMany({
      where: {
        OR: [
          { role: "guru" },
          { mapel: { contains: "BK", mode: "insensitive" } },
        ],
        status: { not: "inactive" },
      },
      select: {
        id: true,
        name: true,
        role: true,
        mapel: true,
        nipy: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ guruBK })
  } catch (error) {
    console.error("[API_GURU_BK_ERROR]:", error)
    return NextResponse.json({ error: "Gagal memuat daftar Guru BK" }, { status: 500 })
  }
}
