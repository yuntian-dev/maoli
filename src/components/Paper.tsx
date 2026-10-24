/**
 * 纸纹 / 暗角容器。纯样式包装，无业务逻辑。
 */
import type { CSSProperties, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** 是否叠加暗角 */
  vignette?: boolean;
}

export function Paper({
  children,
  className = '',
  style,
  vignette = true,
}: Props) {
  const cls = `paper-grain${vignette ? ' vignette' : ''} ${className}`;
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
}

/**
 * 图钉：两颗同心圆 + 高光。
 */
export function Pushpin({ className = '' }: { className?: string }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className={className}
      aria-hidden
    >
      <circle cx="5" cy="5" r="4.2" fill="var(--ink)" opacity="0.75" />
      <circle cx="3.6" cy="3.4" r="1.5" fill="#fff" opacity="0.45" />
    </svg>
  );
}

/**
 * 胶带：歪斜的半透明矩形。
 */
export function Tape({
  className = '',
  rotate = -4,
  text,
}: {
  className?: string;
  rotate?: number;
  text?: string;
}) {
  return (
    <div
      className={className}
      style={{
        transform: `rotate(${rotate}deg)`,
        background: 'rgba(255, 245, 220, 0.62)',
        borderTop: '1px solid rgba(255,255,255,0.35)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      {text}
    </div>
  );
}

/**
 * 撕口：锯齿边缘遮罩。
 */
export function TornEdge({
  side = 'bottom',
  className = '',
}: {
  side?: 'top' | 'bottom';
  className?: string;
}) {
  const clip =
    side === 'bottom'
      ? 'polygon(0 0, 100% 0, 100% 88%, 96% 96%, 91% 86%, 86% 97%, 80% 87%, 74% 98%, 68% 88%, 62% 97%, 56% 86%, 50% 98%, 44% 88%, 38% 97%, 32% 87%, 26% 98%, 20% 88%, 14% 97%, 8% 87%, 3% 96%, 0 88%)'
      : 'polygon(0 12%, 3% 4%, 8% 14%, 14% 3%, 20% 13%, 26% 2%, 32% 13%, 38% 3%, 44% 12%, 50% 2%, 56% 13%, 62% 3%, 68% 12%, 74% 2%, 80% 13%, 86% 3%, 92% 14%, 97% 4%, 100% 12%, 100% 100%, 0 100%)';

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        clipPath: clip,
        background: 'var(--paper-deep)',
        filter: 'drop-shadow(0 -1px 0 rgba(0,0,0,0.12))',
        pointerEvents: 'none',
      }}
      aria-hidden
    />
  );
}
