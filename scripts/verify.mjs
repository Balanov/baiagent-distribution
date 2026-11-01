import { preview } from 'vite';
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

const baseURL = 'http://127.0.0.1:7100/';
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const server = await preview({ preview: { host: '127.0.0.1', port: 7100, strictPort: true } });
let browser;

function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`✓ ${message}`);
}

try {
  await mkdir('test-results', { recursive: true });
  browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
  assert(response.status() === 200, 'Главная страница возвращает HTTP 200');
  assert((await page.title()).includes('BAIagent Distribution'), 'Заголовок страницы корректен');
  assert(await page.locator('h1').isVisible(), 'Главный оффер виден');
  assert(await page.locator('.lead-form').count() === 1, 'Форма заявки присутствует');

  await page.locator('#tab-channels').click();
  assert(await page.locator('#panel-channels').isVisible(), 'Вкладка каналов переключается');
  await page.locator('#tab-pilot').click();
  assert(await page.locator('#panel-pilot').isVisible(), 'Вкладка пилота переключается');
  await page.locator('#tab-passport').click();
  assert(await page.locator('#panel-passport').isVisible(), 'Вкладка паспорта переключается');

  for (const question of ['vision', 'demo', 'proof']) {
    await page.locator(`label:has(input[name="${question}"][value="yes"])`).click();
  }
  for (const question of ['conversion', 'economics']) {
    await page.locator(`label:has(input[name="${question}"][value="no"])`).click();
  }
  assert((await page.locator('#readiness-result code').textContent()) === 'ready_for_partner_pilot', 'Предпроверка выдаёт допуск к партнёрскому пилоту');
  await page.locator('label:has(input[name="vision"][value="no"])').click();
  assert((await page.locator('#readiness-result code').textContent()) === 'return_to_vision', 'Предпроверка возвращает к рыночной гипотезе');
  for (const question of ['vision', 'conversion', 'economics']) {
    await page.locator(`label:has(input[name="${question}"][value="yes"])`).click();
  }
  assert((await page.locator('#readiness-result code').textContent()) === 'ready_for_scale', 'Предпроверка выдаёт допуск к масштабированию');

  await page.route('https://startpervyh.ru/send_mail.php', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
  await page.locator('input[name="Имя"]').fill('Тестовая проверка');
  await page.locator('input[name="Телефон_Telegram"]').fill('@test');
  await page.locator('input[name="Продукт_Компания"]').fill('Тестовый продукт');
  await page.locator('select[name="Стадия_продукта"]').selectOption({ label: 'MVP' });
  await page.locator('select[name="Цель_распространения"]').selectOption({ label: 'Партнёрский пилот' });
  await page.locator('.consent input').check();
  await page.locator('#lead-form [type="submit"]').click();
  await page.locator('.form-status.is-success').waitFor();
  assert((await page.locator('.form-status').textContent()).includes('Заявка отправлена'), 'Форма корректно обрабатывает успешный ответ сервера');

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert(!desktopOverflow, 'На десктопе нет горизонтального переполнения');
  const brokenAnchors = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')]
    .map((link) => link.getAttribute('href'))
    .filter((href) => href.length > 1 && !document.querySelector(href)));
  assert(brokenAnchors.length === 0, 'Все внутренние ссылки ведут к существующим разделам');
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: false });
  await page.screenshot({ path: 'test-results/desktop-full.jpg', fullPage: true, type: 'jpeg', quality: 78 });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert(!mobileOverflow, 'На мобильном нет горизонтального переполнения');
  await page.locator('.nav-toggle').click();
  assert(await page.locator('#mobile-nav').isVisible(), 'Мобильное меню открывается');
  await page.locator('#mobile-nav a[href="#result"]').click();
  assert(await page.locator('#mobile-nav').isHidden(), 'Мобильное меню закрывается после перехода');
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: false });
  await page.screenshot({ path: 'test-results/mobile-full.jpg', fullPage: true, type: 'jpeg', quality: 78 });

  assert(errors.length === 0, 'В браузере нет ошибок JavaScript');
  console.log('\nВсе проверки пройдены.');
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
