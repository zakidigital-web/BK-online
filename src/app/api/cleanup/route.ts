import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const deleted = await prisma.chatMessage.deleteMany({
      where: {
        userId: null,
        createdAt: { lt: sevenDaysAgo },
      },
    })

    return NextResponse.json({
      success: true,
      deleted: deleted.count,
      message: `${deleted.count} pesan anonim lama >7 hari dihapus`,
    })
  } catch {
    return NextResponse.json({ error: "Gagal membersihkan chat" }, { status: 500 })
  }
}
