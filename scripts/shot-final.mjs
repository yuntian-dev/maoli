import { chromium } from 'playwright';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
await p.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);

// 1) 挂历
await p.screenshot({ path: '/tmp/f1.png' });

// 2) 复盘
await p.locator('nav button', { hasText: '复盘' }).click();
await p.waitForTimeout(900);
await p.screenshot({ path: '/tmp/f2.png', fullPage: true });

// 3) 日详情面板
await p.locator('nav button', { hasText: '回挂历' }).click();
await p.waitForTimeout(600);
await p.getByRole('button', { name: /^\d+ 日/ }).nth(8).click();
await p.waitForTimeout(600);
await p.screenshot({ path: '/tmp/f3.png' });

await b.close();
console.log('done');
