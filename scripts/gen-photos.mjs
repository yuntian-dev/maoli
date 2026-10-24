#!/usr/bin/env node
/**
 * 素材轨：用 cataas.com 的公开 API 抓取**真实的猫图**。
 *
 * 相比直接请求 /cat（会随机返回非猫图），这里先通过 /api/cats 拿到 id 列表，
 * 再逐个下载 /cat/{id}，可以精确控制数量、去重、并保证每张都是猫。
 */
import { mkdir, writeFile, readdir, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const OUT = 'public/photos';
const TARGET = Number(process.argv[2] ?? 28);
const API = 'https://cataas.com/api/cats';

await mkdir(OUT, { recursive: true });

/** 1. 拉 id 列表（跳过 gif 和无图的老条目） */
async function fetchIds() {
  const ids = [];
  for (let skip = 0; skip < 600 && ids.length < TARGET * 3; skip += 20) {
    const res = await fetch(`${API}?limit=20&skip=${skip}`, {
      headers: { 'User-Agent': 'maoli-demo/1.0' },
    });
    if (!res.ok) break;
    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) break;
    for (const item of list) {
      if (item.mimetype === 'image/jpeg' || item.mimetype === 'image/png') {
        ids.push(item.id);
      }
    }
  }
  return ids;
}

/** 2. 下载并去重 */
const ids = await fetchIds();
console.log(`fetched ${ids.length} candidate ids`);

const seen = new Set();
let n = 0;

for (const id of ids) {
  if (n >= TARGET) break;
  const file = path.join(OUT, `cat_${String(n + 1).padStart(2, '0')}.jpg`);
  try {
    const res = await fetch(`https://cataas.com/cat/${id}`, {
      headers: { 'User-Agent': 'maoli-demo/1.0' },
    });
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 12000) continue;

    // 简单去重：按文件大小+前 64 字节哈希
    const sig = `${buf.length}-${buf.subarray(0, 64).toString('hex')}`;
    if (seen.has(sig)) continue;
    seen.add(sig);

    await writeFile(file, buf);
    n++;
    console.log(`${file} ${buf.length}B`);
  } catch {
    /* 跳过失败的条目 */
  }
}

// 清理多余文件，保证文件名连续
const files = (await readdir(OUT)).filter((f) => f.startsWith('cat_'));
for (const f of files) {
  const idx = Number(f.match(/cat_(\d+)\.jpg/)?.[1] ?? 0);
  if (idx === 0 || idx > n) await rm(path.join(OUT, f));
}

console.log(`done: ${n} photos`);
