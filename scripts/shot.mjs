import { chromium } from 'playwright';

/**
 * 用法:
 *   node scripts/shot.mjs <url> <out.png> [width] [height] [--click "selector"] [--wait ms] [--full]
 */
const args = process.argv.slice(2);
const url = args[0] ?? 'http://127.0.0.1:5180/';
const out = args[1] ?? '/tmp/shot.png';
const width = Number(args[2] ?? 1280);
const height = Number(args[3] ?? 1000);

const clickIdx = args.indexOf('--click');
const clickSel = clickIdx > -1 ? args[clickIdx + 1] : null;
const waitIdx = args.indexOf('--wait');
const waitMs = waitIdx > -1 ? Number(args[waitIdx + 1]) : 1200;
const full = args.includes('--full');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

if (clickSel) {
  await page.click(clickSel);
  await page.waitForTimeout(waitMs);
}

await page.screenshot({ path: out, fullPage: full });

console.log('saved', out);
if (errors.length) {
  console.log('--- console errors ---');
  errors.slice(0, 20).forEach((e) => console.log(e));
} else {
  console.log('no console errors');
}
await browser.close();
