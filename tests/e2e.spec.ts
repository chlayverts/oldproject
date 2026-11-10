import { expect, test } from '@playwright/test';

test('demo user can search and enroll in a course', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Masuk Demo' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Email atau username').fill('student');
  await dialog.getByLabel('Password').fill('kampus123');
  await dialog.getByRole('button', { name: 'Masuk' }).click();

  await expect(page.getByRole('heading', { name: /Selamat datang, Student Demo/ })).toBeVisible();
  await page.getByRole('button', { name: 'Kursus', exact: true }).click();
  await page.getByPlaceholder('Cari kursus...').fill('Data Science');

  const course = page.getByRole('article').filter({ hasText: 'Data Science Fundamentals' });
  await expect(course).toBeVisible();
  await expect(page.getByRole('article').filter({ hasText: 'Full-Stack Web Development' })).toHaveCount(0);
  await course.getByRole('button', { name: 'Daftar kursus' }).click();
  await expect(course.getByRole('button', { name: 'Terdaftar' })).toBeVisible();
});

test('learner can complete the short quiz', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Kuis', exact: true }).click();

  await page.getByRole('button', { name: 'Mengubah data menjadi insight yang dapat ditindaklanjuti.' }).click();
  await page.getByRole('button', { name: 'Lanjutkan' }).click();
  await page.getByRole('button', { name: 'Mengukur kemampuan model pada data yang belum pernah dilihat.' }).click();
  await page.getByRole('button', { name: 'Lanjutkan' }).click();
  await page.getByRole('button', { name: 'Memeriksa bias dan dampak penggunaan data.' }).click();
  await page.getByRole('button', { name: 'Lihat hasil' }).click();

  await expect(page.getByRole('heading', { name: 'Skor kamu 3 dari 3' })).toBeVisible();
});
