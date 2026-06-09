import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function DELETE(req: Request) {
  try {
    const { target } = await req.json()

    if (target === "all" || target === "asesmen") {
      await prisma.minatBakat.deleteMany()
      await prisma.psikologi.deleteMany()
      await prisma.gayaBelajar.deleteMany()
      await prisma.karakterDiri.deleteMany()
    }
    if (target === "all" || target === "chat") {
      await prisma.chatMessage.deleteMany()
    }
    if (target === "all" || target === "siswa") {
      await prisma.minatBakat.deleteMany()
      await prisma.psikologi.deleteMany()
      await prisma.gayaBelajar.deleteMany()
      await prisma.karakterDiri.deleteMany()
      await prisma.chatMessage.deleteMany({ where: { userId: { not: null } } })
      await prisma.user.deleteMany({ where: { role: "siswa" } })
      await prisma.siswa.deleteMany()
    }
    if (target === "all" || target === "kelas") {
      await prisma.kelas.deleteMany()
    }
    if (target === "all" || target === "users") {
      await prisma.chatMessage.deleteMany()
      await prisma.user.deleteMany()
    }

    return NextResponse.json({ success: true, message: `Data ${target} berhasil direset` })
  } catch {
    return NextResponse.json({ error: "Gagal mereset data" }, { status: 500 })
  }
}
