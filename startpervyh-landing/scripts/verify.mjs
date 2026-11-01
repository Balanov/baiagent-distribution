import { preview } from 'vite';
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

const baseURL = process.env.TEST_URL || 'http://127.0.0.1:7100/';
const webURL = 'https://owners.startpervyh.ru/';
const windowsURL = 'https://github.com/Balanov/baiagent-distribution/releases/download/v0.1.0/BAIagent-Distribution-Setup-Windows-0.1.0-x64.exe';
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let server;
let browser;

function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`✓ ${message}`);
}

async function checkExternalTargets() {
  const webResponse = await fetch(webURL, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
  assert(webResponse.ok, 'Веб-версия доступна по целевой ссылке');
  const windowsResponse = await fetch(windowsURL, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(30000) });
  assert(windowsResponse.ok, 'Установщик Windows доступен по прямой ссылке');
  assert(windowsResponse.headers.get('content-length') === '442596063', 'Размер установщика соответствует опубликованному релизу');
}

try {
  await mkdir('test-results', { recursive: true });
  await checkExternalTargets();

  if (!process.env.TEST_URL) {
    server = await preview({ preview: { host: '127.0.0.1', port: 7100, strictPort: true } });
  }
  browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
  assert(response.status() === 200, 'Главная страница возвращает HTTP 200');
  assert((await page.title()) === 'Поиск каналов для продукта — Старт первых', 'Заголовок страницы русский и понятный');
  assert((await page.locator('h1').count()) === 1, 'На странице один главный оффер');
  assert((await page.locator('h1').innerText()) === 'Найдите, кому предложить ваш продукт.', 'Главный оффер конкретный и русский');
  assert(await page.locator('#open-web').isVisible(), 'Кнопка веб-версии видна');
  assert(await page.locator('#download-windows').isVisible(), 'Кнопка скачивания видна');
  assert(await page.locator('#open-web').getAttribute('href') === webURL, 'Веб-кнопка ведёт в рабочий продукт');
  assert(await page.locator('#download-windows').getAttribute('href') === windowsURL, 'Кнопка скачивания ведёт к установщику');
  assert(await page.locator('form, input, textarea, select, [role="tablist"], iframe').count() === 0, 'Нет анкет, вкладок и встроенных имитаций продукта');
  assert(!(await page.locator('body').innerText()).includes('BAIagent'), 'На видимой странице нет английского нейминга');
  assert(await page.locator('script').count() === 0, 'Страница работает без JavaScript');

  const desktopActionsVisible = await page.evaluate(() => {
    const web = document.querySelector('#open-web').getBoundingClientRect();
    const windows = document.querySelector('#download-windows').getBoundingClientRect();
    return web.bottom <= innerHeight && windows.bottom <= innerHeight;
  });
  assert(desktopActionsVisible, 'Оба действия доступны на первом экране десктопа');
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert(!desktopOverflow, 'На десктопе нет горизонтального переполнения');
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: false });
  await page.screenshot({ path: 'test-results/desktop-full.jpg', fullPage: true, type: 'jpeg', quality: 85 });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert(!mobileOverflow, 'На мобильном нет горизонтального переполнения');
  const mobileActionsVisible = await page.evaluate(() => {
    const web = document.querySelector('#open-web').getBoundingClientRect();
    const windows = document.querySelector('#download-windows').getBoundingClientRect();
    return web.top >= 0 && web.bottom <= innerHeight && windows.top >= 0 && windows.bottom <= innerHeight;
  });
  assert(mobileActionsVisible, 'Оба действия доступны на первом экране телефона');
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: false });
  await page.screenshot({ path: 'test-results/mobile-full.jpg', fullPage: true, type: 'jpeg', quality: 85 });

  const productPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const productResponse = await productPage.goto(webURL, { waitUntil: 'networkidle' });
  assert(productResponse.status() === 200, 'Веб-версия открывается в браузере');
  assert(await productPage.getByRole('textbox', { name: 'Сайт вашего продукта' }).isVisible(), 'В веб-версии доступен запуск по сайту продукта');
  await productPage.close();

  assert(errors.length === 0, 'В браузере нет ошибок JavaScript');
  console.log('\nВсе проверки пройдены.');
} finally {
  if (browser) await browser.close();
  if (server) await new Promise((resolve) => server.httpServer.close(resolve));
}
