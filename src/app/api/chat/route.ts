import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "@/lib/session"

const staffRoles = ["admin", "guru", "walas", "guru-mapel", "guru_bk", "guru-bk"]

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

  // Viewing all student chats is restricted to staff/counselors
  const session = await getServerSession()
  if (!session || !staffRoles.includes(session.role)) {
    return NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Guru/Staff" }, { status: 403 })
  }

  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  return NextResponse.json({ messages })
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    const { anonymousId, message } = await req.json()

    const trimmedMsg = String(message || "").trim()
    const trimmedAnonId = String(anonymousId || "").trim()

    if (!trimmedAnonId || !trimmedMsg) {
      return NextResponse.json({ error: "ID sesi anonim dan pesan tidak boleh kosong" }, { status: 400 })
    }

    if (trimmedMsg.length > 2000) {
      return NextResponse.json({ error: "Pesan maksimal 2000 karakter" }, { status: 400 })
    }

    // Role and userId are strictly derived from server session, never trusted from client
    let senderRole = "siswa"
    let userId: string | null = null

    if (session) {
      userId = session.id
      if (staffRoles.includes(session.role)) {
        senderRole = session.role
      }
    }

    const msg = await prisma.chatMessage.create({
      data: {
        anonymousId: trimmedAnonId,
        message: trimmedMsg,
        senderRole,
        userId,
      },
    })
    return NextResponse.json({ message: msg })
  } catch (error) {
    console.error("Error creating chat message:", error)
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 })
  }
}
