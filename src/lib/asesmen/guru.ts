export interface GuruSoal {
  id: number
  dimensi: string
  pertanyaan: string
  positif: boolean
}

export const soals: GuruSoal[] = [
  // Gaya Mengajar — Traditional
  { id: 1,  dimensi: "Tradisional",    pertanyaan: "Saya mengikuti format RPP standar secara ketat", positif: true },
  { id: 2,  dimensi: "Tradisional",    pertanyaan: "Pembelajaran di kelas saya berpusat pada guru", positif: true },
  { id: 3,  dimensi: "Tradisional",    pertanyaan: "Saya mengutamakan ketertiban dan aturan kelas yang tegas", positif: true },
  { id: 4,  dimensi: "Tradisional",    pertanyaan: "Evaluasi utama yang saya gunakan adalah tes tertulis", positif: true },
  // Gaya Mengajar — Modern
  { id: 5,  dimensi: "Modern",         pertanyaan: "Saya mendorong diskusi dan kolaborasi antarsiswa", positif: true },
  { id: 6,  dimensi: "Modern",         pertanyaan: "Saya menggunakan teknologi dalam setiap pembelajaran", positif: true },
  { id: 7,  dimensi: "Modern",         pertanyaan: "Saya memberi kebebasan siswa mengeksplorasi materi", positif: true },
  { id: 8,  dimensi: "Modern",         pertanyaan: "Proyek dan portofolio lebih saya utamakan daripada hafalan", positif: true },
  // Gaya Mengajar — Praktis
  { id: 9,  dimensi: "Praktis",        pertanyaan: "Saya banyak memberikan contoh konkret dari kehidupan nyata", positif: true },
  { id: 10, dimensi: "Praktis",        pertanyaan: "Saya sering mengadakan praktikum atau simulasi", positif: true },
  { id: 11, dimensi: "Praktis",        pertanyaan: "Saya menyesuaikan metode ajar berdasarkan karakter siswa", positif: true },
  { id: 12, dimensi: "Praktis",        pertanyaan: "Saya melibatkan orang tua dalam menangani masalah siswa", positif: true },
  // Kepribadian — Openness
  { id: 13, dimensi: "Keterbukaan",    pertanyaan: "Saya senang mencoba metode mengajar baru", positif: true },
  { id: 14, dimensi: "Keterbukaan",    pertanyaan: "Saya mudah beradaptasi dengan perubahan kurikulum", positif: true },
  // Kepribadian — Conscientiousness
  { id: 15, dimensi: "Ketelitian",     pertanyaan: "Saya selalu menyiapkan materi sebelum masuk kelas", positif: true },
  { id: 16, dimensi: "Ketelitian",     pertanyaan: "Saya mengecek dan menilai tugas siswa secara rutin", positif: true },
  // Kepribadian — Extroversion
  { id: 17, dimensi: "Ekstrover",      pertanyaan: "Saya nyaman berbicara di depan banyak orang", positif: true },
  { id: 18, dimensi: "Ekstrover",      pertanyaan: "Saya mudah bergaul dengan rekan kerja dan siswa", positif: true },
  // Kepribadian — Agreeableness
  { id: 19, dimensi: "Keramahan",      pertanyaan: "Saya sabar menghadapi siswa yang lambat belajar", positif: true },
  { id: 20, dimensi: "Keramahan",      pertanyaan: "Saya mendengarkan keluhan siswa dengan empati", positif: true },
  // Kompetensi
  { id: 21, dimensi: "Kompetensi",     pertanyaan: "Saya menguasai materi pelajaran yang saya ampu", positif: true },
  { id: 22, dimensi: "Kompetensi",     pertanyaan: "Saya mampu menggunakan teknologi untuk pembelajaran", positif: true },
  { id: 23, dimensi: "Kompetensi",     pertanyaan: "Saya melakukan evaluasi dan tindak lanjut secara berkala", positif: true },
  { id: 24, dimensi: "Kompetensi",     pertanyaan: "Saya terus belajar dan mengikuti pelatihan pengembangan diri", positif: true },
]

