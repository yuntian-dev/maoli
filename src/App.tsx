import { useMemo, useState } from 'react';
import './styles/global.css';
import { CalendarView } from './views/CalendarView';
import { SpikeTear } from './views/SpikeTear';
import { shiftMonth } from './lib/calendar';
import { DEMO_PET, demoToday, generateSeedRecords } from './data/seed';

export default function App() {
  const today = demoToday();
  const records = useMemo(
    () => generateSeedRecords(DEMO_PET.adoptionDate, today),
    [today],
  );
  const [cursor, setCursor] = useState(() => {
    const [y, m] = today.split('-').map(Number);
    return { year: y, month: m };
  });
  const [spike, setSpike] = useState(false);

  if (spike) {
    return (
      <>
        <button
          onClick={() => setSpike(false)}
          className="font-serif"
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 999,
            border: '1px solid var(--line)',
            padding: '5px 12px',
            borderRadius: '2px',
            background: 'var(--paper-card)',
            fontSize: 12,
          }}
        >
          返回挂历
        </button>
        <SpikeTear />
      </>
    );
  }

  return (
    <div
      className="min-h-full"
      style={{
        padding: '32px 24px 64px',
        background:
          'radial-gradient(ellipse at 50% 0%, var(--paper-card) 0%, var(--paper) 60%)',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <CalendarView
          pet={DEMO_PET}
          records={records}
          cursor={cursor}
          onSelect={() => {}}
          onPrev={() => setCursor((c) => shiftMonth(c, -1))}
          onNext={() => setCursor((c) => shiftMonth(c, 1))}
        />
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={() => setSpike(true)}
            className="font-serif"
            style={{ border: '1px solid var(--line)', padding: '6px 16px', borderRadius: '2px' }}
          >
            撕页 Spike
          </button>
        </div>
      </div>
    </div>
  );
}
