export type Course = {
  id: string;
  title: string;
  category: string;
  level: 'Pemula' | 'Menengah' | 'Lanjutan';
  duration: string;
  description: string;
  accent: string;
};

export const courses: Course[] = [
  {
    id: 'data-science',
    title: 'Data Science Fundamentals',
    category: 'Data',
    level: 'Pemula',
    duration: '8 minggu',
    description: 'Bangun dasar analisis data, visualisasi, dan pemodelan dengan Python.',
    accent: 'blue',
  },
  {
    id: 'web-development',
    title: 'Full-Stack Web Development',
    category: 'Engineering',
    level: 'Menengah',
    duration: '12 minggu',
    description: 'Rancang pengalaman web modern dari antarmuka hingga layanan API.',
    accent: 'green',
  },
  {
    id: 'ai-ethics',
    title: 'AI Ethics and Society',
    category: 'AI',
    level: 'Pemula',
    duration: '6 minggu',
    description: 'Pelajari dampak sosial, bias, dan prinsip tanggung jawab dalam AI.',
    accent: 'orange',
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning Advanced',
    category: 'AI',
    level: 'Lanjutan',
    duration: '16 minggu',
    description: 'Kenali alur kerja model, evaluasi, dan teknik machine learning lanjutan.',
    accent: 'purple',
  },
  {
    id: 'cyber-security',
    title: 'Cyber Security Fundamentals',
    category: 'Security',
    level: 'Pemula',
    duration: '10 minggu',
    description: 'Pahami praktik dasar untuk menjaga aplikasi dan data tetap aman.',
    accent: 'red',
  },
  {
    id: 'cloud-computing',
    title: 'Cloud Computing with AWS',
    category: 'Cloud',
    level: 'Menengah',
    duration: '14 minggu',
    description: 'Jelajahi konsep cloud, deployment, dan layanan infrastruktur.',
    accent: 'teal',
  },
];
