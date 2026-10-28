import type { DataStore, ExportBundle } from './storage.ts';
import type { Attempt, LessonProgress, Profile, RewardEvent } from '../domain/types.ts';

/** Session-only store: used when IndexedDB is blocked, and in unit tests. */
export class MemoryStore implements DataStore {
  mode = 'memory' as const;
  fallbackReason: string | null;
  private profiles = new Map<string, Profile>();
  private progress = new Map<string, LessonProgress>();
  private attempts: Attempt[] = [];
  private rewards: RewardEvent[] = [];

  constructor(reason: string | null = null) {
    this.fallbackReason = reason;
  }
  async listProfiles() {
    return [...this.profiles.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  async putProfile(p: Profile) {
    this.profiles.set(p.id, structuredClone(p));
  }
  async deleteProfile(id: string) {
    this.profiles.delete(id);
    await this.resetProgress(id, true);
    this.rewards = this.rewards.filter((r) => r.profileId !== id);
  }
  async listProgress(profileId: string) {
    return [...this.progress.values()].filter((p) => p.profileId === profileId).map((p) => structuredClone(p));
  }
  async putProgress(p: LessonProgress) {
    this.progress.set(`${p.profileId}|${p.lessonId}`, structuredClone(p));
  }
  async addAttempt(a: Attempt) {
    this.attempts.push(structuredClone(a));
  }
  async listAttempts(profileId: string) {
    return this.attempts.filter((a) => a.profileId === profileId).map((a) => structuredClone(a));
  }
  async addReward(r: RewardEvent) {
    if (this.rewards.some((x) => x.profileId === r.profileId && x.sourceKey === r.sourceKey)) return false;
    this.rewards.push(structuredClone(r));
    return true;
  }
  async listRewards(profileId: string) {
    return this.rewards.filter((r) => r.profileId === profileId).map((r) => structuredClone(r));
  }
  async resetProgress(profileId: string, includeHistory: boolean) {
    for (const k of [...this.progress.keys()]) if (k.startsWith(profileId + '|')) this.progress.delete(k);
    if (includeHistory) this.attempts = this.attempts.filter((a) => a.profileId !== profileId);
  }
  async exportAll(): Promise<ExportBundle> {
    return {
      format: 'gemkid-export',
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      profiles: await this.listProfiles(),
      progress: [...this.progress.values()],
      attempts: [...this.attempts],
      rewards: [...this.rewards],
    };
  }
  async importAll(b: ExportBundle) {
    for (const p of b.profiles) await this.putProfile(p);
    for (const p of b.progress) await this.putProgress(p);
    const seen = new Set(this.attempts.map((a) => a.id));
    for (const a of b.attempts) if (!seen.has(a.id)) this.attempts.push(a);
    for (const r of b.rewards) await this.addReward(r);
  }
}
