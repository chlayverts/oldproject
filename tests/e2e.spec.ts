import { expect, test } from '@playwright/test';

test('demo user can search and enroll in a course', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Masuk Demo' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Email atau username').fill('student');
  await dialog.getByLabel('Password').fill('kampus123');
  await dialog.getByRole('button', { name: 'Masuk', exact: true }).click();

  await expect(page.getByRole('heading', { name: /Selamat datang, Student Demo/ })).toBeVisible();
  await page.getByRole('button', { name: 'Kursus', exact: true }).click();
  await page.getByPlaceholder('Cari kursus...').fill('Data Science');

  const course = page.getByRole('article').filter({ hasText: 'Data Science Fundamentals' });
  await expect(course).toBeVisible();
  await expect(page.getByRole('article').filter({ hasText: 'Full-Stack Web Development' })).toHaveCount(0);
  await course.getByRole('button', { name: 'Daftar kursus' }).click();
  await expect(course.getByRole('button', { name: 'Terdaftar' })).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: 'Kursus', exact: true }).click();
  await page.getByPlaceholder('Cari kursus...').fill('Data Science');
  await expect(page.getByRole('article').filter({ hasText: 'Data Science Fundamentals' }).getByRole('button', { name: 'Terdaftar' })).toBeVisible();
});

test('learner can complete the short quiz', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Kuis', exact: true }).click();

  await page.getByRole('button', { name: 'Lanjutkan' }).click();
  await expect(page.getByRole('status')).toContainText('Pilih satu jawaban');
  await page.getByRole('button', { name: 'Mengubah data menjadi insight yang dapat ditindaklanjuti.' }).click();
  await page.getByRole('button', { name: 'Lanjutkan' }).click();
  await page.getByRole('button', { name: 'Mengukur kemampuan model pada data yang belum pernah dilihat.' }).click();
  await page.getByRole('button', { name: 'Lanjutkan' }).click();
  await page.getByRole('button', { name: 'Memeriksa bias dan dampak penggunaan data.' }).click();
  await page.getByRole('button', { name: 'Lihat hasil' }).click();

  await expect(page.getByRole('heading', { name: 'Skor kamu 3 dari 3' })).toBeVisible();
});

test('course search and level filter combine and show an empty state', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Kursus', exact: true }).click();
  await page.getByPlaceholder('Cari kursus...').fill('AI');
  await page.getByLabel('Filter level').selectOption('Lanjutan');

  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Machine Learning Advanced' })).toBeVisible();

  await page.getByPlaceholder('Cari kursus...').fill('not-a-course');
  await expect(page.getByText('Belum ada kursus yang cocok.')).toBeVisible();
});

test('profile edits persist in the demo browser session', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Masuk Demo' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Email atau username').fill('student');
  await dialog.getByLabel('Password').fill('kampus123');
  await dialog.getByRole('button', { name: 'Masuk', exact: true }).click();

  await page.getByRole('button', { name: 'Profil Student Demo' }).click();
  await page.getByLabel('Nama tampilan').fill('Ayu Portofolio');
  await page.getByRole('button', { name: 'Simpan profil' }).click();
  await expect(page.getByRole('button', { name: 'Profil Ayu Portofolio' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: 'Profil Ayu Portofolio' })).toBeVisible();
  await page.getByRole('button', { name: 'Dashboard', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Selamat datang, Ayu Portofolio' })).toBeVisible();
});

test('calendar month navigation advances and returns', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Kalender', exact: true }).click();
  const monthHeading = page.locator('.calendar-toolbar h2');
  const initialMonth = await monthHeading.textContent();

  await page.getByRole('button', { name: 'Bulan berikutnya' }).click();
  await expect(monthHeading).not.toHaveText(initialMonth || '');
  await page.getByRole('button', { name: 'Bulan sebelumnya' }).click();
  await expect(monthHeading).toHaveText(initialMonth || '');
});

test('invalid demo credentials do not create a session', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Masuk Demo' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Email atau username').fill('student');
  await dialog.getByLabel('Password').fill('incorrect-password');
  await dialog.getByRole('button', { name: 'Masuk', exact: true }).click();

  await expect(dialog.getByRole('alert')).toContainText('Akun demo');
  await expect(page.getByRole('button', { name: 'Masuk Demo' })).toBeVisible();
});

test('landing page and sign-in dialog fit small phone screens', async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const pageWidth = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(pageWidth.content).toBeLessThanOrEqual(pageWidth.viewport);

    await page.getByRole('button', { name: 'Masuk Demo' }).click();
    const dialog = page.getByRole('dialog');
    const bounds = await dialog.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    await page.getByRole('button', { name: 'Tutup formulir masuk' }).click();
  }
});

