import { NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import path from "path"

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), "prisma", "dev.db")
    if (!existsSync(dbPath)) {
      return NextResponse.json({ error: "Database tidak ditemukan" }, { status: 404 })
    }
    const buffer = readFileSync(dbPath)
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="bk-backup-${new Date().toISOString().slice(0, 10)}.db"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Gagal membackup database" }, { status: 500 })
  }
}
