import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { nisn, jenis } = await req.json()

    if (!nisn || !jenis) {
      return NextResponse.json({ error: "nisn dan jenis diperlukan" }, { status: 400 })
    }

    const allowed = ["minat-bakat", "psikologi", "gaya-belajar", "karakter", "mbti"]
    if (!allowed.includes(jenis)) {
      return NextResponse.json({ error: "jenis tidak valid" }, { status: 400 })
    }

    const siswa = await prisma.siswa.findFirst({ where: { nisn } })
    if (!siswa) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 })
    }

    const existing = await prisma.retakeRequest.findUnique({
      where: { siswaId_jenis: { siswaId: siswa.id, jenis } },
    })

    if (existing) {
      if (existing.status === "pending") {
        return NextResponse.json({ message: "Permintaan sudah dikirim, tunggu persetujuan" })
      }
      if (existing.status === "approved") {
        return NextResponse.json({ message: "Permintaan sudah disetujui, silakan ulangi asesmen" })
      }
      // rejected — allow re-request
      await prisma.retakeRequest.update({
        where: { id: existing.id },
        data: { status: "pending" },
      })
      return NextResponse.json({ message: "Permintaan dikirim ulang" })
    }

    await prisma.retakeRequest.create({
      data: { siswaId: siswa.id, jenis },
    })

    return NextResponse.json({ message: "Permintaan retake dikirim" })
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengirim permintaan" }, { status: 500 })
  }
}
