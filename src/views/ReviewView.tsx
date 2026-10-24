/**
 * 年度复盘面板 —— 评审停留最久的一屏。
 * 所有数字来自 src/lib/summary.ts 的纯函数，保证与月报一致。
 */
import { useMemo } from 'react';
import { Paper } from '../components/Paper';
import { MoodIcon } from '../components/MoodIcon';
import { buildAnnualStats, isTorn, pickBestDay, today } from '../lib/summary';
import { MOOD_LABEL, type DayRecord, type MonthSummary, type Pet } from '../types';

interface Props {
  pet: Pet;
  records: Record<string, DayRecord>;
  months: Record<string, MonthSummary>;
}

export function ReviewView({ pet, records, months }: Props) {
  const now = today();

  const stats = useMemo(
    () => buildAnnualStats(pet, records, now),
    [pet, records, now],
  );

  const best = useMemo(() => pickBestDay(records), [records]);

  /** 按月分组的照片 */
  const byMonth = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const r of Object.values(records)) {
      const m = Number(r.date.slice(5, 7));
      const list = map.get(m) ?? [];
      list.push(...r.photoIds);
      map.set(m, list);
    }
    return map;
  }, [records]);

  const tornMonths = useMemo(
    () => new Set(Object.values(months).filter((m) => isTorn(m)).map((m) => m.month)),
    [months],
  );

  const maxDensity = Math.max(
    0.01,
    ...stats.monthDensity.map((d) => d ?? 0),
  );

  return (
    <div className="mx-auto" style={{ maxWidth: '1100px' }}>
      <Paper
        style={{
          borderRadius: '4px',
          boxShadow: 'var(--shadow-page)',
          background: 'var(--paper)',
          padding: '26px 28px 30px',
        }}
      >
        {/* 头部 */}
        <header className="flex items-center justify-between" style={{ marginBottom: '22px' }}>
          <div className="flex items-center" style={{ gap: '14px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid var(--paper-deep)',
                background: 'var(--paper-blank)',
              }}
            >
              <img
                src={pet.avatar}
                alt={pet.name}
                className="photo-faded"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h1
                className="font-serif"
                style={{
                  fontSize: '26px',
                  color: 'var(--ink)',
                  letterSpacing: '2px',
                  lineHeight: 1.1,
                }}
              >
                {pet.name}的第一年
              </h1>
              <p
                className="font-hand"
                style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '4px' }}
              >
                从 {pet.adoptionDate.slice(0, 4)} 年 {Number(pet.adoptionDate.slice(5, 7))} 月{' '}
                {Number(pet.adoptionDate.slice(8, 10))} 日到现在
              </p>
            </div>
          </div>

          <div className="text-right">
            <div
              className="font-serif"
              style={{ fontSize: '44px', color: 'var(--red)', lineHeight: 1, fontWeight: 600 }}
            >
              {stats.daysTogether}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink-soft)', letterSpacing: '2px' }}>
              天
            </div>
          </div>
        </header>

        {/* 四个数字卡 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <Stat
            label="记了"
            value={stats.recordedDays > 0 ? `${stats.recordedDays}` : '—'}
            unit="天"
          />
          <Stat
            label="拍了"
            value={stats.photoCount > 0 ? `${stats.photoCount}` : '—'}
            unit="张"
          />
          <Stat
            label="最常"
            value={stats.topMood ? MOOD_LABEL[stats.topMood] : '—'}
            icon={stats.topMood ? <MoodIcon mood={stats.topMood} size={26} /> : undefined}
          />
          <Stat label="纪念日" value={`${stats.anniversaryCount}`} unit="个" />
        </div>

        {/* 节奏条 */}
        <section style={{ marginBottom: '26px' }}>
          <SectionTitle>这一年的节奏</SectionTitle>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '6px',
              alignItems: 'end',
              height: '110px',
              borderBottom: '1px solid var(--line)',
              paddingBottom: '2px',
            }}
          >
            {stats.monthDensity.map((d, i) => (
              <div key={i} className="text-center">
                <div
                  style={{
                    height: d === null ? '3px' : `${Math.max(4, (d / maxDensity) * 84)}px`,
                    background:
                      d === null
                        ? 'var(--line)'
                        : tornMonths.has(i + 1)
                          ? 'var(--red)'
                          : 'var(--ink-soft)',
                    opacity: d === null ? 0.35 : 0.82,
                    borderRadius: '1px',
                    transition: 'height 400ms ease',
                  }}
                />
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--ink-faint)',
                    marginTop: '5px',
                  }}
                >
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
          <div
            className="font-hand"
            style={{ fontSize: '12px', color: 'var(--ink-faint)', marginTop: '7px' }}
          >
            柱子越高，那个月记得越多 · 红色的月份是撕下来的
          </div>
        </section>

        {/* 照片墙 */}
        <section style={{ marginBottom: '26px' }}>
          <SectionTitle>翻回去看看</SectionTitle>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
              gap: '6px',
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const m = i + 1;
              const list = byMonth.get(m) ?? [];
              return (
                <div key={m}>
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'var(--ink-faint)',
                      marginBottom: '4px',
                    }}
                  >
                    {m} 月
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '2px',
                      aspectRatio: '1 / 1',
                      background: 'var(--paper-blank)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    {list.slice(0, 4).map((p, j) => (
                      <div key={j} style={{ overflow: 'hidden' }}>
                        <img
                          src={p}
                          alt=""
                          className="photo-faded"
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 最爱你的一天 */}
        {best && (
          <section>
            <SectionTitle>最爱你的一天</SectionTitle>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                borderTop: '1px solid var(--line)',
                borderBottom: '1px solid var(--line)',
                padding: '14px 0',
              }}
            >
              {best.photoIds[0] && (
                <div
                  style={{
                    width: '96px',
                    height: '96px',
                    overflow: 'hidden',
                    borderRadius: '2px',
                    flexShrink: 0,
                    border: '1px solid var(--line)',
                  }}
                >
                  <img
                    src={best.photoIds[0]}
                    alt=""
                    className="photo-faded"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div>
                <div
                  className="font-serif"
                  style={{ fontSize: '22px', color: 'var(--ink)' }}
                >
                  {Number(best.date.slice(5, 7))} 月 {Number(best.date.slice(8, 10))} 日
                </div>
                <div
                  className="font-hand"
                  style={{ fontSize: '17px', color: 'var(--ink)', marginTop: '5px' }}
                >
                  {best.note ?? '这天没写什么'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-faint)', marginTop: '6px' }}>
                  那天拍了 {best.photoIds.length} 张
                  {best.mood && ` · ${MOOD_LABEL[best.mood]}`}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 落款 */}
        <footer
          className="flex items-end justify-between"
          style={{ marginTop: '24px', paddingTop: '14px' }}
        >
          <div
            className="font-hand"
            style={{ fontSize: '15px', color: 'var(--ink-soft)' }}
          >
            它只有 8 年，我把每一天都钉在墙上
          </div>
          <div
            className="font-serif"
            style={{
              fontSize: '13px',
              color: 'var(--red-deep)',
              border: '1.5px solid var(--red-deep)',
              padding: '4px 10px',
              borderRadius: '2px',
              transform: 'rotate(-4deg)',
              letterSpacing: '2px',
            }}
          >
            毛历
          </div>
        </footer>
      </Paper>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderTop: '2px solid var(--red)',
        padding: '11px 12px 12px',
        background: 'var(--paper-card)',
        borderRight: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        borderLeft: '1px solid var(--line)',
      }}
    >
      <div style={{ fontSize: '11px', color: 'var(--ink-faint)', letterSpacing: '1px' }}>
        {label}
      </div>
      <div className="flex items-baseline" style={{ gap: '3px', marginTop: '4px' }}>
        <span
          className="font-serif"
          style={{ fontSize: '26px', color: 'var(--ink)', lineHeight: 1 }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{unit}</span>
        )}
        {icon}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-serif"
      style={{
        fontSize: '15px',
        color: 'var(--ink)',
        letterSpacing: '2px',
        marginBottom: '11px',
        paddingBottom: '5px',
        borderBottom: '1px solid var(--line)',
      }}
    >
      {children}
    </div>
  );
}
