export interface MbtiQuestion {
  id: number
  text: string
  dimensi: "EI" | "SN" | "TF" | "JP"
  arah: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P"
}

export const questions: MbtiQuestion[] = [
  // E/I — Extraversion vs Introversion
  { id: 1, text: "Setelah menghabiskan waktu bersama banyak orang, saya merasa lebih berenergi.", dimensi: "EI", arah: "E" },
  { id: 2, text: "Saya lebih suka bekerja sendiri daripada dalam tim.", dimensi: "EI", arah: "I" },
  { id: 3, text: "Saya mudah memulai percakapan dengan orang yang baru dikenal.", dimensi: "EI", arah: "E" },
  { id: 4, text: "Saya lebih suka mendengarkan daripada berbicara dalam diskusi kelompok.", dimensi: "EI", arah: "I" },
  { id: 5, text: "Saya menikmati menjadi pusat perhatian dalam acara sosial.", dimensi: "EI", arah: "E" },
  { id: 6, text: "Saya butuh waktu sendiri untuk mengisi ulang energi setelah bersosialisasi.", dimensi: "EI", arah: "I" },

  // S/N — Sensing vs Intuition
  { id: 7, text: "Saya lebih percaya pada fakta dan data yang konkret daripada teori abstrak.", dimensi: "SN", arah: "S" },
  { id: 8, text: "Saya suka membayangkan kemungkinan-kemungkinan di masa depan.", dimensi: "SN", arah: "N" },
  { id: 9, text: "Saya memperhatikan detail-detail kecil yang sering dilewatkan orang lain.", dimensi: "SN", arah: "S" },
  { id: 10, text: "Saya lebih tertarik pada ide-ide besar daripada hal-hal yang detail.", dimensi: "SN", arah: "N" },
  { id: 11, text: "Saya lebih suka petunjuk yang jelas dan langkah demi langkah.", dimensi: "SN", arah: "S" },
  { id: 12, text: "Saya sering melamun dan memikirkan berbagai kemungkinan.", dimensi: "SN", arah: "N" },

  // T/F — Thinking vs Feeling
  { id: 13, text: "Saya mengambil keputusan berdasarkan logika daripada perasaan.", dimensi: "TF", arah: "T" },
  { id: 14, text: "Saya sangat mempertimbangkan perasaan orang lain saat mengambil keputusan.", dimensi: "TF", arah: "F" },
  { id: 15, text: "Saya lebih suka mengatakan kebenaran meskipun itu menyakitkan.", dimensi: "TF", arah: "T" },
  { id: 16, text: "Saya mudah merasakan apa yang dirasakan orang lain.", dimensi: "TF", arah: "F" },
  { id: 17, text: "Saya percaya keputusan yang adil adalah yang objektif dan tidak memihak.", dimensi: "TF", arah: "T" },
  { id: 18, text: "Saya lebih mementingkan keharmonisan kelompok daripada kebenaran mutlak.", dimensi: "TF", arah: "F" },

  // J/P — Judging vs Perceiving
  { id: 19, text: "Saya suka membuat jadwal dan merencanakan kegiatan saya.", dimensi: "JP", arah: "J" },
  { id: 20, text: "Saya lebih suka bersikap spontan dan fleksibel dalam hidup.", dimensi: "JP", arah: "P" },
  { id: 21, text: "Saya merasa tidak nyaman jika sesuatu tidak sesuai rencana.", dimensi: "JP", arah: "J" },
  { id: 22, text: "Saya lebih suka membiarkan opsi tetap terbuka daripada membuat keputusan cepat.", dimensi: "JP", arah: "P" },
  { id: 23, text: "Saya selalu menyelesaikan tugas sebelum tenggat waktu.", dimensi: "JP", arah: "J" },
  { id: 24, text: "Saya suka mengerjakan tugas di menit-menit terakhir.", dimensi: "JP", arah: "P" },
]

export function hitungSkor(jawaban: Record<number, number>): Record<string, number> {
  const skor: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }

  for (const [id, nilai] of Object.entries(jawaban)) {
    const q = questions.find((q) => q.id === Number(id))
    if (q) {
      skor[q.arah] += nilai
    }
  }

  return skor
}

export function getTipeMBTI(skor: Record<string, number>): string {
  const ei = skor.E >= skor.I ? "E" : "I"
  const sn = skor.S >= skor.N ? "S" : "N"
  const tf = skor.T >= skor.F ? "T" : "F"
  const jp = skor.J >= skor.P ? "J" : "P"
  return `${ei}${sn}${tf}${jp}`
}

