import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "@/lib/session"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    const authHeader = req.headers.get("authorization")

    const isAdmin = session?.role === "admin"
    const hasCronSecret = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`

    if (!isAdmin && !hasCronSecret && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized: Memerlukan sesi admin atau cron token" }, { status: 401 })
    }

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
