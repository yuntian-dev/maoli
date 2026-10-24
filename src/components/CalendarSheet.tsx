/**
 * 挂历纸卡 —— 产品的主视觉容器。
 * 页眉布局：产品名（左）→ 月份大字（中）→ 第 N 天（右）
 */
import type { ReactNode } from 'react';
import { Paper, Pushpin } from './Paper';

interface Props {
  children: ReactNode;
  /** 左上角：产品名 + 宠物名 */
  title: string;
  /** 右上角：第 N 天 */
  dayBadge?: string;
  /** 年份 */
  year?: number;
  /** 月份 */
  month?: number;
  /** 农历月名，如「九月」 */
  lunarMonth?: string;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
}

export function CalendarSheet({
  children,
  title,
  dayBadge,
  year,
  month,
  lunarMonth,
  onPrev,
  onNext,
  className = '',
}: Props) {
  return (
    <Paper
      className={className}
      style={{
        position: 'relative',
        borderRadius: '4px',
        boxShadow: 'var(--shadow-page)',
        background: 'var(--paper)',
        padding: 'var(--pad-page)',
      }}
    >
      {/* 图钉 */}
      <div style={{ position: 'absolute', top: '10px', left: '14px' }}>
        <Pushpin />
      </div>

      {/* 页眉 */}
      <header
        className="header-row relative flex items-center justify-between"
        style={{ marginBottom: '10px', paddingTop: '2px' }}
      >
        {/* 左：产品名 */}
        <div style={{ minWidth: '120px' }}>
          <h1
            className="font-serif"
            style={{
              fontSize: '19px',
              letterSpacing: '4px',
              color: 'var(--ink)',
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>
          <p
            className="font-hand"
            style={{
              fontSize: '12px',
              color: 'var(--ink-soft)',
              marginTop: '3px',
            }}
          >
            一格一天，慢慢记
          </p>
        </div>

        {/* 中：月份大字 */}
        {month !== undefined && (
          <div className="text-center" style={{ flex: 1 }}>
            <div
              className="font-serif"
              style={{
                fontSize: '38px',
                lineHeight: 1,
                color: 'var(--ink)',
                fontWeight: 600,
                letterSpacing: '2px',
              }}
            >
              {month}
              <span style={{ fontSize: '20px', marginLeft: '4px' }}>月</span>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--ink-faint)',
                letterSpacing: '2px',
                marginTop: '3px',
              }}
            >
              {year} 年{lunarMonth ? ` · ${lunarMonth}` : ''}
            </div>
          </div>
        )}

        {/* 右：第 N 天 */}
        <div style={{ minWidth: '120px', textAlign: 'right' }}>
          {dayBadge && (
            <>
              <div
                className="font-serif"
                style={{
                  fontSize: '30px',
                  lineHeight: 1,
                  color: 'var(--red)',
                  fontWeight: 600,
                }}
              >
                {dayBadge}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--ink-soft)',
                  letterSpacing: '1px',
                  marginTop: '2px',
                }}
              >
                第 N 天
              </div>
            </>
          )}
        </div>
      </header>

      {/* 翻页条 */}
      {(onPrev || onNext) && (
        <div
          className="flex items-center justify-center"
          style={{ marginBottom: '8px', gap: '18px' }}
        >
          <button
            onClick={onPrev}
            aria-label="上一月"
            className="font-serif"
            style={{
              fontSize: '13px',
              color: 'var(--ink-soft)',
              letterSpacing: '2px',
              padding: '2px 8px',
            }}
          >
            ‹ 上月
          </button>
          <span
            style={{
              width: '1px',
              height: '11px',
              background: 'var(--line)',
            }}
          />
          <button
            onClick={onNext}
            aria-label="下一月"
            className="font-serif"
            style={{
              fontSize: '13px',
              color: 'var(--ink-soft)',
              letterSpacing: '2px',
              padding: '2px 8px',
            }}
          >
            下月 ›
          </button>
        </div>
      )}

      {children}
    </Paper>
  );
}
