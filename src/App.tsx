import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { courses } from './data/courses';
import type { Course } from './data/courses';
import { getCourseLessons } from './data/lessons';
import { readLocal, writeLocal } from './lib/localStore';
import { supabase, supabaseConfigured } from './lib/supabase';
import './styles.css';

type Page = 'home' | 'courses' | 'dashboard' | 'calendar' | 'quiz' | 'profile' | 'forum' | 'materials' | 'learn';
type DemoUser = { email: string; name: string };
type QuizQuestion = { prompt: string; answers: string[]; correct: number };

const pageIds: Page[] = ['home', 'courses', 'dashboard', 'calendar', 'quiz', 'profile', 'forum', 'materials', 'learn'];

function readRoute() {
  const [, route = 'home', courseId] = window.location.hash.split('/');
  const page = pageIds.includes(route as Page) ? route as Page : 'home';
  const validCourseId = courses.some(course => course.id === courseId) ? courseId : null;
  return page === 'learn' && validCourseId
    ? { page, courseId: validCourseId }
    : { page: page === 'learn' ? 'home' : page, courseId: null };
}

const navigationGroups: { label: string; items: { id: Page; label: string }[] }[] = [
  { label: 'Belajar', items: [
    { id: 'home', label: 'Beranda' },
    { id: 'courses', label: 'Kursus' },
    { id: 'learn', label: 'Materi belajar' },
  ] },
  { label: 'Aktivitas', items: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'calendar', label: 'Kalender' },
    { id: 'quiz', label: 'Kuis' },
  ] },
  { label: 'Komunitas', items: [
    { id: 'forum', label: 'Forum' },
    { id: 'materials', label: 'Pustaka' },
  ] },
];

const questions: QuizQuestion[] = [
  { prompt: 'Apa tujuan utama data science?', answers: ['Mengubah data menjadi insight yang dapat ditindaklanjuti.', 'Menyimpan file tanpa analisis.', 'Menggantikan seluruh keputusan manusia.'], correct: 0 },
  { prompt: 'Apa fungsi validasi model?', answers: ['Membuat data terlihat lebih rapi.', 'Mengukur kemampuan model pada data yang belum pernah dilihat.', 'Memastikan model selalu benar.'], correct: 1 },
  { prompt: 'Apa langkah penting dalam pengembangan AI yang bertanggung jawab?', answers: ['Mengabaikan kualitas data.', 'Memeriksa bias dan dampak penggunaan data.', 'Menghapus semua evaluasi model.'], correct: 1 },
];

const calendarEvents = [
  { day: 5, title: 'Diskusi Data Science', time: '09.00 WIB' },
  { day: 12, title: 'Workshop Web Development', time: '13.00 WIB' },
  { day: 18, title: 'Seminar AI Ethics', time: '10.00 WIB' },
  { day: 25, title: 'Review Proyek', time: '15.00 WIB' },
];

