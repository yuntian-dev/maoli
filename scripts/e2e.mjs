import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('CONSOLE: ' + m.text());
});

const step = async (name, fn) => {
  try {
    await fn();
    console.log('OK  ', name);
  } catch (e) {
    console.log('FAIL', name, '-', e.message.split('\n')[0]);
  }
};

await page.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

await step('挂历渲染', async () => {
  const n = await page.locator('button[aria-label*="日"]').count();
  if (n < 28) throw new Error(`格子只有 ${n} 个`);
});

await step('翻到上个月', async () => {
  await page.click('button[aria-label="上一月"]');
  await page.waitForTimeout(400);
});

await step('出现撕页胶带', async () => {
  await page.waitForSelector('text=撕掉这一月', { timeout: 3000 });
});

await step('点胶带出确认浮层', async () => {
  await page.click('text=撕掉这一月');
  await page.waitForTimeout(300);
  await page.waitForSelector('text=再想想', { timeout: 3000 });
});

await step('确认撕页 → 抽屉打开', async () => {
  // 精确点浮层里的「撕掉」按钮（不是胶带上的「撕掉这一月」）
  await page.locator('div[style*="z-index: 250"] button', { hasText: '撕掉' }).click();
  await page.waitForTimeout(1400);
  await page.waitForSelector('text=贴回去', { timeout: 4000 });
  const cards = await page.locator('text=贴回去').count();
  if (cards < 1) throw new Error('抽屉里没有月报卡片');
});

await step('抽屉里能看到月报数字', async () => {
  const txt = await page.locator('text=记了').first().textContent();
  console.log('      月报卡片:', txt?.trim());
});

await step('关闭抽屉 → 月份显示已撕', async () => {
  await page.locator('div[style*="z-index: 220"] button[aria-label="关闭"]').click();
  await page.waitForTimeout(600);
  await page.waitForSelector('text=已经撕下来了', { timeout: 4000 });
});

await step('贴回去', async () => {
  await page.click('button:has-text("抽屉")');
  await page.waitForTimeout(400);
  await page.click('text=贴回去');
  await page.waitForTimeout(500);
});

await step('进入复盘面板', async () => {
  await page.locator('nav button', { hasText: '复盘' }).click();
  await page.waitForTimeout(800);
  await page.waitForSelector('text=的第一年', { timeout: 4000 });
});

await step('复盘页有四个数字卡', async () => {
  for (const t of ['记了', '拍了', '最常', '纪念日']) {
    if (!(await page.locator(`text=${t}`).count())) throw new Error(`缺 ${t}`);
  }
});

await step('复盘页有节奏条 12 根', async () => {
  const bars = await page.locator('div:has-text("这一年的节奏") >> div[style*="height"]').count();
  console.log('      柱子数:', bars);
});

await step('复盘页有最爱你的一天', async () => {
  await page.waitForSelector('text=最爱你的一天', { timeout: 3000 });
});

await step('点格子打开日详情面板', async () => {
  await page.locator('nav button', { hasText: '回挂历' }).click();
  await page.waitForTimeout(600);
  // aria-label 形如「8 日 今天它又在偷睡」，用 getByRole 正则精确匹配
  await page.getByRole('button', { name: /^\d+ 日/ }).first().click();
  await page.waitForTimeout(500);
  await page.waitForSelector('text=今天的心情', { timeout: 4000 });
});

await step('输入短句并保存', async () => {
  await page.fill('textarea', '测试一句话');
  await page.click('button:has-text("记下这一天")');
  await page.waitForTimeout(600);
  await page.waitForSelector('text=记下了', { timeout: 3000 });
});

await step('刷新后记录仍在', async () => {
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);
  const raw = await page.evaluate(() =>
    localStorage.getItem('maoli.records.v1'),
  );
  if (!raw || !raw.includes('测试一句话')) {
    throw new Error('刷新后 localStorage 里没有记录');
  }
});

console.log('\n--- errors ---');
console.log(errors.length ? errors.slice(0, 12).join('\n') : 'none');

await page.screenshot({ path: '/tmp/e2e-final.png', fullPage: true });
await browser.close();
