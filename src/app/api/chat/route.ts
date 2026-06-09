import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const anonymousId = searchParams.get("id")

  if (anonymousId) {
    const messages = await prisma.chatMessage.findMany({
      where: { anonymousId },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json({ messages })
  }

  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  return NextResponse.json({ messages })
}

export async function POST(req: Request) {
  try {
    const { anonymousId, message, senderRole, userId } = await req.json()
    const msg = await prisma.chatMessage.create({
      data: {
        anonymousId,
        message,
        senderRole: senderRole || "siswa",
        userId: userId || null,
      },
    })
    return NextResponse.json({ message: msg })
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 })
  }
}