export const psikologiSoals: GuruSoal[] = [
  // Stres Kerja
  { id: 101, dimensi: "Stres Kerja",     pertanyaan: "Saya merasa terbebani dengan administrasi mengajar", positif: true },
  { id: 102, dimensi: "Stres Kerja",     pertanyaan: "Saya sulit menyeimbangkan pekerjaan dan kehidupan pribadi", positif: true },
  { id: 103, dimensi: "Stres Kerja",     pertanyaan: "Saya sering merasa lelah secara mental setelah mengajar", positif: true },
  // Kesejahteraan (Well-being)
  { id: 104, dimensi: "Kesejahteraan",   pertanyaan: "Saya merasa dihargai oleh rekan kerja dan atasan", positif: true },
  { id: 105, dimensi: "Kesejahteraan",   pertanyaan: "Saya menikmati pekerjaan saya sebagai guru", positif: true },
  { id: 106, dimensi: "Kesejahteraan",   pertanyaan: "Lingkungan kerja saya mendukung perkembangan saya", positif: true },
  // Motivasi
  { id: 107, dimensi: "Motivasi",        pertanyaan: "Saya bersemangat mengajar setiap hari", positif: true },
  { id: 108, dimensi: "Motivasi",        pertanyaan: "Saya memiliki target pengembangan diri yang jelas", positif: true },
  { id: 109, dimensi: "Motivasi",        pertanyaan: "Saya merasa kontribusi saya berarti bagi siswa", positif: true },
  // Stabilitas Emosi
  { id: 110, dimensi: "Stabilitas Emosi", pertanyaan: "Saya mudah tersinggung oleh kritik dari orang lain", positif: false },
  { id: 111, dimensi: "Stabilitas Emosi", pertanyaan: "Saya cemas ketika menghadapi kelas yang sulit diatur", positif: false },
  { id: 112, dimensi: "Stabilitas Emosi", pertanyaan: "Saya kesulitan mengontrol emosi saat menghadapi siswa bermasalah", positif: false },
  // Kepuasan Kerja
  { id: 113, dimensi: "Kepuasan Kerja",  pertanyaan: "Saya puas dengan fasilitas yang tersedia di sekolah", positif: true },
  { id: 114, dimensi: "Kepuasan Kerja",  pertanyaan: "Gaji dan tunjangan yang saya terima sudah sesuai", positif: true },
  { id: 115, dimensi: "Kepuasan Kerja",  pertanyaan: "Saya merasa betah dan ingin pensiun di sekolah ini", positif: true },
]

export const skalaLabel = ["Tidak Sesuai", "Kurang Sesuai", "Netral", "Sesuai", "Sangat Sesuai"]

export const dimensiWarna: Record<string, string> = {
  Tradisional: "#ef4444",
  Modern:      "#3b82f6",
  Praktis:     "#22c55e",
  Keterbukaan: "#a855f7",
  Ketelitian:  "#f97316",
  Ekstrover:   "#06b6d4",
  Keramahan:   "#eab308",
  Kompetensi:  "#ec4899",
  "Stres Kerja": "#ef4444",
  Kesejahteraan: "#22c55e",
  Motivasi:   "#a855f7",
  "Stabilitas Emosi": "#f97316",
  "Kepuasan Kerja": "#3b82f6",
}

export function hitungSkorGuru(jawaban: Record<number, number>) {
  const skor: Record<string, { total: number; count: number }> = {}
  for (const s of soals) {
    const nilai = jawaban[s.id] || 0
    if (!skor[s.dimensi]) skor[s.dimensi] = { total: 0, count: 0 }
    skor[s.dimensi].total += nilai
    skor[s.dimensi].count += 1
  }
  const result: Record<string, number> = {}
  for (const [dimensi, data] of Object.entries(skor)) {
    result[dimensi] = Math.round((data.total / data.count) * 20)
  }
  return result
}

