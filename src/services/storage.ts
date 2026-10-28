// Repository interfaces. The demo uses IndexedDB (device-only) with an in-memory
// fallback; a production adapter can implement the same interface against an API.

import type { Attempt, LessonProgress, Profile, RewardEvent } from '../domain/types.ts';

export interface ExportBundle {
  format: 'kidgem-export';
  exportVersion: 1;
  exportedAt: string;
  profiles: Profile[];
  progress: LessonProgress[];
  attempts: Attempt[];
  rewards: RewardEvent[];
}

export type StorageMode = 'indexeddb' | 'memory';

export interface DataStore {
  mode: StorageMode;
  /** Why we fell back to memory, if we did. */
  fallbackReason: string | null;
  listProfiles(): Promise<Profile[]>;
  putProfile(p: Profile): Promise<void>;
  deleteProfile(id: string): Promise<void>;
  listProgress(profileId: string): Promise<LessonProgress[]>;
  putProgress(p: LessonProgress): Promise<void>;
  /** Attempts are append-only. */
  addAttempt(a: Attempt): Promise<void>;
  listAttempts(profileId: string): Promise<Attempt[]>;
  /** Returns false if the source key was already used (idempotent award). */
  addReward(r: RewardEvent): Promise<boolean>;
  listRewards(profileId: string): Promise<RewardEvent[]>;
  /** Clears progress state for a profile. Attempts are kept unless `includeHistory` is true. */
  resetProgress(profileId: string, includeHistory: boolean): Promise<void>;
  exportAll(): Promise<ExportBundle>;
  importAll(b: ExportBundle): Promise<void>;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Strict validation for imported files; malformed imports are rejected, never partially applied. */
export function parseExport(raw: string): { ok: true; bundle: ExportBundle } | { ok: false; error: string } {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'not-json' };
  }
  if (!isObj(data) || data.format !== 'kidgem-export' || data.exportVersion !== 1) return { ok: false, error: 'wrong-format' };
  for (const k of ['profiles', 'progress', 'attempts', 'rewards']) if (!Array.isArray(data[k])) return { ok: false, error: `missing-${k}` };
  const profiles = data.profiles as unknown[];
  for (const p of profiles) {
    if (!isObj(p) || typeof p.id !== 'string' || typeof p.nickname !== 'string' || p.nickname.length > 40 || typeof p.grade !== 'number' || !isObj(p.prefs))
      return { ok: false, error: 'bad-profile' };
  }
  const ids = new Set(profiles.map((p) => (p as Profile).id));
  const belongs = (arr: unknown[], fields: string[]) =>
    arr.every((x) => isObj(x) && ids.has(x.profileId as string) && fields.every((f) => f in x));
  if (!belongs(data.progress as unknown[], ['lessonId', 'stage', 'sessionId'])) return { ok: false, error: 'bad-progress' };
  if (!belongs(data.attempts as unknown[], ['id', 'lessonId', 'itemKey', 'correct', 'timestamp'])) return { ok: false, error: 'bad-attempt' };
  if (!belongs(data.rewards as unknown[], ['sourceKey', 'delta', 'reason'])) return { ok: false, error: 'bad-reward' };
  return { ok: true, bundle: data as unknown as ExportBundle };
}
