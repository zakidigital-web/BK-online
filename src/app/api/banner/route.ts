import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { aktif: true },
      orderBy: { urutan: "asc" },
    })
    return NextResponse.json({ banners })
  } catch {
    return NextResponse.json({ banners: [] })
  }
}
