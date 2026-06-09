export interface PsikologiQuestion {
  id: number
  text: string
  dimensi: "somatisasi" | "cemas" | "depresi" | "sensitif" | "musuh"
}

export const questions: PsikologiQuestion[] = [
  { id: 1, text: "Saya sering merasa kepala berat atau pusing meskipun tidak sedang sakit.", dimensi: "somatisasi" },
  { id: 2, text: "Dada saya sering terasa sesak atau berdebar lebih cepat dari biasanya.", dimensi: "somatisasi" },
  { id: 3, text: "Saya mudah lelah walaupun tidak melakukan aktivitas berat.", dimensi: "somatisasi" },
  { id: 4, text: "Tangan atau kaki saya sering terasa tegang atau pegal.", dimensi: "somatisasi" },
  { id: 5, text: "Perut saya terasa tidak nyaman saat sedang tertekan.", dimensi: "somatisasi" },
  { id: 6, text: "Punggung atau leher saya sering terasa kaku.", dimensi: "somatisasi" },
  { id: 7, text: "Saya sulit tidur nyenyak atau sering terbangun di malam hari.", dimensi: "somatisasi" },
  { id: 8, text: "Saya berkeringat berlebihan tanpa alasan yang jelas.", dimensi: "somatisasi" },
  { id: 9, text: "Saya sering ingin buang air kecil saat merasa tegang.", dimensi: "somatisasi" },
  { id: 10, text: "Saya mudah khawatir terhadap hal-hal kecil.", dimensi: "cemas" },
  { id: 11, text: "Saya sering merasa gelisah dan sulit tenang.", dimensi: "cemas" },
  { id: 12, text: "Pikiran saya terasa terus berjalan dan sulit berhenti.", dimensi: "cemas" },
  { id: 13, text: "Saya merasa takut pada hal yang sebenarnya tidak terlalu mengancam.", dimensi: "cemas" },
  { id: 14, text: "Tubuh saya sering terasa tegang dan sulit rileks.", dimensi: "cemas" },
  { id: 15, text: "Saya mudah panik saat keadaan tidak berjalan sesuai rencana.", dimensi: "cemas" },
  { id: 16, text: "Saya sulit tidur karena pikiran saya tidak tenang.", dimensi: "cemas" },
  { id: 17, text: "Saya sering merasa ada hal buruk yang akan terjadi tanpa alasan yang jelas.", dimensi: "cemas" },
  { id: 18, text: "Saya kehilangan minat pada hal-hal yang biasanya saya sukai.", dimensi: "depresi" },
  { id: 19, text: "Saya sering merasa sedih atau kosong tanpa alasan yang jelas.", dimensi: "depresi" },
  { id: 20, text: "Saya lebih mudah menangis atau ingin menangis.", dimensi: "depresi" },
  { id: 21, text: "Saya sering menyalahkan diri sendiri atau merasa tidak berharga.", dimensi: "depresi" },
  { id: 22, text: "Saya sulit berkonsentrasi saat belajar.", dimensi: "depresi" },
  { id: 23, text: "Nafsu makan saya berubah cukup terasa.", dimensi: "depresi" },
  { id: 24, text: "Saya merasa masa depan terlihat suram.", dimensi: "depresi" },
  { id: 25, text: "Saya sering merasa lemas dan tidak bertenaga.", dimensi: "depresi" },
  { id: 26, text: "Saya mudah tersinggung oleh ucapan atau sikap orang lain.", dimensi: "sensitif" },
  { id: 27, text: "Saya sering merasa orang lain membicarakan saya.", dimensi: "sensitif" },
  { id: 28, text: "Saya sulit percaya pada orang yang baru saya kenal.", dimensi: "sensitif" },
  { id: 29, text: "Saya sering merasa tidak diterima atau dijauhkan.", dimensi: "sensitif" },
  { id: 30, text: "Kritik kecil bisa sangat memengaruhi perasaan saya.", dimensi: "sensitif" },
  { id: 31, text: "Saya sering membandingkan diri dengan orang lain.", dimensi: "sensitif" },
  { id: 32, text: "Saya merasa orang lain tidak memahami perasaan saya.", dimensi: "sensitif" },
  { id: 33, text: "Saya sering merasa minder atau tidak percaya diri.", dimensi: "sensitif" },
  { id: 34, text: "Saya mudah marah karena hal-hal kecil.", dimensi: "musuh" },
  { id: 35, text: "Saat kesal, saya merasa ingin berteriak atau meluapkan emosi.", dimensi: "musuh" },
  { id: 36, text: "Perbedaan pendapat mudah berubah menjadi pertengkaran.", dimensi: "musuh" },
  { id: 37, text: "Saya kesulitan mengendalikan emosi saat sedang marah.", dimensi: "musuh" },
  { id: 38, text: "Saya sering merasa orang lain sengaja membuat saya kesal.", dimensi: "musuh" },
  { id: 39, text: "Saya pernah melampiaskan kemarahan pada benda di sekitar saya.", dimensi: "musuh" },
  { id: 40, text: "Saya mudah frustrasi saat sesuatu tidak berjalan sesuai harapan.", dimensi: "musuh" },
  { id: 41, text: "Saya sulit melepaskan rasa kecewa.", dimensi: "musuh" },
  { id: 42, text: "Saya pernah merasa ingin menyerah menghadapi semuanya.", dimensi: "depresi" },
  { id: 43, text: "Saya sering merasa sendirian walaupun sedang bersama orang lain.", dimensi: "depresi" },
  { id: 44, text: "Saya terganggu oleh pikiran yang terus muncul dan sulit dihentikan.", dimensi: "cemas" },
  { id: 45, text: "Jantung saya sering berdebar tanpa sebab yang jelas.", dimensi: "somatisasi" },
]

export function hitungSkor(jawaban: Record<number, number>): Record<string, number> {
  const dimensi = ["somatisasi", "cemas", "depresi", "sensitif", "musuh"]
  const skor: Record<string, number> = {}
  for (const d of dimensi) skor[d] = 0

  const counts: Record<string, number> = {}
  for (const d of dimensi) counts[d] = 0

  for (const [id, nilai] of Object.entries(jawaban)) {
    const q = questions.find((q) => q.id === Number(id))
    if (q) {
      skor[q.dimensi] += nilai
      counts[q.dimensi]++
    }
  }

  for (const d of dimensi) {
    if (counts[d] > 0) {
      skor[d] = Math.round((skor[d] / (counts[d] * 4)) * 100)
    }
  }

  return skor
}

export function interpretasi(skor: Record<string, number>): string[] {
  const hasil: string[] = []
  if (skor.somatisasi >= 60) hasil.push("Perhatian: Ada indikasi keluhan fisik terkait stres. Disarankan teknik relaksasi dan konsultasi.")
  if (skor.cemas >= 60) hasil.push("Catatan: Tingkat kecemasan cukup tinggi. Disarankan latihan pernapasan dan grounding.")
  if (skor.depresi >= 60) hasil.push("Evaluasi: Indikasi mood rendah. Perlu dukungan teman/dewasa dan aktivitas positif.")
  if (skor.sensitif >= 60) hasil.push("Observasi: Sensitivitas interpersonal tinggi. Bisa dibantu dengan penguatan kepercayaan diri.")
  if (skor.musuh >= 60) hasil.push("Waspada: Kemarahan mudah terpicu. Disarankan teknik manajemen emosi.")
  if (hasil.length === 0) hasil.push("Profil psikologi dalam batas normal. Pertahankan kesejahteraan mental!")
  return hasil
}
