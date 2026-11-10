import { expect, test } from '@playwright/test';

test('demo user can search and enroll in a course', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Masuk Demo' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Email atau username').fill('student');
  await dialog.getByLabel('Password').fill('kampus123');
  await dialog.getByRole('button', { name: 'Masuk', exact: true }).click();

  await expect(page.getByRole('heading', { name: /Halo, Student Demo/ })).toBeVisible();
  await page.getByRole('button', { name: 'Kursus', exact: true }).click();
  await page.getByPlaceholder('Cari kursus...').fill('Data Science');

  const course = page.getByRole('article').filter({ hasText: 'Data Science Fundamentals' });
  await expect(course).toBeVisible();
  await expect(page.getByRole('article').filter({ hasText: 'Full-Stack Web Development' })).toHaveCount(0);
  await course.getByRole('button', { name: 'Daftar kursus' }).click();
  await expect(course.getByRole('button', { name: 'Lanjut belajar' })).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: 'Kursus', exact: true }).click();
  await page.getByPlaceholder('Cari kursus...').fill('Data Science');
  await expect(page.getByRole('article').filter({ hasText: 'Data Science Fundamentals' }).getByRole('button', { name: 'Lanjut belajar' })).toBeVisible();
});

test('learner completes a lesson and sees saved progress and the next recommendation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Masuk Demo' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Email atau username').fill('student');
  await dialog.getByLabel('Password').fill('kampus123');
  await dialog.getByRole('button', { name: 'Masuk', exact: true }).click();

  await page.getByRole('button', { name: 'Kursus', exact: true }).click();
  const course = page.getByRole('article').filter({ hasText: 'Data Science Fundamentals' });
  await course.getByRole('button', { name: 'Daftar kursus' }).click();
  await course.getByRole('button', { name: 'Lanjut belajar' }).click();
  await expect(page.getByRole('heading', { name: 'Merumuskan pertanyaan data', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Mengikuti langkah tanpa memeriksa konteks atau hasilnya.' }).click();
  await page.getByRole('button', { name: 'Periksa jawaban' }).click();
  await expect(page.getByText('Belum tepat. Tinjau kembali materi dan coba lagi.')).toBeVisible();
  await page.getByRole('button', { name: 'Memahami tujuan, menguji asumsi, dan menjelaskan hasilnya.' }).click();
  await page.getByRole('button', { name: 'Periksa jawaban' }).click();
  await page.getByRole('button', { name: 'Tandai selesai' }).click();
  await expect(page.getByText('Pelajaran ini sudah selesai.')).toBeVisible();

  await page.getByRole('button', { name: 'Dashboard', exact: true }).click();
  await expect(page.getByText('1 / 3')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Menyiapkan dan memahami data' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Dashboard', exact: true }).click();
  await expect(page.getByText('1 / 3')).toBeVisible();
});

test('demo tutor returns a hint grounded in the current lesson', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Masuk Demo' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Email atau username').fill('student');
  await dialog.getByLabel('Password').fill('kampus123');
  await dialog.getByRole('button', { name: 'Masuk', exact: true }).click();
  await page.getByRole('button', { name: 'Kursus', exact: true }).click();
  const course = page.getByRole('article').filter({ hasText: 'Data Science Fundamentals' });
  await course.getByRole('button', { name: 'Daftar kursus' 