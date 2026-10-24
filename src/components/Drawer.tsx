import { useMemo } from 'react';
import { Paper } from './Paper';
import { MOOD_LABEL, type DayRecord, type MonthSummary } from '../types';
import { isTorn, monthKey } from '../lib/summary';

interface Props {
  open: boolean;
  records: Record<string, DayRecord>;
  months: Record<string, MonthSummary>;
  onClose: () => void;
  onRestore: (year: number, month: number) => void;
}

export function Drawer({ open, records, months, onClose, onRestore }: Props) {
  const torn = useMemo(
    () =>
      Object.values(months)
        .filter((m) => isTorn(m))
        .sort((a, b) => b.tornAt.localeCompare(a.tornAt)),
    [months],
  );

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(46,42,38,0.3)',
        zIndex: 220,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(420px, 92vw)',
          background: 'var(--paper-deep)',
          height: '100%',
          overflowY: 'auto',
          padding: '22px 20px 32px',
          boxShadow: '-6px 0 24px rgba(0,0,0,0.14)',
          animation: 'drawerIn 260ms cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        <div className="flex items-start justify-between" style={{ marginBottom: '18px' }}>
          <div>
            <div
              className="font-serif"
              style={{ fontSize: '20px', color: 'var(--ink)', letterSpacing: '2px' }}
            >
              抽屉
            </div>
            <div
              className="font-hand"
              style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '3px' }}
            >
              撕下来的月份都收在这儿
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="font-serif"
            style={{ fontSize: '20px', color: 'var(--ink-faint)', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {torn.length === 0 ? (
          <div
            className="font-hand"
            style={{
              textAlign: 'center',
              color: 'var(--ink-faint)',
              fontSize: '14px',
              padding: '48px 0',
              lineHeight: 1.8,
            }}
          >
            还没有撕过的月份
            <br />
            去挂历上撕一张试试
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
            }}
          >
            {torn.map((m) => (
              <MonthCard
                key={monthKey(m.year, m.month)}
                summary={m}
                photos={
                  Object.values(records)
                    .filter((r) => r.date.startsWith(monthKey(m.year, m.month)))
                    .flatMap((r) => r.photoIds)
                    .slice(0, 4)
                }
                onRestore={() => onRestore(m.year, m.month)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MonthCard({
  summary,
  photos,
  onRestore,
}: {
  summary: MonthSummary;
  photos: string[];
  onRestore: () => void;
}) {
  return (
    <Paper
      vignette={false}
      style={{
        borderRadius: '2px',
        background: 'var(--paper-card)',
        border: '1px solid var(--line)',
        padding: '12px 12px 10px',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 顶部撕口 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background:
            'repeating-linear-gradient(90deg, var(--paper-deep) 0 4px, transparent 4px 8px)',
          opacity: 0.85,
        }}
      />

      <div
        className="font-serif"
        style={{ fontSize: '22px', color: 'var(--ink)', lineHeight: 1 }}
      >
        {summary.month}
        <span style={{ fontSize: '13px', marginLeft: '2px' }}>月</span>
      </div>
      <div
        style={{
          fontSize: '11px',
          color: 'var(--ink-faint)',
          marginTop: '3px',
          marginBottom: '8px',
        }}
      >
        {summary.year} 年
      </div>

      {photos.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '2px',
            marginBottom: '8px',
          }}
        >
          {photos.slice(0, 4).map((p, i) => (
            <div
              key={i}
              style={{
                aspectRatio: '1 / 1',
                overflow: 'hidden',
                background: 'var(--paper-blank)',
              }}
            >
              <img
                src={p}
                alt=""
                className="photo-faded"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          fontSize: '11px',
          color: 'var(--ink-soft)',
          lineHeight: 1.7,
          borderTop: '1px solid var(--line)',
          paddingTop: '7px',
        }}
      >
        记了 {summary.recordedDays} 天
        <br />
        拍了 {summary.photoCount} 张
        {summary.topMood && <> · {MOOD_LABEL[summary.topMood]}</>}
      </div>

      <button
        onClick={onRestore}
        className="font-hand"
        style={{
          marginTop: '8px',
          fontSize: '12px',
          color: 'var(--ink-faint)',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
        }}
      >
        贴回去
      </button>
    </Paper>
  );
}
