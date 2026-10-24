/**
 * Phase 2 Spike：撕页动效手感验证页。
 * 只验动画，不接业务逻辑。Phase 6 验证通过后本文件可删。
 */
import { useState } from 'react';
import { TearSheet } from '../components/TearSheet';
import { Paper } from '../components/Paper';

export function SpikeTear() {
  const [round, setRound] = useState(0);
  const [active, setActive] = useState(false);

  const trigger = () => {
    setActive(true);
    setTimeout(() => {
      setActive(false);
      setRound((r) => r + 1);
    }, 700);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '48px 24px',
        background: 'var(--paper)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px',
      }}
    >
      <h1 className="font-serif" style={{ fontSize: '20px', letterSpacing: '3px' }}>
        撕页动效 Spike
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
        点纸卡测试手感 · 第 {round} 次
      </p>

      <TearSheet
        active={active}
        className="w-full"
        style={{ maxWidth: '420px' }}
      >
        <Paper
          style={{
            position: 'relative',
            borderRadius: '3px',
            boxShadow: 'var(--shadow-page)',
            background: 'var(--paper)',
            padding: '28px',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            className="font-serif"
            style={{ fontSize: '44px', color: 'var(--red)', lineHeight: 1 }}
          >
            十月
          </div>
          <div
            className="font-hand"
            style={{ fontSize: '16px', color: 'var(--ink-soft)' }}
          >
            这个月过完了
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>
            记录 22 天 · 拍了 31 张
          </div>
        </Paper>
      </TearSheet>

      <button
        onClick={trigger}
        disabled={active}
        className="font-serif"
        style={{
          border: '1px solid var(--ink)',
          padding: '9px 26px',
          borderRadius: '2px',
          color: 'var(--ink)',
          opacity: active ? 0.4 : 1,
        }}
      >
        撕掉这一页
      </button>
    </div>
  );
}
