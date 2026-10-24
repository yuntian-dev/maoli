/**
 * 农历 / 节气格式化。纯函数，禁止 import React 或任何 UI 代码。
 * 依赖 lunar-javascript。
 */
import { Lunar } from 'lunar-javascript';

export interface LunarInfo {
  /** 农历日的中文，如「初八」「廿三」 */
  day: string;
  /** 农历月的中文，如「正月」「冬月」 */
  month: string;
  /** 完整农历，如「二〇二五年 正月初八」 */
  full: string;
  /** 节气名，无则 undefined */
  jieQi?: string;
  /** 传统节日名，无则 undefined */
  festival?: string;
}

/** 农历月的数字写法 */
const CN_MONTH = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];

/**
 * 取某天的农历信息。
 * @param date 'YYYY-MM-DD'
 */
export function getLunar(date: string): LunarInfo {
  const [y, m, d] = date.split('-').map(Number);
  const lunar = Lunar.fromDate(new Date(y, m - 1, d));
  const jieQi = lunar.getJieQi();
  const festival = lunar.getFestivals?.()[0] ?? lunar.getOtherFestivals?.()[0];

  const monthRaw = lunar.getMonthInChinese();
  const idx = CN_MONTH.indexOf(monthRaw);
  const month = idx > 0 ? `${CN_MONTH[idx]}月` : `${monthRaw}月`;

  return {
    day: lunar.getDayInChinese(),
    month,
    full: `${lunar.getYearInGanZhi()}年 ${month}${lunar.getDayInChinese()}`,
    jieQi: jieQi || undefined,
    festival: festival || undefined,
  };
}

/**
 * 挂历格子里显示的那一行小字。
 * 优先级：节气 > 传统节日 > 农历日
 */
export function lunarLabel(date: string): string {
  const info = getLunar(date);
  return info.jieQi ?? info.festival ?? info.day;
}

/** 农历月的显示名，如「九月」 */
export function lunarMonthName(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const lunar = Lunar.fromDate(new Date(y, m - 1, d));
  const raw = lunar.getMonthInChinese();
  const idx = CN_MONTH.indexOf(raw);
  return idx > 0 ? `${CN_MONTH[idx]}月` : `${raw}月`;
}
