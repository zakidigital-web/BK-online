export interface MbtiQuestion {
  id: number
  text: string
  dimensi: "EI" | "SN" | "TF" | "JP"
  arah: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P"
}

// =========================================================================
// 1. BANK SOAL MBTI SISWA (48 SOAL)
// Bahasa: Santai, sopan, mudah dipahami siswa SMP/remaja, kontekstual sekolah & pertemanan
// =========================================================================
export const questionsSiswa: MbtiQuestion[] = [
  // E/I — Extraversion vs Introversion (12 Soal)
  { id: 1, text: "Setelah seharian seru-seruan dan ngobrol bareng teman-teman di sekolah, energiku rasanya bertambah dan semakin semangat.", dimensi: "EI", arah: "E" },
  { id: 2, text: "Aku lebih nyaman belajar atau ngerjain tugas sendiri di tempat yang tenang daripada di tempat yang ramai.", dimensi: "EI", arah: "I" },
  { id: 3, text: "Aku gampang akrab dan nggak canggung saat berkenalan atau menyapa teman baru.", dimensi: "EI", arah: "E" },
  { id: 4, text: "Pas kerja kelompok atau diskusi kelas, aku lebih suka mendengarkan teman bicara daripada banyak mengobrol.", dimensi: "EI", arah: "I" },
  { id: 5, text: "Aku merasa percaya diri dan senang saat tampil atau berbicara di depan kelas.", dimensi: "EI", arah: "E" },
  { id: 6, text: "Sehabis kegiatan sekolah yang ramai, aku butuh waktu istirahat sendirian di kamar untuk recharge energiku.", dimensi: "EI", arah: "I" },
  { id: 7, text: "Kalau lagi memikirkan ide seru, aku suka langsung menceritakan dan mendiskusikannya ke teman.", dimensi: "EI", arah: "E" },
  { id: 8, text: "Aku lebih suka memikirkan masak-masak dalam hati terlebih dulu sebelum menyampaikan pendapatku ke orang lain.", dimensi: "EI", arah: "I" },
  { id: 9, text: "Aku punya banyak teman dari berbagai kelas dan senang ikut kumpul-kumpul bareng.", dimensi: "EI", arah: "E" },
  { id: 10, text: "Aku lebih nyaman punya sedikit sahabat dekat yang saling memahami daripada punya banyak kenalan biasa.", dimensi: "EI", arah: "I" },
  { id: 11, text: "Kalau seharian di rumah sendirian tanpa kabar dari teman, aku cepat merasa bosan atau sepi.", dimensi: "EI", arah: "E" },
  { id: 12, text: "Aku merasa lebih lancar menyampaikan isi hati lewat ketikan chat atau tulisan daripada bicara langsung.", dimensi: "EI", arah: "I" },

  // S/N — Sensing vs Intuition (12 Soal)
  { id: 13, text: "Aku lebih mudah paham materi pelajaran kalau ada contoh nyata, gambar jelas, atau praktik langsung.", dimensi: "SN", arah: "S" },
  { id: 14, text: "Aku sering berimajinasi tentang hal-hal keren di masa depan dan ide-ide unik yang belum pernah dibuat orang lain.", dimensi: "SN", arah: "N" },
  { id: 15, text: "Aku orang yang teliti saat membaca soal atau mengerjakan tugas, sampai ke detail-detail kecilnya.", dimensi: "SN", arah: "S" },
  { id: 16, text: "Aku lebih suka memahami inti garis besarnya dulu daripada pusing menghafal rincian kecil yang rumit.", dimensi: "SN", arah: "N" },
  { id: 17, text: "Aku suka tugas sekolah yang petunjuk pengerjaannya jelas dan langkah-langkahnya pasti.", dimensi: "SN", arah: "S" },
  { id: 18, text: "Aku suka menghubungkan pelajaran dengan hal-hal menarik di sekitarku atau arti rahasia di balik suatu cerita.", dimensi: "SN", arah: "N" },
  { id: 19, text: "Aku tipe orang yang fokus pada apa yang sedang terjadi sekarang di dunia nyata daripada melamun.", dimensi: "SN", arah: "S" },
  { id: 20, text: "Aku suka penasaran dengan pertanyaan filosofis, teori seru, atau misteri yang bikin berpikir mendalam.", dimensi: "SN", arah: "N" },
  { id: 21, text: "Aku lebih suka memakai cara belajar yang sudah terbukti berhasil daripada coba-coba cara baru yang belum tentu cocok.", dimensi: "SN", arah: "S" },
  { id: 22, text: "Aku bersemangat kalau diajak membuat karya dengan cara kreatif yang belum pernah dipakai teman lain.", dimensi: "SN", arah: "N" },
  { id: 23, text: "Aku lebih suka membaca fakta nyata atau berita fakta daripada cerita fiksi yang penuh imajinasi bebas.", dimensi: "SN", arah: "S" },
  { id: 24, text: "Aku senang membayangkan cita-cita dan mimpi besar masa depan yang bisa bikin dunia jadi lebih baik.", dimensi: "SN", arah: "N" },

  // T/F — Thinking vs Feeling (12 Soal)
  { id: 25, text: "Saat memutuskan sesuatu, aku lebih mengutamakan logika mana yang masuk akal dan adil bagi semua orang.", dimensi: "TF", arah: "T" },
  { id: 26, text: "Sebelum memutuskan sesuatu, aku selalu memikirkan perasaan teman dan nggak mau membuat orang lain sakit hati.", dimensi: "TF", arah: "F" },
  { id: 27, text: "Bagi aku, berkata jujur sesuai fakta itu paling utama, meskipun terkadang terdengar tegas.", dimensi: "TF", arah: "T" },
  { id: 28, text: "Aku mudah merasakan apa yang sedang dirasakan teman, misalnya ikut sedih kalau ada teman yang murung.", dimensi: "TF", arah: "F" },
  { id: 29, text: "Aturan permainan atau tugas kelompok harus ditegakkan sama rata untuk semua orang tanpa pilih kasih.", dimensi: "TF", arah: "T" },
  { id: 30, text: "Bagiku, menjaga kerukunan dan kekompakan pertemanan lebih penting daripada ngotot menang adu argumen.", dimensi: "TF", arah: "F" },
  { id: 31, text: "Ketika menghadapi masalah sulit, aku bisa tetap tenang dan berkepala dingin mencari jalan keluar.", dimensi: "TF", arah: "T" },
  { id: 32, text: "Aku nggak tega dan langsung tergerak menolong saat melihat teman yang lagi kesulitan atau kena masalah.", dimensi: "TF", arah: "F" },
  { id: 33, text: "Aku gampang melihat kekurangan atau celah dalam suatu rencana agar hasilnya bisa lebih bagus dan efektif.", dimensi: "TF", arah: "T" },
  { id: 34, text: "Aku suka memberikan pujian atau semangat tulus saat melihat teman berhasil atau sedang berjuang.", dimensi: "TF", arah: "F" },
  { id: 35, text: "Menurutku tugas yang sukses adalah tugas yang selesai tepat target, rapi, dan hasilnya terbukti benar.", dimensi: "TF", arah: "T" },
  { id: 36, text: "Aku memaklumi teman yang berbuat salah kalau memang dia lagi ada masalah keluarga atau kondisi tertentu.", dimensi: "TF", arah: "F" },

  // J/P — Judging vs Perceiving (12 Soal)
  { id: 37, text: "Aku terbiasa mencatat jadwal dan membuat daftar kegiatan sebelum mulai belajar atau beraktivitas.", dimensi: "JP", arah: "J" },
  { id: 38, text: "Aku lebih suka belajar dengan santai, mengalir, dan bebas menentukan apa yang ingin kukerjakan saat itu.", dimensi: "JP", arah: "P" },
  { id: 39, text: "Aku merasa nggak nyaman dan gelisah kalau jadwal rencanaku tiba-tiba berantakan tanpa kepastian.", dimensi: "JP", arah: "J" },
  { id: 40, text: "Aku suka fleksibel dan membiarkan pilihan terbuka daripada buru-buru mengunci satu keputusan.", dimensi: "JP", arah: "P" },
  { id: 41, text: "Aku selalu berusaha menyelesaikan PR atau tugas sekolah jauh-jauh hari sebelum tanggal pengumpulan.", dimensi: "JP", arah: "J" },
  { id: 42, text: "Aku orang yang santai dan cepat beradaptasi kalau ada perubahan mendadak di kelas atau kegiatan sekolah.", dimensi: "JP", arah: "P" },
  { id: 43, text: "Aku lebih tenang kalau tugas dan pembagian peran di kelompok sudah jelas dari awal.", dimensi: "JP", arah: "J" },
  { id: 44, text: "Ide cemerlang dan semangatku malah sering keluar maksimal pas waktu deadline tugas sudah mepet.", dimensi: "JP", arah: "P" },
  { id: 45, text: "Aku suka menjaga tas sekolah, meja belajar, dan buku-bukuku tetap rapi dan teratur.", dimensi: "JP", arah: "J" },
  { id: 46, text: "Aku suka mencoba cara-cara baru yang seru daripada harus selalu mengikuti pola yang sama setiap hari.", dimensi: "JP", arah: "P" },
  { id: 47, text: "Aku lebih lega kalau satu tugas sudah benar-benar selesai sebelum aku mulai mengerjakan tugas lain.", dimensi: "JP", arah: "J" },
  { id: 48, text: "Aku menyukai kebebasan dalam belajar dan merasa bosan kalau rutinitas harian terlalu kaku.", dimensi: "JP", arah: "P" },
]

