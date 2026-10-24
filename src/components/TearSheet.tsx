/**
 * 撕页动效（Phase 2 Spike 验证版，Phase 6 直接复用）。
 *
 * 手法：整页沿一条从右上到左下的折线裂开 —— 用两个 clip-path 遮罩把纸分成两半，
 * 分离时给两半加上各自的旋转/位移，形成"被撕开"而不是"矩形淡出"的观感。
 * 撕裂边缘用 SVG 锯齿路径叠一层纸色描边。
 */
import { useEffect, useRef, useState } from 'react';

export type TearStage = 'idle' | 'tearing' | 'gone';

interface Props {
  /** 是否开始撕 */
  active: boolean;
  /** 撕完回调 */
  onTorn?: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/** 折线：右上 → 左下，沿对角偏斜 */
const SPLIT = 'polygon(100% 0, 100% 100%, 0 100%, 12% 62%, 0 48%, 38% 30%, 52% 12%, 74% 6%)';
/** 与 SPLIT 互补的上半部分 */
const SPLIT_TOP =
  'polygon(0 0, 100% 0, 74% 6%, 52% 12%, 38% 30%, 0 48%, 12% 62%)';

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
    const t1 = window.setTimeout(() => onTorn?.(), 600);
    const t2 = window.setTimeout(() => setStage('gone'), 620);
    timers.current = [t1, t2];
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    };
  }, [active, onTorn]);

  if (stage === 'gone') return null;

  const tearing = stage === 'tearing';

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        ...style,
      }}
    >
      {/* 下半部分：向左侧下方甩出 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: SPLIT,
          transform: tearing
            ? 'translate(-26px, 22px) rotate(-4deg)'
            : 'translate(0,0) rotate(0deg)',
          transition: 'transform 340ms cubic-bezier(0.3, 0, 0.2, 1)',
          opacity: tearing ? 0 : 1,
          transitionProperty: 'transform, opacity',
          transitionDuration: '340ms, 260ms',
          transitionDelay: '260ms, 260ms',
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      {/* 上半部分：向右上飞离 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: SPLIT_TOP,
          transform: tearing
            ? 'translate(30px, -34px) rotate(7deg)'
            : 'translate(0,0) rotate(0deg)',
          transition: 'transform 340ms cubic-bezier(0.2, 0.8, 0.3, 1)',
          opacity: tearing ? 0 : 1,
          transitionProperty: 'transform, opacity',
          transitionDuration: '340ms, 200ms',
          transitionDelay: '0ms, 260ms',
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      {/* 撕裂边缘的锯齿描边 */}
      {tearing && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ zIndex: 10 }}
          aria-hidden
        >
          <polyline
            points="100,0 74,6 52,12 38,30 0,48 12,62 0,100"
            fill="none"
            stroke="rgba(120,105,80,0.5)"
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />
        </svg>
      )}
    </div>
  );
}
