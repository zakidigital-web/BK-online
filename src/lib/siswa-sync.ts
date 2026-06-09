import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function syncUserFromSiswa(siswaId: string, nama: string, nisn: string | null) {
  if (!nisn) return

  const existing = await prisma.user.findUnique({ where: { email: nisn } })
  if (existing) {
    if (existing.name !== nama) {
      await prisma.user.update({ where: { id: existing.id }, data: { name: nama } })
    }
    return
  }

  const hashed = await bcrypt.hash(nisn, 10)
  await prisma.user.create({
    data: { name: nama, email: nisn, password: hashed, role: "siswa", status: "active" },
  })
}

export async function deleteUserFromSiswa(nisn: string | null) {
  if (!nisn) return
  await prisma.user.deleteMany({ where: { email: nisn, role: "siswa" } })
}

export async function updateUserFromSiswa(
  oldNisn: string | null,
  newNisn: string | null,
  nama: string
) {
  if (oldNisn && oldNisn !== newNisn) {
    await prisma.user.deleteMany({ where: { email: oldNisn, role: "siswa" } })
  }
  await syncUserFromSiswa("", nama, newNisn)
}
