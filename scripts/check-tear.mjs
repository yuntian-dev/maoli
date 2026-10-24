import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 760 } });
await page.goto('http://127.0.0.1:5180/#spike-tear', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const before = await page.evaluate(() => {
  const el = document.querySelector('[class*="w-full"]');
  const halves = document.querySelectorAll('div[style*="clip-path"]');
  return {
    halves: halves.length,
    clips: [...halves].map((h) => getComputedStyle(h).clipPath.slice(0, 60)),
  };
});

await page.locator('button', { hasText: '撕掉这一页' }).click();
await page.waitForTimeout(180);

const during = await page.evaluate(() => {
  const halves = [...document.querySelectorAll('div[style*="clip-path"]')];
  return halves.map((h) => ({
    transform: getComputedStyle(h).transform,
    opacity: getComputedStyle(h).opacity,
    box: (() => {
      const r = h.getBoundingClientRect();
      return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)];
    })(),
  }));
});

await page.waitForTimeout(700);
const after = await page.evaluate(() => ({
  halves: document.querySelectorAll('div[style*="clip-path"]').length,
}));

console.log(JSON.stringify({ before, during, after }, null, 2));
await browser.close();
