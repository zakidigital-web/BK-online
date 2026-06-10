import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { lastSeen: new Date() },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Gagal update heartbeat" }, { status: 500 })
  }
}
