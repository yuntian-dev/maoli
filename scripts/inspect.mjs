import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:5180/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const info = await page.evaluate(() => {
  const cells = Array.from(document.querySelectorAll('button[aria-label]')).filter(
    (c) => /^\d+ 日/.test(c.getAttribute('aria-label') ?? ''),
  );
  const out = [];
  for (const c of cells) {
    const img = c.querySelector('img');
    if (!img) continue;
    const r = c.getBoundingClientRect();
    const ir = img.getBoundingClientRect();
    const holder = img.parentElement?.getBoundingClientRect();
    out.push({
      label: c.getAttribute('aria-label'),
      cell: [Math.round(r.width), Math.round(r.height)],
      holder: holder ? [Math.round(holder.width), Math.round(holder.height)] : null,
      imgBox: [Math.round(ir.width), Math.round(ir.height)],
      natural: [img.naturalWidth, img.naturalHeight],
      fit: getComputedStyle(img).objectFit,
      display: getComputedStyle(img).display,
    });
    if (out.length >= 4) break;
  }
  return { total: cells.length, samples: out };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
