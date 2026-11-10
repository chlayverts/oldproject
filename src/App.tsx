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
  const 