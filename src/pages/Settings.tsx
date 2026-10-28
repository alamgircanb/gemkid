import { useState } from 'react';
import { useT } from '../i18n/useT.tsx';
import { useApp } from '../app/useApp.ts';
import { store } from '../app/store.ts';
import { LOCALES } from '../i18n/index.ts';
import { PageTitle, Notice } from '../components/common.tsx';
import type { LangTag, MotionPref, Preferences, ThemeMode } from '../domain/types.ts';
import type { MessageKey } from '../i18n/index.ts';

export function SettingsPage() {
  const { t, locale } = useT();
  const s = useApp();
  const profile = s.profiles.find((p) => p.id === s.activeId);
  const prefs = profile?.prefs ?? s.guestPrefs;
  const [nick, setNick] = useState(profile?.nickname ?? '');
  const [saved, setSaved] = useState('');
  const set = (patch: Partial<Preferences>) => {
    void store.setPrefs(patch);
    setSaved(t('settings.saved'));
  };

  return (
    <div className="stack" style={{ maxWidth: 720 }}>
      <PageTitle title={t('settings.title')}>{profile ? t('settings.for', { name: profile.nickname }) : t('settings.title')}</PageTitle>
      {!profile && <Notice kind="info">{t('settings.guest')}</Notice>}
      <p role="status" aria-live="polite" className="small" style={{ fontWeight: 800, minHeight: '1.4em' }}>
        {saved}
      </p>
      <div className="card stack">
        <div className="field">
          <label htmlFor="s-lang">{t('settings.language')}</label>
          <select id="s-lang" value={prefs.uiLocale} onChange={(e) => set({ uiLocale: e.target.value as LangTag })} style={{ maxWidth: 260 }}>
            {LOCALES.map((l) => (
              <option key={l.id} value={l.id} lang={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <span className="field-help">{t('settings.languageHelp')}</span>
          {locale !== 'en' && <span className="field-help">{t('settings.coverage', { lang: LOCALES.find((l) => l.id === locale)!.label })}</span>}
        </div>

        <fieldset>
          <legend>{t('settings.theme')}</legend>
          {(['auto', 'younger', 'older'] as ThemeMode[]).map((m) => (
            <div className="choice" key={m} style={{ marginBottom: '0.4rem' }}>
              <input type="radio" id={`th-${m}`} name="theme" checked={prefs.theme === m} onChange={() => set({ theme: m })} />
              <label htmlFor={`th-${m}`}>{t(`settings.theme.${m}` as MessageKey)}</label>
            </div>
          ))}
        </fieldset>

        <fieldset>
          <legend>{t('settings.motion')}</legend>
          {(['system', 'reduce', 'full'] as MotionPref[]).map((m) => (
            <div className="choice" key={m} style={{ marginBottom: '0.4rem' }}>
              <input type="radio" id={`mo-${m}`} name="motion" checked={prefs.motion === m} onChange={() => set({ motion: m })} />
              <label htmlFor={`mo-${m}`}>{t(`settings.motion.${m}` as MessageKey)}</label>
            </div>
          ))}
        </fieldset>

        <fieldset>
          <legend>{t('settings.text')}</legend>
          <div className="row">
            {([1, 1.15, 1.3] as const).map((v) => (
              <div className="choice" key={v}>
                <input type="radio" id={`ts-${v}`} name="textsize" checked={prefs.textScale === v} onChange={() => set({ textScale: v })} />
                <label htmlFor={`ts-${v}`}>{t(`settings.text.${v}` as MessageKey)}</label>
              </div>
            ))}
          </div>
        </fieldset>

        <div className="row">
          <input type="checkbox" id="s-contrast" checked={prefs.highContrast} onChange={(e) => set({ highContrast: e.target.checked })} style={{ width: 24, height: 24 }} />
          <label htmlFor="s-contrast">{t('settings.contrast')}</label>
        </div>

        <div>
          <div className="row">
            <input type="checkbox" id="s-sound" checked={prefs.sound} onChange={(e) => set({ sound: e.target.checked })} style={{ width: 24, height: 24 }} aria-describedby="s-sound-help" />
            <label htmlFor="s-sound">{t('settings.sound')}</label>
          </div>
          <p id="s-sound-help" className="field-help">
            {t('settings.soundHelp')}
          </p>
        </div>
      </div>

      {profile && (
        <form
          className="card stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (nick.trim()) {
              void store.updateProfile(profile.id, { nickname: nick.trim().slice(0, 24) });
              setSaved(t('settings.saved'));
            }
          }}
        >
          <h2>{t('settings.profile')}</h2>
          <div className="field">
            <label htmlFor="s-nick">{t('settings.nickname')}</label>
            <input id="s-nick" type="text" maxLength={24} value={nick} onChange={(e) => setNick(e.target.value)} style={{ maxWidth: 300 }} />
          </div>
          <div>
            <button type="submit" className="btn btn-secondary">
              {t('settings.save')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
