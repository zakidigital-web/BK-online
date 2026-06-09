import { labelDimensi as riasecLabel, rekomendasiKarier } from "./minat-bakat"
import { interpretasi } from "./psikologi"
import { labelGaya } from "./gaya-belajar"
import { labelDimensiKarakter } from "./karakter"
import { getTipeMBTI, getDeskripsi } from "./mbti"
import { prisma } from "../db"

export async function generateLaporanKelas(kelas: string) {
  const siswa = await prisma.siswa.findMany({
    where: { kelas },
    include: {
      minatBakat: { orderBy: { createdAt: "desc" }, take: 1 },
      psikologi: { orderBy: { createdAt: "desc" }, take: 1 },
      gayaBelajar: { orderBy: { createdAt: "desc" }, take: 1 },
      karakterDiri: { orderBy: { createdAt: "desc" }, take: 1 },
      mbti: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })

  const total = siswa.length
  const riasecDist: Record<string, number> = {}
  const varkDist: Record<string, number> = {}
  const psikologiRerata: Record<string, number> = {}
  const bigFiveRerata: Record<string, number> = {}

  const detailSiswa = siswa.map((s) => {
    const riasec = s.minatBakat[0] ? JSON.parse(s.minatBakat[0].skor) : null
    const psi = s.psikologi[0] ? JSON.parse(s.psikologi[0].skor) : null
    const vark = s.gayaBelajar[0] ? JSON.parse(s.gayaBelajar[0].skor) : null
    const karakter = s.karakterDiri[0] ? JSON.parse(s.karakterDiri[0].skor) : null
    const mbti = s.mbti[0] ? JSON.parse(s.mbti[0].skor) : null

    if (riasec) {
      const top = Object.entries(riasec).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3).map(([k]) => k).join("/")
      riasecDist[top] = (riasecDist[top] || 0) + 1
    }
    if (vark) {
      const top = Object.entries(vark).sort((a: any, b: any) => b[1] - a[1]).slice(0, 2).map(([k]) => k).join("/")
      varkDist[top] = (varkDist[top] || 0) + 1
    }
    if (psi) {
      for (const [k, v] of Object.entries(psi)) {
        psikologiRerata[k] = (psikologiRerata[k] || 0) + (v as number)
      }
    }
    if (karakter) {
      for (const [k, v] of Object.entries(karakter)) {
        bigFiveRerata[k] = (bigFiveRerata[k] || 0) + (v as number)
      }
    }

    return {
      nama: s.nama,
      id: s.id,
      riasec: riasec ? skorKeArray(riasec) : null,
      psikologi: psi ? skorKeArray(psi) : null,
      vark: vark ? skorKeArray(vark) : null,
      karakter: karakter ? skorKeArray(karakter) : null,
      mbti: mbti ? skorKeArray(mbti) : null,
      mbtiTipe: mbti ? getTipeMBTI(mbti) : null,
      rekomendasi: riasec ? generateRekomendasi(riasec) : [],
    }
  })

  for (const k of Object.keys(psikologiRerata)) {
    psikologiRerata[k] = Math.round((psikologiRerata[k] as number) / total)
  }
  for (const k of Object.keys(bigFiveRerata)) {
    bigFiveRerata[k] = Math.round((bigFiveRerata[k] as number) / total)
  }

  return {
    kelas,
    totalSiswa: total,
    tanggal: new Date().toLocaleDateString("id-ID"),
    distribusiRiasec: Object.entries(riasecDist)
      .sort((a, b) => b[1] - a[1])
      .map(([tipe, jumlah]) => ({ tipe, jumlah, persen: Math.round((jumlah / total) * 100) })),
    distribusiVark: Object.entries(varkDist)
      .sort((a, b) => b[1] - a[1])
      .map(([tipe, jumlah]) => ({ tipe, jumlah, persen: Math.round((jumlah / total) * 100) })),
    psikologiRerata,
    bigFiveRerata,
    detailSiswa,
  }
}

