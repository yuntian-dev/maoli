/**
 * 挂历格（DayCell）—— 网格最小单元。
 * PRD 6.5：左上角大日期数字 + 右上角农历小字 + 照片 + 底部手写短句。
 * 布局用 flex 纵向：顶部标题行固定高，中部照片自适应填满，底部短句浮在照片上。
 */

export type CellStatus = 'recorded' | 'blank' | 'future' | 'before';

export interface DayCellProps {
  day: number;
  lunarText?: string;
  status: CellStatus;
  photoUrl?: string;
  note?: string;
  isToday?: boolean;
  isSunday?: boolean;
  isSaturday?: boolean;
  showLunar?: boolean;
  onClick?: () => void;
}

export function DayCell({
  day,
  lunarText,
  status,
  photoUrl,
  note,
  isToday,
  isSunday,
  isSaturday,
  showLunar = true,
  onClick,
}: DayCellProps) {
  const clickable = status === 'recorded' || status === 'blank';

  const dateColor = isSunday
    ? 'var(--red)'
    : isSaturday
      ? 'var(--gray-sat)'
      : 'var(--ink)';

  return (
    <button
      type="button"
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      aria-label={`${day} 日${note ? ' ' + note : ''}`}
      className="relative flex flex-col overflow-hidden text-left"
      style={{
        // 真挂历的格子是扁矩形（宽 > 高），不是正方形
        height: '116px',
        background: 'var(--paper-card)',
        borderRight: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        cursor: clickable ? 'pointer' : 'default',
        opacity: status === 'future' ? 0.42 : 1,
        padding: 0,
      }}
    >
      {/* 顶部：日期 + 农历 + 红点 */}
      <div
        className="relative flex shrink-0 items-start justify-between"
        style={{ padding: '4px 5px 0 6px', height: '26px' }}
      >
        <span
          className="font-serif leading-none"
          style={{
            fontSize: 'var(--fs-date)',
            color: dateColor,
            fontWeight: status === 'blank' ? 400 : 600,
          }}
        >
          {day}
        </span>

        {showLunar && lunarText && (
          <span
            className="leading-none"
            style={{
              fontSize: 'var(--fs-lunar)',
              color: 'var(--ink-faint)',
              marginTop: '3px',
              marginRight: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            {lunarText}
          </span>
        )}

        {/* 有记录 → 右上角小红点 */}
        {status === 'recorded' && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: '7px',
              right: '5px',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'var(--red)',
            }}
          />
        )}
      </div>

      {/* 中部：照片 / 空缺态。
          绝对定位 + flex 剩余高度，避免图片按自然尺寸撑破格子。 */}
      <div
        className="relative"
        style={{
          position: 'absolute',
          left: '6px',
          right: '5px',
          top: '28px',
          bottom: note ? '21px' : '4px',
        }}
      >
        {status === 'recorded' && photoUrl ? (
          <div
            className="photo-faded h-full w-full overflow-hidden"
            style={{
              borderRadius: '1px',
              background: 'var(--paper-blank)',
            }}
          >
            <img
              src={photoUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
              style={{ display: 'block' }}
            />
          </div>
        ) : status === 'recorded' ? (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              color: 'var(--ink-faint)',
              fontSize: 'var(--fs-note)',
              opacity: 0.55,
            }}
          >
            <span className="font-hand">—</span>
          </div>
        ) : status === 'blank' ? (
          <div
            className="flex h-full w-full items-center justify-center font-hand"
            style={{
              color: 'var(--ink-faint)',
              fontSize: 'var(--fs-note)',
            }}
          >
            —
          </div>
        ) : null}

        {isToday && (
          <span
            className="font-hand"
            style={{
              position: 'absolute',
              bottom: '1px',
              right: '4px',
              fontSize: '11px',
              color: 'var(--red)',
              transform: 'rotate(-6deg)',
            }}
          >
            今天
          </span>
        )}
      </div>

      {/* 底部：手写短句独立成行，不压照片 */}
      {status === 'recorded' && note && (
        <div
          className="font-hand shrink-0"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            fontSize: 'var(--fs-note)',
            color: 'var(--ink)',
            padding: '2px 5px 3px 6px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {note}
        </div>
      )}
    </button>
  );
}
