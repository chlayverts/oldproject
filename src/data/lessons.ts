export type Lesson = {
  id: string;
  title: string;
  duration: string;
  content: string[];
  check: { question: string; answers: string[]; correct: number; explanation: string };
};

const examplesByCourse: Record<string, [string, string, string]> = {
  'data-science': [
    'Contohnya, pertanyaan â€œapa yang memengaruhi pelanggan kembali?â€ lebih berguna daripada sekadar â€œlihat data penjualanâ€ karena hasilnya dapat mengarahkan keputusan retensi.',
    'Periksa nilai kosong, duplikasi, rentang waktu, dan bagaimana data dikumpulkan. Sampel yang hanya berisi pelanggan aktif dapat menyembunyikan alasan pelanggan lain berhenti.',
    'Visualisasi tren perlu menyertakan rentang tanggal, ukuran sampel, dan pembanding. Tutup dengan satu tindakan yang dapat diuji, bukan hanya menampilkan grafik.',
  ],
  'web-development': [
    'Formulir pendaftaran, misalnya, perlu label yang jelas, validasi, dan konfirmasi setelah berhasil agar pengguna tahu apa yang harus dilakukan.',
    'Endpoint seperti POST /enrollments dapat menerima permintaan, memvalidasi data, lalu mengembalikan status yang dapat dipahami antarmuka.',
    'Tes dari sudut pandang pengguna: daftar kursus, muat ulang halaman, dan pastikan status pendaftaran tetap benar.',
  ],
  'ai-ethics': [
    'Contoh sistem rekomendasi perlu dinilai dari pengaruhnya kepada pembuat konten dan pengguna, bukan hanya ketepatan prediksinya.',
    'Bandingkan kualitas hasil antar kelompok dan tinjau apakah data latih mewakili orang yang terdampak.',
    'Sediakan cara bagi pengguna untuk meminta peninjauan manusia dan melaporkan hasil yang merugikan.',
  ],
  'machine-learning': [
    'Simpan langkah pemrosesan, versi data, dan parameter model supaya hasil eksperimen dapat diulang.',
    'Pisahkan data latih dan evaluasi agar model tidak diuji pada contoh yang sudah pernah dipelajari.',
    'Pantau perubahan distribusi input dan kualitas prediksi; siapkan proses evaluasi ulang ketika performa menurun.',
  ],
  'cyber-security': [
    'Buat inventaris akun, data, dan layanan; lalu nilai ancaman berdasarkan kemungkinan serta dampaknya.',
    'Pisahkan peran pembaca dan pengelola. Cabut akses yang tidak lagi diperlukan dan lindungi proses masuk dengan autentikasi yang sesuai.',
    'Catat kejadian, batasi akses yang terdampak, pulihkan layanan, dan dokumentasikan pelajaran untuk mencegah pengulangan.',
  ],
  'cloud-computing': [
    'Aplikasi dengan beban berubah-ubah mungkin memerlukan penskalaan otomatis, sedangkan pekerjaan terjadwal bisa memakai komputasi sesuai kebutuhan.',
    'Rancang pemeriksaan kesehatan, pencadangan, dan pemulihan agar satu kegagalan tidak menghentikan seluruh layanan.',
    'Tinjau pemakaian sumber daya dan izin akses secara berkala; hapus resource yang tidak digunakan.',
  ],
};

