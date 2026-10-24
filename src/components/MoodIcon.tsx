/**
 * 心情图标 —— 4 个手绘感 SVG，刻意不用 emoji。
 */
import type { MoodKey } from '../types';

const S = { stroke: 'var(--ink)', strokeWidth: 1.6, fill: 'none' } as const;

export function MoodIcon({
  mood,
  size = 22,
  muted = false,
}: {
  mood: MoodKey;
  size?: number;
  muted?: boolean;
}) {
  const op = muted ? 0.45 : 1;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ opacity: op }}
      aria-hidden
    >
      {mood === 'happy' && (
        <g {...S}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M8.5 13.5c1 1.6 2.2 2.4 3.5 2.4s2.5-.8 3.5-2.4" strokeLinecap="round" />
          <circle cx="9.4" cy="10" r="0.9" fill="var(--ink)" stroke="none" />
          <circle cx="14.6" cy="10" r="0.9" fill="var(--ink)" stroke="none" />
        </g>
      )}
      {mood === 'sleepy' && (
        <g {...S}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M8.4 10.4c1-.9 2-1.3 3-1.3" strokeLinecap="round" />
          <path d="M14.4 10.4c1-.9 1.4-1.1 1.8-1.1" strokeLinecap="round" />
          <path d="M9.5 14.6c1.4.7 3.6.7 5 0" strokeLinecap="round" />
          <path d="M17 5.5h3l-3 3h3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {mood === 'clingy' && (
        <g {...S}>
          <path d="M12 20.5c-3.6 0-6.5-2.7-6.5-6 0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5c0 3.3-2.9 6-6.5 6z" />
          <circle cx="9.6" cy="12.4" r="0.9" fill="var(--ink)" stroke="none" />
          <circle cx="14.4" cy="12.4" r="0.9" fill="var(--ink)" stroke="none" />
          <path d="M10.4 15.4c1 .8 2.2.8 3.2 0" strokeLinecap="round" />
          <path d="M18.5 8.2c1.6-1.4 3.4-1.2 4.4-.6-1 .2-1.6.7-2 1.4" strokeLinecap="round" />
        </g>
      )}
      {mood === 'sly' && (
        <g {...S}>
          <path d="M12 20.5c-3.9 0-7-2.9-7-6.5S8.1 7.5 12 7.5s7 2.9 7 6.5-3.1 6.5-7 6.5z" />
          <path d="M8.2 11.4c1.2-.5 2.3-.4 3.1.3" strokeLinecap="round" />
          <path d="M14 11.6c1.2-.4 2-.3 2.6.4" strokeLinecap="round" />
          <path d="M10.6 15.6c1.6-.4 3-.2 3.9.7" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
