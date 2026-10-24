/**
 * 撕页动效（Phase 2 Spike 验证版，Phase 6 直接复用）。
 *
 * 手法：用一条**锯齿状撕裂线**把纸分成上下两半。
 * 两半各用一个 clip-path polygon，共享同一组撕裂点，因此撕口是真锯齿，
 * 且两半沿锯齿线严丝合缝（不会露缝、也不会重叠）。
 *
 * 撕裂时：
 *   上半 → 向右上平移 + 轻微旋转 + 变暗
 *   下半 → 向左下平移 + 轻微旋转
 */
import { useEffect, useRef, useState } from 'react';

export type TearStage = 'idle' | 'tearing' | 'gone';

interface Props {
  /** 是否开始撕 */
  active: boolean;
  /** 撕完回调（动画中段触发，用于生成月报） */
  onTorn?: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 撕裂线上的锯齿点（x, y 百分比）。从左到右，y 在 46%~60% 之间抖动。
 */
const TEAR_POINTS: [number, number][] = [
  [0, 58],
  [7, 55],
  [13, 60],
  [20, 53],
  [26, 59],
  [33, 52],
  [39, 58],
  [46, 51],
  [52, 57],
  [59, 50],
  [65, 56],
  [72, 49],
  [78, 55],
  [85, 48],
  [91, 54],
  [100, 46],
];

/** 上半：撕裂线之上 */
const CLIP_TOP = [
  '0% 0%',
  '100% 0%',
  ...TEAR_POINTS.slice().reverse().map(([x, y]) => `${x}% ${y}%`),
].join(', ');

/** 下半：撕裂线之下 */
const CLIP_BOTTOM = [
  '0% 100%',
  '100% 100%',
  ...TEAR_POINTS.map(([x, y]) => `${x}% ${y}%`),
].join(', ');

/** 撕裂线的描边点串 */
const TEAR_LINE = TEAR_POINTS.map(([x, y]) => `${x},${y}`).join(' ');

export function TearSheet({
  active,
  onTorn,
  children,
  className = '',
  style,
}: Props) {
  const [stage, setStage] = useState<TearStage>('idle');
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!active) {
      setStage('idle');
      return;
    }
    setStage('tearing');
    const t1 = window.setTimeout(() => onTorn?.(), 300);
    const t2 = window.setTimeout(() => setStage('gone'), 620);
    timers.current = [t1, t2];
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    };
  }, [active, onTorn]);

  if (stage === 'gone') return null;

  const tearing = stage === 'tearing';

  // 未撕时只渲染一层（保证点击正常），撕开时才叠加撕裂层。
  // 撕裂层绝对定位覆盖在原层上，撕完即销毁。
  if (!tearing) {
    return (
      <div className={className} style={{ position: 'relative', ...style }}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{ position: 'relative', ...style }}
    >
      {/* 底层：随下半一起甩出 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `polygon(${CLIP_BOTTOM})`,
          transform: 'translate(-30px, 26px) rotate(-4.5deg)',
          opacity: 0,
          transition:
            'transform 320ms cubic-bezier(0.25, 0.9, 0.3, 1), opacity 220ms ease',
          transitionDelay: '280ms, 280ms',
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      {/* 上半：向右上飞离 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `polygon(${CLIP_TOP})`,
          transform: 'translate(34px, -40px) rotate(7deg)',
          opacity: 0,
          transition:
            'transform 320ms cubic-bezier(0.2, 0.8, 0.3, 1), opacity 200ms ease',
          transitionDelay: '0ms, 280ms',
          willChange: 'transform',
          filter: 'brightness(0.94)',
        }}
      >
        {children}
      </div>

      {/* 撕裂线描边 */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ zIndex: 3, overflow: 'visible' }}
        aria-hidden
      >
        <polyline
          points={TEAR_LINE}
          fill="none"
          stroke="rgba(120,100,72,0.5)"
          strokeWidth="1"
          strokeLinejoin="round"
          style={{ vectorEffect: 'non-scaling-stroke' }}
        />
      </svg>
    </div>
  );
}
