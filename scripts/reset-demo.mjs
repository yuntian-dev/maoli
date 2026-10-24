import { chromium } from 'playwright';

/** 清空 localStorage 并重新加载，得到干净的 Demo 状态 */
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
await p.evaluate(() => {
  localStorage.removeItem('maoli.records.v1');
  localStorage.removeItem('maoli.months.v1');
  localStorage.removeItem('maoli.pet.v1');
});
console.log('cleared');
await b.close();
