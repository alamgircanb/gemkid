import { test } from 'node:test';
import assert from 'node:assert/strict';
import { translate, missingKeys } from '../../src/i18n/index.ts';
import { en } from '../../src/i18n/en.ts';

test('French and Bengali dictionaries cover every interface key', () => {
  assert.deepEqual(missingKeys('fr'), []);
  assert.deepEqual(missingKeys('bn'), []);
});

test('placeholders survive translation', () => {
  for (const loc of ['fr', 'bn'] as const)
    for (const [k, v] of Object.entries(en)) {
      const want = (v.match(/\{\w+\}/g) ?? []).sort().join();
      const got = (translate(loc, k as keyof typeof en).text.match(/\{\w+\}/g) ?? []).sort().join();
      assert.equal(got, want, `${loc} ${k}`);
    }
});

test('Bengali numbers use Bengali digits; fallback is labelled', () => {
  assert.equal(translate('bn', 'level.grade', { n: 3 }).text, 'শ্রেণি ৩');
  const r = translate('fr', 'nav.home');
  assert.equal(r.fallback, false);
});
