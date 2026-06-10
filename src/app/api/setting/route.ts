import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

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
    const { key, value } = await req.json()
    if (!key) {
      return NextResponse.json({ error: "Key diperlukan" }, { status: 400 })
    }
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
    return NextResponse.json({ setting })
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan setting" }, { status: 500 })
  }
}