export function hitungSkorPsikologi(jawaban: Record<number, number>) {
  const skor: Record<string, { total: number; count: number }> = {}
  for (const s of psikologiSoals) {
    let nilai = jawaban[s.id] || 0
    if (!s.positif) nilai = 6 - nilai
    if (!skor[s.dimensi]) skor[s.dimensi] = { total: 0, count: 0 }
    skor[s.dimensi].total += nilai
    skor[s.dimensi].count += 1
  }
  const result: Record<string, number> = {}
  for (const [dimensi, data] of Object.entries(skor)) {
    result[dimensi] = Math.round((data.total / data.count) * 20)
  }
  return result
}

export function getTipeGuruUtama(skor: Record<string, number>): { label: string; desc: string } {
  const gayaSkor: Record<string, number> = {}
  for (const [dimensi, nilai] of Object.entries(skor)) {
    if (["Tradisional", "Modern", "Praktis"].includes(dimensi)) gayaSkor[dimensi] = nilai
  }
  const tertinggi = Object.entries(gayaSkor).sort((a, b) => b[1] - a[1])[0]
  const l = tertinggi?.[0] || "Modern"
  const deskripsi: Record<string, string> = {
    Tradisional: "Anda guru yang terstruktur, disiplin, dan mengutamakan aturan. Cocok untuk kelas yang butuh arahan jelas.",
    Modern: "Anda guru yang inovatif, kolaboratif, dan terbuka dengan teknologi. Mampu menginspirasi siswa berpikir kritis.",
    Praktis: "Anda guru yang aplikatif, adaptif, dan dekat dengan kehidupan nyata. Membantu siswa melihat relevansi materi.",
  }
  return { label: `${l} — ${tertinggi?.[1] || 0}%`, desc: deskripsi[l] || "" }
}

export function getStatusPsikologi(skor: Record<string, number>): { label: string; desc: string } {
  const stres = skor["Stres Kerja"] || 0
  const wellbeing = skor["Kesejahteraan"] || 0
  const motivasi = skor["Motivasi"] || 0
  const emosi = skor["Stabilitas Emosi"] || 0
  const kepuasan = skor["Kepuasan Kerja"] || 0

  if (stres > 60 && wellbeing < 50) {
    return { label: "Perlu Perhatian — Stres Tinggi", desc: "Tingkat stres kerja cukup tinggi. Disarankan konseling dengan psikolog atau mengambil jeda untuk pemulihan." }
  }
  if (motivasi > 70 && kepuasan > 60) {
    return { label: "Sejahtera & Termotivasi", desc: "Kesejahteraan dan motivasi kerja Anda baik. Pertahankan semangat dan terus kembangkan potensi diri." }
  }
  if (emosi > 60 && stres < 40) {
    return { label: "Stabil & Tangguh", desc: "Stabilitas emosi Anda baik. Anda mampu mengelola tekanan dengan tenang dan bijaksana." }
  }
  return { label: "Cukup Stabil", desc: "Kondisi psikologis Anda cukup baik. Beberapa aspek mungkin perlu ditingkatkan untuk kenyamanan kerja yang lebih optimal." }
}

export const dimensiLabels: Record<string, string> = {
  Tradisional: "Tradisional", Modern: "Modern", Praktis: "Praktis",
  Keterbukaan: "Keterbukaan", Ketelitian: "Ketelitian",
  Ekstrover: "Ekstrover", Keramahan: "Keramahan", Kompetensi: "Kompetensi",
  "Stres Kerja": "Stres Kerja", Kesejahteraan: "Kesejahteraan",
  Motivasi: "Motivasi", "Stabilitas Emosi": "Stabilitas Emosi", "Kepuasan Kerja": "Kepuasan Kerja",
}
