/**
 * localStorage + IndexedDB 封装。禁止 import React（纯数据层）。
 * 见 PRD 第 12.4 节：本文件是持久化的唯一出口。
 */
import type { DayRecord, MonthSummary, Pet } from '../types';

const KEY_RECORDS = 'maoli.records.v1';
const KEY_PET = 'maoli.pet.v1';
const KEY_MONTHS = 'maoli.months.v1';

const DB_NAME = 'maoli';
const DB_VERSION = 1;
const STORE_PHOTOS = 'photos';

/* ---------------- localStorage ---------------- */

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadRecords(): Record<string, DayRecord> {
  return readJSON<Record<string, DayRecord>>(KEY_RECORDS, {});
}

export function saveRecords(records: Record<string, DayRecord>): boolean {
  return writeJSON(KEY_RECORDS, records);
}

export function loadMonths(): Record<string, MonthSummary> {
  return readJSON<Record<string, MonthSummary>>(KEY_MONTHS, {});
}

export function saveMonths(months: Record<string, MonthSummary>): boolean {
  return writeJSON(KEY_MONTHS, months);
}

export function loadPet(): Pet | null {
  return readJSON<Pet | null>(KEY_PET, null);
}

export function savePet(pet: Pet): boolean {
  return writeJSON(KEY_PET, pet);
}

/* ---------------- IndexedDB（照片） ---------------- */

let dbPromise: Promise<IDBDatabase> | null = null;
/** IndexedDB 不可用时（隐私模式等）降级为内存 Map，本次会话内仍可用 */
const memoryFallback = new Map<string, Blob>();
let idbUnavailable = false;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        db.createObjectStore(STORE_PHOTOS);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export function isPhotoStoreDegraded(): boolean {
  return idbUnavailable;
}

/** 存一张照片，返回可用于检索的 id */
export async function savePhoto(blob: Blob): Promise<string> {
  const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PHOTOS, 'readwrite');
      tx.objectStore(STORE_PHOTOS).put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch {
    idbUnavailable = true;
    memoryFallback.set(id, blob);
  }
  return id;
}

export async function getPhoto(id: string): Promise<Blob | null> {
  if (idbUnavailable) return memoryFallback.get(id) ?? null;
  try {
    const db = await openDB();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_PHOTOS, 'readonly');
      const req = tx.objectStore(STORE_PHOTOS).get(id);
      req.onsuccess = () => resolve((req.result as Blob) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    idbUnavailable = true;
    return memoryFallback.get(id) ?? null;
  }
}

export async function deletePhoto(id: string): Promise<void> {
  memoryFallback.delete(id);
  if (idbUnavailable) return;
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PHOTOS, 'readwrite');
      tx.objectStore(STORE_PHOTOS).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* 忽略删除失败 */
  }
}
