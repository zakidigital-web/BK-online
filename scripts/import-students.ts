import { PrismaClient } from "@prisma/client"
import * as xlsx from "xlsx"
import bcrypt from "bcryptjs"
import fs from "fs"

const prisma = new PrismaClient()

interface StudentRow {
  nama: string
  kelas: string
  nisn: string
  nis?: string
  lp?: string
}

async function extractStudentsFromFile(filePath: string): Promise<StudentRow[]> {
  if (!fs.existsSync(filePath)) {
    console.error("File tidak ditemukan:", filePath)
    return []
  }

  const wb = xlsx.readFile(filePath)
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 })

  const students: StudentRow[] = []

  // Headers are around row 10, data starts at row 12 (0-indexed 11)
  for (let i = 11; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0) continue

    const nis = row[1] ? String(row[1]).trim() : ""
    const nisn = row[2] ? String(row[2]).trim() : ""
    const nama = row[3] ? String(row[3]).trim() : ""
    const lp = row[4] ? String(row[4]).trim() : ""
    const kls = row[5] ? String(row[5]).trim() : ""

    if (
      nama &&
      !nama.includes("JUMLAH") &&
      !nama.includes("LAKI") &&
      !nama.includes("PEREMPUAN") &&
      !nama.includes("NAMA") &&
      !nama.includes("REKAP") &&
      nisn &&
      nisn !== "-" &&
      nisn !== "null"
    ) {
      students.push({
        nama,
        kelas: kls,
        nisn,
        nis,
        lp,
      })
    }
  }

  return students
}

async function main() {
  console.log("=== Memulai Impor Data Siswa ke Neon Database ===")

  const fileKelas8 = "1.2. DAFTAR KLS _8 2026_2027.xlsx"
  const fileKelas9 = "1.3. DAFTAR KLS _9 2026_2027 (1).xlsx"

  const studentsKls8 = await extractStudentsFromFile(fileKelas8)
  const studentsKls9 = await extractStudentsFromFile(fileKelas9)

  console.log(`Ditemukan ${studentsKls8.length} siswa kelas 8 dari file: ${fileKelas8}`)
  console.log(`Ditemukan ${studentsKls9.length} siswa kelas 9 dari file: ${fileKelas9}`)

  const allStudents = [...studentsKls8, ...studentsKls9]
  console.log(`Total siswa yang akan diimpor: ${allStudents.length}`)

  // 1. Ekstrak dan daftarkan semua kelas unik
  const uniqueClasses = new Set<string>()
  for (const s of allStudents) {
    if (s.kelas) {
      uniqueClasses.add(s.kelas)
      // Tambahkan juga varian tanpa strip (contoh: 8-A dan 8A)
      const cleanClass = s.kelas.replace("-", "")
      uniqueClasses.add(cleanClass)
    }
  }

  console.log(`Mendaftarkan ${uniqueClasses.size} kelas ke database...`)
  for (const namaKelas of uniqueClasses) {
    await prisma.kelas.upsert({
      where: { nama: namaKelas },
      update: {},
      create: { nama: namaKelas },
    })
  }

  // 2. Hash password default (menggunakan NISN siswa)
  // Untuk efisiensi, kita proses per-batch
  console.log("Mengimpor data Siswa & membuat Akun Login Siswa...")

  let importedSiswaCount = 0
  let importedUserCount = 0

  const batchSize = 25
  for (let i = 0; i < allStudents.length; i += batchSize) {
    const batch = allStudents.slice(i, i + batchSize)

    await Promise.all(
      batch.map(async (s) => {
        // Upsert ke tabel Siswa
        await prisma.siswa.upsert({
          where: { nisn: s.nisn },
          update: {
            nama: s.nama,
            kelas: s.kelas,
          },
          create: {
            nama: s.nama,
            kelas: s.kelas,
            nisn: s.nisn,
          },
        })
        importedSiswaCount++

        // Buat akun User agar siswa dapat langsung login menggunakan NISN
        const existingUser = await prisma.user.findUnique({ where: { email: s.nisn } })
        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(s.nisn, 10)
          await prisma.user.create({
            data: {
              name: s.nama,
              email: s.nisn,
              password: hashedPassword,
              role: "siswa",
              kelas: s.kelas,
              status: "active",
            },
          })
          importedUserCount++
        } else {
          await prisma.user.update({
            where: { email: s.nisn },
            data: {
              name: s.nama,
              kelas: s.kelas,
              status: "active",
            },
          })
        }
      })
    )

    const progress = Math.min(i + batchSize, allStudents.length)
    process.stdout.write(`\rProgress: ${progress}/${allStudents.length} siswa...`)
  }

  console.log("\n")
  console.log("3. Memastikan Akun Guru & Staf Aktif...")
  const guruPassword = await bcrypt.hash("guru123", 10)
  
  // Daftarkan/update akun guru demo & tambahan
  const staffList = [
    { email: "lutfia", name: "Ibu Lutfia, S.Pd.", role: "guru", mapel: "BK" },
    { email: "gita", name: "Ibu Gita, S.Pd.", role: "guru", mapel: "BK" },
  ]

  for (const staff of staffList) {
    await prisma.user.upsert({
      where: { email: staff.email },
      update: {
        name: staff.name,
        role: staff.role,
        mapel: staff.mapel,
        status: "active",
      },
      create: {
        name: staff.name,
        email: staff.email,
        password: guruPassword,
        role: staff.role,
        mapel: staff.mapel,
        status: "active",
      },
    })
    console.log(`- Akun Guru '${staff.name}' (${staff.email}) aktif`)
  }

  console.log("=== Impor Berhasil Selesai! ===")
  console.log(`- Total Siswa diimpor : ${importedSiswaCount}`)
  console.log(`- Total Akun Login baru: ${importedUserCount}`)
}

main()
  .catch((e) => {
    console.error("Terjadi kesalahan saat impor:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
