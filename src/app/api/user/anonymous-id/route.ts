import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "@/lib/session"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid atau telah berakhir" }, { status: 401 })
    }

    const { userId, anonymousId } = await req.json()
    if (!userId || !anonymousId) {
      return NextResponse.json({ error: "userId dan anonymousId diperlukan" }, { status: 400 })
    }

    if (session.id !== userId && session.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 })
    }

    const existing = await prisma.user.findUnique({ where: { anonymousId } })
    if (existing && existing.id !== userId) {
      return NextResponse.json({ error: "ID anonim sudah digunakan oleh akun lain" }, { status: 409 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { anonymousId },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.email,
        role: user.role,
        anonymousId: user.anonymousId,
      },
    })
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan ID anonim" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid atau telah berakhir" }, { status: 401 })
    }

    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan" }, { status: 400 })
    }

    if (session.id !== userId && session.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { anonymousId: null },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.email,
        role: user.role,
        anonymousId: user.anonymousId,
      },
    })
  } catch {
    return NextResponse.json({ error: "Gagal menghapus ID anonim" }, { status: 500 })
  }
}
