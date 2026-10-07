import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "@/lib/session"

const staffRoles = ["admin", "guru", "walas", "guru-mapel", "guru_bk", "guru-bk"]

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session || !staffRoles.includes(session.role)) {
      return NextResponse.json({ error: "Akses ditolak: Hanya Guru/Konselor BK yang dapat membalas chat ini" }, { status: 403 })
    }

    const { id } = await params
    const { message } = await req.json()
    const trimmedMsg = String(message || "").trim()

    if (!trimmedMsg) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 })
    }

    const msg = await prisma.chatMessage.create({
      data: {
        anonymousId: id,
        message: trimmedMsg,
        senderRole: session.role || "guru",
        userId: session.id,
      },
    })
    return NextResponse.json({ message: msg })
  } catch (error) {
    return NextResponse.json({ error: "Gagal membalas" }, { status: 500 })
  }
}
