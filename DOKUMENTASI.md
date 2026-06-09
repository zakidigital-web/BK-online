# 📘 Bimbingan Konseling Online — SMP Negeri 1 Genteng

## 📋 Daftar Isi
1. [Tentang Aplikasi](#-tentang-aplikasi)
2. [Pengguna & Hak Akses](#-pengguna--hak-akses)
3. [Alur Kerja Fitur Utama](#-alur-kerja-fitur-utama)
4. [Fitur Admin](#-fitur-admin)
5. [Panduan untuk Setiap Peran](#-panduan-untuk-setiap-peran)
6. [Diagram Alur Data](#-diagram-alur-data)
7. [Cara Memulai](#-cara-memulai)
8. [Panduan Import Excel](#-panduan-import-excel)
9. [Tanya Jawab](#-tanya-jawab)

---

## 🎯 Tentang Aplikasi

**BK Online** adalah aplikasi berbasis web untuk layanan Bimbingan Konseling di **SMP Negeri 1 Genteng**.

| Kebutuhan | Solusi dari BK Online |
|-----------|----------------------|
| ✅ Siswa ingin curhat tanpa ketahuan identitas | **Curhat Anonim** — tulis pesan tanpa nama |
| ✅ Guru BK ingin tahu minat & bakat siswa | **Asesmen RIASEC** — 36 pertanyaan skala 1-5 |
| ✅ Mendeteksi masalah psikologis sejak dini | **Screening Psikologi** — 45 pertanyaan, 5 dimensi |
| ✅ Mengetahui gaya belajar siswa | **Asesmen Gaya Belajar VARK** — 10 soal pilihan ganda |
| ✅ Menilai karakter & kepribadian siswa | **Big Five Personality** — 30 pertanyaan, 5 dimensi |
| ✅ Guru mengevaluasi cara mengajarnya sendiri | **Asesmen Gaya Mengajar Guru** — 24 pertanyaan |
| ✅ Mengetahui kondisi psikologis guru | **Asesmen Psikologi Guru** — 15 pertanyaan |
| ✅ Memantau perkembangan siswa per kelas | **Laporan & Dashboard** — rekap per siswa/kelas |
| ✅ Mendokumentasikan kegiatan BK | **Riwayat tersimpan** — semua data asesmen & chat |

**Teknologi:** Next.js (React) + Tailwind CSS + Prisma + SQLite (development) / PostgreSQL (production via Vercel)

---

## 👥 Pengguna & Hak Akses

Ada **5 peran** pengguna:

### 1. 🛡️ Admin
- ✅ Mengelola akun guru, wali kelas, & admin (tambah/hapus/reset password)
- ✅ Melihat semua data siswa, laporan, & analisa
- ✅ Mengatur kelas (tambah, hapus, import Excel)
- ✅ Import data siswa per kelas & massal (seluruh kelas)
- ✅ Import akun guru dari Excel
- ✅ Mengedit pertanyaan asesmen (siswa & guru) — 6 jenis asesmen
- ✅ Melihat laporan guru (gaya mengajar & psikologi)
- ✅ Backup & restore database
- ✅ Reset data (asesmen, chat, siswa, kelas, akun, atau semua)
- ✅ Mengganti tema warna aplikasi (6 pilihan)
- ❌ Tidak bisa curhat anonim (khusus siswa)

### 2. 🎓 Guru BK
- ✅ Membalas curhat anonim siswa (dengan dukungan media link, gambar, video, YouTube)
- ✅ Melihat data siswa & laporan asesmen
- ✅ Mengisi asesmen gaya mengajar & psikologi guru
- ✅ Melihat laporan guru (hasil asesmen sendiri)
- ❌ Tidak bisa mengelola akun (tambah/hapus guru)
- ❌ Tidak bisa backup/restore/reset data
- ❌ Tidak bisa mengedit pertanyaan asesmen

### 3. 👨‍🏫 Wali Kelas
- ✅ Melihat dashboard
- ✅ Melihat laporan & analisa siswa di kelas yang diampu
- ✅ Melihat data siswa
- ❌ Tidak bisa melihat/membalas curhat
- ❌ Tidak bisa mengelola akun
- ❌ Tidak bisa mengisi asesmen guru

### 4. 📚 Guru Mapel
- ✅ Mengisi asesmen gaya mengajar
- ✅ Mengisi asesmen psikologi guru
- ✅ Melihat laporan asesmen diri sendiri
- ❌ Tidak bisa melihat data siswa lain
- ❌ Tidak bisa mengelola apa pun

### 5. 👦 Siswa
- ✅ Curhat anonim (tanpa nama, pakai ID otomatis)
- ✅ Mengisi asesmen minat bakat (RIASEC) — 36 soal
- ✅ Mengisi asesmen psikologi — 45 soal
- ✅ Mengisi asesmen gaya belajar (VARK) — 10 soal
- ✅ Mengisi asesmen karakter diri (Big Five) — 30 soal
- ✅ Melihat hasil asesmen sendiri
- ❌ Tidak bisa melihat chat guru
- ❌ Tidak bisa mengakses dashboard admin

> 💡 **Login Siswa:** Username & password menggunakan **NISN** (Nomor Induk Siswa Nasional). Password bisa direset admin ke NISN.

---

## 🔄 Alur Kerja Fitur Utama

### 1. 💬 Curhat Anonim

```
Siswa → Tulis pesan (dapat menyertakan link gambar/video) → Masuk ke sistem → Guru BK balas
```

- **Siswa:** Buka Curhat → dapat ID anonim otomatis → kirim pesan
- **Guru BK:** Dashboard → Kelola Curhat → lihat percakapan → balas
- **Media:** Link gambar (jpg/png/gif/webp) otomatis ditampilkan sebagai `<img>`, video mp4 sebagai `<video>`, link YouTube sebagai embed
- **Privasi:** Chat anonim otomatis dihapus setelah 7 hari

### 2. 📊 Asesmen Minat Bakat (RIASEC)

**36 pertanyaan** skala 1-5 → 6 dimensi:

| Dimensi | Skor Maks | Deskripsi | Contoh Karier |
|---------|-----------|-----------|---------------|
| **R**ealistic | 30 | Tangan terampil, suka kerja fisik | Teknisi, Koki, Atlet |
| **I**nvestigative | 30 | Suka mikir, analitis | Dokter, Programmer, Ilmuwan |
| **A**rtistic | 30 | Kreatif, ekspresif | Desainer, Musisi, Penulis |
| **S**ocial | 30 | Suka bantu orang | Guru, Psikolog, Perawat |
| **E**nterprising | 30 | Jiwa pemimpin | CEO, Pengacara, Marketing |
| **C**onventional | 30 | Teratur, rapi | Akuntan, Administrasi |

✅ Hasil grafik batang + rekomendasi karier per dimensi

### 3. 🧠 Screening Psikologi Siswa

**45 pertanyaan** skala 1-5 → 5 dimensi:

| Dimensi | Jumlah Soal | Arti Skor Tinggi |
|---------|-------------|------------------|
| Somatisasi | 10 | Keluhan fisik terkait stres |
| Cemas | 9 | Kecemasan berlebih |
| Depresi | 10 | Mood rendah, kehilangan minat |
| Sensitif | 8 | Sensitivitas interpersonal tinggi |
| Musuh | 8 | Kemarahan mudah terpicu |

✅ Skor dalam persen (0-100%) + interpretasi otomatis

### 4. 📚 Asesmen Gaya Belajar (VARK)

**10 soal pilihan ganda** dengan 4 opsi per soal:

| Gaya | Deskripsi |
|------|-----------|
| **V**isual | Belajar lewat gambar, diagram, video |
| **A**uditory | Belajar lewat suara, musik, diskusi |
| **R**eading | Belajar lewat teks, catatan, bacaan |
| **K**inesthetic | Belajar lewat gerak, praktek, eksperimen |

✅ Hasil dominansi gaya belajar + saran metode belajar

### 5. ❤️ Asesmen Karakter Diri (Big Five)

**30 pertanyaan** skala 1-5 → 5 dimensi:

| Dimensi | Arti Skor Tinggi | Arti Skor Rendah |
|---------|------------------|------------------|
| **O**penness | Kreatif, penasaran | Praktis, konvensional |
| **C**onscientiousness | Disiplin, teratur | Kurang terstruktur |
| **E**xtraversion | Enerjik, ramah | Introvert, reflektif |
| **A**greeableness | Empati, kooperatif | Kompetitif |
| **N**euroticism | Sensitif, emosional | Stabil, tenang |

✅ Profil kepribadian lengkap + tipe karakter otomatis

### 6. 👨‍🏫 Asesmen Gaya Mengajar Guru

**24 pertanyaan** skala 1-5 → 8 dimensi:

| Dimensi | Jumlah Soal |
|---------|-------------|
| Tradisional | 4 |
| Modern | 4 |
| Praktis | 4 |
| Keterbukaan | 2 |
| Ketelitian | 2 |
| Ekstrover | 2 |
| Keramahan | 2 |
| Kompetensi | 4 |

> 🔒 Hasil hanya bisa dilihat oleh **guru yang bersangkutan** dan **admin**.

### 7. 🧘 Asesmen Psikologi Guru

**15 pertanyaan** skala 1-5 → 5 dimensi:

| Dimensi | Arti Skor Tinggi |
|---------|------------------|
| Stres Kerja | Terbebani administrasi & mengajar |
| Kesejahteraan | Merasa dihargai & nyaman |
| Motivasi | Semangat mengajar & berkembang |
| Stabilitas Emosi | Tenang menghadapi situasi sulit |
| Kepuasan Kerja | Puas dengan fasilitas & karir |

✅ Status psikologi otomatis + rekomendasi

---

## 📋 Fitur Admin

### Data Siswa (Class-First View)
1. Masuk → lihat **grid kelas** (kartu per kelas)
2. Klik kelas → lihat & manage siswa di kelas itu
3. **Tambah siswa** langsung (nama + NISN)
4. **Edit siswa** (nama, kelas, NISN)
5. **Hapus siswa** (data asesmen ikut terhapus)
6. **Reset password** siswa ke NISN
7. **Import Excel per kelas** (upload file .xlsx)
8. **Import Excel massal** (upload file dengan kolom Nama + Kelas + NISN)
9. **Tambah / Hapus kelas** langsung dari halaman

### Akun Guru
1. **Tambah akun** — pilih role (Guru BK, Wali Kelas, Guru Mapel, Admin)
2. **Filter** daftar akun per role
3. **Reset password** per guru (dialog konfirmasi)
4. **Hapus akun** guru
5. **Import Excel** — upload file dengan kolom Nama, Username, Password, Role, NIPY, Kelas, Mapel
6. **Download template** Excel

### Kelola Pertanyaan
1. **6 tab:** Minat Bakat, Psikologi, Gaya Belajar, Karakter Diri, Gaya Mengajar Guru, Psikologi Guru
2. **Lihat** daftar pertanyaan + dimensi
3. **Edit** teks & dimensi via dialog
4. **Tambah** pertanyaan baru
5. **Hapus** pertanyaan

### Pengaturan
1. **Tema Aplikasi** — 6 pilihan warna (Indigo, Emerald, Rose, Sky, Violet, Orange)
2. **Tampilkan Akun Demo** — sembunyikan/tampilkan akun demo di halaman login
3. **Inisialisasi Akun Demo** — buat akun demo (admin, guru, walas, siswa)
4. **Ubah Password** — ganti password sendiri
5. **Manajemen Kelas** — tambah/hapus kelas, export/import Excel
6. **Backup & Restore Database** — download file .db, restore dari file backup
7. **Reset Data** — hapus asesmen, chat, siswa, kelas, akun, atau semua data

---

## 📖 Panduan untuk Setiap Peran

### 🛡️ Admin

**Login:** `admin` / `admin123` (demo)

**Menu:**
1. **Dashboard** — ringkasan jumlah siswa, guru, chat
2. **Kelola Curhat** — baca & balas curhat siswa
3. **Laporan** — lihat laporan asesmen siswa & guru
4. **Data Siswa** — tambah/edit/hapus/import siswa, tambah/hapus kelas
5. **Akun Guru** — tambah/hapus/reset password guru, import Excel
6. **Analisa** — lihat analisa detail per siswa
7. **Pertanyaan** — edit pertanyaan asesmen (6 jenis)
8. **Pengaturan** — tema, demo, password, kelas, backup, reset

### 🎓 Guru BK

**Login:** `guru` / `guru123` (demo)

**Menu:**
1. **Dashboard** — ringkasan
2. **Kelola Curhat** — baca & balas curhat anonim
3. **Laporan** — lihat laporan asesmen siswa
4. **Data Siswa** — lihat data siswa
5. **Analisa** — lihat analisa siswa
6. **Gaya Mengajar** — isi asesmen gaya mengajar diri sendiri
7. **Psikologi Guru** — isi asesmen psikologi diri sendiri
8. **Laporan Guru** — lihat hasil asesmen diri sendiri

### 👨‍🏫 Wali Kelas

**Login:** `walas` / `walas123` (demo, harus diinisialisasi dulu)

**Menu:**
1. **Dashboard** — ringkasan
2. **Laporan** — lihat laporan siswa
3. **Data Siswa** — lihat data siswa
4. **Analisa** — lihat analisa siswa

### 📚 Guru Mapel

**Login:** buat akun oleh admin dengan role "Guru Mapel"

**Menu:**
1. **Gaya Mengajar** — isi asesmen gaya mengajar
2. **Psikologi Guru** — isi asesmen psikologi
3. **Laporan Saya** — lihat hasil asesmen diri sendiri

### 👦 Siswa

**Login:** Username = **NISN**, Password = **NISN**
(demo: `siswa` / `siswa123`)

**Menu:**
1. **Curhat** — kirim pesan anonim ke Guru BK
2. **Minat Bakat** — isi asesmen RIASEC (36 soal)
3. **Psikologi** — isi screening psikologi (45 soal)
4. **Gaya Belajar** — isi asesmen VARK (10 soal)
5. **Karakter Diri** — isi asesmen Big Five (30 soal)

---

## 📊 Diagram Alur Data

### Alur Pendaftaran & Login

```
                   ┌──────────────┐
                   │  Pengunjung  │
                   └──────┬───────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
     ┌────────────────┐     ┌────────────────┐
     │  Daftar Akun   │     │  Login Langsung│
     │  (Guru/Admin)  │     │  (Siswa via    │
     └───────┬────────┘     │   NISN)        │
             │              └───────┬────────┘
             ▼                      │
     ┌────────────────┐             │
     │  Admin Aktifkan│             │
     │  Akun (role)   │             │
     └───────┬────────┘             │
             │                      │
             └──────┬───────────────┘
                    ▼
          ┌─────────────────┐
          │  Masuk ke       │
          │  Dashboard      │
          │  (Sesuai Role)  │
          └─────────────────┘
```

### Alur Asesmen Siswa

```
  ┌──────────┐
  │  Siswa   │
  │  Login   │
  └────┬─────┘
       │
       ▼
  ┌──────────┐     ┌──────────────┐     ┌──────────────┐
  │  Pilih   │ ──> │  Jawab       │ ──> │  Lihat Hasil │
  │  Asesmen │     │  Pertanyaan  │     │  & Grafik    │
  └──────────┘     └──────┬───────┘     └──────┬───────┘
                          │                     │
                          ▼                     ▼
                   ┌──────────────┐     ┌──────────────┐
                   │  Tersimpan   │     │  Guru BK     │
                   │  di Database │     │  Bisa Lihat  │
                   └──────────────┘     └──────────────┘
```

### Alur Import Data

```
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │  Download    │ ──> │  Isi Excel   │ ──> │  Upload ke   │
  │  Template    │     │  (sesuai     │     │  Aplikasi    │
  │  Excel       │     │   format)    │     │              │
  └──────────────┘     └──────────────┘     └──────┬───────┘
                                                    │
                          ┌─────────────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  Sistem      │
                   │  Validasi &  │
                   │  Simpan      │
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  Notifikasi  │
                   │  Berhasil /  │
                   │  Gagal       │
                   └──────────────┘
```

---

## 🚀 Cara Memulai

### Untuk Admin (Pertama Kali)

```
Langkah 1: Buka aplikasi → Daftar akun admin
     │
Langkah 2: Login sebagai admin
     │
Langkah 3: Buka Pengaturan → Inisialisasi Akun Demo
           (membuat akun demo: admin, guru, walas, siswa)
     │
Langkah 4: Buka Pengaturan → Manajemen Kelas
           atau buka Data Siswa → Tambah Kelas
           Tambah: 7A, 7B, 8A, 8B, 9A, 9B, dst.
     │
Langkah 5: Buka Data Siswa
           → Klik kelas → Tambah siswa satu-satu
           → Atau Import Excel (per kelas)
           → Atau Import Massal (seluruh kelas sekali upload)
     │
Langkah 6: Buka Akun Guru
           → Tambah Guru BK, Wali Kelas, Guru Mapel
           → Atau Import Excel (upload massal)
     │
Langkah 7: Siap digunakan! Bagikan informasi login ke:
           • Guru BK → login sebagai guru
           • Wali Kelas → login sebagai walas
           • Guru Mapel → login sesuai username
           • Siswa → login pakai NISN (password = NISN)
```

### Untuk Penggunaan Sehari-hari

| Waktu | Aktivitas | Dilakukan Oleh |
|-------|-----------|----------------|
| 📅 Awal Tahun | Import data siswa & kelas | Admin |
| 📅 Awal Tahun | Buat akun guru & wali kelas | Admin |
| 📅 Semester 1 | Siswa isi asesmen minat bakat & psikologi | Siswa |
| 📅 Semester 1 | Guru isi asesmen gaya mengajar | Guru |
| 📅 Setiap Hari | Curhat & balas curhat | Siswa & Guru BK |
| 📅 Setiap Bulan | Review laporan & tindak lanjut | Guru BK |
| 📅 Akhir Semester | Cetak laporan per siswa/kelas | Guru BK & Admin |
| 💾 Rutin | Backup database | Admin (mingguan) |

---

## 📁 Panduan Import Excel

### Import Siswa (Per Kelas)

1. Buka **Data Siswa** → Klik kelas tujuan
2. Klik **Template** → download template Excel
3. Isi file Excel:

| Nama | NISN |
|------|------|
| Ahmad Fauzi | 1234567890 |
| Siti Nurhaliza | 1234567891 |

4. Klik **Import** → pilih file yang sudah diisi
5. Sistem akan membuat akun User otomatis (password = NISN)

### Import Siswa (Massal — Seluruh Kelas)

1. Buka **Data Siswa** (tampilan grid kelas)
2. Klik **Import Massal (Excel)**
3. Format Excel:

| Nama | Kelas | NISN |
|------|-------|------|
| Ahmad Fauzi | 7A | 1234567890 |
| Siti Nurhaliza | 7A | 1234567891 |
| Budi Santoso | 7B | 1234567892 |

4. Upload file → sistem otomatis membuat siswa & akun untuk semua kelas

### Import Guru

1. Buka **Akun Guru**
2. Klik **Download Template**
3. Isi file Excel:

| Nama | Username | Password | Role | NIPY | Kelas | Mapel |
|------|----------|----------|------|------|-------|-------|
| Ibu Sari | sari.guru | sari123 | guru | 12345 | 7A | |
| Pak Budi | budi.walas | budi123 | walas | 67890 | 7A | |
| Bu Dewi | dewi.mapel | dewi123 | guru-mapel | | | Matematika |

**Role yang tersedia:**
- `guru` — Guru BK
- `guru-mapel` — Guru Mata Pelajaran
- `walas` — Wali Kelas
- `admin` — Administrator

> Password opsional. Jika dikosongkan, password = username.

4. Klik **Upload Excel** → pilih file

---

## ❓ Tanya Jawab

**Q: Apakah siswa bisa login tanpa NISN?**
A: Bisa menggunakan akun demo `siswa`/`siswa123`. Untuk data sesungguhnya, NISN diperlukan sebagai username & password default.

**Q: Apakah curhat anonim benar-benar anonim?**
A: Ya. Sistem tidak menyimpan nama siswa. Setiap sesi curhat menggunakan ID acak yang dibuat otomatis.

**Q: Berapa lama chat tersimpan?**
A: Chat anonim otomatis dihapus setelah 7 hari. Chat dari guru BK tetap tersimpan.

**Q: Apakah data bisa dibackup?**
A: Ya. Admin bisa mendownload file database (.db) di Pengaturan → Backup & Restore.

**Q: Bisakah import data dari Excel?**
A: Bisa. Ada 3 jenis import:
- **Siswa per kelas** (Data Siswa → klik kelas → Import)
- **Siswa massal** seluruh kelas (Data Siswa → Import Massal)
- **Guru** (Akun Guru → Upload Excel)
Semua sudah ada template yang bisa didownload.

**Q: Apakah aplikasi bisa diakses dari HP?**
A: Bisa. Tampilan sudah responsive untuk HP, tablet, maupun komputer.

**Q: Bagaimana cara reset password siswa?**
A: Di Data Siswa, klik ikon kunci (🔑) pada siswa → password direset ke NISN.

**Q: Apakah admin bisa mengedit pertanyaan asesmen?**
A: Ya. Buka menu **Pertanyaan** → pilih jenis asesmen → edit/hapus/tambah pertanyaan.

**Q: Apakah perlu instalasi?**
A: Tidak. Cukup buka browser dan akses URL aplikasi.

---

## 📞 Kontak & Dukungan

- **Sekolah:** SMP Negeri 1 Genteng
- **Aplikasi:** Bimbingan Konseling Online
- **Tahun:** 2026

---

> 📄 **Dokumentasi ini dapat dicetak atau dibagikan kepada pihak sekolah.**
