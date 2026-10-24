/**
 * 365 天种子数据生成器（Demo 模式）。
 * 纯数据，无副作用，种子固定（种子化随机），保证每次 Demo 看到的都一样。
 *
 * 关键：Demo 的"今天"锚定在**真实今天**，数据从去年同月同日往前推一年。
 * 这样不论哪天演示，第 N 天都是合理的，挂历永远填满 12 个月。
 */
import type { DayRecord, MoodKey, Pet } from '../types';
import { daysInMonth, toKey } from '../lib/summary';

/** Demo 用的"今天"：真实今天 */
export function demoToday(): string {
  const d = new Date();
  return toKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/** Demo 领养日：一年前的同一天 */
export function demoAdoptionDate(today = demoToday()): string {
  const [y, m, d] = today.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setFullYear(dt.getFullYear() - 1);
  return toKey(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}

/** Demo 起始年（用于遍历 12 个月） */
export function demoYears(today = demoToday()): number[] {
  const [y] = today.split('-').map(Number);
  return [y - 1, y];
}

export const DEMO_PET: Pet = {
  id: 'pet_doudou',
  name: '豆豆',
  species: 'cat',
  breed: '橘猫',
  birthday: '2023-05-20',
  adoptionDate: demoAdoptionDate(),
  avatar: '/photos/cat_01.jpg',
};

/** 20 条短句模板，宠物日常口吻 */
const NOTES = [
  '今天它又在偷睡',
  '把爪子搭我手上了',
  '追了半天自己的尾巴',
  '在门口坐了半小时',
  '偷吃了桌上的肉',
  '窝在纸箱里不出来',
  '突然跑酷了三分钟',
  '叫了两声就不理我',
  '第一次主动靠过来',
  '晒太阳晒到翻肚皮',
  '盯着窗外看了很久',
  '把毛球球推到床下',
  '在键盘上踩了一脚',
  '洗完澡躲了一小时',
  '今天胃口特别好',
  '坐在我腿上睡着了',
  '追了一只真的飞蛾',
  '把拖鞋叼到床底',
  '对着镜子看自己',
  '半夜在客厅跑酷',
] as const;

const MOODS: MoodKey[] = ['happy', 'sleepy', 'clingy', 'sly'];

const TAGS = ['吃饭', '睡觉', '玩耍', '看病', '洗澡', '第一次…'];

/** 种子化伪随机，保证可复现 */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** 图片库文件名 */
export function photoFor(index: number): string {
  const n = ((index % 24) + 24) % 24 + 1;
  return `/photos/cat_${String(n).padStart(2, '0')}.jpg`;
}

/**
 * 生成一年区间的记录：从领养日到今天。
 * 跨年，所以要遍历两个年份。
 * @param coverage 有记录的天数占比（默认 0.7）
 */
export function generateSeedRecords(
  adoptionDate = demoAdoptionDate(),
  today = demoToday(),
  coverage = 0.7,
): Record<string, DayRecord> {
  const rng = makeRng(Number(adoptionDate.replace(/-/g, '')) + 13);
  const records: Record<string, DayRecord> = {};
  let photoIndex = 0;

  const startY = Number(adoptionDate.slice(0, 4));
  const endY = Number(today.slice(0, 4));

  for (let year = startY; year <= endY; year++) {
    for (let month = 1; month <= 12; month++) {
      const total = daysInMonth(year, month);
      for (let day = 1; day <= total; day++) {
        const date = toKey(year, month, day);
        if (date < adoptionDate || date > today) continue;

        // 前 70% 的日子有记录
        if (rng() > coverage) continue;

        const photoCount = rng() > 0.82 ? 2 : rng() > 0.55 ? 1 : 0;
        const photoIds: string[] = [];
        for (let p = 0; p < photoCount; p++) {
          photoIds.push(photoFor(photoIndex++));
        }

        const mood =
          rng() > 0.22 ? MOODS[Math.floor(rng() * MOODS.length)] : undefined;
        const tagCount = rng() > 0.6 ? 1 : rng() > 0.85 ? 2 : 0;
        const tags: string[] = [];
        for (let t = 0; t < tagCount; t++) {
          const tag = TAGS[Math.floor(rng() * TAGS.length)];
          if (!tags.includes(tag)) tags.push(tag);
        }

        records[date] = {
          date,
          photoIds,
          note: rng() > 0.12 ? NOTES[Math.floor(rng() * NOTES.length)] : undefined,
          mood,
          tags,
          recordedAt: new Date(year, month - 1, day, 21, 30).toISOString(),
        };
      }
    }
  }
  return records;
}
