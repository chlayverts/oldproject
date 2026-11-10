export type Page = 'home' | 'courses' | 'dashboard' | 'calendar' | 'quiz' | 'profile' | 'forum' | 'materials' | 'learn';

export const navigationGroups: { label: string; items: { id: Page; label: string }[] }[] = [
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