// =========================================================================
// 2. BANK SOAL MBTI GURU (48 SOAL)
// Bahasa: Profesional, ilmiah-edukatif, kontekstual lingkungan pengajaran & kepemimpinan sekolah
// =========================================================================
export const questionsGuru: MbtiQuestion[] = [
  // E/I — Extraversion vs Introversion (12 Soal)
  { id: 1, text: "Setelah menghabiskan waktu berinteraksi dan berdiskusi dengan banyak rekan guru atau siswa, saya merasa lebih bersemangat dan berenergi.", dimensi: "EI", arah: "E" },
  { id: 2, text: "Saya lebih menikmati merancang modul atau bekerja secara mandiri dalam suasana tenang daripada di ruangan yang bising.", dimensi: "EI", arah: "I" },
  { id: 3, text: "Saya mudah dan percaya diri mengawali percakapan dengan rekan sejawat, wali murid, atau orang yang baru saya kenal.", dimensi: "EI", arah: "E" },
  { id: 4, text: "Dalam rapat dewan guru atau forum musyawarah, saya cenderung lebih banyak mendengarkan dan mencermati sebelum berpendapat.", dimensi: "EI", arah: "I" },
  { id: 5, text: "Saya merasa nyaman, antusias, dan percaya diri saat menjadi pusat perhatian atau berbicara di hadapan audiens besar.", dimensi: "EI", arah: "E" },
  { id: 6, text: "Saya memerlukan waktu tenang menyendiri untuk mengisi ulang energi mental setelah seharian penuh mendampingi siswa.", dimensi: "EI", arah: "I" },
  { id: 7, text: "Saya cenderung memproses gagasan dengan menyuarakannya langsung dalam diskusi tim pendidik.", dimensi: "EI", arah: "E" },
  { id: 8, text: "Saya lebih suka merenungkan gagasan pedagogis matang-matang dalam hati sebelum menyampaikannya di forum.", dimensi: "EI", arah: "I" },
  { id: 9, text: "Saya senang memiliki jejaring pergaulan luas dan mudah berkolaborasi lintas instansi atau lintas komunitas guru.", dimensi: "EI", arah: "E" },
  { id: 10, text: "Saya lebih nyaman menjalin relasi profesional yang mendalam dengan beberapa rekan kerja terdekat daripada banyak kenalan selintas.", dimensi: "EI", arah: "I" },
  { id: 11, text: "Saya cepat merasa jenuh jika harus bekerja sendirian dalam jangka waktu lama tanpa interaksi sosial.", dimensi: "EI", arah: "E" },
  { id: 12, text: "Saya lebih efektif mengekspresikan telaah pikiran dan instruksi penting melalui media tulisan daripada penyampaian lisan spontan.", dimensi: "EI", arah: "I" },

  // S/N — Sensing vs Intuition (12 Soal)
  { id: 13, text: "Saya lebih memercayai data nyata, fakta konkret hasil belajar siswa, dan bukti teramati daripada teori-teori abstrak.", dimensi: "SN", arah: "S" },
  { id: 14, text: "Saya senang merancang kemungkinan masa depan, gagasan konseptual, dan potensi inovasi metode pembelajaran baru.", dimensi: "SN", arah: "N" },
  { id: 15, text: "Saya sangat cermat memperhatikan detail administrasi, ketelitian rubrik penilaian, dan rincian teknis pembelajaran.", dimensi: "SN", arah: "S" },
  { id: 16, text: "Saya lebih berfokus pada visi besar capaian pendidikan sekolah daripada terpaku pada kerumitan rincian teknis kecil.", dimensi: "SN", arah: "N" },
  { id: 17, text: "Saya menyukai pedoman kerja dan perangkat ajar yang prosedural, terstruktur, dan telah terbukti efektif di lapangan.", dimensi: "SN", arah: "S" },
  { id: 18, text: "Saya sering menangkap pola tersembunyi, keterhubungan konsep antar-mata pelajaran, dan makna mendalam di balik peristiwa di kelas.", dimensi: "SN", arah: "N" },
  { id: 19, text: "Fokus utama saya adalah apa yang realistis dan dapat segera dipraktikkan di kelas saat ini juga.", dimensi: "SN", arah: "S" },
  { id: 20, text: "Saya gemar mengkaji teori pendidikan, filosofi kurikulum, dan nilai tersirat di balik setiap proses pembelajaran.", dimensi: "SN", arah: "N" },
  { id: 21, text: "Saya lebih menghargai metode konvensional yang sudah teruji keandalannya daripada eksperimen pembelajaran yang belum terukur.", dimensi: "SN", arah: "S" },
  { id: 22, text: "Saya bersemangat menciptakan terobosan pedagogik yang orisinal demi memajukan mutu sekolah di masa depan.", dimensi: "SN", arah: "N" },
  { id: 23, text: "Saya mengajar paling nyaman melalui contoh aplikasi konkret di kehidupan sehari-hari dan simulasi nyata.", dimensi: "SN", arah: "S" },
  { id: 24, text: "Saya tertarik pada ide-ide visioner yang mampu mengubah paradigma lama pendidikan menuju arah yang lebih transformatif.", dimensi: "SN", arah: "N" },

  // T/F — Thinking vs Feeling (12 Soal)
  { id: 25, text: "Dalam mengambil keputusan penting di sekolah, saya mengedepankan analisis objektif dan pertimbangan logika rasional.", dimensi: "TF", arah: "T" },
  { id: 26, text: "Saya sangat mempertimbangkan kondisi emosional dan dampak psikologis terhadap siswa/rekan sebelum mengambil keputusan.", dimensi: "TF", arah: "F" },
  { id: 27, text: "Saya memegang teguh kejujuran objektif dan ketegasan standar mutu, meskipun terkadang terasa berat bagi pihak tertentu.", dimensi: "TF", arah: "T" },
  { id: 28, text: "Saya memiliki kepekaan empati tinggi dan mudah merasakan suasana hati serta pergulatan batin yang dialami siswa.", dimensi: "TF", arah: "F" },
  { id: 29, text: "Keputusan yang adil adalah keputusan yang berlandaskan pada aturan konsisten dan perlakuan setara bagi seluruh siswa.", dimensi: "TF", arah: "T" },
  { id: 30, text: "Bagi saya, merawat keharmonisan hubungan di lingkungan sekolah jauh lebih berharga daripada memenangkan perdebatan gagasan.", dimensi: "TF", arah: "F" },
  { id: 31, text: "Saya mampu bersikap berkepala dingin dan tidak mudah terpengaruh emosi ketika memediasi perselisihan atau krisis.", dimensi: "TF", arah: "T" },
  { id: 32, text: "Saya mudah tersentuh dan tergerak memberikan dispensasi ketika mendapati siswa yang sedang mengalami kendala hidup yang berat.", dimensi: "TF", arah: "F" },
  { id: 33, text: "Saya terbiasa mengevaluasi program kerja secara kritis guna mengeliminasi inefisiensi demi standar keunggulan.", dimensi: "TF", arah: "T" },
  { id: 34, text: "Saya senang memberikan apresiasi tulus dan penguatan moral untuk menumbuhkan rasa percaya diri anak didik.", dimensi: "TF", arah: "F" },
  { id: 35, text: "Saya mengukur keberhasilan program berdasarkan tolok ukur hasil evaluasi yang terukur, akuntabel, dan valid.", dimensi: "TF", arah: "T" },
  { id: 36, text: "Saya selalu mempertimbangkan keunikan latar belakang personal siswa daripada memaksakan regulasi baku secara kaku.", dimensi: "TF", arah: "F" },

  // J/P — Judging vs Perceiving (12 Soal)
  { id: 37, text: "Saya selalu menyusun rencana pelaksanaan pembelajaran, agenda harian, dan tenggat waktu secara terstruktur sebelum beraktivitas.", dimensi: "JP", arah: "J" },
  { id: 38, text: "Saya menyukai dinamika mengajar yang fleksibel, responsif, dan membuka ruang luas untuk improvisasi spontan di kelas.", dimensi: "JP", arah: "P" },
  { id: 39, text: "Saya merasa tidak nyaman jika jadwal sekolah atau rencana kegiatan tiba-tiba berubah tanpa kejelasan koordinasi.", dimensi: "JP", arah: "J" },
  { id: 40, text: "Saya lebih suka membiarkan opsi perencanaan tetap terbuka agar dapat menyesuaikan dengan situasi kelas yang berkembang.", dimensi: "JP", arah: "P" },
  { id: 41, text: "Saya konsisten menyelesaikan pengisian nilai, pelaporan, dan perangkat tugas jauh sebelum batas waktu yang ditentukan.", dimensi: "JP", arah: "J" },
  { id: 42, text: "Saya memiliki daya adaptasi tinggi dan tetap tenang saat harus mengelola perubahan mendadak di menit-menit akhir.", dimensi: "JP", arah: "P" },
  { id: 43, text: "Bagi saya, kepastian alur kerja dan ketertiban sistemik jauh lebih efektif daripada fleksibilitas yang mengambang.", dimensi: "JP", arah: "J" },
  { id: 44, text: "Daya inovasi dan produktivitas saya justru sering mencapai titik optimal ketika menghadapi tenggat waktu pengerjaan.", dimensi: "JP", arah: "P" },
  { id: 45, text: "Saya senang menjaga berkas kurikulum, catatan administrasi, dan ruang kerja selalu tertata rapi dan sistematis.", dimensi: "JP", arah: "J" },
  { id: 46, text: "Saya menikmati mengeksplorasi strategi pembelajaran alternatif daripada terikat pada pola mengajar yang repetitif.", dimensi: "JP", arah: "P" },
  { id: 47, text: "Saya lebih menyukai menyelesaikan satu target kurikulum hingga tuntas sebelum beralih ke proyek pendidikan lainnya.", dimensi: "JP", arah: "J" },
  { id: 48, text: "Saya membutuhkan fleksibilitas otonomi mengajar dan merasa terkekang jika rutinitas sekolah diatur terlalu kaku.", dimensi: "JP", arah: "P" },
]

