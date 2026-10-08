import { PrismaClient } from "@prisma/client"
import * as xlsx from "xlsx"
import bcrypt from "bcryptjs"
import fs from "fs"

const prisma = new PrismaClient()

async function main() {
  console.log("=== MEMULAI PENATAAN DATABASE NEON ===")

  // 1. Data Kelas 7A - 7I (pastikan terdaftar, siswa dibiarkan kosong)
  console.log("\n1. Mendaftarkan Kelas 7A - 7I...")
  const kelas7List = ["7A", "7B", "7C", "7D", "7E", "7F", "7G", "7H", "7I"]
  const kelas7Aliases = ["7-A", "7-B", "7-C", "7-D", "7-E", "7-F", "7-G", "7-H", "7-I"]
  
  for (const k of [...kelas7List, ...kelas7Aliases]) {
    await prisma.kelas.upsert({
      where: { nama: k },
      update: {},
      create: { nama: k },
    })
  }
  console.log("✓ Kelas 7A - 7I (beserta alias) berhasil didaftarkan.")

  // 2. Bersihkan siswa dummy dari kelas 7 dan sample seed
  console.log("\n2. Membersihkan data siswa demo/dummy (Siswa kelas 7 dibiarkan kosong)...")
  const deletedDummySiswa = await prisma.siswa.deleteMany({
    where: {
      OR: [
        { nisn: null },
        { nisn: "12345" },
        { nama: "Siswa Demo" },
        { kelas: { startsWith: "7" } },
      ],
    },
  })
  console.log(`✓ Menghapus ${deletedDummySiswa.count} data siswa dummy. Kelas 7 kini kosong murni.`)

  // 3. Hapus akun-akun demo (Kecuali Admin)
  console.log("\n3. Menghapus akun-akun demo (Admin tetap dipertahankan)...")
  const demoEmails = ["guru", "gurubk", "gurumapel", "walas", "siswa", "12345"]
  const deletedDemoUsers = await prisma.user.deleteMany({
    where: {
      email: { in: demoEmails },
    },
  })
  console.log(`✓ Berhasil menghapus ${deletedDemoUsers.count} akun demo (${demoEmails.join(", ")}).`)

  // 4. Buat Akun Wali Kelas (Walas) untuk:
  //    Kelas 7: 7A - 7I (9 walas)
  //    Kelas 8: 8A - 8I (9 walas)
  //    Kelas 9: 9A - 9I (9 walas)
  //    Total: 27 Wali Kelas
  console.log("\n4. Membuat 27 Akun Wali Kelas (7A-7I, 8A-8I, 9A-9I)...")
  const walasPassword = await bcrypt.hash("walas123", 10)
  
  const abjad = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
  const tingkatList = [7, 8, 9]

  let walasCreatedCount = 0
  for (const t of tingkatList) {
    for (const a of abjad) {
      const kelasCode = `${t}${a}`
      const username = `walas${t}${a.toLowerCase()}` // contoh: walas7a, walas8b, walas9i
      const nama = `Wali Kelas ${kelasCode}`

      await prisma.user.upsert({
        where: { email: username },
        update: {
          name: nama,
          password: walasPassword,
          role: "walas",
          kelas: kelasCode,
          status: "active",
        },
        create: {
          name: nama,
          email: username,
          password: walasPassword,
          role: "walas",
          kelas: kelasCode,
          status: "active",
        },
      })
      walasCreatedCount++
    }
  }
  console.log(`✓ Berhasil membuat ${walasCreatedCount} akun Wali Kelas (password default: 'walas123').`)

  // 5. Tambahkan Akun Guru & Karyawan dari file 'DAFTAR Guru & Karyawan ok.xlsx'
  console.log("\n5. Mengimpor Akun Guru & Karyawan dari Excel 'DAFTAR Guru & Karyawan ok.xlsx'...")
  const excelFile = "DAFTAR Guru & Karyawan ok.xlsx"
  if (!fs.existsSync(excelFile)) {
    console.error("File tidak ditemukan:", excelFile)
    return
  }

  const wb = xlsx.readFile(excelFile)
  const rows: any[][] = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 })

  const guruPassword = await bcrypt.hash("guru123", 10)
  let teacherCount = 0

  for (let i = 6; i < rows.length; i++) {
    const row = rows[i]
    if (!row || !row[1] || !row[2]) continue

    const nama = String(row[1]).trim()
    const userRaw = String(row[2]).trim()
    const username = userRaw.toLowerCase()
    const isNip = /^\d+$/.test(userRaw)

    await prisma.user.upsert({
      where: { email: username },
      update: {
        name: nama,
        password: guruPassword,
        role: "guru",
        nipy: isNip ? userRaw : undefined,
        status: "active",
      },
      create: {
        name: nama,
        email: username,
        password: guruPassword,
        role: "guru",
        nipy: isNip ? userRaw : undefined,
        status: "active",
      },
    })
    teacherCount++
  }
  console.log(`✓ Berhasil mengimpor ${teacherCount} akun Guru & Karyawan (password default: 'guru123').`)

  // Pertahankan juga akun guru alias 'gita' dan 'lutfia'
  await prisma.user.upsert({
    where: { email: "gita" },
    update: { password: guruPassword, status: "active", role: "guru" },
    create: { name: "GITA KURNIA NUR P, S.Pd", email: "gita", password: guruPassword, role: "guru", status: "active" },
  })
  await prisma.user.upsert({
    where: { email: "lutfia" },
    update: { password: guruPassword, status: "active", role: "guru" },
    create: { name: "LUTHFIA LAILI AYU NOVITASARI, S.Pd", email: "lutfia", password: guruPassword, role: "guru", status: "active" },
  })

  console.log("\n=== PENATAAN DATABASE SELESAI DENGAN SUKSES! ===")
}

main()
  .catch((e) => {
    console.error("Error penataan database:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
