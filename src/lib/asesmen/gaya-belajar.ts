export interface GayaBelajarQuestion {
  id: number
  text: string
  pilihan: { label: string; dimensi: "V" | "A" | "R" | "K" }[]
}

export const questions: GayaBelajarQuestion[] = [
  {
    id: 1,
    text: "Saat mempelajari materi baru, saya lebih mudah paham jika...",
    pilihan: [
      { label: "melihat diagram, ilustrasi, atau video penjelasan", dimensi: "V" },
      { label: "mendengar penjelasan langsung atau rekaman audio", dimensi: "A" },
      { label: "membaca teks, ringkasan, atau panduan tertulis", dimensi: "R" },
      { label: "mencoba langsung melalui praktik", dimensi: "K" },
    ],
  },
  {
    id: 2,
    text: "Saat mencari arah ke suatu tempat, saya biasanya lebih mengandalkan...",
    pilihan: [
      { label: "peta, tampilan visual, atau penunjuk arah", dimensi: "V" },
      { label: "penjelasan lisan dari orang lain", dimensi: "A" },
      { label: "petunjuk tertulis langkah demi langkah", dimensi: "R" },
      { label: "mencoba rute sambil mengecek langsung di lapangan", dimensi: "K" },
    ],
  },
  {
    id: 3,
    text: "Cara yang paling membantu saya untuk mengingat sesuatu adalah...",
    pilihan: [
      { label: "mengingat gambar, warna, atau tampilan visualnya", dimensi: "V" },
      { label: "mengingat suara, irama, atau penjelasan lisan", dimensi: "A" },
      { label: "menulis catatan atau poin penting", dimensi: "R" },
      { label: "langsung mempraktikkan atau mengulang kegiatannya", dimensi: "K" },
    ],
  },
  {
    id: 4,
    text: "Saat berada di kelas, saya biasanya lebih fokus dengan cara...",
    pilihan: [
      { label: "memperhatikan slide, gambar, atau tulisan di papan", dimensi: "V" },
      { label: "mendengarkan penjelasan guru dan diskusi", dimensi: "A" },
      { label: "mencatat isi penjelasan secara tertulis", dimensi: "R" },
      { label: "belajar sambil bergerak atau terlibat langsung", dimensi: "K" },
    ],
  },
  {
    id: 5,
    text: "Ketika membaca buku pelajaran, saya cenderung...",
    pilihan: [
      { label: "melihat diagram, ilustrasi, atau bagan lebih dulu", dimensi: "V" },
      { label: "membaca sambil bersuara atau mengulang secara lisan", dimensi: "A" },
      { label: "membaca dalam hati sambil membuat catatan", dimensi: "R" },
      { label: "lebih mudah memahami jika disertai praktik", dimensi: "K" },
    ],
  },
  {
    id: 6,
    text: "Cara menghabiskan waktu senggang yang paling saya sukai adalah...",
    pilihan: [
      { label: "menonton film, video, atau konten visual", dimensi: "V" },
      { label: "mendengarkan musik, podcast, atau cerita audio", dimensi: "A" },
      { label: "membaca novel, komik, atau artikel", dimensi: "R" },
      { label: "berolahraga, berjalan, atau membuat sesuatu", dimensi: "K" },
    ],
  },
  {
    id: 7,
    text: "Saat mempertimbangkan barang baru, saya biasanya lebih percaya pada...",
    pilihan: [
      { label: "foto, tampilan, atau demonstrasi visual barang", dimensi: "V" },
      { label: "pendapat atau ulasan lisan dari orang lain", dimensi: "A" },
      { label: "deskripsi, spesifikasi, dan informasi tertulis", dimensi: "R" },
      { label: "pengalaman mencoba barang tersebut secara langsung", dimensi: "K" },
    ],
  },
  {
    id: 8,
    text: "Saat mengatur catatan pelajaran, saya paling nyaman dengan cara...",
    pilihan: [
      { label: "mind map, warna, dan penanda visual", dimensi: "V" },
      { label: "mendengarkan ulang rekaman atau diskusi", dimensi: "A" },
      { label: "poin-poin tertulis yang rapi dan terstruktur", dimensi: "R" },
      { label: "mengingat lewat praktik atau pengulangan langsung", dimensi: "K" },
    ],
  },
  {
    id: 9,
    text: "Ketika mendapat instruksi baru, saya lebih mudah memahaminya jika...",
    pilihan: [
      { label: "melihat contoh atau demonstrasi terlebih dahulu", dimensi: "V" },
      { label: "mendengar penjelasan langsung dari orang lain", dimensi: "A" },
      { label: "membaca panduan langkah demi langkah", dimensi: "R" },
      { label: "mencoba langsung sambil belajar dari prosesnya", dimensi: "K" },
    ],
  },
  {
    id: 10,
    text: "Cara belajar yang paling cocok untuk saya biasanya adalah...",
    pilihan: [
      { label: "menggunakan highlight, diagram, dan visual penunjang", dimensi: "V" },
      { label: "belajar lewat diskusi atau penjelasan lisan", dimensi: "A" },
      { label: "membaca ulang rangkuman dan catatan", dimensi: "R" },
      { label: "melakukan praktik atau eksperimen", dimensi: "K" },
    ],
  },
]

export function hitungSkor(jawaban: Record<number, string>): Record<string, number> {
  const skor: Record<string, number> = { V: 0, A: 0, R: 0, K: 0 }
  for (const [, dimensi] of Object.entries(jawaban)) {
    if (dimensi in skor) skor[dimensi]++
  }
  return skor
}

export function getGayaDominan(skor: Record<string, number>): string {
  const max = Math.max(...Object.values(skor))
  const dominan = Object.entries(skor).filter(([, v]) => v === max).map(([k]) => k)
  return dominan.join("/")
}

export const labelGaya: Record<string, string> = {
  V: "Visual — Belajar lewat gambar, diagram, video",
  A: "Auditory — Belajar lewat suara, musik, diskusi",
  R: "Reading — Belajar lewat teks, catatan, bacaan",
  K: "Kinesthetic — Belajar lewat gerak, praktek, eksperimen",
}