function App() {
  const [page, setPage] = useState<Page>(() => readRoute().page);
  const [session, setSession] = useState<Session | null>(null);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authMessage, setAuthMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('Semua level');
  const [enrolled, setEnrolled] = useState<Set<string>>(() => new Set(readLocal<string[]>('zaza-enrollments', [])));
  const [profileName, setProfileName] = useState(() => readLocal('zaza-profile-name', ''));
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState(() => readRoute().courseId || 'data-science');
  const [lessonIndex, setLessonIndex] = useState(0);
  const [lessonProgress, setLessonProgress] = useState<Record<string, string[]>>(() => readLocal('zaza-lesson-progress', {}));
  const [lessonAnswer, setLessonAnswer] = useState<number | null>(null);
  const [lessonAnswerCorrect, setLessonAnswerCorrect] = useState<boolean | null>(null);
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorReply, setTutorReply] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);

  const authenticated = Boolean(session || demoUser);
  const email = session?.user.email || demoUser?.email || '';
  const name = profileName || session?.user.user_metadata.full_name || demoUser?.name || email || 'Student';

  useEffect(() => {
    const syncRoute = () => {
      const route = readRoute();
      setPage(route.page);
      if (route.courseId) setActiveCourseId(route.courseId);
    };
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      const savedDemoUser = readLocal<DemoUser | null>('zaza-demo-user', null);
      setDemoUser(savedDemoUser);
      if (savedDemoUser) setProfileName(readLocal('zaza-profile-name', savedDemoUser.name));
      return;
    }
    let mounted = true;
    void client.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setNotice('Sesi tidak dapat diperiksa. Silakan masuk kembali.');
      setSession(data.session);
    });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const client = supabase;
    const userId = session?.user.id;
    if (!client || !userId) return;
    let mounted = true;
    const profileRequest = client.from('profiles').select('full_name').eq('id', userId).maybeSingle();
    const enrollmentRequest = client.from('enrollments').select('course_id').eq('user_id', userId);
    void Promise.all([profileRequest, enrollmentRequest]).then(([profile, enrollments]) => {
      if (!mounted) return;
      if (profile.data?.full_name) setProfileName(profile.data.full_name);
      if (enrollments.data) setEnrolled(new Set(enrollments.data.map(row => row.course_id)));
    }).catch(() => setNotice('Data akun belum dapat dimuat.'));
    return () => { mounted = false; };
  }, [session]);

  useEffect(() => {
    const client = supabase;
    const userId = session?.user.id;
    if (!client || !userId) return;
    let mounted = true;
    void client.from('lesson_progress').select('course_id, lesson_id').eq('user_id', userId).then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setNotice('Progres belajar belum termuat. Jalankan pembaruan skema Supabase.');
        return;
      }
      const grouped = (data || []).reduce<Record<string, string[]>>((result, row) => {
        result[row.course_id] = [...(result[row.course_id] || []), row.lesson_id];
        return result;
      }, {});
      setLessonProgress(grouped);
    });
    return () => { mounted = false; };
  }, [session]);

  const visibleCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return courses.filter(course => {
      const searchable = (course.title + ' ' + course.description + ' ' + course.category).toLowerCase();
      return (!query || searchable.includes(query)) && (level === 'Semua level' || course.level === level);
    });
  }, [search, level]);

  const enrolledCourses = courses.filter(course => enrolled.has(course.id));
  const recommendedCourse = enrolledCourses.find(course => (lessonProgress[course.id] || []).length < getCourseLessons(course.id).length) || courses[0];
  const recommendedLessons = getCourseLessons(recommendedCourse.id);
  const recommendedLessonIndex = recommendedLessons.findIndex(lesson => !(lessonProgress[recommendedCourse.id] || []).includes(lesson.id));
  const recommendedLesson = recommendedLessons[recommendedLessonIndex] ?? null;
  const totalLessons = enrolledCourses.reduce((count, course) => count + getCourseLessons(course.id).length, 0);
  const completedLessons = enrolledCourses.reduce((count, course) => count + (lessonProgress[course.id] || []).filter(id => getCourseLessons(course.id).some(lesson => lesson.id === id)).length, 0);
  const learningPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  function setRoute(target: Page, courseId = activeCourseId, replace = false) {
    const path = `#/${target}${target === 'learn' ? `/${courseId}` : ''}`;
    if (window.location.hash !== path) window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
    if (target === 'learn') setActiveCourseId(courseId);
    setPage(target);
  }

  function navigate(target: Page) {
    if ((target === 'dashboard' || target === 'profile') && !authenticated) {
      setAuthMessage('Masuk untuk membuka halaman akun demo.');
      setAuthMode('login');
      setLoginOpen(true);
      return;
    }
    if (target === 'learn' && !enrolled.size) {
      setPage('courses');
      setNotice('Daftar ke kursus terlebih dahulu untuk membuka materi belajar.');
      return;
    }
    setNotice('');
    setRoute(target);
  }

  function openCourse(course: Course) {
    if (!authenticated) {
      setAuthMessage('Masuk untuk menyimpan progres belajar.');
      setAuthMode('login');
      setLoginOpen(true);
      return;
    }
    if (!enrolled.has(course.id)) {
      setNotice('Daftar ke kursus ini terlebih dahulu untuk membuka materinya.');
      return;
    }
    const courseLessons = getCourseLessons(course.id);
    const firstIncomplete = courseLessons.findIndex(lesson => !(lessonProgress[course.id] || []).includes(lesson.id));
    setActiveCourseId(course.id);
    setLessonIndex(firstIncomplete < 0 ? 0 : firstIncomplete);
    setLessonAnswer(null);
    setLessonAnswerCorrect(null);
    setTutorQuestion('');
    setTutorReply('');
    setNotice('');
    setRoute('learn', course.id);
  }

  async function completeLesson() {
    const lesson = getCourseLessons(activeCourseId)[lessonIndex];
    if (!lesson || lessonAnswerCorrect !== true) return;
    if ((lessonProgress[activeCourseId] || []).includes(lesson.id)) {
      setNotice('Materi ini sudah selesai. Lanjutkan ke pelajaran berikutnya.');
      return;
    }
    if (supabase && session) {
      const { error } = await supabase.from('lesson_progress').upsert(
        { user_id: session.user.id, course_id: activeCourseId, lesson_id: lesson.id },
        { onConflict: 'user_id,lesson_id', ignoreDuplicates: true },
      );
      if (error) {
        setNotice('Progres belum tersimpan. Pastikan pembaruan skema Supabase sudah diterapkan.');
        return;
      }
    } else {
      const next = { ...lessonProgress, [activeCourseId]: [...(lessonProgress[activeCourseId] || []), lesson.id] };
      if (!writeLocal('zaza-lesson-progress', next)) {
        setNotice('Browser tidak dapat menyimpan progres belajar.');
        return;
      }
      setLessonProgress(next);
    }
    if (supabase && session) setLessonProgress(previous => ({ ...previous, [activeCourseId]: [...(previous[activeCourseId] || []), lesson.id] }));
    setNotice('Pelajaran selesai. Progres belajarmu berhasil diperbarui.');
  }

  async function askTutor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = tutorQuestion.trim();
    const lesson = getCourseLessons(activeCourseId)[lessonIndex];
    if (!question || !lesson) return;
    setTutorLoading(true);
    setTutorReply('');
    if (supabase && session) {
      const { data, error } = await supabase.functions.invoke('tutor', { body: { courseId: activeCourseId, lessonId: lesson.id, question } });
      setTutorReply(error ? 'Tutor AI belum tersedia. Periksa konfigurasi Supabase Edge Function.' : (data?.answer || 'Tutor belum dapat menyiapkan jawaban.'));
    } else {
      setTutorReply(`Petunjuk dari materi â€œ${lesson.title}â€: ${lesson.content[0]} Coba hubungkan pertanyaanmu dengan contoh atau masalah yang sedang kamu pelajari.`);
    }
    setTutorLoading(false);
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const identifier = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    const client = supabase;

    if (!client) {
      if (authMode === 'login' && ['student', 'student@kampusunggul.demo'].includes(identifier.toLowerCase()) && password === 'kampus123') {
        const user = { email: 'student@kampusunggul.demo', name: 'Student Demo' };
        setDemoUser(user);
        writeLocal('zaza-demo-user', user);
        setProfileName(readLocal('zaza-profile-name', user.name));
        setAuthMessage('');
        setLoginOpen(false);
        setRoute('dashboard', activeCourseId, true);
      } else {
        setAuthMessage('Akun demo: student / kampus123. Akun baru memerlukan Supabase.');
      }
      return;
    }

    const result = authMode === 'signup'
      ? await client.auth.signUp({
          email: identifier,
          password,
          options: { data: { full_name: String(form.get('fullName') || '').trim() } },
        })
      : await client.auth.signInWithPassword({ email: identifier, password });

    if (result.error) {
      setAuthMessage(result.error.message);
      return;
    }
    if (authMode === 'signup' && !result.data.session) {
      setAuthMessage('Akun dibuat. Periksa email untuk menyelesaikan konfirmasi.');
      return;
    }
    setAuthMessage('');
    setLoginOpen(false);
    setRoute('dashboard', activeCourseId, true);
  }

  async function handleLogout() {
    if (supabase && session) {
      const { error } = await supabase.auth.signOut();
      setNotice(error ? 'Keluar gagal. Coba lagi.' : 'Anda sudah keluar.');
    } else {
      localStorage.removeItem('zaza-demo-user');
      setDemoUser(null);
      setNotice('Anda sudah keluar dari akun demo.');
    }
    setRoute('home', activeCourseId, true);
  }

  async function enroll(course: Course) {
    if (!authenticated) {
      setAuthMessage('Masuk untuk menyimpan pendaftaran kursus.');
      setAuthMode('login');
      setLoginOpen(true);
      return;
    }
    if (enrolled.has(course.id)) {
      setNotice('Kursus sudah ada di daftar belajar Anda.');
      return;
    }
    if (supabase && session) {
      const { error } = await supabase.from('enrollments').upsert(
        { user_id: session.user.id, course_id: course.id },
        { onConflict: 'user_id,course_id', ignoreDuplicates: true },
      );
      if (error) {
        setNotice('Pendaftaran belum tersimpan. Pastikan skema Supabase sudah diterapkan.');
        return;
      }
    } else {
      const next = new Set(enrolled);
      next.add(course.id);
      if (!writeLocal('zaza-enrollments', Array.from(next))) {
        setNotice('Browser tidak dapat menyimpan pendaftaran demo.');
        return;
      }
    }
    setEnrolled(previous => new Set(previous).add(course.id));
    setNotice('Kursus ditambahkan ke daftar belajar.');
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextName = String(form.get('fullName') || '').trim();
    if (!nextName) return;
    setProfileName(nextName);
    if (supabase && session) {
      const { error } = await supabase.from('profiles').upsert(
        { id: session.user.id, full_name: nextName },
        { onConflict: 'id' },
      );
      setNotice(error ? 'Profil belum tersimpan. Pastikan skema Supabase sudah diterapkan.' : 'Profil berhasil disimpan.');
    } else {
      const saved = writeLocal('zaza-profile-name', nextName);
      setNotice(saved ? 'Profil tersimpan di browser demo ini.' : 'Profil tidak dapat disimpan di browser.');
    }
  }

  function submitAnswer() {
    if (selectedAnswer === null) {
      setNotice('Pilih satu jawaban sebelum melanjutkan.');
      return;
    }
    const nextAnswers = [...answers, selectedAnswer];
    setAnswers(nextAnswers);
    setSelectedAnswer(null);
    setNotice('');
    if (questionIndex === questions.length - 1) setQuizComplete(true);
    else setQuestionIndex(index => index + 1);
  }

  function resetQuiz() {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setQuizComplete(false);
    setNotice('');
  }

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leadingDays = Array.from({ length: firstDay.getDay() }, (_, index) => index);
  const days = Array.from({ length: dayCount }, (_, index) => index + 1);
  const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(month);

  function courseCard(course: Course) {
    const isEnrolled = enrolled.has(course.id);
    return (
      <article className="course-card" key={course.id}>
        <div className={'course-art ' + course.accent} aria-hidden="true">
          <span>{course.category}</span><strong>{course.title.split(' ').slice(0, 2).join(' ')}</strong>
        </div>
        <div className="course-card-content">
          <div className="course-meta"><span>{course.level}</span><span>{course.duration}</span></div>
          <h3>{course.title}</h3><p>{course.description}</p>
          {isEnrolled
            ? <div className="course-card-actions"><button className="button button-primary" type="button" onClick={() => openCourse(course)}>Lanjut belajar</button><span className="helper-text" aria-label={`${getCourseLessons(course.id).filter(lesson => (lessonProgress[course.id] || []).includes(lesson.id)).length} dari ${getCourseLessons(course.id).length} pelajaran selesai`}>{getCourseLessons(course.id).filter(lesson => (lessonProgress[course.id] || []).includes(lesson.id)).length}/{getCourseLessons(course.id).length} pelajaran</span></div>
            : <button className="button button-primary" type="button" onClick={() => void enroll(course)}>Daftar kursus</button>}
        </div>
      </article>
    );
  }

  function signInPrompt() {
    return <div className="sign-in-prompt"><p className="eyebrow">AKUN DIPERLUKAN</p><h1>Masuk untuk melanjutkan</h1><p>Gunakan akun demo atau akun Supabase untuk menyimpan progres.</p><button className="button button-primary" onClick={() => setLoginOpen(true)}>Masuk demo</button></div>;
  }

  function renderPage() {
    if (page === 'courses') {
      return <section className="page-section">
        <div className="section-heading"><p className="eyebrow">KATALOG</p><h1>Temukan kursus berikutnya</h1><p>Pilih materi yang sesuai dengan tujuan belajarmu.</p></div>
        <div className="catalog-controls"><label className="search-field"><span className="sr-only">Cari kursus</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Cari kursus..." /></label><label><span className="sr-only">Filter level</span><select value={level} onChange={event => setLevel(event.target.value)}><option>Semua level</option><option>Pemula</option><option>Menengah</option><option>Lanjutan</option></select></label></div>
        <div className="course-grid">{visibleCourses.map(courseCard)}</div>
        {visibleCourses.length === 0 && <p className="empty-state">Belum ada kursus yang cocok. Coba kata kunci lain.</p>}
      </section>;
    }

    if (page === 'dashboard') {
      if (!authenticated) return <section className="page-section narrow">{signInPrompt()}</section>;
      const myCourses = courses.filter(course => enrolled.has(course.id));
      const nextLessons = getCourseLessons(recommendedCourse.id);
      const nextDone = nextLessons.filter(lesson => (lessonProgress[recommendedCourse.id] || []).includes(lesson.id)).length;
      const nextPercent = nextLessons.length ? Math.round((nextDone / nextLessons.length) * 100) : 0;
      const hasCourse = enrolled.has(recommendedCourse.id);
      return <section className="page-section dashboard-page">
        <div className="dashboard-welcome"><div><p className="eyebrow">RUANG BELAJAR <span aria-hidden="true">/</span> RINGKASAN</p><h1>Halo, {name}<span className="welcome-sparkle" aria-hidden="true">✦</span></h1><p>Setiap pelajaran kecil membawamu lebih dekat ke tujuan.</p></div><button className="button button-outline dashboard-calendar-action" onClick={() => navigate('calendar')}><span aria-hidden="true">▦</span> Lihat kalender</button></div>
        <div className="dashboard-metrics" aria-label="Ringkasan progres belajar">
          <article className="dashboard-metric"><span className="dashboard-metric-icon courses-icon" aria-hidden="true">▤</span><div><span>Kursus diikuti</span><strong>{enrolled.size}</strong></div><small>kursus aktif</small></article>
          <article className="dashboard-metric"><span className="dashboard-metric-icon lessons-icon" aria-hidden="true">✓</span><div><span>Pelajaran selesai</span><strong>{completedLessons}<small>{totalLessons ? ' / ' + totalLessons : ''}</small></strong></div><small>{totalLessons ? 'terus bertumbuh' : 'mulai dari satu materi'}</small></article>
          <article className="dashboard-metric"><span className="dashboard-metric-icon progress-icon" aria-hidden="true">↗</span><div><span>Progres keseluruhan</span><strong>{learningPercent}%</strong></div><div className="metric-progress" role="progressbar" aria-label="Progres keseluruhan" aria-valuenow={learningPercent} aria-valuemin={0} aria-valuemax={100}><i style={{ width: learningPercent + '%' }} /></div></article>
        </div>
        <div className="dashboard-layout"><div className="dashboard-main-column">
          <section className={hasCourse ? 'continue-card' : 'continue-card continue-card-empty'} aria-labelledby="continue-title"><div className="continue-card-content">
            <span className="continue-label"><span aria-hidden="true">✦</span> {hasCourse ? 'LANJUTKAN PERJALANAN' : 'MULAI PERJALANAN'}</span>
            <h2 id="continue-title">{hasCourse ? recommendedLesson ? recommendedLesson.title : 'Kamu menuntaskan kursus ini!' : 'Satu langkah kecil, awal yang baik.'}</h2>
            <p>{hasCourse ? recommendedLesson ? recommendedCourse.title + ' · ' + recommendedLesson.duration : 'Hebat, semua pelajaran ' + recommendedCourse.title + ' sudah selesai.' : 'Pilih kursus yang menarik dan pelajari materi pertamamu dengan santai.'}</p>
            {hasCourse && <div className="continue-progress"><div><span>Progres kursus</span><strong>{nextDone} dari {nextLessons.length} pelajaran</strong></div><div className="continue-progress-track" role="progressbar" aria-label={'Progres ' + recommendedCourse.title} aria-valuenow={nextPercent} aria-valuemin={0} aria-valuemax={100}><i style={{ width: nextPercent + '%' }} /></div></div>}
            <button className="button button-primary" onClick={() => hasCourse && recommendedLesson ? openCourse(recommendedCourse) : navigate('courses')}>{hasCourse && recommendedLesson ? 'Lanjut belajar' : hasCourse ? 'Jelajahi kursus lain' : 'Jelajahi kursus'} <span aria-hidden="true">→</span></button>
          </div><div className="continue-art" aria-hidden="true"><span className="art-orbit art-orbit-one" /><span className="art-orbit art-orbit-two" /><span className="art-book">{hasCourse ? '✦' : 'K'}</span><span className="art-sparkle sparkle-one">✧</span><span className="art-sparkle sparkle-two">✦</span></div></section>
          <div className="dashboard-section-heading"><div><p className="eyebrow">KOLEKSI BELAJARMU</p><h2>Kursus pilihanmu <span>{myCourses.length}</span></h2></div><button className="text-button" onClick={() => navigate('courses')}>Jelajahi katalog <span aria-hidden="true">→</span></button></div>
          {myCourses.length ? <div className="course-grid dashboard-course-grid">{myCourses.map(courseCard)}</div> : <div className="dashboard-empty-state"><span className="empty-book" aria-hidden="true">▤</span><div><h3>Belum ada kursus di daftar belajarmu</h3><p>Jelajahi katalog dan pilih topik yang paling ingin kamu pelajari.</p></div><button className="button button-outline" onClick={() => navigate('courses')}>Lihat katalog</button></div>}
        </div>
        <aside className="dashboard-sidebar" aria-label="Ringkasan dan pintasan">
          <section className="dashboard-side-card progress-summary-card"><div className="side-card-heading"><span className="side-card-icon" aria-hidden="true">◔</span><span>Ringkasan progres</span></div><div className="progress-summary-number">{learningPercent}<span>%</span></div><p>progres seluruh kursus</p><div className="side-progress-track" role="progressbar" aria-label="Progres seluruh kursus" aria-valuenow={learningPercent} aria-valuemin={0} aria-valuemax={100}><i style={{ width: learningPercent + '%' }} /></div><div className="progress-summary-footer"><span>{completedLessons} pelajaran selesai</span><span>{enrolled.size} kursus</span></div></section>
          <section className="dashboard-side-card quick-links-card"><div className="side-card-heading"><span className="side-card-icon quick-icon" aria-hidden="true">⌘</span><span>Pintasan</span></div><button className="quick-link" onClick={() => navigate('calendar')}><span className="quick-link-symbol calendar-symbol" aria-hidden="true">▦</span><span><strong>Kalender belajar</strong><small>Atur jadwal belajarmu</small></span><span className="quick-chevron" aria-hidden="true">→</span></button><button className="quick-link" onClick={() => navigate('quiz')}><span className="quick-link-symbol quiz-symbol" aria-hidden="true">✓</span><span><strong>Coba kuis</strong><small>Uji pemahamanmu</small></span><span className="quick-chevron" aria-hidden="true">→</span></button></section>
          <section className="study-tip-card"><span className="tip-icon" aria-hidden="true">✦</span><div><p className="eyebrow">CATATAN HARI INI</p><h3>Belajar sedikit tetap berarti.</h3><p>Selesaikan satu materi, lalu lanjutkan lagi saat kamu siap.</p></div></section>
        </aside></div>
      </section>;
    }

    if (page === 'calendar') {
      return <section className="page-section">
        <div className="section-heading"><p className="eyebrow">JADWAL</p><h1>Kalender belajar</h1><p>Jadwal contoh untuk merencanakan sesi belajar.</p></div>
        <div className="calendar-panel"><div className="calendar-toolbar"><button className="icon-button" onClick={() => setMonth(date => new Date(date.getFullYear(), date.getMonth() - 1, 1))} aria-label="Bulan sebelumnya">â€¹</button><h2>{monthLabel}</h2><button className="icon-button" onClick={() => setMonth(date => new Date(date.getFullYear(), date.getMonth() + 1, 1))} aria-label="Bulan berikutnya">â€º</button></div>
          <div className="calendar-grid" role="grid" aria-label={'Kalender ' + monthLabel}>{['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => <span className="calendar-weekday" role="columnheader" key={day}>{day}</span>)}{leadingDays.map(day => <span className="calendar-day muted" role="gridcell" aria-hidden="true" key={'empty-' + day} />)}{days.map(day => <span className={calendarEvents.some(event => event.day === day) ? 'calendar-day has-event' : 'calendar-day'} role="gridcell" key={day} aria-label={day + ' ' + monthLabel}>{day}</span>)}</div>
        </div>
        <div className="event-list"><h2>Agenda contoh</h2>{calendarEvents.map(event => <article className="event-row" key={event.day}><time>{event.day} {monthLabel.split(' ')[0]}</time><div><strong>{event.title}</strong><span>{event.time}</span></div></article>)}</div>
      </section>;
    }

    if (page === 'learn') {
      const course = courses.find(item => item.id === activeCourseId);
      const courseLessons = getCourseLessons(activeCourseId);
      const lesson = courseLessons[lessonIndex];
      if (!authenticated || !course || !enrolled.has(activeCourseId) || !lesson) return <section className="page-section narrow">{signInPrompt()}</section>;
      const completed = (lessonProgress[activeCourseId] || []).includes(lesson.id);
      const doneCount = courseLessons.filter(item => (lessonProgress[activeCourseId] || []).includes(item.id)).length;
      return <section className="page-section learning-layout">
        <div className="section-heading"><p className="eyebrow">RUANG BELAJAR Â· {course.title.toUpperCase()}</p><h1>{lesson.title}</h1><p>Pelajari materinya, jawab pertanyaan singkat, lalu simpan progresmu.</p></div>
        <div className="learning-progress" aria-label={`Progres ${doneCount} dari ${courseLessons.length} pelajaran`}><div><span>Progres kursus</span><strong>{doneCount} dari {courseLessons.length} pelajaran Â· {Math.round((doneCount / courseLessons.length) * 100)}%</strong></div><progress value={doneCount} max={courseLessons.length}>{doneCount} dari {courseLessons.length}</progress></div>
        <div className="learning-columns"><aside className="lesson-list" aria-label="Daftar pelajaran"><h2>Pelajaran kursus</h2>{courseLessons.map((item, index) => <button key={item.id} className={index === lessonIndex ? 'lesson-link active' : 'lesson-link'} aria-current={index === lessonIndex ? 'step' : undefined} onClick={() => { setLessonIndex(index); setLessonAnswer(null); setLessonAnswerCorrect(null); setTutorReply(''); }}><span>{(lessonProgress[activeCourseId] || []).includes(item.id) ? 'âœ“' : String(index + 1).padStart(2, '0')}</span><span>{item.title}<small>{item.duration}</small></span></button>)}</aside>
          <div className="lesson-content"><article className="lesson-reading"><p className="eyebrow">MATERI Â· {lesson.duration}</p>{lesson.content.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</article>
            <section className="lesson-check" aria-labelledby="lesson-check-title"><p className="eyebrow">CEK PEMAHAMAN</p><h2 id="lesson-check-title">{lesson.check.question}</h2><div className="answer-list" role="group" aria-label="Pilih jawaban"><button className={lessonAnswer === 0 ? 'answer-option selected' : 'answer-option'} aria-pressed={lessonAnswer === 0} onClick={() => { setLessonAnswer(0); setLessonAnswerCorrect(null); }}>{lesson.check.answers[0]}</button><button className={lessonAnswer === 1 ? 'answer-option selected' : 'answer-option'} aria-pressed={lessonAnswer === 1} onClick={() => { setLessonAnswer(1); setLessonAnswerCorrect(null); }}>{lesson.check.answers[1]}</button><button className={lessonAnswer === 2 ? 'answer-option selected' : 'answer-option'} aria-pressed={lessonAnswer === 2} onClick={() => { setLessonAnswer(2); setLessonAnswerCorrect(null); }}>{lesson.check.answers[2]}</button></div><div className="lesson-check-actions"><button className="button button-outline" disabled={lessonAnswer === null} onClick={() => setLessonAnswerCorrect(lessonAnswer === lesson.check.correct)}>Periksa jawaban</button>{completed || lessonAnswerCorrect === true ? <button className="button button-primary" onClick={() => void completeLesson()}>{completed ? 'Simpan progres' : 'Tandai selesai'}</button> : null}</div>{lessonAnswerCorrect !== null && <p className={lessonAnswerCorrect ? 'inline-feedback success' : 'inline-feedback error'} role="status">{lessonAnswerCorrect ? `Tepat! ${lesson.check.explanation}` : 'Belum tepat. Tinjau kembali materi dan coba lagi.'}</p>}{completed && <div className="next-lesson"><p className="inline-feedback success" role="status">Pelajaran ini sudah selesai.</p>{lessonIndex + 1 < courseLessons.length && <button className="text-button" onClick={() => { setLessonIndex(index => index + 1); setLessonAnswer(null); setLessonAnswerCorrect(null); setTutorReply(''); }}>Lanjut ke pelajaran berikutnya â†’</button>}</div>}</section>
            <section className="tutor-panel" aria-labelledby="tutor-title"><p className="eyebrow">ASISTEN BELAJAR</p><h2 id="tutor-title">Tanya tutor tentang materi</h2><p>{supabase && session ? 'Tutor AI akan menjawab berdasarkan materi pelajaran ini.' : 'Mode demo memberi petunjuk dari materi tanpa mengirim data ke layanan luar.'}</p><form onSubmit={event => void askTutor(event)}><label className="sr-only" htmlFor="tutor-question">Pertanyaan untuk tutor</label><textarea id="tutor-question" value={tutorQuestion} onChange={event => setTutorQuestion(event.target.value)} maxLength={500} placeholder="Contoh: bagaimana menerapkan konsep ini?" required /><button className="button button-primary" type="submit" disabled={tutorLoading}>{tutorLoading ? 'Menyiapkan jawabanâ€¦' : 'Tanya tutor'}</button></form>{tutorReply && <p className="tutor-reply" role="status">{tutorReply}</p>}</section>
          </div>
        </div>
      </section>;
    }

    if (page === 'quiz') {
      const score = answers.reduce((total, answer, index) => total + (answer === questions[index]?.correct ? 1 : 0), 0);
      return <section className="page-section narrow">
        <div className="section-heading"><p className="eyebrow">LATIHAN</p><h1>Kuis singkat</h1><p>Uji pemahamanmu dengan tiga pertanyaan.</p></div>
        {quizComplete
          ? <div className="quiz-panel result-panel"><p className="eyebrow">HASIL</p><h2>Skor kamu {score} dari {questions.length}</h2><p>{score === questions.length ? 'Hebat, semua jawaban tepat.' : 'Terus berlatih dan coba lagi.'}</p><button className="button button-primary" onClick={resetQuiz}>Ulangi kuis</button></div>
          : <div className="quiz-panel"><div className="quiz-progress"><span>Pertanyaan {questionIndex + 1} dari {questions.length}</span><div><i style={{ width: (((questionIndex + 1) / questions.length) * 100) + '%' }} /></div></div><h2>{questions[questionIndex].prompt}</h2><div className="answer-list">{questions[questionIndex].answers.map((answer, index) => <button key={answer} className={selectedAnswer === index ? 'answer-option selected' : 'answer-option'} aria-pressed={selectedAnswer === index} onClick={() => setSelectedAnswer(index)}>{answer}</button>)}</div><button className="button button-primary" onClick={submitAnswer}>{questionIndex === questions.length - 1 ? 'Lihat hasil' : 'Lanjutkan'}</button></div>}
      </section>;
    }

    if (page === 'profile') {
      if (!authenticated) return <section className="page-section narrow">{signInPrompt()}</section>;
      return <section className="page-section narrow"><div className="section-heading"><p className="eyebrow">AKUN</p><h1>Profil belajar</h1><p>Perbarui nama yang digunakan di dashboard.</p></div><form className="profile-panel" onSubmit={event => void saveProfile(event)}><label>Email akun<input value={email} readOnly /></label><label>Nama tampilan<input name="fullName" value={profileName} onChange={event => setProfileName(event.target.value)} required maxLength={80} /></label><p className="helper-text">{supabaseConfigured ? 'Profil disimpan pada akun Supabase.' : 'Profil disimpan di browser ini untuk mode demo.'}</p><button className="button button-primary" type="submit">Simpan profil</button></form></section>;
    }

    if (page === 'forum') {
      return <section className="page-section"><div className="section-heading"><p className="eyebrow">KOMUNITAS</p><h1>Ruang diskusi</h1><p>Topik contoh untuk menemukan komunitas belajarmu.</p></div><div className="topic-grid">{['Programming', 'Artificial Intelligence', 'Data Science', 'Karier Teknologi'].map((topic, index) => <article className="topic-card" key={topic}><span className="topic-number">0{index + 1}</span><h2>{topic}</h2><p>Diskusi, pertanyaan, dan berbagi wawasan seputar {topic.toLowerCase()}.</p><span className="helper-text">Kategori demo</span></article>)}</div></section>;
    }

    if (page === 'materials') {
      return <section className="page-section"><div className="section-heading"><p className="eyebrow">SUMBER BELAJAR</p><h1>Materi pembelajaran</h1><p>Daftar materi contoh. Berkas unduhan belum tersedia di demo ini.</p></div><div className="topic-grid">{['Panduan pengantar data science', 'Catatan machine learning', 'Template proyek web'].map(item => <article className="topic-card" key={item}><span className="topic-number">PDF</span><h2>{item}</h2><p>Materi contoh untuk melengkapi pengalaman belajar.</p><button className="button button-muted" disabled>Segera tersedia</button></article>)}</div></section>;
    }

    return <>
      <section className="hero"><div className="hero-copy"><p className="eyebrow">BELAJAR DENGAN TUJUAN</p><h1>Bangun skill digital, selangkah demi selangkah.</h1><p>Temukan kursus praktis, ukur pemahamanmu, dan simpan progres belajar dalam satu ruang.</p><div className="hero-actions"><button className="button button-primary" onClick={() => navigate('courses')}>Jelajahi kursus <span aria-hidden="true">â†’</span></button><button className="button button-ghost" onClick={() => navigate('quiz')}>Coba kuis singkat</button></div><div className="hero-proof"><span><strong>06</strong> kursus contoh</span><span><strong>03</strong> topik latihan</span></div></div><div className="hero-visual" aria-label="Pratinjau ruang belajar"><div className="visual-window"><div className="visual-topline"><span /><span /><span /></div><div className="visual-title">Progress belajar</div><div className="visual-course"><span className="visual-icon">DS</span><div><strong>Data Science</strong><small>Modul 04 Â· Analisis data</small></div><span className="visual-percent">72%</span></div><div className="visual-progress"><i /></div><div className="visual-bottom"><span>Terus bergerak maju</span><b>â†—</b></div></div><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /></div></section>
      <section className="home-section"><div className="section-heading"><p className="eyebrow">KATALOG PILIHAN</p><h2>Mulai dari yang menarik perhatianmu</h2><p>Kursus contoh dengan topik yang relevan untuk perjalanan digital.</p></div><div className="course-grid">{courses.slice(0, 3).map(courseCard)}</div><div className="section-action"><button className="button button-outline" onClick={() => navigate('courses')}>Lihat semua kursus</button></div></section>
      <section className="feature-strip"><div><span className="feature-mark">01</span><h3>Belajar terarah</h3><p>Mulai dari materi fondasi hingga topik lanjutan.</p></div><div><span className="feature-mark">02</span><h3>Latihan singkat</h3><p>Uji pemahaman lewat kuis interaktif.</p></div><div><span className="feature-mark">03</span><h3>Progres tersimpan</h3><p>Mode demo menyimpan pilihan di browser; Supabase opsional untuk data akun.</p></div></section>
    </>;
  }

  return <div className="app-shell">
    <header className="site-header">
      <button className="brand" onClick={() => navigate('home')} aria-label="Kampus Unggul beranda"><span className="brand-mark">K</span><span>Kampus<span className="brand-light">Unggul</span><small>RUANG BELAJAR DIGITAL</small></span></button>
      <nav className="main-nav" aria-label="Navigasi utama">{navigationGroups.map(group => <div className="nav-group" role="group" aria-label={group.label} key={group.label}><span className="nav-group-label">{group.label}</span><div className="nav-group-links">{group.items.map(item => <button key={item.id} className={page === item.id ? 'nav-link active' : 'nav-link'} aria-current={page === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}>{item.label}</button>)}</div></div>)}</nav>
      <div className="header-actions"><span className={supabaseConfigured ? 'environment-badge' : 'environment-badge demo'}>{supabaseConfigured ? 'Supabase' : 'Mode demo'}</span>{authenticated ? <><button className="user-chip" onClick={() => navigate('profile')} aria-label={'Profil ' + name}><span className="avatar">{name.slice(0, 1).toUpperCase()}</span><span>{name}</span></button><button className="button button-small button-outline" onClick={() => void handleLogout()}>Keluar</button></> : <button className="button button-small button-primary" aria-label="Masuk Demo" onClick={() => { setAuthMode('login'); setLoginOpen(true); }}>Masuk</button>}</div>
    </header>
    <main>
      {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Tutup pemberitahuan">Ã—</button></div>}
      {renderPage()}
    </main>
    <footer className="site-footer"><div className="footer-brand"><span className="brand-mark">K</span><span>Kampus Unggul</span></div><p>Prototipe e-learning untuk eksplorasi pengalaman belajar digital.</p><a href="https://github.com/chlayverts/oldproject" target="_blank" rel="noreferrer">Lihat repositori â†—</a></footer>
    {loginOpen && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setLoginOpen(false); }}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="modal-close" onClick={() => setLoginOpen(false)} aria-label="Tutup formulir masuk">Ã—</button><p className="eyebrow">{supabaseConfigured ? 'AKUN KAMPUS UNGGUL' : 'MODE DEMO'}</p><h2 id="auth-title">{authMode === 'login' ? 'Selamat datang kembali' : 'Buat akun belajar'}</h2><p>{supabaseConfigured ? 'Masuk untuk menyimpan kursus dan profilmu.' : 'Gunakan akun demo untuk mencoba dashboard dan pendaftaran.'}</p>{!supabaseConfigured && <div className="demo-credentials"><span>Username</span><strong>student</strong><span>Password</span><strong>kampus123</strong></div>}<form onSubmit={event => void handleAuth(event)}><label>{supabaseConfigured ? 'Email' : 'Email atau username'}<input name="email" type={supabaseConfigured ? 'email' : 'text'} placeholder={supabaseConfigured ? 'nama@email.com' : 'student'} autoComplete="username" required /></label>{authMode === 'signup' && <label>Nama lengkap<input name="fullName" autoComplete="name" required /></label>}<label>Password<input name="password" type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength={6} req