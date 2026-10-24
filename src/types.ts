/**
 * PRD 第 8 节：全部类型定义。禁止在此文件之外重复定义同名类型。
 */

export type MoodKey = 'happy' | 'sleepy' | 'clingy' | 'sly';

export const MOOD_ORDER: MoodKey[] = ['happy', 'sleepy', 'clingy', 'sly'];

export const MOOD_LABEL: Record<MoodKey, string> = {
  happy: '开心',
  sleepy: '困倦',
  clingy: '粘人',
  sly: '狡黠',
};

export const TAGS = ['吃饭', '睡觉', '玩耍', '看病', '洗澡', '第一次…'] as const;

/** 单日照片上限（见 PRD 第 8 节） */
export const PHOTO_MAX_PER_DAY = 3;

/** 单条短句字数上限 */
export const NOTE_MAX_LENGTH = 50;

/** 单日标签上限 */
export const TAG_MAX_PER_DAY = 3;

export interface Pet {
  id: string;
  name: string;
  species: 'cat' | 'dog';
  breed: string;
  birthday: string;
  /** Day 1 锚点 */
  adoptionDate: string;
  avatar: string;
}

export interface DayRecord {
  /** 'YYYY-MM-DD' 主键 */
  date: string;
  /** 指向 IndexedDB 的照片 blob id，0..PHOTO_MAX_PER_DAY 张；网格只显示第 1 张 */
  photoIds: string[];
  note?: string;
  mood?: MoodKey;
  tags: string[];
  recordedAt: string;
}

export interface MonthSummary {
  year: number;
  month: number;
  recordedDays: number;
  photoCount: number;
  topMood?: MoodKey;
  topTag?: string;
  tornAt: string;
  restoredAt?: string;
}

export type View = 'calendar' | 'review';

export interface AppState {
  view: View;
  cursor: { year: number; month: number };
  drawerOpen: boolean;
  panel: { open: boolean; date?: string };
  confirmTear: { year: number; month: number } | null;
  pet: Pet;
  /** 'YYYY-MM-DD' -> record */
  records: Record<string, DayRecord>;
  /** 'YYYY-MM' -> summary */
  months: Record<string, MonthSummary>;
}
