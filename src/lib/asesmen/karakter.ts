export interface KarakterQuestion {
  id: number
  text: string
  dimensi: "O" | "C" | "E" | "A" | "N"
  positif: boolean
}

export const questions: KarakterQuestion[] = [
  { id: 1, text: "Saya memiliki imajinasi yang kaya dan suka memikirkan gagasan baru.", dimensi: "O", positif: true },
  { id: 2, text: "Penampilan dan barang-barang saya biasanya rapi dan tertata.", dimensi: "C", positif: true },
  { id: 3, text: "Saya mudah memulai percakapan dengan orang lain.", dimensi: "E", positif: true },
  { id: 4, text: "Saya peduli pada perasaan orang lain.", dimensi: "A", positif: true },
  { id: 5, text: "Saya sering merasa khawatir atau tegang.", dimensi: "N", positif: false },
  { id: 6, text: "Saya tertarik mencoba hal-hal baru dan pengalaman yang berbeda.", dimensi: "O", positif: true },
  { id: 7, text: "Saya sering menunda pekerjaan yang seharusnya bisa segera dikerjakan.", dimensi: "C", positif: false },
  { id: 8, text: "Saya lebih nyaman menyendiri daripada berada di keramaian.", dimensi: "E", positif: false },
  { id: 9, text: "Saya cenderung mudah percaya pada orang lain.", dimensi: "A", positif: true },
  { id: 10, text: "Perasaan saya biasanya stabil dan tidak mudah berubah.", dimensi: "N", positif: false },
  { id: 11, text: "Saya menyukai seni, musik, atau hal-hal yang bersifat estetis.", dimensi: "O", positif: true },
  { id: 12, text: "Saya terbiasa tepat waktu dan disiplin.", dimensi: "C", positif: true },
  { id: 13, text: "Saya nyaman menjadi pusat perhatian dalam kelompok.", dimensi: "E", positif: true },
  { id: 14, text: "Saya senang membantu orang lain tanpa mengharapkan balasan.", dimensi: "A", positif: true },
  { id: 15, text: "Suasana hati saya mudah berubah secara tiba-tiba.", dimensi: "N", positif: false },
  { id: 16, text: "Saya senang memikirkan makna hidup atau hal-hal yang mendalam.", dimensi: "O", positif: true },
  { id: 17, text: "Orang lain dapat mengandalkan saya.", dimensi: "C", positif: true },
  { id: 18, text: "Saya termasuk orang yang bersemangat dan antusias.", dimensi: "E", positif: true },
  { id: 19, text: "Saya mudah memahami sudut pandang orang lain.", dimensi: "A", positif: true },
  { id: 20, text: "Saya sering merasa sedih atau murung.", dimensi: "N", positif: false },
  { id: 21, text: "Saya suka mencoba makanan, budaya, atau pengalaman baru.", dimensi: "O", positif: true },
  { id: 22, text: "Barang-barang saya sering tidak tertata dengan rapi.", dimensi: "C", positif: false },
  { id: 23, text: "Saya menyenangkan untuk diajak berbicara.", dimensi: "E", positif: true },
  { id: 24, text: "Saya mudah memaafkan kesalahan orang lain.", dimensi: "A", positif: true },
  { id: 25, text: "Saya mudah merasa tertekan saat menghadapi tuntutan.", dimensi: "N", positif: false },
  { id: 26, text: "Saya terbuka terhadap ide atau cara pandang baru.", dimensi: "O", positif: true },
  { id: 27, text: "Saya konsisten menjalankan hal yang sudah saya mulai.", dimensi: "C", positif: true },
  { id: 28, text: "Saya cenderung malu dalam situasi yang baru.", dimensi: "E", positif: false },
  { id: 29, text: "Saya mudah mencari titik tengah agar situasi tetap damai.", dimensi: "A", positif: true },
  { id: 30, text: "Saya tetap merasa tenang saat menghadapi situasi genting.", dimensi: "N", positif: false },
]

