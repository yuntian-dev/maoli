/**
 * 日历网格构建。纯函数，禁止 import React / DOM API。
 * 负责「某月 → 6 行 × 7 列」的排布，跨月首日的星期对位在这里处理。
 */
import { daysInMonth, toKey } from './summary';

/** 周一 → 周日 */
export const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

export interface GridSlot {
  /** 'YYYY-MM-DD'，空位为 null */
  date: string | null;
  /** 该月的第几天，null 表示空位 */
  day: number | null;
}

/**
 * 构建某月的网格。
 * 中文日历习惯：周一为一周第一天。
 */
export function buildMonthGrid(year: number, month: number): GridSlot[] {
  const total = daysInMonth(year, month);
  const first = new Date(year, month - 1, 1);
  // getDay(): 0=周日 … 6=周六 → 转成 0=周一 … 6=周日
  const lead = (first.getDay() + 6) % 7;
  const cells: GridSlot[] = [];

  for (let i = 0; i < lead; i++) {
    cells.push({ date: null, day: null });
  }
  for (let d = 1; d <= total; d++) {
    cells.push({ date: toKey(year, month, d), day: d });
  }
  // 补齐到整周
  while (cells.length % 7 !== 0) {
    cells.push({ date: null, day: null });
  }
  return cells;
}

/** 某日期是周几：0=周一 … 6=周日 */
export function weekdayIndex(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
}

/** 月份位移：跨年自动进位 */
export function shiftMonth(
  cursor: { year: number; month: number },
  delta: number,
): { year: number; month: number } {
  let month = cursor.month + delta;
  let year = cursor.year;
  while (month < 1) {
    month += 12;
    year -= 1;
  }
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  return { year, month };
}

export function isSunday(date: string): boolean {
  return weekdayIndex(date) === 6;
}

export function isSaturday(date: string): boolean {
  return weekdayIndex(date) === 5;
}
