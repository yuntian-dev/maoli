/**
 * 月视图挂历 —— 主界面。
 */
import { useMemo } from 'react';
import { CalendarSheet } from '../components/CalendarSheet';
import { MonthGrid } from '../components/MonthGrid';
import { TearSheet } from '../components/TearSheet';
import type { CellStatus } from '../components/DayCell';
import { buildMonthGrid } from '../lib/calendar';
import { lunarLabel, lunarMonthName } from '../lib/lunar';
import { diffDays, daysInMonth, toKey, today } from '../lib/summary';
import type { DayRecord, Pet } from '../types';

interface Props {
  pet: Pet;
  records: Record<string, DayRecord>;
  cursor: { year: number; month: number };
  /** 该月是否已撕 */
  torn?: boolean;
  /** 正在撕 */
  tearing?: boolean;
  onSelect?: (date: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** 点胶带触发撕页 */
  onTear?: () => void;
  /** 顶部操作区 */
  children?: React.ReactNode;
}

export function CalendarView({
  pet,
  records,
  cursor,
  torn = false,
  tearing = false,
  onSelect,
  onPrev,
  onNext,
  onTear,
  children,
}: Props) {
  const now = today();

  const slots = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const cells = useMemo(() => {
    const out: Record<
      string,
      {
        status: CellStatus;
        lunarText?: string;
        photoUrl?: string;
        note?: string;
        isToday?: boolean;
      }
    > = {};

    for (const slot of slots) {
      if (!slot.date) continue;
      const rec = records[slot.date];
      let status: CellStatus = 'blank';

      if (slot.date < pet.adoptionDate) status = 'before';
      else if (slot.date > now) status = 'future';
      else if (rec) status = 'recorded';

      out[slot.date] = {
        status,
        lunarText: lunarLabel(slot.date),
        photoUrl: rec?.photoIds[0],
        note: rec?.note,
        isToday: slot.date === now,
      };
    }
    return out;
  }, [slots, records, pet.adoptionDate, now]);

  const dayBadge = String(diffDays(pet.adoptionDate, now) + 1);
  const lunarMonth = lunarMonthName(toKey(cursor.year, cursor.month, 1));

  // 该月是否已过完（可撕）
  const past =
    cursor.year < Number(now.slice(0, 4)) ||
    (cursor.year === Number(now.slice(0, 4)) &&
      cursor.month < Number(now.slice(5, 7)));

  const grid = (
    <MonthGrid slots={slots} cells={cells} onSelect={onSelect} />
  );

  return (
    <CalendarSheet
      title="毛历"
      dayBadge={dayBadge}
      year={cursor.year}
      month={cursor.month}
      lunarMonth={lunarMonth}
      onPrev={onPrev}
      onNext={onNext}
      className="mx-auto w-full"
    >
      {children}

      {/* 撕页胶带：仅已过去的月份出现 */}
      {past && !torn && onTear && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '28px',
            zIndex: 20,
            transform: 'rotate(-5deg)',
          }}
        >
          <button
            onClick={onTear}
            className="font-hand"
            style={{
              background: 'rgba(255,245,220,0.72)',
              padding: '4px 14px',
              fontSize: '13px',
              color: 'var(--ink)',
              borderTop: '1px solid rgba(255,255,255,0.4)',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.13)',
            }}
          >
            撕掉这一月
          </button>
        </div>
      )}

      {/* 已撕：显示残页提示 */}
      {torn && (
        <div
          className="font-hand"
          style={{
            textAlign: 'center',
            padding: '46px 0',
            color: 'var(--ink-faint)',
            fontSize: '15px',
            border: '1px dashed var(--line)',
            margin: '0 0 2px',
            background: 'var(--paper-blank)',
          }}
        >
          这一页已经撕下来了，收在抽屉里
        </div>
      )}

      {!torn && (
        <div style={{ position: 'relative' }}>
          <TearSheet active={tearing}>{grid}</TearSheet>
        </div>
      )}

      {!torn && (
        <footer
          className="flex items-end justify-between"
          style={{ marginTop: '12px', paddingBottom: '2px' }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--ink-faint)',
              letterSpacing: '0.5px',
            }}
          >
            本月 {daysInMonth(cursor.year, cursor.month)} 天
          </div>
          <div
            className="font-hand"
            style={{ fontSize: '12px', color: 'var(--ink-faint)' }}
          >
            {pet.name}的第一本挂历
          </div>
        </footer>
      )}
    </CalendarSheet>
  );
}
