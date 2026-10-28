const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

test('responsive image inputs have unique filename stems', () => {
  const stems = fs.readdirSync('assets/img')
    .filter(file => /\.(jpe?g|png|tiff|gif)$/i.test(file))
    .map(file => path.parse(file).name);
  expect(new Set(stems).size).toBe(stems.length);
});

test('homepage preserves biography, publications, assets and theme controls', async ({ page }, testInfo) => {
  const failedLocal = [];
  page.on('response', response => {
    if (response.url().startsWith('http://127.0.0.1:4000/') && response.status() >= 400) {
      failedLocal.push(response.url());
    }
  });
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Francesco Zoffoli');
  await expect(page.locator('article')).toContainText('Bloomberg');
  await expect(page.getByRole('heading', { name: 'C++ Fundamentals' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Coroutine Patterns and How to Use Them' })).toBeVisible();
  await expect(page.locator('a[href="https://youtu.be/l6Y9PqyK1Mc"]')).toBeVisible();
  await expect(page.locator('a[href="https://github.com/MakersF"]')).toBeVisible();
  await expect(page.locator('a[href="https://www.linkedin.com/in/francesco-zoffoli"]')).toBeVisible();
  const portrait = page.locator('img[src*="prof_pic"]');
  await expect(portrait).toBeVisible();
  expect(await portrait.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  expect(await page.locator('body').evaluate(element => getComputedStyle(element).fontFamily)).toMatch(/Roboto/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('home-light.png'), fullPage: true });
  const menu = page.getByRole('button', { name: 'Toggle navigation' });
  if (await menu.isVisible()) {
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
  }
  await expect(page.locator('nav').getByRole('link', { name: 'blog', exact: true })).toBeVisible();
  await expect(page.locator('nav').getByRole('link', { name: 'resume', exact: true })).toHaveAttribute('href', '/resume/');
  await page.locator('#light-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  if (await menu.isVisible()) await menu.click();
  await page.screenshot({ path: testInfo.outputPath('home-dark.png'), fullPage: true });
  expect(failedLocal).toEqual([]);
});

test('blog, resume, error page and custom domain survive the migration', async ({ page, request }) => {
  await page.goto('/blog/');
  await expect(page.getByRole('heading', { name: 'Brainstorming Aloud' })).toBeVisible();
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  const pdf = await request.get('/assets/pdf/francesco_zoffoli-CV.pdf');
  expect(pdf.ok()).toBe(true);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  const resume = await request.get('/resume/');
  expect(resume.ok()).toBe(true);
  expect(await resume.text()).toContain('url=/assets/pdf/francesco_zoffoli-CV.pdf');
  expect(fs.readFileSync('_site/CNAME', 'utf8').trim()).toBe('www.francescozoffoli.com');
  expect(fs.existsSync('_site/vendor')).toBe(false);
  expect(fs.readFileSync('_site/index.html', 'utf8')).not.toContain('you@example.com');
});
