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

    const trimmedMsg = String(message || "").trim()
    const trimmedAnonId = String(anonymousId || "").trim()

    if (!trimmedAnonId || !trimmedMsg) {
      return NextResponse.json({ error: "ID sesi anonim dan pesan tidak boleh kosong" }, { status: 400 })
    }

    if (trimmedMsg.length > 2000) {
      return NextResponse.json({ error: "Pesan maksimal 2000 karakter" }, { status: 400 })
    }

    const msg = await prisma.chatMessage.create({
      data: {
        anonymousId: trimmedAnonId,
        message: trimmedMsg,
        senderRole: senderRole || "siswa",
        userId: userId || null,
      },
    })
    return NextResponse.json({ message: msg })
  } catch (error) {
    console.error("Error creating chat message:", error)
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 })
  }
}
