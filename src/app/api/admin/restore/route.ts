import { NextResponse } from "next/server"
import { writeFileSync, readFileSync, existsSync, unlinkSync } from "fs"
import path from "path"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const dbPath = path.join(process.cwd(), "prisma", "dev.db")

    const backupPath = dbPath + ".backup"
    if (existsSync(backupPath)) unlinkSync(backupPath)
    if (existsSync(dbPath)) {
      writeFileSync(backupPath, readFileSync(dbPath))
    }

    writeFileSync(dbPath, buffer)

    return NextResponse.json({ success: true, message: "Database berhasil dipulihkan." })
  } catch {
    return NextResponse.json({ error: "Gagal memulihkan database" }, { status: 500 })
  }
}
