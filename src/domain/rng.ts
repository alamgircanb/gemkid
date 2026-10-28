// Deterministic pseudo-random helpers (mulberry32). Used for option shuffling and
// variant selection so that tests are repeatable.

export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const rand = mulberry32(hashString(seed));
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function newId(prefix = ''): string {
  const c = globalThis.crypto;
  if (c && 'randomUUID' in c) return prefix + c.randomUUID();
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/** Shuffle for presentation, guaranteeing the result differs from the input order when possible. */
export function scramble<T>(items: readonly T[], seed: string): T[] {
  const out = seededShuffle(items, seed);
  if (items.length > 1 && out.every((x, i) => x === items[i])) out.push(out.shift()!);
  return out;
}
