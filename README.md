# Kampus Unggul

Kampus Unggul adalah contoh aplikasi belajar online yang dibuat sebagai proyek portofolio. Kamu bisa mencoba katalog kursus, dashboard siswa, kuis, kalender belajar, profil, forum, dan halaman materi.

**Teknologi:** React, TypeScript, Vite, Supabase (opsional), dan Playwright.

## Coba demo online

Jika GitHub Pages sudah diaktifkan untuk repositori ini, buka tab **Settings â†’ Pages** di GitHub untuk melihat alamat demo yang diterbitkan.

## Jalankan di komputer sendiri

### 1. Siapkan Node.js

Pasang **Node.js versi 22.12 atau lebih baru** dari [nodejs.org](https://nodejs.org/). Setelah instalasi, buka Terminal (macOS/Linux) atau PowerShell (Windows), lalu pastikan Node.js dan npm tersedia:

```bash
node --version
npm --version
```

### 2. Unduh project dan pasang kebutuhan

Jika Git sudah terpasang, jalankan:

```bash
git clone https://github.com/chlayverts/zaza.git
cd zaza
npm install
```

> Jika kamu sudah mengunduh ZIP repositori dari GitHub, ekstrak ZIP, buka Terminal di folder `zaza`, lalu jalankan `npm install`.

### 3. Mulai aplikasi

```bash
npm run dev
```

Terminal akan menampilkan alamat lokal, biasanya `http://localhost:5173`. Buka alamat itu di browser. Biarkan terminal tetap berjalan selama kamu menggunakan aplikasi. Untuk menghentikannya, tekan `Ctrl+C`.

### 4. Masuk ke akun demo

Pilih **Masuk Demo**, kemudian gunakan:

| Kolom | Isi |
| --- | --- |
| Username | `student` |
| Password | `kampus123` |

Akun demo tidak memerlukan pendaftaran atau konfigurasi tambahan. Profil dan kursus yang diikuti disimpan di penyimpanan browser pada perangkat tersebut. Data ini tidak tersinkron ke perangkat lain. Hapus data situs di browser untuk mengulang demo dari awal.

## Fitur yang bisa dicoba

- Cari dan saring kursus, lalu coba mendaftar.
- Lihat ringkasan belajar di dashboard.
- Kerjakan kuis singkat dan lihat hasilnya.
- Pindah bulan di kalender belajar.
- Ubah nama tampilan pada profil.
- Jelajahi contoh topik forum dan materi belajar.

## (Opsional) Hubungkan ke Supabase

Lewati bagian ini jika hanya ingin mencoba akun demo. Supabase diperlukan untuk mencoba akun dan data yang tersimpan secara online.

1. Buat project di [Supabase](https://supabase.com/).
2. Buka **SQL Editor** pada project tersebut, lalu jalankan isi file [`supabase/schema.sql`](supabase/schema.sql) untuk membuat tabel dan aturan akses.
3. Salin file `.env.example` menjadi `.env.local` di folder utama project.
4. Isi URL project dan publishable key dari pengaturan API Supabase:

   ```dotenv
   VITE_SUPABASE_URL=https://project-kamu.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=publishable-key-kamu
   ```

5. Hentikan server lokal jika sedang berjalan (`Ctrl+C`), lalu jalankan kembali `npm run dev`. Gunakan formulir daftar untuk membuat akun.

> Gunakan **publishable key** untuk aplikasi browser. Jangan pernah menaruh `service_role` key di `.env.local` yang dibagikan, kode frontend, atau repositori publik. Skema database project ini mengaktifkan Row Level Security untuk membatasi data profil dan pendaftaran kursus.

Untuk mengaktifkan Supabase pada GitHub Pages, tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` sebagai **Actions variables** di pengaturan repositori GitHub.

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

Workflow GitHub Actions menjalankan build dan tes pada perubahan ke `main` dan pull request. Untuk menerbitkan situs, pilih **Settings â†’ Pages â†’ Build and deployment â†’ GitHub Actions**. Setelah workflow berhasil, GitHub menampilkan alamat situs di halaman Pages.

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

