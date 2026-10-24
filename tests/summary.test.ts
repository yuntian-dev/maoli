import { describe, expect, it } from 'vitest';
import {
  buildAnnualStats,
  buildMonthSummary,
  countAnniversaries,
  diffDays,
  isTorn,
  pickBestDay,
  pickTopMood,
  pickTopTag,
} from '../src/lib/summary';
import { buildMonthGrid, weekdayIndex } from '../src/lib/calendar';
import type { DayRecord, Pet } from '../src/types';

const PET: Pet = {
  id: 'p1',
  name: '豆豆',
  species: 'cat',
  breed: '橘猫',
  birthday: '2023-05-20',
  adoptionDate: '2025-01-01',
  avatar: '',
};

function rec(date: string, over: Partial<DayRecord> = {}): DayRecord {
  return {
    date,
    photoIds: [],
    tags: [],
    recordedAt: '2025-01-01T10:00:00.000Z',
    ...over,
  };
}

describe('日期工具', () => {
  it('diffDays 计算跨月与跨年天数', () => {
    expect(diffDays('2025-01-01', '2025-01-01')).toBe(0);
    expect(diffDays('2025-01-01', '2025-01-31')).toBe(30);
    expect(diffDays('2025-01-31', '2025-02-01')).toBe(1);
    expect(diffDays('2024-12-31', '2025-01-01')).toBe(1);
    expect(diffDays('2025-01-02', '2025-01-01')).toBe(-1);
  });
});

describe('buildMonthSummary', () => {
  it('空月份返回全零', () => {
    const s = buildMonthSummary(2025, 3, {}, '2025-04-01');
    expect(s.recordedDays).toBe(0);
    expect(s.photoCount).toBe(0);
    expect(s.topMood).toBeUndefined();
    expect(s.topTag).toBeUndefined();
    expect(s.year).toBe(2025);
    expect(s.month).toBe(3);
  });

  it('只统计本月的记录，不串月', () => {
    const records = {
      '2025-03-01': rec('2025-03-01', { photoIds: ['a', 'b'], mood: 'happy' }),
      '2025-03-02': rec('2025-03-02', { photoIds: ['c'], mood: 'sly', tags: ['玩耍'] }),
      '2025-04-01': rec('2025-04-01', { photoIds: ['x'], mood: 'happy' }),
      '2025-02-28': rec('2025-02-28', { photoIds: ['y'] }),
    };
    const s = buildMonthSummary(2025, 3, records, '2025-04-01');
    expect(s.recordedDays).toBe(2);
    expect(s.photoCount).toBe(3);
    expect(s.topMood).toBe('happy');
  });

  it('同源数字：月报与年度统计的记录数/照片数一致', () => {
    const records = {
      '2025-01-05': rec('2025-01-05', { photoIds: ['a', 'b'] }),
      '2025-01-06': rec('2025-01-06', { photoIds: ['c'] }),
      '2025-02-05': rec('2025-02-05', { photoIds: ['d'] }),
    };
    const jan = buildMonthSummary(2025, 1, records, '2025-03-01');
    const feb = buildMonthSummary(2025, 2, records, '2025-03-01');
    const year = buildAnnualStats(PET, records, '2025-03-01');
    expect(jan.recordedDays + feb.recordedDays).toBe(year.recordedDays);
    expect(jan.photoCount + feb.photoCount).toBe(year.photoCount);
  });
});

describe('pickTopMood / pickTopTag', () => {
  it('并列时取 MOOD_ORDER 中靠前者', () => {
    const m = new Map([
      ['sly', 2],
      ['happy', 2],
    ] as const);
    expect(pickTopMood(m as Map<'happy' | 'sleepy' | 'clingy' | 'sly', number>)).toBe(
      'happy',
    );
  });

  it('高频标签并列时取字典序靠前者', () => {
    const t = new Map([
      ['玩耍', 3],
      ['吃饭', 3],
    ]);
    expect(pickTopTag(t)).toBe('吃饭');
  });

  it('空 Map 返回 undefined', () => {
    expect(pickTopMood(new Map())).toBeUndefined();
    expect(pickTopTag(new Map())).toBeUndefined();
  });
});

