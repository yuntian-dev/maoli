import { chromium } from 'playwright';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
await p.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);

// 点第一个可点的格子
await p.getByRole('button', { name: /^\d+ 日/ }).first().click();
await p.waitForTimeout(500);
console.log('panel open:', await p.locator('text=今天的心情').count());
console.log('textarea:', await p.locator('textarea').count());
console.log('date text:', await p.locator('div.font-serif').first().textContent());

await p.fill('textarea', '测试一句话');
await p.click('button:has-text("记下这一天")');
await p.waitForTimeout(800);

const ls = await p.evaluate(() => {
  const raw = localStorage.getItem('maoli.records.v1');
  if (!raw) return { keys: Object.keys(localStorage) };
  const obj = JSON.parse(raw);
  const withNote = Object.values(obj).filter((r) => r.note === '测试一句话');
  return {
    total: Object.keys(obj).length,
    matched: withNote.length,
    sample: withNote.slice(0, 2),
  };
});
console.log('localStorage:', JSON.stringify(ls, null, 2));

await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
console.log('after reload, note visible:', await p.locator('text=测试一句话').count());

await b.close();
