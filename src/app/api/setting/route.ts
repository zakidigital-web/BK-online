import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "@/lib/session"

export async function GET() {
  try {
    const settings = await prisma.setting.findMany()
    const map: Record<string, string> = {}
    for (const s of settings) {
      map[s.key] = s.value
    }
    return NextResponse.json({ settings: map })
  } catch {
    return NextResponse.json({ settings: {} })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Super Administrator" }, { status: 403 })
    }

    const body = await req.json()
    const { key, value, settings } = body

    if (settings && typeof settings === "object") {
      const updates = Object.entries(settings).map(([k, v]) =>
        prisma.setting.upsert({
          where: { key: k },
          update: { value: String(v) },
          create: { key: k, value: String(v) },
        })
      )
      await prisma.$transaction(updates)
      return NextResponse.json({ success: true, count: updates.length })
    }

    if (!key) {
      return NextResponse.json({ error: "Key diperlukan" }, { status: 400 })
    }
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: String(value ?? "") },
      create: { key, value: String(value ?? "") },
    })
    return NextResponse.json({ setting })
  } catch (error) {
    console.error("[SETTING_PUT_ERROR]:", error)
    return NextResponse.json({ error: "Gagal menyimpan setting" }, { status: 500 })
  }
}
