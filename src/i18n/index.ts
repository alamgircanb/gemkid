import { en, type MessageKey } from './en.ts';
import { fr } from './fr.ts';
import { bn } from './bn.ts';
import type { LangTag } from '../domain/types.ts';

export type { MessageKey };
export const DICTS: Record<LangTag, Partial<Record<MessageKey, string>>> = { en, fr, bn };
export const LOCALES: { id: LangTag; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'Français' },
  { id: 'bn', label: 'বাংলা' },
];

const NUMBER_LOCALE: Record<LangTag, string> = { en: 'en-CA', fr: 'fr-CA', bn: 'bn-BD' };

export type Params = Record<string, string | number>;

export interface Translated {
  text: string;
  /** The language the text is actually in (differs from the locale when falling back). */
  lang: LangTag;
  fallback: boolean;
}

export function translate(locale: LangTag, key: MessageKey, params?: Params): Translated {
  const own = DICTS[locale][key];
  const raw = own ?? en[key] ?? key;
  const lang: LangTag = own !== undefined ? locale : 'en';
  const fmt = new Intl.NumberFormat(NUMBER_LOCALE[lang]);
  const text = params
    ? raw.replace(/\{(\w+)\}/g, (_, k: string) => {
        const v = params[k];
        if (v === undefined) return `{${k}}`;
        return typeof v === 'number' ? fmt.format(v) : v;
      })
    : raw;
  return { text, lang, fallback: own === undefined && locale !== 'en' };
}

export function missingKeys(locale: LangTag): MessageKey[] {
  return (Object.keys(en) as MessageKey[]).filter((k) => DICTS[locale][k] === undefined);
}

export function formatDate(locale: LangTag, iso: string): string {
  try {
    return new Intl.DateTimeFormat(NUMBER_LOCALE[locale], { dateStyle: 'medium' }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}
