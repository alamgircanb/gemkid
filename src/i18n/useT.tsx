import { useCallback } from 'react';
import { useApp } from '../app/useApp.ts';
import { store } from '../app/store.ts';
import { translate, formatDate, type MessageKey, type Params } from './index.ts';
import type { LangTag } from '../domain/types.ts';

export function useLocale(): LangTag {
  const s = useApp();
  const a = s.profiles.find((p) => p.id === s.activeId);
  return a?.prefs.uiLocale ?? s.guestPrefs.uiLocale;
}

export function useT() {
  const locale = useLocale();
  const t = useCallback((key: MessageKey, params?: Params) => translate(locale, key, params).text, [locale]);
  const date = useCallback((iso: string) => formatDate(locale, iso), [locale]);
  return { t, locale, date };
}

/** Renders a message and marks an English fallback with lang="en" so it is announced correctly. */
export function T({ k, p }: { k: MessageKey; p?: Params }) {
  const locale = useLocale();
  const r = translate(locale, k, p);
  return r.fallback ? <span lang="en">{r.text}</span> : <>{r.text}</>;
}

export function prefs() {
  return store.prefs();
}
