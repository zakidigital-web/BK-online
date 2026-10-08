import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "@/lib/session"

const staffRoles = ["admin", "guru", "walas", "guru-mapel", "guru_bk", "guru-bk"]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const anonymousId = searchParams.get("id")

  if (anonymousId) {
    const messages = await prisma.chatMessage.findMany({
      where: { anonymousId },
      include: {
        targetGuru: {
          select: { id: true, name: true, role: true, mapel: true },
        },
        user: {
          select: { id: true, name: true, role: true, kelas: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json({ messages })
  }

  // Viewing all student chats is restricted to staff/counselors
  const session = await getServerSession()
  if (!session || !staffRoles.includes(session.role)) {
    return NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Guru/Staff" }, { status: 403 })
  }

  const messages = await prisma.chatMessage.findMany({
    include: {
      targetGuru: {
        select: { id: true, name: true, role: true, mapel: true },
      },
      user: {
        select: { id: true, name: true, kelas: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  })
  return NextResponse.json({ messages })
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    const body = await req.json()
    const { anonymousId, message, targetGuruId, isAnonymous: reqIsAnonymous } = body

    const trimmedMsg = String(message || "").trim()
    const trimmedAnonId = String(anonymousId || "").trim()

    if (!trimmedAnonId || !trimmedMsg) {
      return NextResponse.json({ error: "ID sesi dan pesan tidak boleh kosong" }, { status: 400 })
    }

    if (trimmedMsg.length > 2000) {
      return NextResponse.json({ error: "Pesan maksimal 2000 karakter" }, { status: 400 })
    }

    let senderRole = "siswa"
    let userId: string | null = null
    let senderName: string | null = null
    let senderKelas: string | null = null
    let isAnonymous = true
    let verifiedTargetGuruId: string | null = null

    // Validasi target guru jika dipilih
    if (targetGuruId && typeof targetGuruId === "string") {
      const guru = await prisma.user.findUnique({
        where: { id: targetGuruId },
        select: { id: true, name: true },
      })
      if (guru) {
        verifiedTargetGuruId = guru.id
      }
    }

    if (session) {
      userId = session.id
      if (staffRoles.includes(session.role)) {
        senderRole = session.role
        senderName = session.name
        isAnonymous = false
      } else if (session.role === "siswa") {
        senderRole = "siswa"
        // Siswa sudah login: dapat memilih anonim atau nama asli
        if (reqIsAnonymous === false) {
          isAnonymous = false
          // Ambil kelas terbaru dari database
          const siswaUser = await prisma.user.findUnique({
            where: { id: session.id },
            select: { name: true, kelas: true },
          })
          senderName = siswaUser?.name || session.name
          senderKelas = siswaUser?.kelas || null
        } else {
          isAnonymous = true
          senderName = null
          senderKelas = null
        }
      }
    } else {
      // Siswa belum login (tamu): selalu mode anonim
      isAnonymous = true
      senderName = null
      senderKelas = null
      userId = null
    }

    const msg = await prisma.chatMessage.create({
      data: {
        anonymousId: trimmedAnonId,
        message: trimmedMsg,
        senderRole,
        userId,
        targetGuruId: verifiedTargetGuruId,
        isAnonymous,
        senderName,
        senderKelas,
      },
      include: {
        targetGuru: {
          select: { id: true, name: true, role: true, mapel: true },
        },
        user: {
          select: { id: true, name: true, role: true, kelas: true },
        },
      },
    })

    return NextResponse.json({ message: msg })
  } catch (error) {
    console.error("Error creating chat message:", error)
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 })
  }
}
