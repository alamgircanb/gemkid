// Cosmetic-only rewards. Every award uses a unique source key, so replaying a
// lesson can never earn the same gems twice.

import type { RewardEvent } from './types.ts';

export const GEMS = {
  lessonComplete: 10,
  mastery: 15,
  review: 5,
} as const;

export const completionKey = (lessonId: string, version: number) => `complete:${lessonId}:v${version}`;
export const masteryKey = (lessonId: string, version: number) => `mastery:${lessonId}:v${version}`;
export const reviewKey = (lessonId: string, step: number) => `review:${lessonId}:${step}`;
export const purchaseKey = (itemId: string) => `buy:${itemId}`;

/** Apply an award only if its source key has not been used. Returns the new list and whether it changed. */
export function applyReward(events: RewardEvent[], ev: RewardEvent): { events: RewardEvent[]; added: boolean } {
  if (events.some((e) => e.profileId === ev.profileId && e.sourceKey === ev.sourceKey)) return { events, added: false };
  return { events: [...events, ev], added: true };
}

export function balance(events: RewardEvent[]): number {
  return events.reduce((n, e) => n + e.delta, 0);
}

export function earned(events: RewardEvent[]): number {
  return events.filter((e) => e.delta > 0).reduce((n, e) => n + e.delta, 0);
}

export type RankId = 'explorer' | 'builder' | 'problem-solver' | 'creator';
export const RANKS: { id: RankId; min: number }[] = [
  { id: 'explorer', min: 0 },
  { id: 'builder', min: 50 },
  { id: 'problem-solver', min: 120 },
  { id: 'creator', min: 250 },
];

export function rankFor(earnedTotal: number): { rank: RankId; next: { id: RankId; min: number } | null } {
  let idx = 0;
  RANKS.forEach((r, i) => {
    if (earnedTotal >= r.min) idx = i;
  });
  return { rank: RANKS[idx].id, next: RANKS[idx + 1] ?? null };
}

export interface ShopItem {
  id: string;
  cost: number;
  kind: 'accessory' | 'background';
}

export const SHOP: ShopItem[] = [
  { id: 'hat-star', cost: 10, kind: 'accessory' },
  { id: 'scarf', cost: 15, kind: 'accessory' },
  { id: 'glasses', cost: 20, kind: 'accessory' },
  { id: 'crown', cost: 40, kind: 'accessory' },
  { id: 'bg-sunrise', cost: 15, kind: 'background' },
  { id: 'bg-ocean', cost: 25, kind: 'background' },
  { id: 'bg-forest', cost: 25, kind: 'background' },
];

export type PurchaseResult = 'ok' | 'already-owned' | 'not-enough' | 'unknown';

export function canPurchase(events: RewardEvent[], profileId: string, itemId: string): PurchaseResult {
  const item = SHOP.find((s) => s.id === itemId);
  if (!item) return 'unknown';
  if (events.some((e) => e.profileId === profileId && e.sourceKey === purchaseKey(itemId))) return 'already-owned';
  if (balance(events.filter((e) => e.profileId === profileId)) < item.cost) return 'not-enough';
  return 'ok';
}

export function owned(events: RewardEvent[]): string[] {
  return events.filter((e) => e.reason === 'purchase').map((e) => e.sourceKey.replace(/^buy:/, ''));
}