function skorKeArray(obj: Record<string, number>) {
  return Object.entries(obj).map(([label, skor]) => ({ label, skor }))
}

function generateRekomendasi(skor: Record<string, number>) {
  const top = Object.entries(skor).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3)
  return top.flatMap(([k]) => rekomendasiKarier[k] || []).slice(0, 5)
}

export function generateNarasiLaporanSiswa(data: {
  nama: string
  kelas: string
  riasec?: Record<string, number> | null
  vark?: Record<string, number> | null
  psikologi?: Record<string, number> | null
  karakter?: Record<string, number> | null
  mbti?: Record<string, number> | null
}): string[] {
  const narasi: string[] = []

  narasi.push(`LAPORAN HASIL ASESMEN PESERTA DIDIK`)
  narasi.push(`Nama: ${data.nama} | Kelas: ${data.kelas}`)
  narasi.push(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`)
  narasi.push("")

  if (data.riasec) {
    narasi.push("A. PROFIL MINAT (RIASEC)")
    const top = Object.entries(data.riasec).sort((a: any, b: any) => b[1] - a[1])
    narasi.push(`Tipe dominan: ${top[0][0]} (skor ${top[0][1]})`)
    narasi.push(`Urutan minat: ${top.map(([k, v]) => `${k}=${v}`).join(" → ")}`)
    narasi.push(`Deskripsi: ${riasecLabel[top[0][0]] || ""}`)
    narasi.push(`Rekomendasi karir: ${(rekomendasiKarier[top[0][0]] || []).slice(0, 4).join(", ")}`)
    narasi.push("")
  }

  if (data.vark) {
    narasi.push("B. GAYA BELAJAR (VARK)")
    const sorted = Object.entries(data.vark).sort((a: any, b: any) => b[1] - a[1])
    narasi.push(`Gaya dominan: ${sorted[0][0]} (skor ${sorted[0][1]})`)
    narasi.push(`Profil: ${sorted.map(([k, v]) => `${k}=${v}`).join(" | ")}`)
    narasi.push(`${labelGaya[sorted[0][0]] || ""}`)
    narasi.push("Rekomendasi: Sesuaikan metode belajar dengan gaya dominan untuk hasil optimal.")
    narasi.push("")
  }

  if (data.psikologi) {
    narasi.push("C. PROFIL PSIKOLOGI")
    narasi.push(`Skor per dimensi: ${Object.entries(data.psikologi).map(([k, v]) => `${k}=${v}%`).join(" | ")}`)
    const interpretasiArr = interpretasi(data.psikologi)
    interpretasiArr.forEach((i) => narasi.push(`• ${i}`))
    narasi.push("Catatan: Instrumen ini bersifat screening, bukan diagnosis klinis.")
    narasi.push("")
  }

  if (data.mbti) {
    narasi.push("D. PROFIL KEPRIBADIAN (MBTI)")
    const tipe = getTipeMBTI(data.mbti)
    const deskripsi = getDeskripsi(tipe)
    narasi.push(`Tipe MBTI: ${tipe} — ${deskripsi.title}`)
    narasi.push(`Deskripsi: ${deskripsi.desc}`)
    narasi.push(`Peran: ${deskripsi.role}`)
    narasi.push("")
  }

  if (data.karakter) {
    narasi.push("E. PROFIL KARAKTER (BIG FIVE)")
    const sorted = Object.entries(data.karakter).sort((a: any, b: any) => b[1] - a[1])
    narasi.push(`Skor: ${sorted.map(([k, v]) => `${k}=${v}%`).join(" | ")}`)
    sorted.forEach(([k, v]) => {
      narasi.push(`${labelDimensiKarakter[k] || k}: ${v}% — ${v >= 60 ? "Tinggi" : v >= 40 ? "Sedang" : "Rendah"}`)
    })
    narasi.push("")
  }

  narasi.push("— Laporan ini digenerate otomatis oleh sistem BK —")
  return narasi
}
