/**
 * 月视图网格。7 列，表头周一→周日。
 */
import { DayCell, type CellStatus } from './DayCell';
import { WEEK_LABELS } from '../lib/calendar';

export interface MonthGridProps {
  /** 该月的格子数据 */
  slots: { date: string | null; day: number | null }[];
  /** 'YYYY-MM-DD' -> 展示数据 */
  cells: Record<
    string,
    {
      status: CellStatus;
      lunarText?: string;
      photoUrl?: string;
      note?: string;
      isToday?: boolean;
    }
  >;
  onSelect?: (date: string) => void;
}

export function MonthGrid({ slots, cells, onSelect }: MonthGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        borderTop: '1px solid var(--line)',
        borderLeft: '1px solid var(--line)',
      }}
    >
      {WEEK_LABELS.map((w, i) => (
        <div
          key={w}
          className="text-center font-serif"
          style={{
            padding: '6px 0 5px',
            fontSize: '13px',
            borderRight: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
            color:
              i === 6 ? 'var(--red)' : i === 5 ? 'var(--gray-sat)' : 'var(--ink-soft)',
            letterSpacing: '2px',
          }}
        >
          {w}
        </div>
      ))}

      {slots.map((slot, i) => {
        if (!slot.date) {
          return (
            <div
              key={`blank-${i}`}
              style={{
                height: 'var(--cell-h)',
                borderRight: '1px solid var(--line)',
                borderBottom: '1px solid var(--line)',
                background: 'var(--paper-blank)',
                opacity: 0.45,
              }}
            />
          );
        }
        const c = cells[slot.date];
        const isSun = i % 7 === 6;
        const isSat = i % 7 === 5;
        return (
          <DayCell
            key={slot.date}
            day={slot.day!}
            lunarText={c?.lunarText}
            status={c?.status ?? 'blank'}
            photoUrl={c?.photoUrl}
            note={c?.note}
            isToday={c?.isToday}
            isSunday={isSun}
            isSaturday={isSat}
            onClick={() => onSelect?.(slot.date!)}
          />
        );
      })}
    </div>
  );
}
