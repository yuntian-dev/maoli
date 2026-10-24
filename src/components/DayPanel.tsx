import { useEffect, useRef, useState } from 'react';
import { MoodIcon } from './MoodIcon';
import { getLunar } from '../lib/lunar';
import {
  MOOD_LABEL,
  MOOD_ORDER,
  NOTE_MAX_LENGTH,
  PHOTO_MAX_PER_DAY,
  TAG_MAX_PER_DAY,
  TAGS,
  type DayRecord,
  type MoodKey,
} from '../types';

interface Props {
  date: string | null;
  record?: DayRecord;
  onClose: () => void;
  onSave: (rec: DayRecord) => void;
  onDelete: (date: string) => void;
}

export function DayPanel({
  date,
  record,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [note, setNote] = useState('');
  const [mood, setMood] = useState<MoodKey | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!date) return;
    setNote(record?.note ?? '');
    setMood(record?.mood);
    setTags(record?.tags ?? []);
    setPhotos(record?.photoIds ?? []);
    setConfirmDelete(false);
  }, [date, record]);

  if (!date) return null;

  const lunar = getLunar(date);
  const [, m, d] = date.split('-').map(Number);
  const editing = !!record;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const room = PHOTO_MAX_PER_DAY - photos.length;
    const picked = Array.from(files).slice(0, room);
    // 本 Demo 用对象 URL 直接预览（存 IndexedDB 的逻辑在 storage.ts 已就绪）
    const urls = picked.map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...urls]);
  };

  const save = () => {
    onSave({
      date,
      photoIds: photos,
      note: note.trim() || undefined,
      mood,
      tags,
      recordedAt: new Date().toISOString(),
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(46,42,38,0.3)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 200,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="day-panel"
        style={{
          background: 'var(--paper-card)',
          width: '100%',
          maxWidth: '620px',
          borderRadius: '6px 6px 0 0',
          boxShadow: 'var(--shadow-lift)',
          padding: '22px 24px 26px',
          maxHeight: '86vh',
          overflowY: 'auto',
          animation: 'panelUp 260ms cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        {/* 头部 */}
        <div className="flex items-start justify-between" style={{ marginBottom: '16px' }}>
          <div>
            <div
              className="font-serif"
              style={{ fontSize: '30px', lineHeight: 1, color: 'var(--ink)' }}
            >
              {m} 月 {d} 日
            </div>
            <div
              style={{ fontSize: '12px', color: 'var(--ink-faint)', marginTop: '5px' }}
            >
              {lunar.full}
              {lunar.jieQi ? ` · ${lunar.jieQi}` : ''}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="font-serif"
            style={{ fontSize: '20px', color: 'var(--ink-faint)', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* 照片 */}
        <div className="flex" style={{ gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {photos.map((src, i) => (
            <div
              key={i}
              style={{
                width: '86px',
                height: '86px',
                borderRadius: '2px',
                overflow: 'hidden',
                border: '1px solid var(--line)',
                position: 'relative',
              }}
            >
              <img
                src={src}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                aria-label="移除照片"
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'rgba(46,42,38,0.7)',
                  color: '#fff',
                  fontSize: '12px',
                  lineHeight: '18px',
                }}
              >
                ×
              </button>
            </div>
          ))}

          {photos.length < PHOTO_MAX_PER_DAY && (
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: '86px',
                height: '86px',
                border: '1px dashed var(--line)',
                borderRadius: '2px',
                color: 'var(--ink-faint)',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ＋ 照片
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* 短句 */}
        <div style={{ marginBottom: '14px' }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX_LENGTH))}
            placeholder="今天它怎么样？写一句话"
            rows={2}
            className="font-hand w-full"
            style={{
              border: '1px solid var(--line)',
              borderRadius: '2px',
              padding: '9px 11px',
              fontSize: '15px',
              background: 'var(--paper)',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.5,
            }}
          />
          <div
            style={{
              fontSize: '11px',
              color: 'var(--ink-faint)',
              textAlign: 'right',
              marginTop: '3px',
            }}
          >
            {note.length} / {NOTE_MAX_LENGTH}
          </div>
        </div>

        {/* 心情 */}
        <div style={{ marginBottom: '14px' }}>
          <Label>今天的心情</Label>
          <div className="flex" style={{ gap: '10px' }}>
            {MOOD_ORDER.map((m2) => (
              <button
                key={m2}
                onClick={() => setMood(mood === m2 ? undefined : m2)}
                title={MOOD_LABEL[m2]}
                style={{
                  padding: '7px 10px',
                  border: `1px solid ${mood === m2 ? 'var(--red)' : 'var(--line)'}`,
                  borderRadius: '2px',
                  background: mood === m2 ? 'rgba(200,65,47,0.06)' : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <MoodIcon mood={m2} size={22} muted={mood !== m2} />
                <span style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
                  {MOOD_LABEL[m2]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 标签 */}
        <div style={{ marginBottom: '20px' }}>
          <Label>标签</Label>
          <div className="flex" style={{ gap: '7px', flexWrap: 'wrap' }}>
            {TAGS.map((t) => {
              const on = tags.includes(t);
              return (
                <button
                  key={t}
                  onClick={() =>
                    setTags((prev) =>
                      on
                        ? prev.filter((x) => x !== t)
                        : prev.length >= TAG_MAX_PER_DAY
                          ? prev
                          : [...prev, t],
                    )
                  }
                  style={{
                    fontSize: '12px',
                    padding: '4px 11px',
                    borderRadius: '11px',
                    border: `1px solid ${on ? 'var(--red)' : 'var(--line)'}`,
                    color: on ? 'var(--red)' : 'var(--ink-soft)',
                    background: on ? 'rgba(200,65,47,0.05)' : 'transparent',
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* 操作 */}
        <div className="flex" style={{ gap: '10px' }}>
          {editing && (
            <button
              onClick={() => {
                if (confirmDelete) {
                  onDelete(date);
                } else {
                  setConfirmDelete(true);
                }
              }}
              className="font-serif"
              style={{
                padding: '9px 16px',
                border: '1px solid var(--line)',
                borderRadius: '2px',
                fontSize: '13px',
                color: confirmDelete ? 'var(--red)' : 'var(--ink-faint)',
              }}
            >
              {confirmDelete ? '确认删除' : '删除'}
            </button>
          )}
          <button
            onClick={save}
            className="font-serif"
            style={{
              flex: 1,
              padding: '9px 0',
              border: '1px solid var(--ink)',
              borderRadius: '2px',
              fontSize: '14px',
              color: 'var(--ink)',
              letterSpacing: '2px',
            }}
          >
            {editing ? '保存' : '记下这一天'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '11px',
        color: 'var(--ink-faint)',
        letterSpacing: '1px',
        marginBottom: '7px',
      }}
    >
      {children}
    </div>
  );
}
