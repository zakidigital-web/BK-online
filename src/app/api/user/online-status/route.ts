import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["guru", "admin"] },
      },
      select: {
        id: true,
        name: true,
        role: true,
        lastSeen: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ users })
  } catch {
    return NextResponse.json({ error: "Gagal mengambil status" }, { status: 500 })
  }
}
