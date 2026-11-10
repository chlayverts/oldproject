# Kampus Unggul

Kampus Unggul adalah contoh aplikasi belajar online untuk proyek portofolio. Di sini kamu bisa mencoba katalog kursus, dashboard, kuis, kalender belajar, profil, forum, materi, dan tutor.

**Teknologi yang digunakan:** React dan TypeScript untuk aplikasi, Vite untuk menjalankannya saat dikembangkan, Supabase (opsional) untuk akun online, dan Playwright untuk tes browser.

> **Baru mencoba?** Kamu hanya perlu memasang Node.js lalu menjalankan aplikasi demo. Tidak perlu membuat akun Supabase, menyiapkan API key, atau mengaktifkan tutor AI.

## Coba demo online

Buka [demo Kampus Unggul](https://chlayverts.github.io/oldproject/) untuk mencoba aplikasinya langsung di browser.

## Jalankan di komputer sendiri

Ikuti langkah ini untuk mencoba aplikasi di komputer. Perintah di bawah dijalankan dari Terminal (macOS/Linux) atau PowerShell (Windows).

### 1. Siapkan Node.js

Pasang **Node.js versi 22.12 atau lebih baru** dari [nodejs.org](https://nodejs.org/). Setelah instalasi, buka Terminal (macOS/Linux) atau PowerShell (Windows), lalu pastikan Node.js dan npm tersedia:

```bash
node --version
npm --version
```

### 2. Unduh project dan pasang kebutuhan

Ada dua cara untuk mendapatkan project:

- **Dengan Git:** jika Git sudah terpasang, jalankan perintah berikut:

```bash
git clone https://github.com/chlayverts/oldproject.git
cd oldproject
npm install
```

- **Dengan ZIP:** unduh ZIP dari tombol **Code** di GitHub, ekstrak foldernya, lalu buka Terminal atau PowerShell di folder `oldproject` dan jalankan `npm install`.

### 3. Mulai aplikasi

```bash
npm run dev
```

Perintah ini menyalakan server lokal untuk aplikasi. Server lokal artinya aplikasi berjalan di komputermu sendiri.

Terminal akan menampilkan alamat lokal, biasanya `http://localhost:5173`. Buka alamat tersebut di browser. Biarkan jendela Terminal tetap terbuka selama aplikasi digunakan; tekan `Ctrl+C` di sana untuk menghentikan server.


### 4. Masuk ke akun demo

Pilih **Masuk Demo**, kemudian gunakan:

| Kolom | Isi |
| --- | --- |
| Username | `student` |
| Password | `kampus123` |

Akun demo tidak memerlukan pendaftaran atau konfigurasi tambahan. Profil dan progres kursus disimpan di browser pada perangkatmu, sehingga tidak tersinkron ke perangkat lain. Untuk mengulang demo dari awal, hapus data situs di browser.

### Jika mengalami kendala

- **Perintah `node` atau `npm` tidak ditemukan:** pasang Node.js, tutup lalu buka kembali Terminal, kemudian cek dengan `node --version` dan `npm --version`.
- **Alamat `localhost:5173` tidak terbuka:** pastikan `npm run dev` masih berjalan. Gunakan alamat yang tercetak di Terminal jika port yang dipakai berbeda.
- **Ingin menghentikan aplikasi:** kembali ke Terminal dan tekan `Ctrl+C`.

## Fitur yang bisa dicoba

- Cari dan saring kursus, lalu coba mendaftar.
- Lihat ringkasan belajar di dashboard.
- Kerjakan kuis singkat dan lihat hasilnya.
- Pindah bulan di kalender belajar.
- Ubah nama tampilan pada profil.
- Jelajahi contoh topik forum dan materi belajar.
- Buka kursus terdaftar, pelajari modul, jawab cek pemahaman, dan lanjutkan dari progres yang tersimpan.
- Tanyakan konsep pelajaran kepada tutor. Mode demo memberi petunjuk lokal berdasarkan materi; mode Supabase dapat menggunakan tutor AI.

## Batasan mode demo

Mode demo dibuat agar aplikasi bisa dicoba tanpa membuat akun atau menyiapkan layanan tambahan. Beberapa bagian merupakan simulasi:

| Bagian | Mode demo | Dengan layanan tambahan |
| --- | --- | --- |
| Masuk | Akun contoh tersimpan di browser ini | Supabase Auth untuk akun sungguhan |
| Kursus dan progres | Disimpan di penyimpanan browser perangkat ini | Supabase untuk menyimpan data akun secara online |
| Tutor | Petunjuk lokal dari materi contoh | Jawaban AI melalui Supabase Edge Function |
| Kalender, forum, dan pustaka | Konten contoh untuk memperlihatkan rancangan antarmuka | Belum terhubung ke layanan jadwal, komunitas, atau berkas |

Akun demo bukan mekanisme keamanan dan tidak boleh digu