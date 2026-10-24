/**
 * 月视图挂历 —— 主界面。
 */
import { useMemo } from 'react';
import { CalendarSheet } from '../components/CalendarSheet';
import { MonthGrid } from '../components/MonthGrid';
import type { CellStatus } from '../components/DayCell';
import { buildMonthGrid } from '../lib/calendar';
import { lunarLabel, lunarMonthName } from '../lib/lunar';
import { diffDays, daysInMonth, today } from '../lib/summary';
import { toKey } from '../lib/summary';
import type { DayRecord, Pet } from '../types';

interface Props {
  pet: Pet;
  records: Record<string, DayRecord>;
  cursor: { year: number; month: number };
  onSelect?: (date: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** 顶部操作区（顶栏） */
  children?: React.ReactNode;
}

export function CalendarView({
  pet,
  records,
  cursor,
  onSelect,
  onPrev,
  onNext,
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
        hasPhoto?: boolean;
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

      <MonthGrid slots={slots} cells={cells} onSelect={onSelect} />

      {/* 页脚 */}
      <footer
        className="flex items-end justify-between"
        style={{ marginTop: '12px', paddingBottom: '2px' }}
      >
        <div
          style={{ fontSize: '11px', color: 'var(--ink-faint)', letterSpacing: '0.5px' }}
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
    </CalendarSheet>
  );
}
