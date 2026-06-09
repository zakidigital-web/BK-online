export interface MinatBakatQuestion {
  id: number
  text: string
  dimensi: "R" | "I" | "A" | "S" | "E" | "C"
}

export const questions: MinatBakatQuestion[] = [
  { id: 1, text: "Saya lebih suka memperbaiki barang yang rusak sendiri daripada menunggu bantuan orang lain.", dimensi: "R" },
  { id: 2, text: "Saya senang mengutak-atik peralatan seperti komputer, motor, atau gawai.", dimensi: "R" },
  { id: 3, text: "Saya menikmati kegiatan yang menghasilkan karya nyata, seperti memasak, berkebun, atau membuat kerajinan.", dimensi: "R" },
  { id: 4, text: "Saya lebih menikmati kegiatan luar ruang daripada terlalu lama berada di dalam kamar.", dimensi: "R" },
  { id: 5, text: "Saya menyukai aktivitas fisik atau kegiatan yang menuntut tenaga dan ketahanan tubuh.", dimensi: "R" },
  { id: 6, text: "Saya lebih mudah belajar melalui praktik langsung daripada teori saja.", dimensi: "R" },
  { id: 7, text: "Saya tertarik memahami bagaimana sesuatu bekerja di balik prosesnya.", dimensi: "I" },
  { id: 8, text: "Saya senang mencari tahu topik baru meskipun tidak diminta.", dimensi: "I" },
  { id: 9, text: "Saya pernah membongkar atau merakit sesuatu hanya untuk mempelajari bagian-bagiannya.", dimensi: "I" },
  { id: 10, text: "Matematika atau IPA termasuk pelajaran yang saya nikmati.", dimensi: "I" },
  { id: 11, text: "Saya menikmati teka-teki, puzzle, atau tantangan yang membutuhkan logika.", dimensi: "I" },
  { id: 12, text: "Saya bisa fokus lama saat membaca artikel atau informasi yang menurut saya menarik.", dimensi: "I" },
  { id: 13, text: "Saya menikmati mengambil foto atau video dengan komposisi yang menarik.", dimensi: "A" },
  { id: 14, text: "Saya senang menulis cerita, puisi, atau catatan pribadi.", dimensi: "A" },
  { id: 15, text: "Saya tertarik merancang sesuatu, seperti poster, pakaian, atau tata ruang.", dimensi: "A" },
  { id: 16, text: "Musik, bernyanyi, atau menari adalah kegiatan yang saya sukai.", dimensi: "A" },
  { id: 17, text: "Saya sering memikirkan ide-ide kreatif yang berbeda dari biasanya.", dimensi: "A" },
  { id: 18, text: "Saat menonton film, saya tertarik memperhatikan unsur visual dan artistiknya.", dimensi: "A" },
  { id: 19, text: "Saya mudah memahami perasaan orang lain.", dimensi: "S" },
  { id: 20, text: "Saya senang menjelaskan materi atau membantu teman belajar.", dimensi: "S" },
  { id: 21, text: "Saya tertarik mengikuti kegiatan sosial atau organisasi yang bermanfaat bagi orang lain.", dimensi: "S" },
  { id: 22, text: "Teman-teman sering datang kepada saya untuk bercerita atau meminta saran.", dimensi: "S" },
  { id: 23, text: "Saya peduli pada isu sosial dan kemanusiaan di sekitar saya.", dimensi: "S" },
  { id: 24, text: "Saya lebih menikmati kerja kelompok daripada bekerja sendiri.", dimensi: "S" },
  { id: 25, text: "Saya nyaman mengambil peran memimpin dalam kelompok.", dimensi: "E" },
  { id: 26, text: "Saya suka berbicara atau presentasi di depan banyak orang.", dimensi: "E" },
  { id: 27, text: "Saya cukup percaya diri saat meyakinkan orang lain tentang suatu ide.", dimensi: "E" },
  { id: 28, text: "Saya tertarik membangun usaha atau proyek sendiri.", dimensi: "E" },
  { id: 29, text: "Saya bersemangat mengikuti kompetisi dan tantangan.", dimensi: "E" },
  { id: 30, text: "Saya percaya diri saat menawarkan ide atau rencana kepada orang lain.", dimensi: "E" },
  { id: 31, text: "Saya merasa kerapian dan ketelitian adalah hal yang penting.", dimensi: "C" },
  { id: 32, text: "Saya nyaman bekerja dengan aturan dan prosedur yang jelas.", dimensi: "C" },
  { id: 33, text: "Saya terbiasa mencatat jadwal dan membuat daftar tugas.", dimensi: "C" },
  { id: 34, text: "Saya lebih menyukai rutinitas yang teratur daripada situasi yang terlalu acak.", dimensi: "C" },
  { id: 35, text: "Saya teliti saat mengerjakan data atau angka.", dimensi: "C" },
  { id: 36, text: "Saya senang mengatur dan merapikan dokumen atau file.", dimensi: "C" },
]

export function hitungSkor(jawaban: Record<number, number>): Record<string, number> {
  const skor: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  for (const [id, nilai] of Object.entries(jawaban)) {
    const q = questions.find((q) => q.id === Number(id))
    if (q) skor[q.dimensi] += nilai
  }
  return skor
}

export function getTipeTeratas(skor: Record<string, number>): string {
  const tertinggi = Math.max(...Object.values(skor))
  const tipe = Object.entries(skor).filter(([, v]) => v === tertinggi).map(([k]) => k)
  return tipe.join("/")
}

export const labelDimensi: Record<string, string> = {
  R: "Realistic — Tangan terampil, suka kerja fisik",
  I: "Investigative — Suka mikir, analitis, penasaran",
  A: "Artistic — Kreatif, ekspresif, imajinatif",
  S: "Social — Suka bantu orang, empati tinggi",
  E: "Enterprising — Jiwa pemimpin, suka tantangan",
  C: "Conventional — Teratur, rapi, detail",
}

export const rekomendasiKarier: Record<string, string[]> = {
  R: ["Teknisi", "Arsitek", "Koki", "Atlet", "Insinyur", "Pilot"],
  I: ["Ilmuwan", "Dokter", "Programmer", "Detektif", "Analis Data", "Peneliti"],
  A: ["Desainer Grafis", "Penulis", "Musisi", "Aktor", "Content Creator", "Animator"],
  S: ["Psikolog", "Guru", "Konselor", "Perawat", "Pekerja Sosial", "HRD"],
  E: ["CEO", "Pengacara", "Marketing", "Politikus", "Entrepreneur", "Sales Manager"],
  C: ["Akuntan", "Administrasi", "Bankir", "Auditor", "Data Entry", "Notaris"],
}
