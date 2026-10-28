// Versioned IndexedDB adapter. Device-only: anyone using this browser profile can read it,
// and clearing browser data erases it.

import type { DataStore, ExportBundle } from './storage.ts';
import type { Attempt, LessonProgress, Profile, RewardEvent } from '../domain/types.ts';
import { MemoryStore } from './memoryStore.ts';

const DB_NAME = 'gemkid';
export const DB_VERSION = 1;

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((res, rej) => {
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error ?? new Error('Transaction aborted'));
  });
}

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    let r: IDBOpenDBRequest;
    try {
      r = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (e) {
      rej(e);
      return;
    }
    r.onupgradeneeded = (ev) => {
      const db = r.result;
      // Version 1 schema. Future versions add migrations here keyed on ev.oldVersion.
      if ((ev as IDBVersionChangeEvent).oldVersion < 1) {
        db.createObjectStore('profiles', { keyPath: 'id' });
        const prog = db.createObjectStore('progress', { keyPath: ['profileId', 'lessonId'] });
        prog.createIndex('byProfile', 'profileId');
        const att = db.createObjectStore('attempts', { keyPath: 'id' });
        att.createIndex('byProfile', 'profileId');
        const rew = db.createObjectStore('rewards', { keyPath: ['profileId', 'sourceKey'] });
        rew.createIndex('byProfile', 'profileId');
      }
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.onblocked = () => rej(new Error('blocked'));
  });
}

export class IdbStore implements DataStore {
  mode = 'indexeddb' as const;
  fallbackReason = null;
  private db: IDBDatabase;
  constructor(db: IDBDatabase) {
    this.db = db;
  }
  private store(name: string, mode: IDBTransactionMode = 'readonly') {
    const tx = this.db.transaction(name, mode);
    return { tx, s: tx.objectStore(name) };
  }
  async listProfiles() {
    const { s } = this.store('profiles');
    const all = (await req(s.getAll())) as Profile[];
    return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  async putProfile(p: Profile) {
    const { tx, s } = this.store('profiles', 'readwrite');
    s.put(p);
    await done(tx);
  }
  async deleteProfile(id: string) {
    const tx = this.db.transaction(['profiles', 'progress', 'attempts', 'rewards'], 'readwrite');
    tx.objectStore('profiles').delete(id);
    for (const name of ['progress', 'attempts', 'rewards']) {
      const keys = await req(tx.objectStore(name).index('byProfile').getAllKeys(id));
      for (const k of keys) tx.objectStore(name).delete(k);
    }
    await done(tx);
  }
  async listProgress(profileId: string) {
    const { s } = this.store('progress');
    return (await req(s.index('byProfile').getAll(profileId))) as LessonProgress[];
  }
  async putProgress(p: LessonProgress) {
    const { tx, s } = this.store('progress', 'readwrite');
    s.put(p);
    await done(tx);
  }
  async addAttempt(a: Attempt) {
    const { tx, s } = this.store('attempts', 'readwrite');
    s.add(a);
    await done(tx);
  }
  async listAttempts(profileId: string) {
    const { s } = this.store('attempts');
    const list = (await req(s.index('byProfile').getAll(profileId))) as Attempt[];
    return list.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }
  async addReward(r: RewardEvent) {
    // Unique key (profileId, sourceKey) makes awards idempotent at the storage layer too.
    const { tx, s } = this.store('rewards', 'readwrite');
    const existing = await req(s.get([r.profileId, r.sourceKey]));
    if (existing) {
      await done(tx);
      return false;
    }
    s.add(r);
    await done(tx);
    return true;
  }
  async listRewards(profileId: string) {
    const { s } = this.store('rewards');
    const list = (await req(s.index('byProfile').getAll(profileId))) as RewardEvent[];
    return list.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }
  async resetProgress(profileId: string, includeHistory: boolean) {
    const names = includeHistory ? ['progress', 'attempts'] : ['progress'];
    const tx = this.db.transaction(names, 'readwrite');
    for (const name of names) {
      const keys = await req(tx.objectStore(name).index('byProfile').getAllKeys(profileId));
      for (const k of keys) tx.objectStore(name).delete(k);
    }
    await done(tx);
  }
  async exportAll(): Promise<ExportBundle> {
    const all = async <T,>(name: string) => (await req(this.db.transaction(name).objectStore(name).getAll())) as T[];
    return {
      format: 'gemkid-export',
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      profiles: await all<Profile>('profiles'),
      progress: await all<LessonProgress>('progress'),
      attempts: await all<Attempt>('attempts'),
      rewards: await all<RewardEvent>('rewards'),
    };
  }
  async importAll(b: ExportBundle) {
    const tx = this.db.transaction(['profiles', 'progress', 'attempts', 'rewards'], 'readwrite');
    for (const p of b.profiles) tx.objectStore('profiles').put(p);
    for (const p of b.progress) tx.objectStore('progress').put(p);
    for (const a of b.attempts) tx.objectStore('attempts').put(a);
    for (const r of b.rewards) tx.objectStore('rewards').put(r);
    await done(tx);
  }
}

export async function openStore(): Promise<DataStore> {
  try {
    if (typeof indexedDB === 'undefined') return new MemoryStore('unsupported');
    const db = await open();
    return new IdbStore(db);
  } catch (e) {
    return new MemoryStore(e instanceof Error ? e.message || 'error' : 'error');
  }
}
