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

## Pengaturan lanjutan (opsional)

Bagian berikut hanya diperlukan jika kamu ingin mencoba akun online atau tutor AI. Jika tujuanmu hanya menjalankan demo, kamu bisa melewatinya.

### Hubungkan ke Supabase

Supabase memungkinkan pengguna membuat akun dan menyimpan data secara online.

1. Buat project di [Supabase](https://supabase.com/).
2. Buka **SQL Editor** pada project tersebut, lalu jalankan isi file [`supabase/schema.sql`](supabase/schema.sql) untuk membuat tabel dan aturan akses. Jika kamu sudah menyiapkan database sebelumnya, jalankan kembali file terbaru ini untuk menambahkan tabel progres belajar.
3. Salin file `.env.example` menjadi `.env.local` di folder utama project.
4. Isi URL project dan publishable key dari pengaturan API Supabase:

   ```dotenv
   VITE_SUPABASE_URL=https://project-kamu.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=publishable-key-kamu
   ```

5. Hentikan server lokal jika sedang berjalan (`Ctrl+C`), lalu jalankan kembali `npm run dev`. Gunakan formulir daftar untuk membuat akun.

> Gunakan **publishable key** untuk aplikasi browser. Jangan pernah menaruh `service_role` key di `.env.local` yang dibagikan, kode frontend, atau repositori publik. Skema database project ini mengaktifkan Row Level Security untuk membatasi data profil dan pendaftaran kursus.

Untuk mengaktifkan Supabase pada GitHub Pages, tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` sebagai **Actions variables** di pengaturan repositori GitHub.

### Aktifkan tutor AI

Tutor AI memerlukan akun Supabase, akun OpenAI API, dan penggunaan API dapat dikenakan biaya oleh penyedia. Kunci OpenAI hanya disimpan di Supabase Edge Function, bukan di browser.

1. Buat database Redis di [Upstash](https://upstash.com/) dan siapkan REST URL serta tokennya.
2. Instal dan autentikasi [Supabase CLI](https://supabase.com/docs/guides/cli). Dari folder project, hubungkan project Supabase:

   ```bash
   supabase link --project-ref ID_PROJECT_KAMU
   ```

3. Salin `supabase/functions/.env.example` menjadi `supabase/functions/.env`, isi OpenAI API key dan kredensial REST Upstash. File `.env` diabaikan oleh Git. Kirim nilainya sebagai secrets dan terbitkan fungsi:

   ```bash
   supabase secrets set --env-file supabase/functions/.env
   supabase functions deploy tutor
   ```

   Kamu juga bisa menambahkan `OPENAI_MODEL` untuk memilih model yang tersedia pada akun API. Nilai bawaannya `gpt-4.1-mini`. Jangan letakkan kunci AI atau Redis di `.env.local` atau frontend.
4. Pastikan aplikasi memakai URL dan publishable key Supabase seperti pada langkah sebelumnya, lalu masuk menggunakan akun Supabase. Tutor AI membatasi jawaban pada catatan pelajaran, mengizinkan maksimal 8 pertanyaan per menit dan 40 per hari per akun, serta gagal tertutup jika Redis tidak tersedia.

Tanpa Supabase dan konfigurasi API, tutor demo tetap dapat dicoba; jawabannya merupakan petunjuk lokal berbasis materi, bukan respons AI.

### Tes database dan pemeriksaan keamanan

Tes RLS dapat dijalankan pada Supabase lokal. Docker Desktop perlu aktif:

```bash
supabase start
supabase test db
```

GitHub Actions juga menjalankan tes database, CodeQL untuk TypeScript, pemindaian secret Gitleaks, audit dependency, dan tes aplikasi. Dependabot memeriksa pembaruan package npm serta GitHub Actions setiap minggu.

## Build dan tes

Untuk membuat build production:

```bash
npm run build
```

Untuk menjalankan tes browser Playwright, pasang browser Chromium satu kali:

```bash
npx playwright install chromium
npm run test:e2e
```

Workflow GitHub Actions menjalankan build dan tes pada perubahan ke `main` dan pull request. Untuk menerbitkan situs, pilih **Settings → Pages → Build and deployment → GitHub Actions**. Setelah workflow berhasil, GitHub menampilkan alamat situs di halaman Pages.

## Catatan demo

Akun demo hanya simulasi untuk mencoba tampilan dan alur aplikasi; akun ini bukan autentikasi sungguhan. Topik forum, jadwal kalender, dan materi adalah konten contoh. Halaman materi belum menyediakan unduhan file.

## Struktur utama

```text
src/                    Tampilan dan alur aplikasi
  data/courses.ts       Data contoh kursus
  lib/                  Penyimpanan lokal dan integrasi Supabase
  styles.css            Gaya dan tampilan responsif
supabase/schema.sql     Tabel dan aturan akses Supabase
tests/e2e.spec.ts       Tes alur aplikasi di browser
```

## Tentang

Dibuat oleh [Chlayverts](https://github.com/chlayverts) sebagai proyek portofolio.

