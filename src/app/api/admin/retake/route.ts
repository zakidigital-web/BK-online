import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const requests = await prisma.retakeRequest.findMany({
      include: { siswa: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ requests })
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { id, action } = await req.json()

    if (!id || !action) {
      return NextResponse.json({ error: "id dan action diperlukan" }, { status: 400 })
    }

    if (action === "approve") {
      const request = await prisma.retakeRequest.findUnique({
        where: { id },
        include: { siswa: true },
      })

      if (!request) {
        return NextResponse.json({ error: "Permintaan tidak ditemukan" }, { status: 404 })
      }

      const deleteModels: Record<string, string> = {
        "minat-bakat": "minatBakat",
        "psikologi": "psikologi",
        "gaya-belajar": "gayaBelajar",
        "karakter": "karakterDiri",
        "mbti": "mbti",
      }
      const modelName = deleteModels[request.jenis]
      if (modelName) {
        await (prisma as any)[modelName].deleteMany({ where: { siswaId: request.siswaId } })
      }

      await prisma.retakeRequest.update({
        where: { id },
        data: { status: "approved" },
      })

      return NextResponse.json({ message: "Retake disetujui, data asesmen direset" })
    }

    if (action === "reject") {
      await prisma.retakeRequest.update({
        where: { id },
        data: { status: "rejected" },
      })
      return NextResponse.json({ message: "Permintaan ditolak" })
    }

    return NextResponse.json({ error: "action harus approve atau reject" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Gagal memproses" }, { status: 500 })
  }
}
