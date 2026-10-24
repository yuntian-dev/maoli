import { useCallback, useEffect, useMemo, useState } from 'react';
import './styles/global.css';
import { CalendarView } from './views/CalendarView';
import { ReviewView } from './views/ReviewView';
import { DayPanel } from './components/DayPanel';
import { Drawer } from './components/Drawer';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Toast } from './components/Toast';
import { shiftMonth } from './lib/calendar';
import {
  buildMonthSummary,
  isTorn,
  monthKey,
  today,
} from './lib/summary';
import {
  loadMonths,
  loadPet,
  loadRecords,
  saveMonths,
  saveRecords,
} from './lib/storage';
import { DEMO_PET, demoToday, generateSeedRecords } from './data/seed';
import type { DayRecord, MonthSummary, Pet, View } from './types';

export default function App() {
  const now = demoToday();

  const [pet] = useState<Pet>(() => loadPet() ?? DEMO_PET);
  const [records, setRecords] = useState<Record<string, DayRecord>>(() =>
    loadRecords(),
  );
  const [months, setMonths] = useState<Record<string, MonthSummary>>(() =>
    loadMonths(),
  );

  const [view, setView] = useState<View>('calendar');
  const [cursor, setCursor] = useState(() => {
    const [y, m] = now.split('-').map(Number);
    return { year: y, month: m };
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [panelDate, setPanelDate] = useState<string | null>(null);
  const [confirmTear, setConfirmTear] = useState<{
    year: number;
    month: number;
  } | null>(null);
  const [tearing, setTearing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 首次进入：注入 Demo 种子数据（仅当本地无记录时）
  useEffect(() => {
    if (Object.keys(records).length === 0) {
      const seed = generateSeedRecords(DEMO_PET.adoptionDate, now);
      setRecords(seed);
      saveRecords(seed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const tornCount = useMemo(
    () => Object.values(months).filter((m) => isTorn(m)).length,
    [months],
  );

  /** 保存记录 */
  const upsertRecord = useCallback((rec: DayRecord) => {
    setRecords((prev) => {
      const next = { ...prev, [rec.date]: rec };
      saveRecords(next);
      return next;
    });
  }, []);

  const deleteRecord = useCallback((date: string) => {
    setRecords((prev) => {
      const next = { ...prev };
      delete next[date];
      saveRecords(next);
      return next;
    });
  }, []);

  /** 撕页 */
  const doTear = useCallback(() => {
    if (!confirmTear) return;
    const { year, month } = confirmTear;
    setConfirmTear(null);
    setTearing(true);

    window.setTimeout(() => {
      const summary = buildMonthSummary(year, month, records, today());
      setMonths((prev) => {
        const next = { ...prev, [monthKey(year, month)]: summary };
        saveMonths(next);
        return next;
      });
      setTearing(false);
      setDrawerOpen(true);
      setToast(`${month} 月的挂历撕下来了`);
    }, 340);
  }, [confirmTear, records]);

  /** 贴回去 */
  const restoreMonth = useCallback(
    (year: number, month: number) => {
      setMonths((prev) => {
        const key = monthKey(year, month);
        const cur = prev[key];
        if (!cur) return prev;
        const next = {
          ...prev,
          [key]: { ...cur, restoredAt: new Date().toISOString() },
        };
        saveMonths(next);
        return next;
      });
      setDrawerOpen(false);
      setToast(`${month} 月贴回去了`);
    },
    [],
  );

  const currentTorn = cursor
    ? isTorn(months[monthKey(cursor.year, cursor.month)])
    : false;

  return (
    <div
      className="min-h-full app-shell"
      style={{
        padding: '28px 24px 72px',
        background:
          'radial-gradient(ellipse at 50% 0%, var(--paper-card) 0%, var(--paper) 62%)',
      }}
    >
      {/* 顶栏 */}
      <nav
        className="mx-auto flex items-center justify-between"
        style={{ maxWidth: '1100px', marginBottom: '14px', gap: '12px' }}
      >
        <div
          className="font-hand"
          style={{ fontSize: '13px', color: 'var(--ink-soft)' }}
        >
          {pet.name}的挂历 · 撕一撕，看看这一年
        </div>

        <div className="flex items-center" style={{ gap: '8px' }}>
          <TopBtn onClick={() => setDrawerOpen(true)}>
            抽屉{tornCount > 0 ? ` · ${tornCount}` : ''}
          </TopBtn>
          <TopBtn
            active={view === 'review'}
            onClick={() => setView(view === 'review' ? 'calendar' : 'review')}
          >
            {view === 'review' ? '回挂历' : '复盘'}
          </TopBtn>
        </div>
      </nav>

      {view === 'calendar' ? (
        <CalendarView
          pet={pet}
          records={records}
          cursor={cursor}
          torn={currentTorn}
          tearing={tearing}
          onSelect={setPanelDate}
          onPrev={() => setCursor((c) => shiftMonth(c, -1))}
          onNext={() => setCursor((c) => shiftMonth(c, 1))}
          onTear={() =>
            setConfirmTear({ year: cursor.year, month: cursor.month })
          }
        />
      ) : (
        <ReviewView pet={pet} records={records} months={months} />
      )}

      {/* 日详情面板 */}
      <DayPanel
        date={panelDate}
        record={panelDate ? records[panelDate] : undefined}
        onClose={() => setPanelDate(null)}
        onSave={(rec) => {
          upsertRecord(rec);
          setPanelDate(null);
          setToast('记下了');
        }}
        onDelete={(date) => {
          deleteRecord(date);
          setPanelDate(null);
          setToast('删掉了');
        }}
      />

      {/* 抽屉 */}
      <Drawer
        open={drawerOpen}
        records={records}
        months={months}
        onClose={() => setDrawerOpen(false)}
        onRestore={restoreMonth}
      />

      {/* 撕页确认 */}
      <ConfirmDialog
        open={!!confirmTear}
        month={confirmTear?.month ?? 0}
        summary={
          confirmTear
            ? buildMonthSummary(
                confirmTear.year,
                confirmTear.month,
                records,
                today(),
              )
            : undefined
        }
        onCancel={() => setConfirmTear(null)}
        onConfirm={doTear}
      />

      {toast && <Toast message={toast} />}
    </div>
  );
}

function TopBtn({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="font-serif"
      style={{
        fontSize: '13px',
        letterSpacing: '1px',
        padding: '5px 14px',
        border: `1px solid ${active ? 'var(--red)' : 'var(--line)'}`,
        color: active ? 'var(--red)' : 'var(--ink-soft)',
        borderRadius: '2px',
        background: 'transparent',
      }}
    >
      {children}
    </button>
  );
}
