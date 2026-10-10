export interface MbtiQuestion {
  id: number
  text: string
  dimensi: "EI" | "SN" | "TF" | "JP"
  arah: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P"
}

export const questions: MbtiQuestion[] = [
  // ==========================================
  // E/I — Extraversion vs Introversion (12 Soal)
  // ==========================================
  { id: 1, text: "Setelah menghabiskan waktu berinteraksi dan berdiskusi dengan banyak orang, saya merasa lebih bersemangat dan berenergi.", dimensi: "EI", arah: "E" },
  { id: 2, text: "Saya lebih menikmati bekerja secara mandiri dan fokus dalam suasana yang tenang daripada berada dalam tim yang ramai.", dimensi: "EI", arah: "I" },
  { id: 3, text: "Saya mudah dan percaya diri mengawali percakapan dengan rekan atau orang yang baru saya kenal.", dimensi: "EI", arah: "E" },
  { id: 4, text: "Dalam pertemuan atau diskusi kelompok, saya lebih suka mendengarkan dan mencermati daripada banyak berbicara.", dimensi: "EI", arah: "I" },
  { id: 5, text: "Saya merasa nyaman dan antusias saat menjadi pusat perhatian atau berbicara aktif di hadapan banyak orang.", dimensi: "EI", arah: "E" },
  { id: 6, text: "Saya memerlukan waktu tenang menyendiri untuk mengisi ulang energi mental setelah seharian beraktivitas sosial.", dimensi: "EI", arah: "I" },
  { id: 7, text: "Saya cenderung memproses pikiran dengan menyuarakannya langsung dan berdiskusi bersama orang lain.", dimensi: "EI", arah: "E" },
  { id: 8, text: "Saya lebih suka memikirkan dan merenungkan suatu gagasan matang-matang dalam hati sebelum mengungkapkannya.", dimensi: "EI", arah: "I" },
  { id: 9, text: "Saya senang memiliki lingkungan pergaulan yang luas dan mudah berbaur dengan berbagai lingkaran pertemanan.", dimensi: "EI", arah: "E" },
  { id: 10, text: "Saya lebih nyaman menjalin hubungan mendalam dengan segelintir teman dekat daripada mengenal banyak orang secara sepintas.", dimensi: "EI", arah: "I" },
  { id: 11, text: "Saya cepat merasa jenuh atau kesepian jika harus berdiam diri sendirian tanpa interaksi dalam waktu lama.", dimensi: "EI", arah: "E" },
  { id: 12, text: "Saya lebih suka mengekspresikan pikiran dan gagasan penting melalui tulisan daripada percakapan lisan spontan.", dimensi: "EI", arah: "I" },

  // ==========================================
  // S/N — Sensing vs Intuition (12 Soal)
  // ==========================================
  { id: 13, text: "Saya lebih memercayai fakta konkret, data nyata, dan bukti yang teramati daripada teori-teori abstrak.", dimensi: "SN", arah: "S" },
  { id: 14, text: "Saya senang membayangkan berbagai kemungkinan masa depan, gagasan konseptual, dan potensi inovasi baru.", dimensi: "SN", arah: "N" },
  { id: 15, text: "Saya sangat teliti dan cermat memperhatikan detail-detail kecil serta rincian teknis dalam setiap pekerjaan.", dimensi: "SN", arah: "S" },
  { id: 16, text: "Saya lebih tertarik memahami gambaran besar (big picture) dan visi utama daripada terpaku pada detail teknis.", dimensi: "SN", arah: "N" },
  { id: 17, text: "Saya menyukai petunjuk kerja yang jelas, prosedural, dan tahapan langkah demi langkah yang sudah terbukti efektif.", dimensi: "SN", arah: "S" },
  { id: 18, text: "Saya sering menemukan pola-pola tersembunyi, hubungan antarkonsep yang berbeda, dan makna di balik suatu peristiwa.", dimensi: "SN", arah: "N" },
  { id: 19, text: "Saya lebih fokus pada situasi saat ini dan apa yang dapat diterapkan secara praktis di dunia nyata.", dimensi: "SN", arah: "S" },
  { id: 20, text: "Saya gemar memikirkan teori, filosofi, analogi, dan arti tersirat di balik suatu hal daripada sekadar apa yang tampak.", dimensi: "SN", arah: "N" },
  { id: 21, text: "Saya lebih menghargai metode tradisional yang sudah teruji keandalannya daripada eksperimen baru yang belum pasti.", dimensi: "SN", arah: "S" },
  { id: 22, text: "Saya bersemangat merancang cara-cara orisinal yang belum pernah dilakukan sebelumnya demi kemajuan masa depan.", dimensi: "SN", arah: "N" },
  { id: 23, text: "Saya belajar paling mudah melalui contoh riil, peragaan langsung, dan aplikasi praktis sehari-hari.", dimensi: "SN", arah: "S" },
  { id: 24, text: "Saya lebih tertarik pada ide-ide visioner dan inovatif yang mampu mengubah tatanan lama ke arah yang lebih baik.", dimensi: "SN", arah: "N" },

  // ==========================================
  // T/F — Thinking vs Feeling (12 Soal)
  // ==========================================
  { id: 25, text: "Dalam mengambil keputusan penting, saya mengutamakan pertimbangan logika rasional dan analisis objektif.", dimensi: "TF", arah: "T" },
  { id: 26, text: "Saya sangat mempertimbangkan perasaan dan dampak emosional terhadap orang lain sebelum membuat keputusan.", dimensi: "TF", arah: "F" },
  { id: 27, text: "Saya lebih mengutamakan kejujuran dan kebenaran faktual, meskipun hal itu terkadang terasa tegas bagi orang lain.", dimensi: "TF", arah: "T" },
  { id: 28, text: "Saya memiliki kepekaan empati yang tinggi dan mudah merasakan apa yang sedang dialami oleh orang di sekitar saya.", dimensi: "TF", arah: "F" },
  { id: 29, text: "Saya percaya keputusan yang adil adalah keputusan yang didasarkan pada aturan konsisten dan perlakuan setara tanpa memihak.", dimensi: "TF", arah: "T" },
  { id: 30, text: "Bagi saya, menjaga keharmonisan hubungan dan kehangatan tim jauh lebih penting daripada memenangkan perdebatan.", dimensi: "TF", arah: "F" },
  { id: 31, text: "Saya mampu bersikap tenang, berkepala dingin, dan tidak mudah terbawa emosi saat menghadapi masalah atau konflik rumit.", dimensi: "TF", arah: "T" },
  { id: 32, text: "Saya mudah terenyuh dan tergerak untuk memberikan bantuan atau kompromi ketika melihat seseorang sedang kesulitan.", dimensi: "TF", arah: "F" },
  { id: 33, text: "Saya cenderung mengevaluasi suatu gagasan secara kritis untuk menemukan celah kekurangannya demi efisiensi optimal.", dimensi: "TF", arah: "T" },
  { id: 34, text: "Saya senang memberikan apresiasi tulus dan dukungan moral untuk membangkitkan rasa percaya diri rekan atau siswa.", dimensi: "TF", arah: "F" },
  { id: 35, text: "Saya menilai suatu keberhasilan berdasarkan tolok ukur hasil kerja yang terukur, efektif, dan sesuai standar rasional.", dimensi: "TF", arah: "T" },
  { id: 36, text: "Saya mempertimbangkan kondisi khusus dan latar belakang personal seseorang daripada memaksakan aturan baku secara kaku.", dimensi: "TF", arah: "F" },

  // ==========================================
  // J/P — Judging vs Perceiving (12 Soal)
  // ==========================================
  { id: 37, text: "Saya terbiasa membuat perencanaan terstruktur, jadwal teratur, dan daftar kegiatan sebelum memulai pekerjaan.", dimensi: "JP", arah: "J" },
  { id: 38, text: "Saya lebih menyukai ritme kerja yang santai, dinamis, dan memiliki ruang kebebasan untuk bertindak secara spontan.", dimensi: "JP", arah: "P" },
  { id: 39, text: "Saya merasa terganggu dan tidak nyaman jika suasana kerja tidak menentu atau hal-hal berjalan di luar rencana.", dimensi: "JP", arah: "J" },
  { id: 40, text: "Saya lebih suka membiarkan berbagai opsi tetap terbuka daripada terburu-buru mengunci sebuah keputusan final.", dimensi: "JP", arah: "P" },
  { id: 41, text: "Saya selalu berusaha menyelesaikan tugas dan tanggung jawab jauh sebelum batas waktu (deadline) berakhir.", dimensi: "JP", arah: "J" },
  { id: 42, text: "Saya mampu beradaptasi dengan cepat dan tetap tenang ketika terjadi perubahan mendadak di menit-menit terakhir.", dimensi: "JP", arah: "P" },
  { id: 43, text: "Bagi saya, kepastian dan kejelasan arah kerja jauh lebih baik daripada situasi yang mengambang dan fleksibel berlebihan.", dimensi: "JP", arah: "J" },
  { id: 44, text: "Kreativitas dan semangat kerja saya justru sering muncul secara optimal ketika waktu mendekati batas akhir pengerjaan.", dimensi: "JP", arah: "P" },
  { id: 45, text: "Saya senang menjaga meja kerja, dokumen, dan jadwal selalu tertata rapi, sistematis, dan terorganisir.", dimensi: "JP", arah: "J" },
  { id: 46, text: "Saya menikmati proses eksplorasi dan mencoba berbagai cara baru daripada terikat pada prosedur tetap yang monoton.", dimensi: "JP", arah: "P" },
  { id: 47, text: "Saya lebih suka menyelesaikan satu pekerjaan hingga tuntas sebelum memulai pekerjaan atau proyek berikutnya.", dimensi: "JP", arah: "J" },
  { id: 48, text: "Saya menyukai variasi dan fleksibilitas tinggi, serta merasa terkekang jika rutinitas harian terlalu kaku dan ketat.", dimensi: "JP", arah: "P" },
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
    title: "Arsitek (Strategis & Visioner)",
    desc: "Pemikir strategis dengan visi jangka panjang yang jelas. Mandiri, analitis, dan memiliki standar keunggulan tinggi dalam setiap tugas profesional.",
    role: "Ahli strategi, perancang kurikulum, ilmuwan, arsitek sistem edukasi",
    strengths: ["Visioner", "Analitis Tajam", "Mandiri", "Tekun", "Terorganisir Sistematis"],
    weaknesses: ["Cenderung kaku terhadap perubahan mendadak", "Standar terlalu tinggi", "Kurang sabar dengan inefisiensi"],
  },
  INTP: {
    title: "Pemikir (Inovator Logis)",
    desc: "Inovator cerdas yang gemar memecahkan masalah kompleks dan teka-teki logika. Senang mengkaji teori, mendalam, dan memiliki rasa ingin tahu intelektual yang luas.",
    role: "Peneliti, analis data, pengembang metode inovatif, filsuf akademisi",
    strengths: ["Kritis Logis", "Kreatif Mengembangkan Konsep", "Objektif Imparsial", "Rasa Ingin Tahu Tinggi"],
    weaknesses: ["Kurang menyukai rutinitas administratif", "Kadang sulit mengekspresikan perasaan", "Cenderung overthinking"],
  },
  ENTJ: {
    title: "Komandan (Pemimpin Berorientasi Sasaran)",
    desc: "Pemimpin visioner yang tegas, berani mengambil keputusan sulit, dan sangat berorientasi pada pencapaian sasaran nyata serta efisiensi organisasi.",
    role: "Kepala sekolah, koordinator program, manajer proyek, pengarah kurikulum",
    strengths: ["Kepemimpinan Alami Kuat", "Efisien & Terstruktur", "Tegas Mengambil Keputusan", "Strategis"],
    weaknesses: ["Bisa terkesan terlalu menuntut", "Kurang sabar menghadapi kelambatan", "Perlu meningkatkan empati personal"],
  },
  ENTP: {
    title: "Inovator (Kreatif & Penggagas Ide)",
    desc: "Pribadi cerdas, energik, dan serba bisa yang gemar mengeksplorasi ide-ide baru serta menantang batas konvensional demi terobosan segar.",
    role: "Inovator pembelajaran, konsultan, fasilitator diskusi, penggagas proyek kreatif",
    strengths: ["Inovatif & Banyak Akal", "Komunikasi Persuasif", "Adaptif Tinggi", "Wawasan Luas"],
    weaknesses: ["Cepat bosan dengan detail rutin", "Kadang terlalu senang berdebat", "Perlu disiplin menuntaskan implementasi"],
  },
  INFJ: {
    title: "Penasihat (Idealis Berwawasan Mendalam)",
    desc: "Pribadi idealis yang bijaksana, memiliki empati mendalam, dan komitmen tulus untuk membimbing serta mengembangkan potensi sesama manusia.",
    role: "Guru Bimbingan Konseling (BK), mentor pembina, psikolog edukasi, penulis buku ajar",
    strengths: ["Empati Mendalam", "Intuitif Membaca Potensi Siswa", "Idealis Bermakna", "Bijaksana"],
    weaknesses: ["Rentan mengalami kelelahan emosional (burnout)", "Perfeksionis terhadap misi pribadi", "Tertutup saat tertekan"],
  },
  INFP: {
    title: "Mediator (Penuh Empati & Humanis)",
    desc: "Pribadi hangat yang berpegang teguh pada nilai-nilai luhur dan kebaikan hati. Selalu melihat sisi terbaik dalam diri orang lain dan mencintai keaslian diri.",
    role: "Pendidik humanis, penulis sastra, konselor minat bakat, fasilitator karakter",
    strengths: ["Kreatif & Berjiwa Seni", "Penuh Welas Asih", "Menghargai Keunikan Siswa", "Setia pada Nilai Kebajikan"],
    weaknesses: ["Sangat sensitif terhadap kritik", "Kadang kurang praktis dalam eksekusi", "Sulit bersikap tegas dalam konflik"],
  },
  ENFJ: {
    title: "Protagonis (Penginspirasi Karismatik)",
    desc: "Pendidik karismatik yang mampu menginspirasi, memotivasi, dan menyatukan kelompok untuk mencapai tujuan mulia bersama dengan penuh kepedulian.",
    role: "Guru teladan, pembina kesiswaan, motivator pendidikan, pemimpin komunitas belajar",
    strengths: ["Karismatik Menginspirasi", "Komunikator Ulung", "Peka Kebutuhan Siswa", "Pembangun Semangat Tim"],
    weaknesses: ["Rentan terlalu membebani diri demi orang lain", "Sulit menolak permintaan", "Terlalu memikirkan penilaian sosial"],
  },
  ENFP: {
    title: "Sang Inspirator (Antusias & Penuh Semangat)",
    desc: "Pribadi kreatif, hangat, dan bersemangat tinggi yang memandang hidup sebagai petualangan penuh kemungkinan. Mampu membuat suasana belajar menjadi hidup.",
    role: "Guru kreatif, pelatih ekstrakurikuler, pembicara inspiratif, perancang modul tematik",
    strengths: ["Energi Positif Menular", "Kreatif Tanpa Batas", "Ramah & Hangat", "Mudah Beradaptasi"],
    weaknesses: ["Kurang konsisten dalam administrasi detail", "Mudah terdistraksi ide baru", "Mudah cemas bila terlalu terkekang"],
  },
  ISTJ: {
    title: "Pelaksana (Disiplin & Terpercaya)",
    desc: "Sosok yang berdedikasi tinggi, teliti, taat asas, dan sangat dapat diandalkan. Menjadi pilar stabilitas dan ketertiban di lingkungan sekolah.",
    role: "Wakil kepala sekolah bidang kurikulum/administrasi, penguji, pengelola asesmen, auditor mutu",
    strengths: ["Sangat Bertanggung Jawab", "Disiplin Tepat Waktu", "Teliti Mengelola Data", "Konsisten & Loyal"],
    weaknesses: ["Kaku terhadap perubahan aturan mendadak", "Cenderung skeptis pada ide yang belum terbukti", "Kurang spontan"],
  },
  ISFJ: {
    title: "Pelindung (Setia & Berdedikasi)",
    desc: "Pendidik yang berhati lembut, penuh perhatian, dan telaten. Selalu memastikan kebutuhan murid dan lingkungan kelas aman, nyaman, dan terayomi.",
    role: "Wali kelas teladan, pendidik nilai moral, pembina kedisiplinan ramah, pengasuh asrama",
    strengths: ["Penuh Perhatian & Telaten", "Dapat Diandalkan", "Rapi & Teratur", "Peka Kesejahteraan Siswa"],
    weaknesses: ["Enggan menerima perubahan mendadak", "Sulit berkata 'tidak'", "Cenderung memendam beban perasaan"],
  },
  ESTJ: {
    title: "Pengawas (Pengorganisir Andal & Tegas)",
    desc: "Sosok praktis, terstruktur, dan tegas dalam menegakkan standar kedisiplinan serta target kinerja yang jelas dan terukur.",
    role: "Pembina ketertiban sekolah, koordinator acara besar, pengelola sarana prasarana, pengarah tim",
    strengths: ["Tegas & Lugas", "Keahlian Organisasi Tinggi", "Efisien & Teratur", "Loyal pada Komitmen"],
    weaknesses: ["Bisa terkesan kaku atau kurang fleksibel", "Kurang peka pada alasan personal", "Standar kepatuhan sangat ketat"],
  },
  ESFJ: {
    title: "Konsul (Harmonis & Penuh Kepedulian)",
    desc: "Pribadi ramah, kooperatif, dan penuh perhatian yang selalu berupaya menciptakan suasana kekeluargaan yang guyub dan harmonis di lingkungan kerja.",
    role: "Hubungan Masyarakat (Humas) sekolah, pembina OSIS, koordinator paguyuban kelas, guru inklusif",
    strengths: ["Hangat & Ramah", "Pembangun Hubungan Harmonis", "Pekerja Keras", "Suka Menolong"],
    weaknesses: ["Mudah terluka oleh penolakan atau kritik", "Rentan cemas bila terjadi konflik", "Perlu keberanian bersikap tegas"],
  },
  ISTP: {
    title: "Pengrajin (Praktisi Tanggap & Solutif)",
    desc: "Pribadi tenang, analitis praktis, dan cekatan dalam mencari solusi efisien di lapangan. Sangat ahli dalam menangani masalah teknis dan situasi tak terduga.",
    role: "Guru praktikum/teknologi/informatika, teknisi laboratorium, pembina robotik/olahraga",
    strengths: ["Tanggap Menghadapi Masalah Riil", "Tenang di Bawah Tekanan", "Logis & Objektif", "Praktis Berorientasi Solusi"],
    weaknesses: ["Kurang menyukai formalitas berbelit", "Pendiam dalam urusan emosional", "Mudah jenuh dengan ceramah panjang"],
  },
  ISFP: {
    title: "Petualang (Seniman Berjiwa Lembut)",
    desc: "Sosok pendiam yang ramah, berjiwa seni, dan memiliki kepekaan estetika tinggi. Menghargai kebebasan berekspresi dan memperlakukan setiap orang dengan tulus.",
    role: "Guru seni budaya, pelatih desain grafis, pendamping kreativitas, pembina lingkungan",
    strengths: ["Kreativitas Estetika Tinggi", "Fleksibel & Terbuka", "Hangat Tanpa Menghakimi", "Rendah Hati"],
    weaknesses: ["Menghindari konfrontasi langsung", "Kurang menyukai perencanaan jangka panjang yang kaku", "Mudah merasa tertekan"],
  },
  ESTP: {
    title: "Pelaku (Dinamis, Berani, & Aplikatif)",
    desc: "Sosok berenergi tinggi, spontan, dan berorientasi pada tindakan nyata. Sangat piawai menghidupkan suasana kelas melalui aktivitas aktif dan interaktif.",
    role: "Guru PJOK/olahraga, pembina pramuka/lapangan, penggerak kegiatan aksi nyata, wirausahawan sekolah",
    strengths: ["Cepat Mengambil Tindakan", "Karismatik & Dinamis", "Praktis di Lapangan", "Adaptif dalam Situasi Darurat"],
    weaknesses: ["Cenderung tidak sabar dengan teori berpanjang-lebar", "Bisa bersikap impulsif", "Kurang menyukai regulasi berlebihan"],
  },
  ESFP: {
    title: "Penghibur (Spontan, Hangat, & Menyenangkan)",
    desc: "Pribadi ceria, ramah, dan penuh semangat yang mampu membuat proses belajar terasa seru dan mengasyikkan. Dicintai murid karena keterbukaan dan keceriaannya.",
    role: "Pendidik interaktif, pelatih seni peran/tari, pembawa acara (MC) sekolah, pemandu outbound",
    strengths: ["Sangat Komunikatif & Ceria", "Mudah Menarik Perhatian Murid", "Praktis & Spontan", "Empati Tinggi"],
    weaknesses: ["Mudah teralihkan fokusnya", "Kurang menyukai analisis data teoritis", "Perlu disiplin perencanaan jadwal"],
  },
}

export function getDeskripsi(tipe: string) {
  return deskripsiTipe[tipe] || deskripsiTipe.INTJ
}
