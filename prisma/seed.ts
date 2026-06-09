import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10)
  const guruPassword = await bcrypt.hash("guru123", 10)
  const siswaPassword = await bcrypt.hash("siswa123", 10)

  await prisma.user.upsert({
    where: { email: "admin" },
    update: {},
    create: {
      name: "Admin BK",
      email: "admin",
      password: adminPassword,
      role: "admin",
      nipy: "199001012024011001",
    },
  })

  await prisma.user.upsert({
    where: { email: "guru" },
    update: {},
    create: {
      name: "Ibu Dewi Sartika",
      email: "guru",
      password: guruPassword,
      role: "guru",
      nipy: "199002012024011002",
      mapel: "BK",
    },
  })

  await prisma.user.upsert({
    where: { email: "siswa" },
    update: {},
    create: {
      name: "Siswa Demo",
      email: "siswa",
      password: siswaPassword,
      role: "siswa",
      kelas: "8A",
    },
  })

  const kelasData = ["7A", "7B", "7C", "7D", "8A", "8B", "8C", "8D", "9A", "9B", "9C", "9D"]
  for (const nama of kelasData) {
    await prisma.kelas.upsert({
      where: { nama },
      update: {},
      create: { nama },
    })
  }

  const siswaData = [
    { nama: "Ahmad Fauzi", kelas: "7A" },
    { nama: "Bunga Citra", kelas: "7A" },
    { nama: "Charlie Putra", kelas: "7A" },
    { nama: "Dinda Kirana", kelas: "7A" },
    { nama: "Eko Prasetyo", kelas: "7A" },
    { nama: "Fitri Handayani", kelas: "8B" },
    { nama: "Gilang Ramadhan", kelas: "8B" },
    { nama: "Hana Safira", kelas: "8B" },
    { nama: "Irfan Maulana", kelas: "8B" },
    { nama: "Jasmine Putri", kelas: "8B" },
    { nama: "Kevin Alexander", kelas: "9C" },
    { nama: "Luna Mayang", kelas: "9C" },
    { nama: "Miftahul Jannah", kelas: "9C" },
    { nama: "Nabila Syahira", kelas: "9C" },
    { nama: "Oscar Wirawan", kelas: "9C" },
  ]

  for (const s of siswaData) {
    await prisma.siswa.upsert({
      where: { id: s.nama },
      update: {},
      create: { id: s.nama, nama: s.nama, kelas: s.kelas },
    })
  }

  console.log("Seed completed!")
  console.log("Admin: admin / admin123")
  console.log("Guru: guru / guru123")
  console.log("Siswa: siswa / siswa123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
