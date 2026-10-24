import { chromium } from 'playwright';

/**
 * 撕页动效多帧采样。
 * 用法: node scripts/shot-tear.mjs <url> <outPrefix>
 */
const url = process.argv[2] ?? 'http://127.0.0.1:5180/';
const prefix = process.argv[3] ?? '/tmp/tear';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 760 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

// 撕页按钮
const btn = page.locator('button', { hasText: '撕掉这一页' });
await btn.click();

// 采样多帧
const frames = [80, 160, 260, 380, 520];
let prev = 0;
for (const t of frames) {
  await page.waitForTimeout(t - prev);
  prev = t;
  await page.screenshot({ path: `${prefix}_${t}.png` });
  console.log('frame', t);
}

console.log(errors.length ? errors.slice(0, 10) : 'no console errors');
await browser.close();
