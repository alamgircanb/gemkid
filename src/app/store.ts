// Application state. Holds the active learner's records in memory and writes through
// to the DataStore. A failed write is surfaced as a visible warning, never hidden.

import type { DataStore, ExportBundle } from '../services/storage.ts';
import { parseExport } from '../services/storage.ts';
import { openStore } from '../services/idbStore.ts';
import { readLocal, writeLocal } from '../services/safeLocal.ts';
import { newId } from '../domain/rng.ts';
import type {
  Attempt,
  AvatarId,
  Item,
  LangTag,
  Lesson,
  LessonProgress,
  Level,
  MasteryState,
  Preferences,
  Profile,
  RewardEvent,
  StageId,
  SubjectId,
} from '../domain/types.ts';
import { defaultPlacements, LESSONS, lessonById } from '../content/curriculum.ts';
import { lessonEvidence } from '../domain/mastery.ts';
import { GEMS, completionKey, masteryKey, purchaseKey, reviewKey, canPurchase, SHOP } from '../domain/rewards.ts';
import { analytics } from '../services/analytics.ts';

export interface AppState {
  ready: boolean;
  storageMode: 'indexeddb' | 'memory' | 'pending';
  storageReason: string | null;
  saveError: boolean;
  profiles: Profile[];
  activeId: string | null;
  progress: LessonProgress[];
  attempts: Attempt[];
  rewards: RewardEvent[];
  guestPrefs: Preferences;
}

const ACTIVE_KEY = 'kidgem.activeProfile';
const GUEST_PREFS_KEY = 'kidgem.guestPrefs';

export const DEFAULT_PREFS: Preferences = {
  uiLocale: 'en',
  theme: 'auto',
  sound: false,
  motion: 'system',
  highContrast: false,
  textScale: 1,
};

function loadGuestPrefs(): Preferences {
  const raw = readLocal(GUEST_PREFS_KEY);
  if (!raw) {
    const nav = (globalThis.navigator?.language ?? 'en').slice(0, 2);
    return { ...DEFAULT_PREFS, uiLocale: (['en', 'fr', 'bn'].includes(nav) ? nav : 'en') as LangTag };
  }
  try {
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Preferences>), sound: false };
  } catch {
    return DEFAULT_PREFS;
  }
}

type Listener = () => void;

