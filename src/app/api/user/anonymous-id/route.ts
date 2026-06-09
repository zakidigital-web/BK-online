import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PATCH(req: Request) {
  try {
    const { userId, anonymousId } = await req.json()
    if (!userId || !anonymousId) {
      return NextResponse.json({ error: "userId dan anonymousId diperlukan" }, { status: 400 })
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
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan" }, { status: 400 })
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
