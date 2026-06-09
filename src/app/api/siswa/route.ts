import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { syncUserFromSiswa, deleteUserFromSiswa, updateUserFromSiswa } from "@/lib/siswa-sync"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const kelas = searchParams.get("kelas")
  const nisn = searchParams.get("nisn")

  const where: Record<string, unknown> = {}
  if (kelas) where.kelas = kelas
  if (nisn) where.nisn = nisn

  const siswa = await prisma.siswa.findMany({
    where,
    include: {
      _count: { select: { minatBakat: true, psikologi: true, gayaBelajar: true, karakterDiri: true } },
    },
    orderBy: [{ kelas: "asc" }, { nama: "asc" }],
  })

  return NextResponse.json({ siswa })
}

export async function POST(req: Request) {
  try {
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
    const { id, nama, kelas, nisn } = await req.json()
    if (!id) {
      return NextResponse.json({ error: "ID siswa diperlukan" }, { status: 400 })
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

    return NextResponse.json({ siswa })
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate siswa" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
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
