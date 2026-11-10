import { Ratelimit } from 'npm:@upstash/ratelimit@2.2.0';
import { Redis } from 'npm:@upstash/redis@1.41.0';
import { checkTutorRateLimit } from './rateLimit.ts';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const allowedOrigins = new Set([
  'https://chlayverts.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

const lessonNotes: Record<string, string> = {
  'data-science-lesson-1': 'Analisis dimulai dari pertanyaan spesifik dan keputusan yang ingin didukung.',
  'data-science-lesson-2': 'Periksa kualitas, sumber, dan keterbatasan data sebelum menarik kesimpulan.',
  'data-science-lesson-3': 'Insight bernilai jika disajikan dengan konteks dan tindakan yang jelas.',
  'web-development-lesson-1': 'Antarmuka yang baik membantu pengguna memahami tindakan berikutnya.',
  'web-development-lesson-2': 'API membentuk batas yang jelas antara antarmuka dan data aplikasi.',
  'web-development-lesson-3': 'Pengujian alur pengguna menemukan masalah yang tidak terlihat dari kode saja.',
  'ai-ethics-lesson-1': 'Sistem AI dapat memengaruhi orang yang datanya digunakan maupun yang menerima hasilnya.',
  'ai-ethics-lesson-2': 'Bias dapat muncul dari data, tujuan, dan cara sistem diterapkan.',
  'ai-ethics-lesson-3': 'Pengawasan, transparansi, dan mekanisme koreksi perlu dirancang sejak awal.',
  'machine-learning-lesson-1': 'Pipeline yang dapat diulang membuat proses pemodelan lebih mudah diperiksa.',
  'machine-learning-lesson-2': 'Evaluasi pada data yang tidak digunakan saat pelatihan membantu mengukur generalisasi.',
  'machine-learning-lesson-3': 'Kinerja model dapat berubah sehingga perlu dipantau setelah deployment.',
  'cyber-security-lesson-1': 'Perlindungan dimulai dengan mengetahui aset penting dan ancaman yang relevan.',
  'cyber-security-lesson-2': 'Berikan akses minimum yang diperlukan dan tinjau izin secara berkala.',
  'cyber-security-lesson-3': 'Respons insiden yang jelas membantu membatasi dampak dan mempercepat pemulihan.',
  'cloud-computing-lesson-1': 'Pilih layanan cloud berdasarkan kebutuhan beban kerja dan tanggung jawab operasional.',
  'cloud-computing-lesson-2': 'Deployment andal mempertimbangkan pemantauan, pemulihan, dan kapasitas.',
  'cloud-computing-lesson-3': 'Biaya dan keamanan perlu ditinjau sepanjang siklus hidup layanan.',
};

const redisUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
const redisToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;
const perMinute = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(8, '60 s'),
  prefix: 'oldproject:tutor:minute',
  timeout: 1500,
}) : null;
const perDay = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(40, '1 d'),
  prefix: 'oldproject:tutor:day',
  timeout: 1500,
}) : null;

Deno.serve(async (request) => {
  const origin = request.headers.get('Origin');
  const responseHeaders = origin && allowedOrigins.has(origin)
    ? { ...corsHeaders, 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' }
    : corsHeaders;
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: { ...responseHeaders, 'Content-Type': 'application/json' },
  });
  if (request.method === 'OPTIONS') {
    return origin && allowedOrigins.has(origin) ? new Response('ok', { headers: responseHeaders }) : json({ error: 'Origin tidak diizinkan.' }, 403);
  }
  if (request.method !== 'POST') return json({ error: 'Metode tidak didukung.' }, 405);
  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (declaredLength > 4096) return json({ error: 'Permintaan terlalu besar.' }, 413);

  const authorization = request.headers.get('Authorization');
  const apiKey = request.headers.get('apikey');
  const projectUrl = Deno.env.get('SUPABASE_URL');
  if (!authoriza