export const nilaiPersonal: { id: string; label: string; iconKey: string }[] = [
  { id: "kebebasan", label: "Kebebasan", iconKey: "bird" },
  { id: "keadilan", label: "Keadilan", iconKey: "scale" },
  { id: "keluarga", label: "Keluarga", iconKey: "house" },
  { id: "prestasi", label: "Prestasi", iconKey: "trophy" },
  { id: "kreativitas", label: "Kreativitas", iconKey: "palette" },
  { id: "persahabatan", label: "Persahabatan", iconKey: "users" },
  { id: "kejujuran", label: "Kejujuran", iconKey: "gem" },
  { id: "petualangan", label: "Petualangan", iconKey: "compass" },
  { id: "keamanan", label: "Keamanan", iconKey: "shield" },
  { id: "pengetahuan", label: "Pengetahuan", iconKey: "book" },
  { id: "kekuasaan", label: "Kekuasaan", iconKey: "crown" },
  { id: "kebijaksanaan", label: "Kebijaksanaan", iconKey: "lightbulb" },
  { id: "ketenaran", label: "Ketenaran", iconKey: "star" },
  { id: "kesehatan", label: "Kesehatan", iconKey: "heartPulse" },
  { id: "spiritualitas", label: "Spiritualitas", iconKey: "sparkles" },
  { id: "kesetiaan", label: "Kesetiaan", iconKey: "link" },
  { id: "kesederhanaan", label: "Kesederhanaan", iconKey: "leaf" },
  { id: "keberanian", label: "Keberanian", iconKey: "shieldCheck" },
  { id: "kasih_sayang", label: "Kasih Sayang", iconKey: "heart" },
  { id: "humor", label: "Humor", iconKey: "smile" },
  { id: "kesabaran", label: "Kesabaran", iconKey: "clock" },
  { id: "kerjasama", label: "Kerjasama", iconKey: "handshake" },
  { id: "kepemimpinan", label: "Kepemimpinan", iconKey: "flag" },
  { id: "kemerdekaan", label: "Kemerdekaan Berpikir", iconKey: "brain" },
  { id: "tanggung_jawab", label: "Tanggung Jawab", iconKey: "clipboard" },
  { id: "kedisiplinan", label: "Kedisiplinan", iconKey: "clock" },
  { id: "optimisme", label: "Optimisme", iconKey: "sun" },
  { id: "empati", label: "Empati", iconKey: "heart" },
  { id: "ketekunan", label: "Ketekunan", iconKey: "target" },
  { id: "rasa_syukur", label: "Rasa Syukur", iconKey: "sparkles" },
]

export function hitungSkor(jawaban: Record<number, number>): Record<string, number> {
  const skor: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 }
  const counts: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 }

  for (const [id, nilai] of Object.entries(jawaban)) {
    const q = questions.find((q) => q.id === Number(id))
    if (q) {
      const skorNilai = q.positif ? nilai : 6 - nilai
      skor[q.dimensi] += skorNilai
      counts[q.dimensi]++
    }
  }

  for (const d of Object.keys(skor)) {
    if (counts[d] > 0) {
      skor[d] = Math.round((skor[d] / (counts[d] * 5)) * 100)
    }
  }

  return skor
}

export function getTipeKarakter(skor: Record<string, number>): string {
  const tipe: string[] = []
  if (skor.O >= 60) tipe.push("The Creative Explorer — Pikiran terbuka, penasaran, dan kreatif")
  else if (skor.O <= 40) tipe.push("The Grounded Realist — Praktis, konvensional, dan apa adanya")
  else tipe.push("The Balanced Thinker — Seimbang antara tradisi dan inovasi")

  if (skor.C >= 60) tipe.push("The Organizer — Teratur, disiplin, dan bisa diandalkan")
  if (skor.E >= 60) tipe.push("The Social Spark — Enerjik, ramah, dan suka jadi pusat perhatian")
  else if (skor.E <= 40) tipe.push("The Quiet Observer — Introvert, reflektif, dan nyaman sendiri")
  if (skor.A >= 60) tipe.push("The Peacemaker — Empati tinggi, kooperatif, dan menjaga harmoni")
  if (skor.N >= 60) tipe.push("The Deep Feeler — Sensitif, waspada, dan emosional")

  return tipe.join(" · ")
}

export const labelDimensiKarakter: Record<string, string> = {
  O: "Openness — Keterbukaan terhadap hal baru",
  C: "Conscientiousness — Kedisiplinan & keteraturan",
  E: "Extraversion — Energi sosial & ekspresivitas",
  A: "Agreeableness — Keramahan & kerjasama",
  N: "Neuroticism — Stabilitas emosi",
}
