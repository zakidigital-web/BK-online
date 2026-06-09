import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const defaultQuestions: Record<string, { teks: string; dimensi: string }[]> = {
  "minat-bakat": [
    { teks: "Saya lebih suka memperbaiki barang yang rusak sendiri daripada menunggu bantuan orang lain.", dimensi: "R" },
    { teks: "Saya senang mengutak-atik peralatan seperti komputer, motor, atau gawai.", dimensi: "R" },
    { teks: "Saya menikmati kegiatan yang menghasilkan karya nyata, seperti memasak, berkebun, atau membuat kerajinan.", dimensi: "R" },
    { teks: "Saya lebih menikmati kegiatan luar ruang daripada terlalu lama berada di dalam kamar.", dimensi: "R" },
    { teks: "Saya menyukai aktivitas fisik atau kegiatan yang menuntut tenaga dan ketahanan tubuh.", dimensi: "R" },
    { teks: "Saya lebih mudah belajar melalui praktik langsung daripada teori saja.", dimensi: "R" },
    { teks: "Saya tertarik memahami bagaimana sesuatu bekerja di balik prosesnya.", dimensi: "I" },
    { teks: "Saya senang mencari tahu topik baru meskipun tidak diminta.", dimensi: "I" },
    { teks: "Saya pernah membongkar atau merakit sesuatu hanya untuk mempelajari bagian-bagiannya.", dimensi: "I" },
    { teks: "Matematika atau IPA termasuk pelajaran yang saya nikmati.", dimensi: "I" },
    { teks: "Saya menikmati teka-teki, puzzle, atau tantangan yang membutuhkan logika.", dimensi: "I" },
    { teks: "Saya bisa fokus lama saat membaca artikel atau informasi yang menurut saya menarik.", dimensi: "I" },
    { teks: "Saya menikmati mengambil foto atau video dengan komposisi yang menarik.", dimensi: "A" },
    { teks: "Saya senang menulis cerita, puisi, atau catatan pribadi.", dimensi: "A" },
    { teks: "Saya tertarik merancang sesuatu, seperti poster, pakaian, atau tata ruang.", dimensi: "A" },
    { teks: "Musik, bernyanyi, atau menari adalah kegiatan yang saya sukai.", dimensi: "A" },
    { teks: "Saya sering memikirkan ide-ide kreatif yang berbeda dari biasanya.", dimensi: "A" },
    { teks: "Saat menonton film, saya tertarik memperhatikan unsur visual dan artistiknya.", dimensi: "A" },
    { teks: "Saya mudah memahami perasaan orang lain.", dimensi: "S" },
    { teks: "Saya senang menjelaskan materi atau membantu teman belajar.", dimensi: "S" },
    { teks: "Saya tertarik mengikuti kegiatan sosial atau organisasi yang bermanfaat bagi orang lain.", dimensi: "S" },
    { teks: "Teman-teman sering datang kepada saya untuk bercerita atau meminta saran.", dimensi: "S" },
    { teks: "Saya peduli pada isu sosial dan kemanusiaan di sekitar saya.", dimensi: "S" },
    { teks: "Saya lebih menikmati kerja kelompok daripada bekerja sendiri.", dimensi: "S" },
    { teks: "Saya nyaman mengambil peran memimpin dalam kelompok.", dimensi: "E" },
    { teks: "Saya suka berbicara atau presentasi di depan banyak orang.", dimensi: "E" },
    { teks: "Saya cukup percaya diri saat meyakinkan orang lain tentang suatu ide.", dimensi: "E" },
    { teks: "Saya tertarik membangun usaha atau proyek sendiri.", dimensi: "E" },
    { teks: "Saya bersemangat mengikuti kompetisi dan tantangan.", dimensi: "E" },
    { teks: "Saya percaya diri saat menawarkan ide atau rencana kepada orang lain.", dimensi: "E" },
    { teks: "Saya merasa kerapian dan ketelitian adalah hal yang penting.", dimensi: "C" },
    { teks: "Saya nyaman bekerja dengan aturan dan prosedur yang jelas.", dimensi: "C" },
    { teks: "Saya terbiasa mencatat jadwal dan membuat daftar tugas.", dimensi: "C" },
    { teks: "Saya lebih menyukai rutinitas yang teratur daripada situasi yang terlalu acak.", dimensi: "C" },
    { teks: "Saya teliti saat mengerjakan data atau angka.", dimensi: "C" },
    { teks: "Saya senang mengatur dan merapikan dokumen atau file.", dimensi: "C" },
  ],
  psikologi: [
    { teks: "Saya sering merasa kepala berat atau pusing meskipun tidak sedang sakit.", dimensi: "somatisasi" },
    { teks: "Dada saya sering terasa sesak atau berdebar lebih cepat dari biasanya.", dimensi: "somatisasi" },
    { teks: "Saya mudah lelah walaupun tidak melakukan aktivitas berat.", dimensi: "somatisasi" },
    { teks: "Tangan atau kaki saya sering terasa tegang atau pegal.", dimensi: "somatisasi" },
    { teks: "Perut saya terasa tidak nyaman saat sedang tertekan.", dimensi: "somatisasi" },
    { teks: "Punggung atau leher saya sering terasa kaku.", dimensi: "somatisasi" },
    { teks: "Saya sulit tidur nyenyak atau sering terbangun di malam hari.", dimensi: "somatisasi" },
    { teks: "Saya berkeringat berlebihan tanpa alasan yang jelas.", dimensi: "somatisasi" },
    { teks: "Saya sering ingin buang air kecil saat merasa tegang.", dimensi: "somatisasi" },
    { teks: "Jantung saya sering berdebar tanpa sebab yang jelas.", dimensi: "somatisasi" },
    { teks: "Saya mudah khawatir terhadap hal-hal kecil.", dimensi: "cemas" },
    { teks: "Saya sering merasa gelisah dan sulit tenang.", dimensi: "cemas" },
    { teks: "Pikiran saya terasa terus berjalan dan sulit berhenti.", dimensi: "cemas" },
    { teks: "Saya merasa takut pada hal yang sebenarnya tidak terlalu mengancam.", dimensi: "cemas" },
    { teks: "Tubuh saya sering terasa tegang dan sulit rileks.", dimensi: "cemas" },
    { teks: "Saya mudah panik saat keadaan tidak berjalan sesuai rencana.", dimensi: "cemas" },
    { teks: "Saya sulit tidur karena pikiran saya tidak tenang.", dimensi: "cemas" },
    { teks: "Saya sering merasa ada hal buruk yang akan terjadi tanpa alasan yang jelas.", dimensi: "cemas" },
    { teks: "Saya terganggu oleh pikiran yang terus muncul dan sulit dihentikan.", dimensi: "cemas" },
    { teks: "Saya kehilangan minat pada hal-hal yang biasanya saya sukai.", dimensi: "depresi" },
    { teks: "Saya sering merasa sedih atau kosong tanpa alasan yang jelas.", dimensi: "depresi" },
    { teks: "Saya lebih mudah menangis atau ingin menangis.", dimensi: "depresi" },
    { teks: "Saya sering menyalahkan diri sendiri atau merasa tidak berharga.", dimensi: "depresi" },
    { teks: "Saya sulit berkonsentrasi saat belajar.", dimensi: "depresi" },
    { teks: "Nafsu makan saya berubah cukup terasa.", dimensi: "depresi" },
    { teks: "Saya merasa masa depan terlihat suram.", dimensi: "depresi" },
    { teks: "Saya sering merasa lemas dan tidak bertenaga.", dimensi: "depresi" },
    { teks: "Saya pernah merasa ingin menyerah menghadapi semuanya.", dimensi: "depresi" },
    { teks: "Saya sering merasa sendirian walaupun sedang bersama orang lain.", dimensi: "depresi" },
    { teks: "Saya mudah tersinggung oleh ucapan atau sikap orang lain.", dimensi: "sensitif" },
    { teks: "Saya sering merasa orang lain membicarakan saya.", dimensi: "sensitif" },
    { teks: "Saya sulit percaya pada orang yang baru saya kenal.", dimensi: "sensitif" },
    { teks: "Saya sering merasa tidak diterima atau dijauhkan.", dimensi: "sensitif" },
    { teks: "Kritik kecil bisa sangat memengaruhi perasaan saya.", dimensi: "sensitif" },
    { teks: "Saya sering membandingkan diri dengan orang lain.", dimensi: "sensitif" },
    { teks: "Saya merasa orang lain tidak memahami perasaan saya.", dimensi: "sensitif" },
    { teks: "Saya sering merasa minder atau tidak percaya diri.", dimensi: "sensitif" },
    { teks: "Saya mudah marah karena hal-hal kecil.", dimensi: "musuh" },
    { teks: "Saat kesal, saya merasa ingin berteriak atau meluapkan emosi.", dimensi: "musuh" },
    { teks: "Perbedaan pendapat mudah berubah menjadi pertengkaran.", dimensi: "musuh" },
    { teks: "Saya kesulitan mengendalikan emosi saat sedang marah.", dimensi: "musuh" },
    { teks: "Saya sering merasa orang lain sengaja membuat saya kesal.", dimensi: "musuh" },
    { teks: "Saya pernah melampiaskan kemarahan pada benda di sekitar saya.", dimensi: "musuh" },
    { teks: "Saya mudah frustrasi saat sesuatu tidak berjalan sesuai harapan.", dimensi: "musuh" },
    { teks: "Saya sulit melepaskan rasa kecewa.", dimensi: "musuh" },
  ],
  "gaya-belajar": [
    { teks: "Saat mempelajari materi baru, saya lebih mudah paham jika melihat diagram/ilustrasi/video, mendengar penjelasan, membaca teks, atau mencoba langsung.", dimensi: "V/A/R/K" },
    { teks: "Saat mencari arah, saya lebih mengandalkan peta visual, penjelasan lisan, petunjuk tertulis, atau mencoba rute langsung.", dimensi: "V/A/R/K" },
    { teks: "Cara paling membantu saya mengingat sesuatu adalah gambar/suara/catatan/praktik langsung.", dimensi: "V/A/R/K" },
    { teks: "Saat di kelas, saya lebih fokus dengan melihat tayangan, mendengar penjelasan, mencatat, atau bergerak.", dimensi: "V/A/R/K" },
    { teks: "Ketika membaca buku, saya cenderung melihat diagram dulu, membaca bersuara, mencatat, atau perlu praktik.", dimensi: "V/A/R/K" },
    { teks: "Waktu senggang saya suka menonton film, dengar musik/podcast, baca buku, atau olahraga/berkarya.", dimensi: "V/A/R/K" },
    { teks: "Saat mempertimbangkan barang baru, saya percaya pada tampilan visual, ulasan lisan, spesifikasi tertulis, atau mencoba langsung.", dimensi: "V/A/R/K" },
    { teks: "Mengatur catatan, saya paling nyaman dengan mind map warna, rekaman audio, poin tertulis rapi, atau praktik langsung.", dimensi: "V/A/R/K" },
    { teks: "Menerima instruksi baru, saya lebih paham dengan contoh visual, penjelasan lisan, panduan tertulis, atau coba langsung.", dimensi: "V/A/R/K" },
    { teks: "Cara belajar paling cocok: highlight/diagram visual, diskusi lisan, baca rangkuman, atau praktik/eksperimen.", dimensi: "V/A/R/K" },
  ],
  karakter: [
    { teks: "Saya memiliki imajinasi yang kaya dan suka memikirkan gagasan baru.", dimensi: "O" },
    { teks: "Penampilan dan barang-barang saya biasanya rapi dan tertata.", dimensi: "C" },
    { teks: "Saya mudah memulai percakapan dengan orang lain.", dimensi: "E" },
    { teks: "Saya peduli pada perasaan orang lain.", dimensi: "A" },
    { teks: "Saya sering merasa khawatir atau tegang.", dimensi: "N" },
    { teks: "Saya tertarik mencoba hal-hal baru dan pengalaman yang berbeda.", dimensi: "O" },
    { teks: "Saya sering menunda pekerjaan yang seharusnya bisa segera dikerjakan.", dimensi: "C" },
    { teks: "Saya lebih nyaman menyendiri daripada berada di keramaian.", dimensi: "E" },
    { teks: "Saya cenderung mudah percaya pada orang lain.", dimensi: "A" },
    { teks: "Perasaan saya biasanya stabil dan tidak mudah berubah.", dimensi: "N" },
    { teks: "Saya menyukai seni, musik, atau hal-hal yang bersifat estetis.", dimensi: "O" },
    { teks: "Saya terbiasa tepat waktu dan disiplin.", dimensi: "C" },
    { teks: "Saya nyaman menjadi pusat perhatian dalam kelompok.", dimensi: "E" },
    { teks: "Saya senang membantu orang lain tanpa mengharapkan balasan.", dimensi: "A" },
    { teks: "Suasana hati saya mudah berubah secara tiba-tiba.", dimensi: "N" },
    { teks: "Saya senang memikirkan makna hidup atau hal-hal yang mendalam.", dimensi: "O" },
    { teks: "Orang lain dapat mengandalkan saya.", dimensi: "C" },
    { teks: "Saya termasuk orang yang bersemangat dan antusias.", dimensi: "E" },
    { teks: "Saya mudah memahami sudut pandang orang lain.", dimensi: "A" },
    { teks: "Saya sering merasa sedih atau murung.", dimensi: "N" },
    { teks: "Saya suka mencoba makanan, budaya, atau pengalaman baru.", dimensi: "O" },
    { teks: "Barang-barang saya sering tidak tertata dengan rapi.", dimensi: "C" },
    { teks: "Saya menyenangkan untuk diajak berbicara.", dimensi: "E" },
    { teks: "Saya mudah memaafkan kesalahan orang lain.", dimensi: "A" },
    { teks: "Saya mudah merasa tertekan saat menghadapi tuntutan.", dimensi: "N" },
    { teks: "Saya terbuka terhadap ide atau cara pandang baru.", dimensi: "O" },
    { teks: "Saya konsisten menjalankan hal yang sudah saya mulai.", dimensi: "C" },
    { teks: "Saya cenderung malu dalam situasi yang baru.", dimensi: "E" },
    { teks: "Saya mudah mencari titik tengah agar situasi tetap damai.", dimensi: "A" },
    { teks: "Saya tetap merasa tenang saat menghadapi situasi genting.", dimensi: "N" },
  ],
  "guru-mengajar": [
    { teks: "Saya mengikuti format RPP standar secara ketat", dimensi: "Tradisional" },
    { teks: "Pembelajaran di kelas saya berpusat pada guru", dimensi: "Tradisional" },
    { teks: "Saya mengutamakan ketertiban dan aturan kelas yang tegas", dimensi: "Tradisional" },
    { teks: "Evaluasi utama yang saya gunakan adalah tes tertulis", dimensi: "Tradisional" },
    { teks: "Saya mendorong diskusi dan kolaborasi antarsiswa", dimensi: "Modern" },
    { teks: "Saya menggunakan teknologi dalam setiap pembelajaran", dimensi: "Modern" },
    { teks: "Saya memberi kebebasan siswa mengeksplorasi materi", dimensi: "Modern" },
    { teks: "Proyek dan portofolio lebih saya utamakan daripada hafalan", dimensi: "Modern" },
    { teks: "Saya banyak memberikan contoh konkret dari kehidupan nyata", dimensi: "Praktis" },
    { teks: "Saya sering mengadakan praktikum atau simulasi", dimensi: "Praktis" },
    { teks: "Saya menyesuaikan metode ajar berdasarkan karakter siswa", dimensi: "Praktis" },
    { teks: "Saya melibatkan orang tua dalam menangani masalah siswa", dimensi: "Praktis" },
    { teks: "Saya senang mencoba metode mengajar baru", dimensi: "Keterbukaan" },
    { teks: "Saya mudah beradaptasi dengan perubahan kurikulum", dimensi: "Keterbukaan" },
    { teks: "Saya selalu menyiapkan materi sebelum masuk kelas", dimensi: "Ketelitian" },
    { teks: "Saya mengecek dan menilai tugas siswa secara rutin", dimensi: "Ketelitian" },
    { teks: "Saya nyaman berbicara di depan banyak orang", dimensi: "Ekstrover" },
    { teks: "Saya mudah bergaul dengan rekan kerja dan siswa", dimensi: "Ekstrover" },
    { teks: "Saya sabar menghadapi siswa yang lambat belajar", dimensi: "Keramahan" },
    { teks: "Saya mendengarkan keluhan siswa dengan empati", dimensi: "Keramahan" },
    { teks: "Saya menguasai materi pelajaran yang saya ampu", dimensi: "Kompetensi" },
    { teks: "Saya mampu menggunakan teknologi untuk pembelajaran", dimensi: "Kompetensi" },
    { teks: "Saya melakukan evaluasi dan tindak lanjut secara berkala", dimensi: "Kompetensi" },
    { teks: "Saya terus belajar dan mengikuti pelatihan pengembangan diri", dimensi: "Kompetensi" },
  ],
  "mbti": [
    { teks: "Setelah menghabiskan waktu bersama banyak orang, saya merasa lebih berenergi.", dimensi: "EI" },
    { teks: "Saya lebih suka bekerja sendiri daripada dalam tim.", dimensi: "EI" },
    { teks: "Saya mudah memulai percakapan dengan orang yang baru dikenal.", dimensi: "EI" },
    { teks: "Saya lebih suka mendengarkan daripada berbicara dalam diskusi kelompok.", dimensi: "EI" },
    { teks: "Saya menikmati menjadi pusat perhatian dalam acara sosial.", dimensi: "EI" },
    { teks: "Saya butuh waktu sendiri untuk mengisi ulang energi setelah bersosialisasi.", dimensi: "EI" },
    { teks: "Saya lebih percaya pada fakta dan data yang konkret daripada teori abstrak.", dimensi: "SN" },
    { teks: "Saya suka membayangkan kemungkinan-kemungkinan di masa depan.", dimensi: "SN" },
    { teks: "Saya memperhatikan detail-detail kecil yang sering dilewatkan orang lain.", dimensi: "SN" },
    { teks: "Saya lebih tertarik pada ide-ide besar daripada hal-hal yang detail.", dimensi: "SN" },
    { teks: "Saya lebih suka petunjuk yang jelas dan langkah demi langkah.", dimensi: "SN" },
    { teks: "Saya sering melamun dan memikirkan berbagai kemungkinan.", dimensi: "SN" },
    { teks: "Saya mengambil keputusan berdasarkan logika daripada perasaan.", dimensi: "TF" },
    { teks: "Saya sangat mempertimbangkan perasaan orang lain saat mengambil keputusan.", dimensi: "TF" },
    { teks: "Saya lebih suka mengatakan kebenaran meskipun itu menyakitkan.", dimensi: "TF" },
    { teks: "Saya mudah merasakan apa yang dirasakan orang lain.", dimensi: "TF" },
    { teks: "Saya percaya keputusan yang adil adalah yang objektif dan tidak memihak.", dimensi: "TF" },
    { teks: "Saya lebih mementingkan keharmonisan kelompok daripada kebenaran mutlak.", dimensi: "TF" },
    { teks: "Saya suka membuat jadwal dan merencanakan kegiatan saya.", dimensi: "JP" },
    { teks: "Saya lebih suka bersikap spontan dan fleksibel dalam hidup.", dimensi: "JP" },
    { teks: "Saya merasa tidak nyaman jika sesuatu tidak sesuai rencana.", dimensi: "JP" },
    { teks: "Saya lebih suka membiarkan opsi tetap terbuka daripada membuat keputusan cepat.", dimensi: "JP" },
    { teks: "Saya selalu menyelesaikan tugas sebelum tenggat waktu.", dimensi: "JP" },
    { teks: "Saya suka mengerjakan tugas di menit-menit terakhir.", dimensi: "JP" },
  ],
  "guru-psikologi": [
    { teks: "Saya merasa terbebani dengan administrasi mengajar", dimensi: "Stres Kerja" },
    { teks: "Saya sulit menyeimbangkan pekerjaan dan kehidupan pribadi", dimensi: "Stres Kerja" },
    { teks: "Saya sering merasa lelah secara mental setelah mengajar", dimensi: "Stres Kerja" },
    { teks: "Saya merasa dihargai oleh rekan kerja dan atasan", dimensi: "Kesejahteraan" },
    { teks: "Saya menikmati pekerjaan saya sebagai guru", dimensi: "Kesejahteraan" },
    { teks: "Lingkungan kerja saya mendukung perkembangan saya", dimensi: "Kesejahteraan" },
    { teks: "Saya bersemangat mengajar setiap hari", dimensi: "Motivasi" },
    { teks: "Saya memiliki target pengembangan diri yang jelas", dimensi: "Motivasi" },
    { teks: "Saya merasa kontribusi saya berarti bagi siswa", dimensi: "Motivasi" },
    { teks: "Saya mudah tersinggung oleh kritik dari orang lain", dimensi: "Stabilitas Emosi" },
    { teks: "Saya cemas ketika menghadapi kelas yang sulit diatur", dimensi: "Stabilitas Emosi" },
    { teks: "Saya kesulitan mengontrol emosi saat menghadapi siswa bermasalah", dimensi: "Stabilitas Emosi" },
    { teks: "Saya puas dengan fasilitas yang tersedia di sekolah", dimensi: "Kepuasan Kerja" },
    { teks: "Gaji dan tunjangan yang saya terima sudah sesuai", dimensi: "Kepuasan Kerja" },
    { teks: "Saya merasa betah dan ingin pensiun di sekolah ini", dimensi: "Kepuasan Kerja" },
  ],
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const jenis = searchParams.get("jenis")

    if (jenis && !defaultQuestions[jenis]) {
      return NextResponse.json({ error: "Jenis tidak valid" }, { status: 400 })
    }

    const where = jenis ? { jenis } : {}
    const dbSoal = await prisma.soalAsesmen.findMany({ where, orderBy: [{ jenis: "asc" }, { nomor: "asc" }] })

    if (jenis) {
      const defaults = defaultQuestions[jenis] || []
      if (dbSoal.length === 0) {
        return NextResponse.json({ soal: defaults.map((q, i) => ({ ...q, nomor: i + 1 })), dariDB: false })
      }
      return NextResponse.json({ soal: dbSoal.map((q) => ({ teks: q.teks, dimensi: q.dimensi, nomor: q.nomor, id: q.id })), dariDB: true })
    }

    const grouped: Record<string, { teks: string; dimensi: string; nomor: number; id?: string }[]> = {}
    for (const [key, defaults] of Object.entries(defaultQuestions)) {
      const db = dbSoal.filter((q) => q.jenis === key)
      if (db.length > 0) {
        grouped[key] = db.map((q) => ({ teks: q.teks, dimensi: q.dimensi, nomor: q.nomor, id: q.id }))
      } else {
        grouped[key] = defaults.map((q, i) => ({ ...q, nomor: i + 1 }))
      }
    }
    return NextResponse.json({ grouped })
  } catch {
    return NextResponse.json({ error: "Gagal memuat pertanyaan" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { jenis, teks, dimensi } = await req.json()
    if (!jenis || !teks) {
      return NextResponse.json({ error: "jenis dan teks diperlukan" }, { status: 400 })
    }
    if (!defaultQuestions[jenis]) {
      return NextResponse.json({ error: "Jenis tidak valid" }, { status: 400 })
    }

    const max = await prisma.soalAsesmen.findFirst({
      where: { jenis },
      orderBy: { nomor: "desc" },
    })
    const nextNomor = (max?.nomor || defaultQuestions[jenis].length) + 1

    const soal = await prisma.soalAsesmen.create({
      data: { jenis, nomor: nextNomor, teks, dimensi: dimensi || "" },
    })
    return NextResponse.json({ soal })
  } catch {
    return NextResponse.json({ error: "Gagal menambah pertanyaan" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { id, teks, dimensi } = await req.json()
    if (!id) return NextResponse.json({ error: "id diperlukan" }, { status: 400 })

    const soal = await prisma.soalAsesmen.update({
      where: { id },
      data: { teks, dimensi },
    })
    return NextResponse.json({ soal })
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate pertanyaan" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "id diperlukan" }, { status: 400 })
    await prisma.soalAsesmen.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Gagal menghapus pertanyaan" }, { status: 500 })
  }
}