export function getPersentase(skor: Record<string, number>): Record<string, { kiri: number; kanan: number }> {
  return {
    EI: {
      kiri: Math.round((skor.E / (skor.E + skor.I || 1)) * 100),
      kanan: Math.round((skor.I / (skor.E + skor.I || 1)) * 100),
    },
    SN: {
      kiri: Math.round((skor.S / (skor.S + skor.N || 1)) * 100),
      kanan: Math.round((skor.N / (skor.S + skor.N || 1)) * 100),
    },
    TF: {
      kiri: Math.round((skor.T / (skor.T + skor.F || 1)) * 100),
      kanan: Math.round((skor.F / (skor.T + skor.F || 1)) * 100),
    },
    JP: {
      kiri: Math.round((skor.J / (skor.J + skor.P || 1)) * 100),
      kanan: Math.round((skor.P / (skor.J + skor.P || 1)) * 100),
    },
  }
}

export const labelDimensi: Record<string, { kiri: string; kanan: string }> = {
  EI: { kiri: "Ekstrovert (E)", kanan: "Introvert (I)" },
  SN: { kiri: "Sensing (S)", kanan: "Intuition (N)" },
  TF: { kiri: "Thinking (T)", kanan: "Feeling (F)" },
  JP: { kiri: "Judging (J)", kanan: "Perceiving (P)" },
}

