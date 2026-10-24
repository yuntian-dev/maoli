import type { MonthSummary } from '../types';

interface Props {
  open: boolean;
  month: number;
  summary?: MonthSummary;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  month,
  summary,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(46,42,38,0.34)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 250,
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--paper-card)',
          borderRadius: '3px',
          boxShadow: 'var(--shadow-lift)',
          padding: '24px 28px',
          maxWidth: '340px',
          width: '100%',
          border: '1px solid var(--line)',
        }}
      >
        <div
          className="font-serif"
          style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '8px' }}
        >
          撕掉 {month} 月？
        </div>
        <p
          className="font-hand"
          style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '16px' }}
        >
          撕下来的是这个月的月报
        </p>

        {summary && (
          <div
            style={{
              borderTop: '1px solid var(--line)',
              borderBottom: '1px solid var(--line)',
              padding: '10px 0',
              marginBottom: '18px',
              fontSize: '12px',
              color: 'var(--ink-soft)',
              display: 'flex',
              gap: '18px',
            }}
          >
            <span>记了 {summary.recordedDays} 天</span>
            <span>拍了 {summary.photoCount} 张</span>
          </div>
        )}

        <div className="flex" style={{ gap: '10px' }}>
          <button
            onClick={onCancel}
            className="font-serif"
            style={{
              flex: 1,
              padding: '8px 0',
              border: '1px solid var(--line)',
              borderRadius: '2px',
              fontSize: '13px',
              color: 'var(--ink-soft)',
            }}
          >
            再想想
          </button>
          <button
            onClick={onConfirm}
            className="font-serif"
            style={{
              flex: 1,
              padding: '8px 0',
              border: '1px solid var(--red)',
              borderRadius: '2px',
              fontSize: '13px',
              color: 'var(--red)',
              background: 'rgba(200,65,47,0.05)',
            }}
          >
            撕掉
          </button>
        </div>
      </div>
    </div>
  );
}
