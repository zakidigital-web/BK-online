import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { syncUserFromSiswa, deleteUserFromSiswa, updateUserFromSiswa } from "@/lib/siswa-sync"
import { getServerSession } from "@/lib/session"

const staffRoles = ["admin", "guru", "walas", "guru-mapel", "guru_bk", "guru-bk"]

export async function GET(req: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid atau telah berakhir" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const kelas = searchParams.get("kelas")
    const nisn = searchParams.get("nisn")

    const where: Record<string, unknown> = {}
    if (session.role === "siswa") {
      // Siswa only permitted to see their own record
      where.nisn = session.username
    } else {
      if (kelas) where.kelas = kelas
      if (nisn) where.nisn = nisn
    }

    const siswa = await prisma.siswa.findMany({
      where,
      include: {
        _count: { select: { minatBakat: true, psikologi: true, gayaBelajar: true, karakterDiri: true } },
      },
      orderBy: [{ kelas: "asc" }, { nama: "asc" }],
    })

    return NextResponse.json({ siswa })
  } catch (error) {
    console.error("Error fetching siswa:", error)
    return NextResponse.json({ error: "Gagal mengambil data siswa", siswa: [] }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || !staffRoles.includes(session.role)) {
      return NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Guru/Staff" }, { status: 403 })
    }

    const { nama, kelas, nisn } = await req.json()
    const trimmedNama = String(nama || "").trim()
    const trimmedKelas = String(kelas || "").trim().toUpperCase()

    if (!trimmedNama || !trimmedKelas) {
      return NextResponse.json({ error: "Nama dan kelas harus diisi" }, { status: 400 })
    }

    const siswa = await prisma.siswa.create({
      data: { nama: trimmedNama, kelas: trimmedKelas, nisn: nisn || undefined },
    })

    await syncUserFromSiswa(siswa.id, trimmedNama, nisn || null)

    await prisma.kelas.upsert({
      where: { nama: trimmedKelas },
      update: {},
      create: { nama: trimmedKelas },
    })

    return NextResponse.json({ siswa }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Gagal menambah siswa" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || !staffRoles.includes(session.role)) {
      return NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Guru/Staff" }, { status: 403 })
    }

    const body = await req.json()
    const { id, ids, nama, kelas, targetKelas, nisn } = body

    // Batch transfer siswa antar kelas
    if (Array.isArray(ids) && ids.length > 0) {
      const destClass = String(targetKelas || kelas || "").trim().toUpperCase()
      if (!destClass) {
        return NextResponse.json({ error: "Kelas tujuan harus ditentukan" }, { status: 400 })
      }

      await prisma.kelas.upsert({
        where: { nama: destClass },
        update: {},
        create: { nama: destClass },
      })

      // Cari siswa untuk dapat NISN sinkronisasi User
      const targetSiswaList = await prisma.siswa.findMany({
        where: { id: { in: ids } },
        select: { nisn: true }
      })

      const nisnList = targetSiswaList
        .map(s => s.nisn)
        .filter((n): n is string => Boolean(n))

      const [updatedSiswa] = await prisma.$transaction([
        prisma.siswa.updateMany({
          where: { id: { in: ids } },
          data: { kelas: destClass }
        }),
        ...(nisnList.length > 0 ? [
          prisma.user.updateMany({
            where: { email: { in: nisnList }, role: "siswa" },
            data: { kelas: destClass }
          })
        ] : [])
      ])

      return NextResponse.json({ success: true, count: updatedSiswa.count, targetKelas: destClass })
    }

    if (!id) {
      return NextResponse.json({ error: "ID siswa atau daftar IDs diperlukan" }, { status: 400 })
    }
    const data: { nama?: string; kelas?: string; nisn?: string | null } = {}
    if (nama) data.nama = String(nama).trim()
    if (kelas) data.kelas = String(kelas).trim().toUpperCase()
    if (nisn !== undefined) data.nisn = nisn ? String(nisn).trim() : null

    const existing = await prisma.siswa.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 })
    }

    if (data.kelas) {
      await prisma.kelas.upsert({
        where: { nama: data.kelas },
        update: {},
        create: { nama: data.kelas },
      })
    }

    const siswa = await prisma.siswa.update({ where: { id }, data })

    await updateUserFromSiswa(
      existing.nisn,
      siswa.nisn,
      siswa.nama
    )

    if (data.kelas && siswa.nisn) {
      await prisma.user.updateMany({
        where: { email: siswa.nisn, role: "siswa" },
        data: { kelas: data.kelas }
      })
    }

    return NextResponse.json({ siswa })
  } catch (error) {
    console.error("[UPDATE_SISWA_ERROR]:", error)
    return NextResponse.json({ error: "Gagal mengupdate siswa" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || !staffRoles.includes(session.role)) {
      return NextResponse.json({ error: "Akses ditolak: Memerlukan hak akses Guru/Staff" }, { status: 403 })
    }

    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: "ID siswa diperlukan" }, { status: 400 })
    }
    const existing = await prisma.siswa.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 })
    }
    await prisma.siswa.delete({ where: { id } })
    await deleteUserFromSiswa(existing.nisn)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Gagal menghapus siswa" }, { status: 500 })
  }
}