export const deskripsiTipe: Record<string, { title: string; desc: string; role: string; strengths: string[]; weaknesses: string[] }> = {
  INTJ: {
    title: "Arsitek",
    desc: "Pemikir strategis dengan visi jangka panjang. Mandiri, analitis, dan selalu punya rencana.",
    role: "Ahli strategi, ilmuwan, arsitek sistem",
    strengths: ["Visioner", "Analitis", "Mandiri", "Tekun", "Terorganisir"],
    weaknesses: ["Kurang peka sosial", "Terlalu perfeksionis", "Cenderung kaku"],
  },
  INTP: {
    title: "Pemikir",
    desc: "Inovator logis yang suka memecahkan masalah kompleks. Kreatif, abstrak, dan selalu ingin tahu.",
    role: "Ilmuwan, programmer, filsuf, insinyur",
    strengths: ["Analitis", "Kreatif", "Objektif", "Rasa ingin tahu tinggi"],
    weaknesses: ["Kurang praktis", "Sulit mengekspresikan perasaan", "Cenderung overthink"],
  },
  ENTJ: {
    title: "Komandan",
    desc: "Pemimpin alami yang tegas dan karismatik. Berorientasi pada tujuan dan efisiensi.",
    role: "CEO, manajer, pengusaha, pemimpin proyek",
    strengths: ["Kepemimpinan kuat", "Efisien", "Karismatik", "Strategis"],
    weaknesses: ["Terlalu dominan", "Tidak sabaran", "Kurang empati"],
  },
  ENTP: {
    title: "Inovator",
    desc: "Pemikir cerdas yang suka debat dan tantangan intelektual. Serba bisa dan penuh ide.",
    role: "Pengusaha, pengacara, konsultan, penemu",
    strengths: ["Cerdas", "Serba bisa", "Inovatif", "Karismatik"],
    weaknesses: ["Argumentatif", "Kurang konsisten", "Mudah bosan"],
  },
  INFJ: {
    title: "Penasihat",
    desc: "Idealis yang empatik dengan visi kuat untuk masa depan. Pendiam tapi berpengaruh.",
    role: "Konselor, penulis, psikolog, guru",
    strengths: ["Empati tinggi", "Intuitif", "Idealis", "Bijaksana"],
    weaknesses: ["Terlalu perfeksionis", "Mudah kelelahan", "Terlalu sensitif"],
  },
  INFP: {
    title: "Mediator",
    desc: "Penuh idealisme dan nilai-nilai luhur. Kreatif, peduli, dan selalu mencari makna.",
    role: "Penulis, seniman, konselor, desainer",
    strengths: ["Kreatif", "Empati", "Idealis", "Setia pada nilai"],
    weaknesses: ["Terlalu idealis", "Sulit menerima kritik", "Cenderung overthink"],
  },
  ENFJ: {
    title: "Protagonis",
    desc: "Pemimpin karismatik yang menginspirasi orang lain. Hangat, persuasif, dan peduli.",
    role: "Guru, motivator, pemimpin tim, HRD",
    strengths: ["Karismatik", "Persuasif", "Empati", "Menginspirasi"],
    weaknesses: ["Terlalu peduli pada orang lain", "Idealisme berlebihan", "Kritis pada diri sendiri"],
  },
  ENFP: {
    title: "Juara",
    desc: "Semangat bebas yang kreatif dan antusias. Penuh energi, optimis, dan suka petualangan.",
    role: "Kreator, jurnalis, konselor, wirausaha",
    strengths: ["Antusias", "Kreatif", "Ramah", "Optimis"],
    weaknesses: ["Kurang fokus", "Terlalu emosional", "Sulit dengan rutinitas"],
  },
  ISTJ: {
    title: "Pelaksana",
    desc: "Tanggung jawab, dapat diandalkan, dan sangat terorganisir. Pilar stabilitas dalam setiap tim.",
    role: "Akuntan, auditor, manajer, administrator",
    strengths: ["Bertanggung jawab", "Teliti", "Konsisten", "Loyal"],
    weaknesses: ["Kaku", "Sulit beradaptasi", "Kurang fleksibel"],
  },
  ISFJ: {
    title: "Pelindung",
    desc: "Penjaga tradisi yang hangat dan penuh perhatian. Selalu siap membantu orang lain.",
    role: "Perawat, guru, pekerja sosial, admin",
    strengths: ["Setia", "Praktis", "Penuh perhatian", "Teliti"],
    weaknesses: ["Terlalu mengalah", "Takut perubahan", "Sulit mengatakan tidak"],
  },
  ESTJ: {
    title: "Pengawas",
    desc: "Praktis, tegas, dan berorientasi pada hasil. Penegak aturan yang efisien.",
    role: "Manajer, pengawas, hakim, militer",
    strengths: ["Tegas", "Efisien", "Praktis", "Terorganisir"],
    weaknesses: ["Kaku", "Terlalu dominan", "Kurang peka"],
  },
  ESFJ: {
    title: "Konsul",
    desc: "Populer dan peduli pada kesejahteraan orang lain. Suka bekerja sama dan membantu.",
    role: "HRD, perawat, guru, event organizer",
    strengths: ["Ramah", "Peduli", "Kooperatif", "Praktis"],
    weaknesses: ["Terlalu bergantung pada opini orang", "Kurang fleksibel", "Terlalu sensitif"],
  },
  ISTP: {
    title: "Pengrajin",
    desc: "Pemecah masalah praktis yang suka bekerja dengan tangan. Tenang, mandiri, dan tanggap.",
    role: "Teknisi, insinyur, pilot, atlet",
    strengths: ["Praktis", "Mandiri", "Tanggap", "Kreatif dalam krisis"],
    weaknesses: ["Kurang komunikatif", "Mudah bosan", "Sulit berkomitmen"],
  },
  ISFP: {
    title: "Petualang",
    desc: "Seniman yang pendiam dan penuh gairah. Menghargai keindahan dan kebebasan.",
    role: "Seniman, desainer, musisi, fotografer",
    strengths: ["Kreatif", "Hangat", "Setia", "Peka terhadap keindahan"],
    weaknesses: ["Terlalu sensitif", "Kurang tegas", "Cenderung menghindari konflik"],
  },
  ESTP: {
    title: "Pelaku",
    desc: "Enerjik, berani, dan suka tantangan. Ahli dalam membaca situasi dan bertindak cepat.",
    role: "Sales, wirausaha, atlet, detektif",
    strengths: ["Berani", "Karismatik", "Praktis", "Cepat bertindak"],
    weaknesses: ["Kurang sabar", "Cenderung mengambil risiko", "Kurang sensitif"],
  },
  ESFP: {
    title: "Penghibur",
    desc: "Hidup dan ceria, selalu menjadi pusat perhatian. Membawa keceriaan di mana pun berada.",
    role: "Entertainer, public relation, event planner, pelatih",
    strengths: ["Ceria", "Ramah", "Spontan", "Praktis"],
    weaknesses: ["Kurang fokus", "Terlalu impulsif", "Kurang perencanaan"],
  },
}

export function getDeskripsi(tipe: string) {
  return deskripsiTipe[tipe] || deskripsiTipe.INTJ
}
