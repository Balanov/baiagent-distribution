import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const profile = path.join(root, 'artifacts', 'ui-smoke-profile');
const screenshot = path.join(root, 'validation', 'distribution-home.png');
const vite = spawn(process.execPath, [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', '127.0.0.1', '--port', '5199', '--strictPort'], { cwd: root, stdio: 'ignore' });
let desktop;
let socket;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const stop = child => { if (child?.pid) spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); };

async function waitForJson(url) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try { return await (await fetch(url)).json(); } catch { await delay(250); }
  }
  throw new Error(`Сервис не открылся: ${url}`);
}

try {
  await fs.mkdir(path.dirname(screenshot), { recursive: true });
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try { await fetch('http://127.0.0.1:5199/'); break; } catch { await delay(250); }
  }
  desktop = spawn(path.join(root, 'node_modules', 'electron', 'dist', 'electron.exe'), ['.', '--remote-debugging-port=9337', `--user-data-dir=${profile}`], {
    cwd: root,
    env: { ...process.env, VITE_DEV_SERVER_URL: 'http://127.0.0.1:5199/', ELECTRON_RUN_AS_NODE: undefined },
    stdio: 'ignore',
  });
  const targets = await waitForJson('http://127.0.0.1:9337/json/list');
  const target = targets.find(item => item.type === 'page' && item.url.includes('5199'));
  if (!target) throw new Error('Electron не открыл интерфейс Distribution');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const handlers = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) handlers.reject(new Error(message.error.message)); else handlers.resolve(message.result);
  };
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  for (let attempt = 0; attempt < 80 && !(await evaluate('Boolean(document.querySelector("#product-url"))')); attempt += 1) await delay(250);
  await delay(500);
  const contract = await evaluate(`({
    href: location.href,
    title: document.title,
    products: document.querySelectorAll('.own-products button').length,
    desktop: Boolean(window.director?.isDesktop),
    saveDistribution: typeof window.director?.saveDistribution,
    overflow: document.documentElement.scrollWidth > innerWidth,
    heading: document.querySelector('h1')?.textContent || ''
  })`);
  console.log('UI_CONTRACT', JSON.stringify(contract));
  assert.equal(contract.title, 'BAIagent Distribution — путь продукта к рынку');
  assert.equal(contract.products, 6);
  assert.equal(contract.desktop, true);
  assert.equal(contract.saveDistribution, 'function');
  assert.equal(contract.overflow, false);
  assert.match(contract.heading, /Продукт сам находит/);
  await evaluate('document.fonts.ready');
  await delay(400);
  const image = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await fs.writeFile(screenshot, Buffer.from(image.data, 'base64'));
  console.log(JSON.stringify({ status: 'passed', ...contract, screenshot }));
} finally {
  if (socket) socket.close();
  stop(desktop);
  stop(vite);
  await delay(300);
  await fs.rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
