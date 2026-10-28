// Store behaviour against the in-memory adapter: profile isolation (AC09),
// reward idempotency across replays (AC07), export/import (AC17), failed saves (AC08).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { AppStore } from '../../src/app/store.ts';
import { MemoryStore } from '../../src/services/memoryStore.ts';
import { lessonById } from '../../src/content/curriculum.ts';
import { itemForSession } from '../../src/domain/answers.ts';
import { balance } from '../../src/domain/rewards.ts';
import type { DataStore } from '../../src/services/storage.ts';

const eq = lessonById('math-g3-equal-groups-01')!;

async function playThrough(s: AppStore, allCorrect: boolean) {
  const p = await s.ensureProgress(eq);
  const cur = s.progressFor(eq.id) ?? p;
  for (const [stage, list] of [['practice', eq.practiceItems], ['challenge', eq.challenges]] as const) {
    for (const base of list) {
      const shown = itemForSession(base, cur.sessionNumber);
      await s.recordAttempt({ lessonId: eq.id, stage, base, shown, sessionId: cur.sessionId, answer: 'x', correct: allCorrect, hintsUsed: 0 });
    }
  }
  return s.completeLesson(eq.id);
}

async function fresh(db: DataStore = new MemoryStore()) {
  const s = new AppStore();
  let t = Date.parse('2026-11-01T10:00:00Z');
  s.now = () => new Date((t += 1000));
  await s.init(db);
  return s;
}

describe('store', () => {
  test('replaying a lesson never awards the same gems twice', async () => {
    const s = await fresh();
    await s.createProfile({ nickname: 'Ari', avatar: 'ruby', grade: 3 });
    const r1 = await playThrough(s, true);
    assert.deepEqual(r1, { completionGems: 10, masteryGems: 15, mastered: true });
    for (let i = 0; i < 3; i++) {
      await s.restart(eq.id, 'discover');
      const r = await playThrough(s, true);
      assert.equal(r.completionGems + r.masteryGems, 0);
    }
    assert.equal(balance(s.get().rewards), 25);
    assert.equal(s.get().attempts.length, 8 * 4, 'attempt history is preserved across replays');
  });

  test('profiles are isolated', async () => {
    const s = await fresh();
    const a = await s.createProfile({ nickname: 'A', avatar: 'ruby', grade: 3 });
    await playThrough(s, true);
    const b = await s.createProfile({ nickname: 'B', avatar: 'jade', grade: 5 });
    assert.equal(s.get().activeId, b.id);
    assert.equal(s.get().attempts.length, 0);
    assert.equal(s.get().rewards.length, 0);
    assert.equal(s.masteryOf(eq.id), 'not-started');
    await s.selectProfile(a.id);
    assert.equal(s.masteryOf(eq.id), 'mastered');
  });

  test('reset keeps history by default; mastery evidence survives', async () => {
    const s = await fresh();
    const a = await s.createProfile({ nickname: 'A', avatar: 'ruby', grade: 3 });
    await playThrough(s, true);
    await s.resetProgress(a.id, false);
    assert.equal(s.get().progress.length, 0);
    assert.equal(s.get().attempts.length, 8);
  });

  test('export → import restores a profile; malformed import is rejected', async () => {
    const s = await fresh();
    await s.createProfile({ nickname: 'Ari', avatar: 'ruby', grade: 3 });
    await playThrough(s, true);
    const json = await s.exportJson();
    const t = await fresh();
    assert.deepEqual(await t.importJson('{"format":"nope"}'), { ok: false, error: 'wrong-format' });
    assert.deepEqual(await t.importJson('not json'), { ok: false, error: 'not-json' });
    const bad = JSON.parse(json);
    bad.attempts[0].profileId = 'someone-else';
    assert.equal((await t.importJson(JSON.stringify(bad))).ok, false);
    assert.equal(t.get().profiles.length, 0, 'rejected import changes nothing');
    assert.deepEqual(await t.importJson(json), { ok: true, count: 1 });
    await t.selectProfile(t.get().profiles[0].id);
    assert.equal(t.masteryOf(eq.id), 'mastered');
    assert.equal(balance(t.get().rewards), 25);
  });

  test('a failing storage write shows a warning instead of claiming success', async () => {
    const db = new MemoryStore();
    db.putProgress = async () => {
      throw new Error('QuotaExceededError');
    };
    const s = await fresh(db);
    await s.createProfile({ nickname: 'A', avatar: 'ruby', grade: 3 });
    await s.ensureProgress(eq);
    assert.equal(s.get().saveError, true);
    assert.ok(s.progressFor(eq.id), 'session keeps working in memory');
  });

  test('purchases spend gems once', async () => {
    const s = await fresh();
    await s.createProfile({ nickname: 'A', avatar: 'ruby', grade: 3 });
    await playThrough(s, true);
    assert.equal(await s.purchase('hat-star'), 'ok');
    assert.equal(await s.purchase('hat-star'), 'already-owned');
    assert.equal(balance(s.get().rewards), 15);
    assert.equal(await s.purchase('crown'), 'not-enough');
  });
});
