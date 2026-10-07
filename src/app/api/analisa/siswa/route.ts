import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { labelDimensi as riasecLabel, rekomendasiKarier } from "@/lib/asesmen/minat-bakat"
import { interpretasi } from "@/lib/asesmen/psikologi"
import { labelGaya } from "@/lib/asesmen/gaya-belajar"
import { labelDimensiKarakter } from "@/lib/asesmen/karakter"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Parameter id diperlukan" }, { status: 400 })
    }

    const siswa = await prisma.siswa.findUnique({
      where: { id },
      include: {
        minatBakat: { orderBy: { createdAt: "desc" }, take: 1 },
        psikologi: { orderBy: { createdAt: "desc" }, take: 1 },
        gayaBelajar: { orderBy: { createdAt: "desc" }, take: 1 },
        karakterDiri: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    })

    if (!siswa) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 })
    }

    let riasec: Record<string, number> | null = null
    let psi: Record<string, number> | null = null
    let vark: Record<string, number> | null = null
    let karakter: Record<string, number> | null = null

    try { if (siswa.minatBakat[0]?.skor) riasec = JSON.parse(siswa.minatBakat[0].skor) } catch {}
    try { if (siswa.psikologi[0]?.skor) psi = JSON.parse(siswa.psikologi[0].skor) } catch {}
    try { if (siswa.gayaBelajar[0]?.skor) vark = JSON.parse(siswa.gayaBelajar[0].skor) } catch {}
    try { if (siswa.karakterDiri[0]?.skor) karakter = JSON.parse(siswa.karakterDiri[0].skor) } catch {}

    const analisa: Record<string, unknown> = {
      siswa: {
        id: siswa.id,
        nama: siswa.nama,
        kelas: siswa.kelas,
        nisn: siswa.nisn,
      },
      asesmen: {},
    }

    if (riasec && Object.keys(riasec).length > 0) {
      const sorted = Object.entries(riasec).sort((a, b) => b[1] - a[1])
      if (sorted.length > 0) {
        analisa.asesmen = {
          ...analisa.asesmen as Record<string, unknown>,
          minatBakat: {
            skor: riasec,
            urutan: sorted.map(([k, v]) => ({ kode: k, label: riasecLabel[k] || k, skor: v })),
            dominan: { kode: sorted[0][0], label: riasecLabel[sorted[0][0]] || sorted[0][0], skor: sorted[0][1] },
            rekomendasiKarier: (rekomendasiKarier[sorted[0][0]] || []).slice(0, 5),
          },
        }
      }
    }

    if (vark && Object.keys(vark).length > 0) {
      const sorted = Object.entries(vark).sort((a, b) => b[1] - a[1])
      if (sorted.length > 0) {
        analisa.asesmen = {
          ...analisa.asesmen as Record<string, unknown>,
          gayaBelajar: {
            skor: vark,
            urutan: sorted.map(([k, v]) => ({ kode: k, label: labelGaya[k] || k, skor: v })),
            dominan: { kode: sorted[0][0], label: labelGaya[sorted[0][0]] || sorted[0][0], skor: sorted[0][1] },
          },
        }
      }
    }

    if (psi) {
      analisa.asesmen = {
        ...analisa.asesmen as Record<string, unknown>,
        psikologi: {
          skor: psi,
          dimensi: Object.entries(psi).map(([k, v]) => ({ label: k, skor: v, interpretasi: v >= 70 ? "Perlu perhatian" : v >= 50 ? "Sedang" : "Baik" })),
          catatan: interpretasi(psi),
        },
      }
    }

    if (karakter && Object.keys(karakter).length > 0) {
      const sorted = Object.entries(karakter).sort((a, b) => b[1] - a[1])
      analisa.asesmen = {
        ...analisa.asesmen as Record<string, unknown>,
        karakter: {
          skor: karakter,
          urutan: sorted.map(([k, v]) => ({
            kode: k,
            label: labelDimensiKarakter[k] || k,
            skor: v,
            tingkat: v >= 60 ? "Tinggi" : v >= 40 ? "Sedang" : "Rendah",
          })),
        },
      }
    }

    return NextResponse.json(analisa)
  } catch (error) {
    console.error("Error generating analisa siswa:", error)
    return NextResponse.json({ error: "Gagal membuat analisa siswa" }, { status: 500 })
  }
}