describe('buildAnnualStats', () => {
  it('陪伴天数 = 今天 − 领养日 + 1', () => {
    const s = buildAnnualStats(PET, {}, '2025-01-01');
    expect(s.daysTogether).toBe(1);
    const s2 = buildAnnualStats(PET, {}, '2025-12-31');
    expect(s2.daysTogether).toBe(365);
  });

  it('未到的月份密度为 null', () => {
    const s = buildAnnualStats(PET, {}, '2025-03-15');
    expect(s.monthDensity[0]).not.toBeNull();
    expect(s.monthDensity[2]).not.toBeNull();
    expect(s.monthDensity[3]).toBeNull();
    expect(s.monthDensity[11]).toBeNull();
  });

  it('已过月份密度 = 记录数 ÷ 已过天数', () => {
    const records = {
      '2025-01-01': rec('2025-01-01'),
      '2025-01-02': rec('2025-01-02'),
      '2025-01-03': rec('2025-01-03'),
    };
    const s = buildAnnualStats(PET, records, '2025-01-31');
    expect(s.monthRecordedDays[0]).toBe(3);
    expect(s.monthDensity[0]).toBeCloseTo(3 / 31, 5);
  });
});

describe('countAnniversaries', () => {
  it('领养当天：领养日 1 + 已过的生日 2（2023、2024）+ 满月 0 = 3', () => {
    expect(countAnniversaries(PET, '2025-01-01')).toBe(3);
  });

  it('过了三个月 = 领养日 + 三个整月 + 生日', () => {
    // 2025-04-01: 领养日 + 1/2/3 月 + 2023 生日 + 2024 生日 = 1+3+2 = 6
    expect(countAnniversaries(PET, '2025-04-01')).toBe(6);
  });
});

describe('pickBestDay', () => {
  it('无照片时返回 null', () => {
    expect(pickBestDay({ '2025-01-01': rec('2025-01-01') })).toBeNull();
  });

  it('照片数最多优先', () => {
    const r = {
      '2025-01-01': rec('2025-01-01', { photoIds: ['a'] }),
      '2025-01-02': rec('2025-01-02', { photoIds: ['a', 'b', 'c'] }),
    };
    expect(pickBestDay(r)?.date).toBe('2025-01-02');
  });

  it('照片数并列时取短句更短的一天', () => {
    const r = {
      '2025-01-01': rec('2025-01-01', { photoIds: ['a'], note: '短' }),
      '2025-01-02': rec('2025-01-02', { photoIds: ['b'], note: '长长长长长' }),
    };
    expect(pickBestDay(r)?.date).toBe('2025-01-01');
  });

  it('仍并列时取日期最早', () => {
    const r = {
      '2025-01-05': rec('2025-01-05', { photoIds: ['a'], note: '一样长' }),
      '2025-01-02': rec('2025-01-02', { photoIds: ['b'], note: '一样长' }),
    };
    expect(pickBestDay(r)?.date).toBe('2025-01-02');
  });
});

describe('isTorn', () => {
  it('无摘要 → 未撕', () => {
    expect(isTorn(undefined)).toBe(false);
  });

  it('只有 tornAt → 已撕', () => {
    expect(isTorn({ year: 2025, month: 3, recordedDays: 1, photoCount: 1, tornAt: '2025-04-01' })).toBe(true);
  });

  it('restoredAt 晚于 tornAt → 已贴回', () => {
    expect(
      isTorn({
        year: 2025, month: 3, recordedDays: 1, photoCount: 1,
        tornAt: '2025-04-01', restoredAt: '2025-04-02',
      }),
    ).toBe(false);
  });

  it('重新撕（restoredAt 早于 tornAt）→ 已撕', () => {
    expect(
      isTorn({
        year: 2025, month: 3, recordedDays: 1, photoCount: 1,
        tornAt: '2025-04-03', restoredAt: '2025-04-02',
      }),
    ).toBe(true);
  });
});

describe('buildMonthGrid', () => {
  it('2025-01-01 是周三，网格首行前应有 2 个空位', () => {
    const grid = buildMonthGrid(2025, 1);
    expect(grid[0].date).toBeNull();
    expect(grid[1].date).toBeNull();
    expect(grid[2].date).toBe('2025-01-01');
  });

  it('2025-10-01 是周三，同上 2 个空位', () => {
    const grid = buildMonthGrid(2025, 10);
    expect(grid[2].date).toBe('2025-10-01');
  });

  it('2 月天数按闰年变化', () => {
    expect(buildMonthGrid(2025, 2).filter((s) => s.date).length).toBe(28);
    expect(buildMonthGrid(2024, 2).filter((s) => s.date).length).toBe(29);
  });

  it('总格数是 7 的倍数', () => {
    for (let m = 1; m <= 12; m++) {
      expect(buildMonthGrid(2025, m).length % 7).toBe(0);
    }
  });

  it('weekdayIndex：周一=0，周日=6', () => {
    expect(weekdayIndex('2025-01-06')).toBe(0); // 周一
    expect(weekdayIndex('2025-01-05')).toBe(6); // 周日
    expect(weekdayIndex('2025-01-11')).toBe(5); // 周六
  });
});