const makeLessons = (courseId: string, topics: [string, string, string], takeaways: [string, string, string]): Lesson[] => topics.map((title, index) => ({
  id: `${courseId}-lesson-${index + 1}`,
  title,
  duration: `${8 + index * 3} menit`,
  content: [
    `${takeaways[index]} Dalam kursus ini, kita akan melihat bagaimana konsep tersebut membantu menyelesaikan masalah nyata secara bertahap.`,
    examplesByCourse[courseId][index],
  ],
  check: {
    question: `Praktik mana yang paling tepat saat mempelajari ${title.toLowerCase()}?`,
    answers: index === 0
      ? ['Memahami tujuan, menguji asumsi, dan menjelaskan hasilnya.', 'Mengikuti langkah tanpa memeriksa konteks atau hasilnya.', 'Menganggap satu pendekatan selalu cocok untuk semua masalah.']
      : index === 1
        ? ['Mengikuti langkah tanpa memeriksa konteks atau hasilnya.', 'Memahami tujuan, menguji asumsi, dan menjelaskan hasilnya.', 'Menganggap satu pendekatan selalu cocok untuk semua masalah.']
        : ['Menganggap satu pendekatan selalu cocok untuk semua masalah.', 'Mengikuti langkah tanpa memeriksa konteks atau hasilnya.', 'Memahami tujuan, menguji asumsi, dan menjelaskan hasilnya.'],
    correct: index,
    explanation: takeaways[index],
  },
}));

export const lessonsByCourse: Record<string, Lesson[]> = {
  'data-science': makeLessons('data-science', ['Merumuskan pertanyaan data', 'Menyiapkan dan memahami data', 'Mengomunikasikan insight'], [
    'Analisis yang baik berawal dari pertanyaan yang spesifik dan keputusan yang ingin didukung.',
    'Periksa kualitas, sumber, dan keterbatasan data sebelum menarik kesimpulan.',
    'Insight bernilai ketika disajikan dengan konteks dan tindakan yang jelas.',
  ]),
  'web-development': makeLessons('web-development', ['Menyusun antarmuka web', 'Membangun layanan API', 'Menguji alur aplikasi'], [
    'Antarmuka yang baik membantu pengguna memahami tindakan berikutnya.',
    'API menjadi batas yang jelas antara antarmuka dan data aplikasi.',
    'Pengujian alur pengguna menangkap masalah yang tidak terlihat dari kode saja.',
  ]),
  'ai-ethics': makeLessons('ai-ethics', ['Dampak AI pada masyarakat', 'Mengenali bias data', 'Merancang penggunaan bertanggung jawab'], [
    'Sistem AI dapat memengaruhi orang yang datanya digunakan maupun yang menerima hasilnya.',
    'Bias dapat muncul dari data, tujuan, dan cara sistem diterapkan.',
    'Pengawasan, transparansi, dan mekanisme koreksi perlu dirancang sejak awal.',
  ]),
  'machine-learning': makeLessons('machine-learning', ['Menyusun pipeline model', 'Mengevaluasi generalisasi', 'Memantau model di produksi'], [
    'Pipeline yang dapat diulang membuat proses pemodelan lebih mudah diperiksa.',
    'Evaluasi pada data yang tidak digunakan saat pelatihan membantu mengukur generalisasi.',
    'Kinerja model dapat berubah sehingga perlu dipantau setelah deployment.',
  ]),
  'cyber-security': makeLessons('cyber-security', ['Memetakan aset dan ancaman', 'Menerapkan kontrol akses', 'Menangani insiden keamanan'], [
    'Perlindungan dimulai dengan mengetahui aset penting dan ancaman yang relevan.',
    'Berikan akses minimum yang diperlukan dan tinjau izin secara berkala.',
    'Respons insiden yang jelas membantu membatasi dampak dan mempercepat pemulihan.',
  ]),
  'cloud-computing': makeLessons('cloud-computing', ['Memahami layanan cloud', 'Mendesain deployment andal', 'Mengelola biaya dan keamanan'], [
    'Pilih layanan cloud berdasarkan kebutuhan beban kerja dan tanggung jawab operasional.',
    'Deployment andal mempertimbangkan pemantauan, pemulihan, dan kapasitas.',
    'Biaya dan keamanan perlu ditinjau sepanjang siklus hidup layanan.',
  ]),
};

export function getCourseLessons(courseId: string): Lesson[] {
  return lessonsByCourse[courseId] ?? [];
}