export class AppStore {
  private state: AppState = {
    ready: false,
    storageMode: 'pending',
    storageReason: null,
    saveError: false,
    profiles: [],
    activeId: null,
    progress: [],
    attempts: [],
    rewards: [],
    guestPrefs: loadGuestPrefs(),
  };
  private listeners = new Set<Listener>();
  private db: DataStore | null = null;
  /** Injectable clock so tests can move time. */
  now: () => Date = () => new Date();

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };
  get = () => this.state;
  private set(patch: Partial<AppState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }
  private iso() {
    return this.now().toISOString();
  }

  async init(db?: DataStore) {
    this.db = db ?? (await openStore());
    let profiles: Profile[] = [];
    try {
      profiles = await this.db.listProfiles();
    } catch {
      this.set({ saveError: true });
    }
    const stored = readLocal(ACTIVE_KEY);
    const activeId = profiles.some((p) => p.id === stored) ? stored : null;
    this.set({ storageMode: this.db.mode, storageReason: this.db.fallbackReason, profiles, ready: true });
    if (activeId) await this.selectProfile(activeId);
  }

  /** Run a write; on failure keep the in-memory state and show the warning banner. */
  private async persist(op: () => Promise<unknown>) {
    try {
      await op();
    } catch (e) {
      console.warn('KidGem save failed', e);
      this.set({ saveError: true });
    }
  }

  active(): Profile | null {
    return this.state.profiles.find((p) => p.id === this.state.activeId) ?? null;
  }

  prefs(): Preferences {
    return this.active()?.prefs ?? this.state.guestPrefs;
  }

  async selectProfile(id: string | null) {
    if (!id || !this.db) {
      writeLocal(ACTIVE_KEY, null);
      this.set({ activeId: null, progress: [], attempts: [], rewards: [] });
      return;
    }
    let progress: LessonProgress[] = [], attempts: Attempt[] = [], rewards: RewardEvent[] = [];
    try {
      [progress, attempts, rewards] = await Promise.all([this.db.listProgress(id), this.db.listAttempts(id), this.db.listRewards(id)]);
    } catch {
      this.set({ saveError: true });
    }
    writeLocal(ACTIVE_KEY, id);
    this.set({ activeId: id, progress, attempts, rewards });
  }

  async createProfile(input: { nickname: string; avatar: AvatarId; grade: number }): Promise<Profile> {
    const at = this.iso();
    const placements = defaultPlacements();
    const p: Profile = {
      id: newId('p-'),
      nickname: input.nickname.trim().slice(0, 24),
      avatar: input.avatar,
      grade: input.grade,
      placements,
      placementHistory: (Object.keys(placements) as SubjectId[]).map((s) => ({
        subjectId: s,
        from: null,
        to: placements[s]!,
        at,
        by: 'learner-setup' as const,
      })),
      prefs: { ...this.state.guestPrefs },
      equipped: [],
      createdAt: at,
      schemaVersion: 1,
    };
    this.set({ profiles: [...this.state.profiles, p] });
    await this.persist(() => this.db!.putProfile(p));
    await this.selectProfile(p.id);
    return p;
  }

  async updateProfile(id: string, patch: Partial<Profile>) {
    const profiles = this.state.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p));
    this.set({ profiles });
    const p = profiles.find((x) => x.id === id);
    if (p) await this.persist(() => this.db!.putProfile(p));
  }

  async setPrefs(patch: Partial<Preferences>) {
    const a = this.active();
    if (a) {
      await this.updateProfile(a.id, { prefs: { ...a.prefs, ...patch } });
    } else {
      const guestPrefs = { ...this.state.guestPrefs, ...patch };
      this.set({ guestPrefs });
      writeLocal(GUEST_PREFS_KEY, JSON.stringify(guestPrefs));
    }
  }

  async setPlacement(profileId: string, subjectId: SubjectId, to: Level) {
    const p = this.state.profiles.find((x) => x.id === profileId);
    if (!p) return;
    await this.updateProfile(profileId, {
      placements: { ...p.placements, [subjectId]: to },
      placementHistory: [...p.placementHistory, { subjectId, from: p.placements[subjectId] ?? null, to, at: this.iso(), by: 'parent' }],
    });
    analytics.track('path_selected', { subjectId });
  }

  async deleteProfile(id: string) {
    await this.persist(() => this.db!.deleteProfile(id));
    const profiles = this.state.profiles.filter((p) => p.id !== id);
    this.set({ profiles });
    if (this.state.activeId === id) await this.selectProfile(null);
  }

  /** Clear resume state. Attempt history and rewards are kept unless `includeHistory`. */
  async resetProgress(id: string, includeHistory: boolean) {
    await this.persist(() => this.db!.resetProgress(id, includeHistory));
    if (this.state.activeId === id) await this.selectProfile(id);
  }

  // ---------- Lessons ----------
  progressFor(lessonId: string): LessonProgress | undefined {
    return this.state.progress.find((p) => p.lessonId === lessonId);
  }

  masteryOf = (lessonId: string): MasteryState => {
    const l = lessonById(lessonId);
    if (!l) return 'not-started';
    return lessonEvidence(l, this.state.attempts, this.progressFor(lessonId)).state;
  };

  private async saveProgress(p: LessonProgress) {
    const progress = [...this.state.progress.filter((x) => x.lessonId !== p.lessonId), p];
    this.set({ progress });
    await this.persist(() => this.db!.putProgress(p));
  }

  async ensureProgress(lesson: Lesson): Promise<LessonProgress> {
    const a = this.active();
    if (!a) throw new Error('No active profile');
    const existing = this.progressFor(lesson.id);
    if (existing) return existing;
    const at = this.iso();
    const p: LessonProgress = {
      profileId: a.id,
      lessonId: lesson.id,
      contentVersion: lesson.contentVersion,
      stage: 'discover',
      itemIndex: 0,
      sessionId: newId('s-'),
      sessionNumber: 0,
      gameCompleted: false,
      gameSkipped: false,
      reflectionChoice: null,
      startedAt: at,
      updatedAt: at,
      completedAt: null,
      completions: 0,
    };
    analytics.track('lesson_started', { lessonId: lesson.id });
    await this.saveProgress(p);
    return p;
  }

  async moveTo(lessonId: string, stage: StageId, itemIndex = 0, extra: Partial<LessonProgress> = {}) {
    const p = this.progressFor(lessonId);
    if (!p) return;
    await this.saveProgress({ ...p, itemDone: false, ...extra, stage, itemIndex, updatedAt: this.iso() });
  }

  /** Replay from the start, or jump to a fresh assessment set. Never erases attempts. */
  async restart(lessonId: string, from: 'discover' | 'practice') {
    const p = this.progressFor(lessonId);
    if (!p) return;
    await this.saveProgress({
      ...p,
      stage: from,
      itemIndex: 0,
      sessionId: newId('s-'),
      sessionNumber: p.sessionNumber + 1,
      completedAt: null,
      gameCompleted: from === 'practice' ? p.gameCompleted : false,
      gameSkipped: from === 'practice' ? p.gameSkipped : false,
      reflectionChoice: null,
      itemDone: false,
      updatedAt: this.iso(),
    });
  }

  async recordAttempt(input: {
    lessonId: string;
    stage: Attempt['stage'];
    base: Item;
    shown: Item;
    sessionId: string;
    answer: string;
    correct: boolean;
    hintsUsed: number;
  }): Promise<Attempt> {
    const a = this.active();
    const lesson = lessonById(input.lessonId)!;
    const firstAttempt = !this.state.attempts.some(
      (x) => x.sessionId === input.sessionId && x.stage === input.stage && x.itemKey === input.shown.id,
    );
    const att: Attempt = {
      id: newId('a-'),
      profileId: a!.id,
      lessonId: input.lessonId,
      contentVersion: lesson.contentVersion,
      stage: input.stage,
      itemId: input.base.id,
      itemKey: input.shown.id,
      sessionId: input.sessionId,
      answer: input.answer.slice(0, 200),
      correct: input.correct,
      firstAttempt,
      hintsUsed: input.hintsUsed,
      timestamp: this.iso(),
    };
    this.set({ attempts: [...this.state.attempts, att] });
    analytics.track('assessment_submitted', { lessonId: input.lessonId, stage: input.stage, correct: input.correct });
    await this.persist(() => this.db!.addAttempt(att));
    return att;
  }

  private async award(sourceKey: string, delta: number, reason: RewardEvent['reason']): Promise<boolean> {
    const a = this.active();
    if (!a) return false;
    if (this.state.rewards.some((r) => r.sourceKey === sourceKey)) return false;
    const ev: RewardEvent = { profileId: a.id, sourceKey, delta, reason, timestamp: this.iso() };
    let added = true;
    try {
      added = await this.db!.addReward(ev);
    } catch {
      this.set({ saveError: true });
    }
    if (added) this.set({ rewards: [...this.state.rewards, ev] });
    return added;
  }

  /** Finish a lesson: record completion and award gems at most once per content version. */
  async completeLesson(lessonId: string): Promise<{ completionGems: number; masteryGems: number; mastered: boolean }> {
    const lesson = lessonById(lessonId)!;
    const p = this.progressFor(lessonId);
    if (!p) return { completionGems: 0, masteryGems: 0, mastered: false };
    await this.saveProgress({ ...p, stage: 'summary', itemIndex: 0, itemDone: false, completedAt: this.iso(), completions: p.completions + 1, updatedAt: this.iso() });
    const c = await this.award(completionKey(lesson.id, lesson.contentVersion), GEMS.lessonComplete, 'lesson-complete');
    const ev = lessonEvidence(lesson, this.state.attempts, this.progressFor(lessonId));
    let m = false;
    if (ev.state === 'mastered') m = await this.award(masteryKey(lesson.id, lesson.contentVersion), GEMS.mastery, 'mastery');
    analytics.track('lesson_completed', { lessonId, mastered: ev.state === 'mastered' });
    return { completionGems: c ? GEMS.lessonComplete : 0, masteryGems: m ? GEMS.mastery : 0, mastered: ev.state === 'mastered' };
  }

  async awardReview(lessonId: string, step: number): Promise<boolean> {
    analytics.track('review_completed', { lessonId, step });
    return this.award(reviewKey(lessonId, step), GEMS.review, 'review');
  }

  async purchase(itemId: string): Promise<ReturnType<typeof canPurchase>> {
    const a = this.active();
    if (!a) return 'unknown';
    const r = canPurchase(this.state.rewards, a.id, itemId);
    if (r !== 'ok') return r;
    const item = SHOP.find((s) => s.id === itemId)!;
    await this.award(purchaseKey(itemId), -item.cost, 'purchase');
    return 'ok';
  }

  async toggleEquip(itemId: string) {
    const a = this.active();
    if (!a) return;
    const item = SHOP.find((s) => s.id === itemId);
    if (!item) return;
    let equipped = a.equipped.includes(itemId) ? a.equipped.filter((x) => x !== itemId) : [...a.equipped, itemId];
    // Only one background at a time.
    if (item.kind === 'background' && !a.equipped.includes(itemId))
      equipped = equipped.filter((x) => x === itemId || SHOP.find((s) => s.id === x)?.kind !== 'background');
    await this.updateProfile(a.id, { equipped });
  }

  // ---------- Export / import ----------
  async exportJson(): Promise<string> {
    return JSON.stringify(await this.db!.exportAll(), null, 2);
  }

  async importJson(raw: string): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
    const parsed = parseExport(raw);
    if (!parsed.ok) return parsed;
    const b: ExportBundle = parsed.bundle;
    try {
      await this.db!.importAll(b);
    } catch {
      this.set({ saveError: true });
      return { ok: false, error: 'save-failed' };
    }
    const profiles = await this.db!.listProfiles();
    this.set({ profiles });
    if (this.state.activeId) await this.selectProfile(this.state.activeId);
    return { ok: true, count: b.profiles.length };
  }

  /** Records for any learner on this device (used by the Parent Zone). */
  async recordsFor(profileId: string): Promise<{ attempts: Attempt[]; progress: LessonProgress[] }> {
    if (profileId === this.state.activeId) return { attempts: this.state.attempts, progress: this.state.progress };
    try {
      const [attempts, progress] = await Promise.all([this.db!.listAttempts(profileId), this.db!.listProgress(profileId)]);
      return { attempts, progress };
    } catch {
      return { attempts: [], progress: [] };
    }
  }

  dismissSaveError() {
    this.set({ saveError: false });
  }

  lessonsCompleted(): number {
    return LESSONS.filter((l) => (this.progressFor(l.id)?.completions ?? 0) > 0).length;
  }
}

export const store = new AppStore();