// Default export untuk backward-compatibility
export const questions = questionsSiswa

export function getQuestionsByRole(role?: string): MbtiQuestion[] {
  if (role && role !== "siswa") {
    return questionsGuru
  }
  return questionsSiswa
}

export function hitungSkor(jawaban: Record<number, number>, customQuestions?: MbtiQuestion[]): Record<string, number> {
  const skor: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
  const qList = customQuestions || questionsSiswa

  for (const [id, nilai] of Object.entries(jawaban)) {
    const q = qList.find((item) => item.id === Number(id))
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

// Deskripsi untuk Siswa (Bahasa ramah, membangkitkan percaya diri, relevan masa sekolah & cita-cita)
export const deskripsiTipeSiswa: Record<string, { title: string; desc: string; role: string; strengths: string[]; weaknesses: string[] }> = {
  INTJ: {
    title: "Sang Arsitek (Pintar Mengatur Strategi)",
    desc: "Kamu adalah pemikir mandiri yang suka menyusun rencana matang. Punya wawasan luas, fokus pada tujuan masa depan, dan suka belajar hal-hal yang menantang.",
    role: "Perencana cerdas, peneliti masa depan, pembuat sistem, ahli teknologi",
    strengths: ["Pikiran logis & tajam", "Mandiri dan mandiri belajar", "Fokus meraih impian", "Suka merancang solusi cerdas"],
    weaknesses: ["Kadang kurang sabar jika rencana berubah mendadak", "Perlu lebih rileks menikmati proses santai bersama teman"],
  },
  INTP: {
    title: "Sang Pemikir (Penemu Kreatif & Logis)",
    desc: "Kamu adalah sosok yang penuh rasa ingin tahu tinggi. Suka mengamati cara kerja sesuatu, jago memecahkan teka-teki logika, dan punya banyak ide orisinal.",
    role: "Penemu ide baru, programmer/ilmuwan, analis teka-teki, pengamat sains",
    strengths: ["Kreatif mencari ide unik", "Pikiran kritis dan objektif", "Senang belajar hal baru", "Terbuka pada wawasan menarik"],
    weaknesses: ["Mudah bosan pada hal yang berulang-ulang", "Sering overthinking saat mengambil keputusan"],
  },
  ENTJ: {
    title: "Sang Pemimpin (Tegas & Semangat Meraih Target)",
    desc: "Kamu punya jiwa kepemimpinan alami! Berani mengambil keputusan, pandai menggerakkan teman-teman dalam tim, dan selalu terdorong untuk meraih hasil terbaik.",
    role: "Ketua organisasi/OSIS, koordinator kelompok, pemimpin proyek masa depan",
    strengths: ["Percaya diri dan tegas", "Pandai mengatur tim kerja", "Berani berbicara dan memimpin", "Fokus mencapai target"],
    weaknesses: ["Bisa terkesan terlalu menuntut jika teman lain lambat", "Perlu mendengarkan perasaan teman lebih lembut"],
  },
  ENTP: {
    title: "Sang Penggagas Ide (Kreatif, Cerdas, & Seru)",
    desc: "Kamu orang yang energik, banyak akal, dan asyik diajak ngobrol. Senang mencari cara-cara baru yang beda dari biasanya dan pintar melihat peluang menarik.",
    role: "Penggagas ide seru, pembicara kreatif, inovator muda, komunikator handal",
    strengths: ["Banyak akal dan cepat tanggap", "Sangat seru saat diajak bertukar pikiran", "Adaptif menghadapi suasana baru", "Percaya diri berekspresi"],
    weaknesses: ["Sering cepat bosan kalau ide sudah mulai dieksekusi rutin", "Perlu konsisten menyelesaikan satu tugas sampai tuntas"],
  },
  INFJ: {
    title: "Sang Sahabat Bijak (Penuh Empati & Berhati Lembut)",
    desc: "Kamu adalah teman yang sangat setia, pendengar yang baik, dan punya kepekaan hati yang mendalam. Selalu tulus membantu teman dan ingin membuat suasana sekitar jadi lebih damai.",
    role: "Pendengar setia, konselor teman sebaya, penulis yang menginspirasi, perawat perdamaian",
    strengths: ["Empati mendalam pada perasaan orang lain", "Bijaksana dan tulus", "Setia kawan dan penuh kepedulian", "Punya visi kebaikan yang kuat"],
    weaknesses: ["Gampang lelah hati kalau terlalu banyak mikirin masalah orang lain", "Cenderung memendam perasaan saat sedih"],
  },
  INFP: {
    title: "Sang Pencerita Berbakat (Tulus, Kreatif, & Berjiwa Seni)",
    desc: "Kamu punya imajinasi yang indah, berhati hangat, dan sangat menghargai kebaikan. Kamu suka berkarya sesuai isi hatimu dan menghargai keunikan setiap orang.",
    role: "Penulis kreatif, seniman/desainer, sahabat penyemangat, aktivis kepedulian",
    strengths: ["Imajinasi dan kreativitas tinggi", "Sangat tulus dan menghargai orang lain", "Penyayang dan pemaaf", "Setia pada prinsip kebaikan"],
    weaknesses: ["Cukup sensitif jika dikritik terlalu keras", "Kadang suka menunda tugas jika mood sedang turun"],
  },
  ENFJ: {
    title: "Sang Penyemangat Hebat (Hangat, Peduli, & Menginspirasi)",
    desc: "Kamu adalah sosok yang menyenangkan, pandai menyemangati teman yang lagi down, dan bisa merangkul siapa saja agar kompak bersama.",
    role: "Penyemangat kelas, penggerak kegiatan sekolah, sahabat semua teman",
    strengths: ["Energi hangat yang bikin teman nyaman", "Mudah membaca kebutuhan orang lain", "Bisa menyatukan teman yang berbeda", "Penuh rasa tanggung jawab"],
    weaknesses: ["Sering lupa istirahat karena terlalu mengutamakan orang lain", "Sulit menolak permintaan tolong dari teman"],
  },
  ENFP: {
    title: "Sang Petualang Kreatif (Ceria, Penuh Semangat, & Eksploratif)",
    desc: "Kehadiranmu selalu membawa keceriaan dan suasana positif! Kamu ramah pada siapa saja, suka mencoba hal baru, dan punya segudang ide seru.",
    role: "Jiwa kreatif kelas, pencair suasana, penggagas kreasi seni, pembawa tawa positif",
    strengths: ["Selalu bersemangat dan ramah", "Pikiran kreatif tanpa batas", "Mudah berteman dengan siapa pun", "Menyenangkan dan suportif"],
    weaknesses: ["Kadang fokus mudah teralihkan ke hal baru yang menarik", "Perlu lebih teliti memperhatikan detail tugas sekolah"],
  },
  ISTJ: {
    title: "Sang Juara Disiplin (Rapi, Bertanggung Jawab, & Bisa Diandalkan)",
    desc: "Kamu adalah sosok teladan yang tertib, rajin, dan selalu menepati janji. Teman-teman dan guru tahu bahwa tugas yang diberikan kepadamu pasti selesai dengan baik.",
    role: "Bendahara/sekretaris kelas, pilar keteraturan, penjaga kedisiplinan belajar",
    strengths: ["Sangat disiplin dan tepat waktu", "Pekerja keras dan teratur", "Bisa diandalkan sepenuhnya", "Teliti dalam segala hal"],
    weaknesses: ["Agak kaget jika rencana berubah tiba-tiba", "Perlu belajar bersikap santai saat situasi di luar kendali"],
  },
  ISFJ: {
    title: "Sang Penjaga Setia (Perhatian, Rajin, & Berhati Lembut)",
    desc: "Kamu selalu siap membantu orang lain dengan tulus dan rendah hati. Penuh perhatian, menjaga kerapian kelas, dan selalu membuat teman merasa dihargai.",
    role: "Sahabat yang selalu ada, pengatur suasana nyaman kelas, penolong yang sabar",
    strengths: ["Sangat peduli dan perhatian pada teman", "Telaten dan rajin belajar", "Rendah hati dan tidak suka pamer", "Setia dan dapat dipercaya"],
    weaknesses: ["Suka malu-malu menunjukkan kehebatan diri sendiri", "Kadang merasa sungkan untuk menolak ajakan"],
  },
  ESTJ: {
    title: "Sang Pengatur Handal (Praktis, Cekatan, & Tertata)",
    desc: "Kamu orang yang sigap, teratur, dan suka memastikan segala kegiatan berjalan lancar. Kamu berani memimpin kelompok agar tugas bisa selesai cepat dan rapi.",
    role: "Koordinator tugas kelompok, kapten disiplin, pengatur kegiatan kelas",
    strengths: ["Cekatan dan terorganisir", "Berani bersuara dan tegas", "Praktis menyelesaikan masalah", "Sangat loyal dan bertanggung jawab"],
    weaknesses: ["Bisa terkesan agak kaku bagi teman yang santai", "Perlu lebih sabar menghadapi teman yang ritmenya pelan"],
  },
  ESFJ: {
    title: "Sang Sahabat Ramah (Hangat, Kompak, & Suka Menolong)",
    desc: "Kamu sangat ramah, murah senyum, dan disenangi banyak orang. Kamu suka melihat semua teman akur dan selalu berusaha membuat suasana kumpul jadi seru dan menyenangkan.",
    role: "Penghubung pertemanan, pengurus acara seru, penyambut teman baru",
    strengths: ["Sangat ramah dan mudah bergaul", "Peduli pada kebersamaan kelas", "Suka menolong dengan sukarela", "Pekerja tim yang kompak"],
    weaknesses: ["Gampang kepikiran kalau ada teman yang berselisih", "Perlu melatih kemandirian tanpa terlalu bergantung pendapat teman"],
  },
  ISTP: {
    title: "Sang Penjelajah Keren (Tenang, Cerdik, & Terampil)",
    desc: "Kamu tipe orang yang tenang, santai, tapi punya keterampilan hebat saat praktik langsung. Cepat menemukan solusi saat ada masalah teknis yang bikin bingung.",
    role: "Ahli praktik/teknik, atlet/gamer handal, pemecah masalah darurat",
    strengths: ["Tenang saat situasi darurat", "Jago otak-atik dan praktik langsung", "Logis dan praktis", "Punya rasa ingin tahu bagaimana benda bekerja"],
    weaknesses: ["Cenderung irit bicara soal perasaan", "Kurang suka aturan yang terlalu berbelit-belit"],
  },
  ISFP: {
    title: "Sang Seniman Berbakat (Rendah Hati, Manis, & Berjiwa Estetis)",
    desc: "Kamu punya selera seni yang bagus, menyukai keindahan, dan berhati lembut. Kamu santai, ramah, dan lebih suka menunjukkan karya kerenmu daripada banyak bicara.",
    role: "Pencipta karya seni/desain, teman yang menenangkan, penikmat keindahan",
    strengths: ["Bakat seni dan kreativitas tinggi", "Sangat santun dan ramah", "Pikiran terbuka dan fleksibel", "Tulus apa adanya"],
    weaknesses: ["Menghindari konflik sampai kadang memendam kekecewaan", "Perlu lebih teratur menyusun target masa depan"],
  },
  ESTP: {
    title: "Sang Aksi Tangguh (Berani, Lincah, & Selalu Siap Beraksi)",
    desc: "Kamu tipe orang yang aktif, pemberani, dan gesit! Lebih suka langsung mencoba dan beraksi daripada hanya membaca teori panjang lebar. Suasana kelas selalu ramai berkat energimu.",
    role: "Bintang olahraga/lapangan, penggerak aksi seru, sosok spontan pemberani",
    strengths: ["Pemberani dan cepat bertindak", "Lincah beradaptasi di situasi baru", "Energik dan percaya diri", "Suka belajar lewat pengalaman nyata"],
    weaknesses: ["Terkadang bertindak terburu-buru sebelum dipikir panjang", "Cepat bosan dengan pelajaran yang terlalu teoritis"],
  },
  ESFP: {
    title: "Sang Bintang Panggung (Ceria, Menghibur, & Berenergi Positif)",
    desc: "Kamu selalu bisa membuat suasana di sekitarmu ceria dan penuh tawa. Ramah, ekspresif, dan suka mengajak teman bersenang-senang dalam kegiatan belajar maupun bermain.",
    role: "Pencair suasana kelas, bintang pertunjukan, penyemangat teman",
    strengths: ["Sangat ceria dan ramah", "Pandai menghibur teman yang sedih", "Praktis dan menikmati momen sekarang", "Mudah disukai banyak orang"],
    weaknesses: ["Perlu melatih konsentrasi pada tugas jangka panjang", "Terkadang mudah tergoda untuk bersenang-senang dulu sebelum selesai PR"],
  },
}

// Deskripsi untuk Guru (Bahasa profesional pendidik, pendekatan pedagogik & kepemimpinan sekolah)
export const deskripsiTipeGuru: Record<string, { title: string; desc: string; role: string; strengths: string[]; weaknesses: string[] }> = {
  INTJ: {
    title: "Arsitek (Strategis & Visioner)",
    desc: "Pemikir strategis dengan visi jangka panjang yang jelas. Mandiri, analitis, dan memiliki standar keunggulan tinggi dalam setiap rancangan kurikulum serta evaluasi pembelajaran.",
    role: "Ahli strategi, perancang kurikulum, ilmuwan edukasi, arsitek sistem sekolah",
    strengths: ["Visioner Tajam", "Analitis & Sistematis", "Mandiri & Berintegritas", "Tekun Menuntaskan Konsep"],
    weaknesses: ["Cenderung kaku terhadap perubahan mendadak", "Standar terlalu tinggi bagi lingkungan sekitar", "Kurang sabar dengan inefisiensi"],
  },
  INTP: {
    title: "Pemikir (Inovator Logis)",
    desc: "Inovator cerdas yang gemar memecahkan masalah kompleks dan teka-teki logika. Senang mengkaji teori pendidikan, mendalam, dan memiliki rasa ingin tahu intelektual yang luas.",
    role: "Peneliti pedagogi, analis data asesmen, pengembang metode inovatif, filsuf akademisi",
    strengths: ["Kritis Logis", "Kreatif Mengembangkan Konsep", "Objektif Imparsial", "Rasa Ingin Tahu Tinggi"],
    weaknesses: ["Kurang menyukai rutinitas administratif", "Kadang sulit mengekspresikan empati secara verbal", "Cenderung overthinking"],
  },
  ENTJ: {
    title: "Komandan (Pemimpin Berorientasi Sasaran)",
    desc: "Pemimpin visioner yang tegas, berani mengambil keputusan sulit, dan sangat berorientasi pada pencapaian sasaran nyata mutu sekolah serta efisiensi organisasi pendidik.",
    role: "Kepala sekolah, koordinator program strategis, manajer proyek, pengarah mutu",
    strengths: ["Kepemimpinan Alami Kuat", "Efisien & Terstruktur", "Tegas Mengambil Keputusan", "Strategis"],
    weaknesses: ["Bisa terkesan terlalu menuntut", "Kurang sabar menghadapi kelambatan", "Perlu meningkatkan empati personal"],
  },
  ENTP: {
    title: "Inovator (Kreatif & Penggagas Ide)",
    desc: "Pribadi cerdas, energik, dan serba bisa yang gemar mengeksplorasi ide-ide baru serta menantang kebiasaan lama demi terobosan segar dalam dunia pendidikan.",
    role: "Inovator pembelajaran, konsultan, fasilitator diskusi, penggagas proyek kreatif",
    strengths: ["Inovatif & Banyak Akal", "Komunikasi Persuasif", "Adaptif Tinggi", "Wawasan Luas"],
    weaknesses: ["Cepat bosan dengan detail rutin", "Kadang terlalu senang berdebat", "Perlu disiplin menuntaskan implementasi"],
  },
  INFJ: {
    title: "Penasihat (Idealis Berwawasan Mendalam)",
    desc: "Pribadi idealis yang bijaksana, memiliki empati mendalam, dan komitmen tulus untuk membimbing serta mengembangkan potensi unik setiap anak didik.",
    role: "Guru Bimbingan Konseling (BK), mentor pembina, psikolog edukasi, penulis buku ajar",
    strengths: ["Empati Mendalam", "Intuitif Membaca Potensi Siswa", "Idealis Bermakna", "Bijaksana"],
    weaknesses: ["Rentan mengalami kelelahan emosional (burnout)", "Perfeksionis terhadap misi pribadi", "Tertutup saat tertekan"],
  },
  INFP: {
    title: "Mediator (Penuh Empati & Humanis)",
    desc: "Pribadi hangat yang berpegang teguh pada nilai-nilai luhur dan kebaikan hati. Selalu melihat sisi terbaik dalam diri siswa dan mencintai keaslian kepribadian manusia.",
    role: "Pendidik humanis, penulis sastra, konselor minat bakat, fasilitator karakter",
    strengths: ["Kreatif & Berjiwa Seni", "Penuh Welas Asih", "Menghargai Keunikan Siswa", "Setia pada Nilai Kebajikan"],
    weaknesses: ["Sangat sensitif terhadap kritik", "Kadang kurang praktis dalam eksekusi", "Sulit bersikap tegas dalam konflik"],
  },
  ENFJ: {
    title: "Protagonis (Penginspirasi Karismatik)",
    desc: "Pendidik karismatik yang mampu menginspirasi, memotivasi, dan menyatukan kelompok untuk mencapai tujuan mulia bersama dengan penuh kehangatan.",
    role: "Guru teladan, pembina kesiswaan, motivator pendidikan, pemimpin komunitas belajar",
    strengths: ["Karismatik Menginspirasi", "Komunikator Ulung", "Peka Kebutuhan Siswa", "Pembangun Semangat Tim"],
    weaknesses: ["Rentan terlalu membebani diri demi orang lain", "Sulit menolak permintaan", "Terlalu memikirkan penilaian sosial"],
  },
  ENFP: {
    title: "Sang Inspirator (Antusias & Penuh Semangat)",
    desc: "Pribadi kreatif, hangat, dan bersemangat tinggi yang memandang pendidikan sebagai petualangan penuh kemungkinan. Mampu membuat suasana kelas menjadi hidup dan interaktif.",
    role: "Guru kreatif, pelatih ekstrakurikuler, pembicara inspiratif, perancang modul tematik",
    strengths: ["Energi Positif Menular", "Kreatif Tanpa Batas", "Ramah & Hangat", "Mudah Beradaptasi"],
    weaknesses: ["Kurang konsisten dalam administrasi detail", "Mudah terdistraksi ide baru", "Mudah cemas bila terlalu terkekang"],
  },
  ISTJ: {
    title: "Pelaksana (Disiplin & Terpercaya)",
    desc: "Sosok yang berdedikasi tinggi, teliti, taat asas, dan sangat dapat diandalkan. Menjadi pilar stabilitas, kedisiplinan, dan ketertiban di lingkungan sekolah.",
    role: "Wakil kepala sekolah kurikulum/administrasi, penguji, pengelola asesmen, auditor mutu",
    strengths: ["Sangat Bertanggung Jawab", "Disiplin Tepat Waktu", "Teliti Mengelola Data", "Konsisten & Loyal"],
    weaknesses: ["Kaku terhadap perubahan aturan mendadak", "Cenderung skeptis pada ide yang belum terbukti", "Kurang spontan"],
  },
  ISFJ: {
    title: "Pelindung (Setia & Berdedikasi)",
    desc: "Pendidik yang berhati lembut, penuh perhatian, dan telaten. Selalu memastikan kebutuhan murid dan iklim belajar di kelas aman, nyaman, dan terayomi.",
    role: "Wali kelas teladan, pendidik nilai moral, pembina kedisiplinan ramah, pengasuh asrama",
    strengths: ["Penuh Perhatian & Telaten", "Dapat Diandalkan", "Rapi & Teratur", "Peka Kesejahteraan Siswa"],
    weaknesses: ["Enggan menerima perubahan mendadak", "Sulit berkata 'tidak'", "Cenderung memendam beban perasaan"],
  },
  ESTJ: {
    title: "Pengawas (Pengorganisir Andal & Tegas)",
    desc: "Sosok praktis, terstruktur, dan tegas dalam menegakkan standar kedisiplinan serta target kinerja sekolah yang jelas dan terukur.",
    role: "Pembina ketertiban sekolah, koordinator acara besar, pengelola sarana prasarana, pengarah tim",
    strengths: ["Tegas & Lugas", "Keahlian Organisasi Tinggi", "Efisien & Teratur", "Loyal pada Komitmen"],
    weaknesses: ["Bisa terkesan kaku atau kurang fleksibel", "Kurang peka pada alasan personal", "Standar kepatuhan sangat ketat"],
  },
  ESFJ: {
    title: "Konsul (Harmonis & Penuh Kepedulian)",
    desc: "Pribadi ramah, kooperatif, dan penuh perhatian yang selalu berupaya menciptakan suasana kekeluargaan yang guyub dan harmonis di lingkungan kerja pendidik.",
    role: "Hubungan Masyarakat (Humas) sekolah, pembina OSIS, koordinator paguyuban kelas, guru inklusif",
    strengths: ["Hangat & Ramah", "Pembangun Hubungan Harmonis", "Pekerja Keras", "Suka Menolong"],
    weaknesses: ["Mudah terluka oleh penolakan atau kritik", "Rentan cemas bila terjadi konflik", "Perlu keberanian bersikap tegas"],
  },
  ISTP: {
    title: "Pengrajin (Praktisi Tanggap & Solutif)",
    desc: "Pribadi tenang, analitis praktis, dan cekatan dalam mencari solusi efisien di lapangan. Sangat ahli dalam menangani masalah teknis dan simulasi pembelajaran di laboratorium.",
    role: "Guru praktikum/teknologi/informatika, teknisi laboratorium, pembina robotik/olahraga",
    strengths: ["Tanggap Menghadapi Masalah Riil", "Tenang di Bawah Tekanan", "Logis & Objektif", "Praktis Berorientasi Solusi"],
    weaknesses: ["Kurang menyukai formalitas berbelit", "Pendiam dalam urusan emosional", "Mudah jenuh dengan ceramah panjang"],
  },
  ISFP: {
    title: "Petualang (Seniman Berjiwa Lembut)",
    desc: "Sosok pendiam yang ramah, berjiwa seni, dan memiliki kepekaan estetika tinggi. Menghargai kebebasan berekspresi dan memperlakukan setiap siswa dengan penuh ketulusan.",
    role: "Guru seni budaya, pelatih desain kreatif, pendamping bakat, pembina lingkungan hidup",
    strengths: ["Kreativitas Estetika Tinggi", "Fleksibel & Terbuka", "Hangat Tanpa Menghakimi", "Rendah Hati"],
    weaknesses: ["Menghindari konfrontasi langsung", "Kurang menyukai perencanaan jangka panjang yang kaku", "Mudah merasa tertekan"],
  },
  ESTP: {
    title: "Pelaku (Dinamis, Berani, & Aplikatif)",
    desc: "Sosok berenergi tinggi, spontan, dan berorientasi pada tindakan nyata. Sangat piawai menghidupkan suasana kelas melalui aktivitas fisik dan pembelajaran berbasis aksi.",
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

// Backward compatibility: default deskripsiTipe merujuk ke deskripsiTipeGuru
export const deskripsiTipe = deskripsiTipeGuru

export function getDeskripsi(tipe: string, role?: string) {
  if (role && role !== "siswa") {
    return deskripsiTipeGuru[tipe] || deskripsiTipeGuru.INTJ
  }
  return deskripsiTipeSiswa[tipe] || deskripsiTipeSiswa.INTJ
}

