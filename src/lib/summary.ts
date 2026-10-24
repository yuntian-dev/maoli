/**
 * 月报与年度统计的**纯函数**。
 * 硬约束（PRD 12.4）：本文件禁止 import React / DOM API / 计时器。
 * 月报卡片与复盘面板的数字必须全部来自这里，保证两边一致。
 */
import { MOOD_ORDER, type DayRecord, type MoodKey, type MonthSummary, type Pet } from '../types';

/* ---------------- 日期工具（纯） ---------------- */

/** 'YYYY-MM-DD' */
export function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** 'YYYY-MM' */
export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

/** 某月的天数 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** 两个日期相差的天数（b - a） */
export function diffDays(a: string, b: string): number {
  const pa = a.split('-').map(Number);
  const pb = b.split('-').map(Number);
  const da = Date.UTC(pa[0], pa[1] - 1, pa[2]);
  const db = Date.UTC(pb[0], pb[1] - 1, pb[2]);
  return Math.round((db - da) / 86400000);
}

/** 今天（本地时区） */
export function today(): string {
  const d = new Date();
  return toKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/* ---------------- 月报 ---------------- */

/**
 * 计算某个月的摘要。撕页时调用并缓存。
 */
export function buildMonthSummary(
  year: number,
  month: number,
  records: Record<string, DayRecord>,
  now = today(),
): MonthSummary {
  const prefix = monthKey(year, month);
  const inMonth: DayRecord[] = Object.values(records).filter((r) =>
    r.date.startsWith(prefix),
  );

  let photoCount = 0;
  const moodCount = new Map<MoodKey, number>();
  const tagCount = new Map<string, number>();

  for (const r of inMonth) {
    photoCount += r.photoIds.length;
    if (r.mood) moodCount.set(r.mood, (moodCount.get(r.mood) ?? 0) + 1);
    for (const t of r.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  }

  return {
    year,
    month,
    recordedDays: inMonth.length,
    photoCount,
    topMood: pickTopMood(moodCount),
    topTag: pickTopTag(tagCount),
    tornAt: now,
  };
}

/** 最常心情；并列时取 MOOD_ORDER 中靠前者，保证结果稳定 */
export function pickTopMood(counts: Map<MoodKey, number>): MoodKey | undefined {
  let best: MoodKey | undefined;
  let bestN = 0;
  for (const mood of MOOD_ORDER) {
    const n = counts.get(mood) ?? 0;
    if (n > bestN) {
      best = mood;
      bestN = n;
    }
  }
  return best;
}

/** 高频标签；并列时取字典序靠前者 */
export function pickTopTag(counts: Map<string, number>): string | undefined {
  let best: string | undefined;
  let bestN = 0;
  for (const tag of [...counts.keys()].sort()) {
    const n = counts.get(tag) ?? 0;
    if (n > bestN) {
      best = tag;
      bestN = n;
    }
  }
  return best;
}

/* ---------------- 年度统计 ---------------- */

export interface AnnualStats {
  /** 陪伴天数（今天 − 领养日 + 1） */
  daysTogether: number;
  /** 有记录的日期数量 */
  recordedDays: number;
  /** 照片总张数 */
  photoCount: number;
  /** 最常心情 */
  topMood?: MoodKey;
  /** 纪念日数量 */
  anniversaryCount: number;
  /** 12 个月的记录密度（未到的月份为 null） */
  monthDensity: (number | null)[];
  /** 每月记录天数 */
  monthRecordedDays: number[];
  /** 每月照片数 */
  monthPhotoCount: number[];
}

export function buildAnnualStats(
  pet: Pet,
  records: Record<string, DayRecord>,
  now = today(),
): AnnualStats {
  const all = Object.values(records);

  const daysTogether = Math.max(0, diffDays(pet.adoptionDate, now) + 1);

  let photoCount = 0;
  const moodCount = new Map<MoodKey, number>();
  for (const r of all) {
    photoCount += r.photoIds.length;
    if (r.mood) moodCount.set(r.mood, (moodCount.get(r.mood) ?? 0) + 1);
  }

  const startYear = Number(pet.adoptionDate.slice(0, 4));
  const endYear = Number(now.slice(0, 4));
  const endMonth = Number(now.slice(5, 7));

  const monthRecordedDays = new Array(12).fill(0);
  const monthPhotoCount = new Array(12).fill(0);
  for (const r of all) {
    const y = Number(r.date.slice(0, 4));
    const m = Number(r.date.slice(5, 7)) - 1;
    if (y === startYear || y === endYear) {
      monthRecordedDays[m] += 1;
      monthPhotoCount[m] += r.photoIds.length;
    }
  }

  // 密度：已过天数为分母
  const monthDensity: (number | null)[] = [];
  for (let m = 0; m < 12; m++) {
    const y = endYear;
    const passed =
      y > startYear || (y === startYear && m + 1 <= endMonth);
    if (!passed) {
      monthDensity.push(null);
      continue;
    }
    const denom =
      y === endYear && m + 1 === endMonth
        ? Number(now.slice(8, 10))
        : daysInMonth(y, m + 1);
    const startOffset =
      y === startYear && m + 1 === Number(pet.adoptionDate.slice(5, 7))
        ? Number(pet.adoptionDate.slice(8, 10))
        : 1;
    const usable = Math.max(1, denom - startOffset + 1);
    monthDensity.push(monthRecordedDays[m] / usable);
  }

  return {
    daysTogether,
    recordedDays: all.length,
    photoCount,
    topMood: pickTopMood(moodCount),
    anniversaryCount: countAnniversaries(pet, now),
    monthDensity,
    monthRecordedDays,
    monthPhotoCount,
  };
}

/**
 * 纪念日数量 = 领养日 + 宠物生日 + 领养满 N 个月的每个整月节点。
 * 只统计到今天为止的。
 */
export function countAnniversaries(pet: Pet, now = today()): number {
  const adopt = pet.adoptionDate;
  const adoptY = Number(adopt.slice(0, 4));
  const adoptM = Number(adopt.slice(5, 7));
  const adoptD = Number(adopt.slice(8, 10));
  const nowY = Number(now.slice(0, 4));
  const nowM = Number(now.slice(5, 7));
  const nowD = Number(now.slice(8, 10));

  let count = 0;

  // 领养日 + 每个满月 + 每个整年
  count += 1; // Day 1
  for (let k = 1; ; k++) {
    let y = adoptY;
    let m = adoptM + k;
    while (m > 12) {
      m -= 12;
      y += 1;
    }
    const passed =
      y < nowY || (y === nowY && (m < nowM || (m === nowM && adoptD <= nowD)));
    if (!passed) break;
    count += 1;
  }

  // 宠物生日
  const bY = Number(pet.birthday.slice(0, 4));
  const bM = Number(pet.birthday.slice(5, 7));
  const bD = Number(pet.birthday.slice(8, 10));
  for (let y = bY; y <= nowY; y++) {
    if (y === nowY && (bM > nowM || (bM === nowM && bD > nowD))) break;
    if (y >= bY) count += 1;
  }

  return count;
}

/* ---------------- 最爱你的一天 ---------------- */

/**
 * 照片数最多 > 短句字数最短 > 日期最早。
 */
export function pickBestDay(records: Record<string, DayRecord>): DayRecord | null {
  const withPhotos = Object.values(records).filter((r) => r.photoIds.length > 0);
  if (withPhotos.length === 0) return null;

  return withPhotos.sort((a, b) => {
    if (b.photoIds.length !== a.photoIds.length) {
      return b.photoIds.length - a.photoIds.length;
    }
    const la = a.note?.length ?? 0;
    const lb = b.note?.length ?? 0;
    if (la !== lb) return la - lb;
    return a.date.localeCompare(b.date);
  })[0];
}

/* ---------------- 撕 / 贴回判定 ---------------- */

/** 已撕且未贴回 */
export function isTorn(summary: MonthSummary | undefined): boolean {
  if (!summary) return false;
  if (!summary.restoredAt) return true;
  return summary.restoredAt < summary.tornAt;
}
