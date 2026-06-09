import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { message, senderRole } = await req.json()
    const msg = await prisma.chatMessage.create({
      data: { anonymousId: id, message, senderRole },
    })
    return NextResponse.json({ message: msg })
  } catch (error) {
    return NextResponse.json({ error: "Gagal membalas" }, { status: 500 })
  }
}
