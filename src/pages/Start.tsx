import { useState, type FormEvent } from 'react';
import { useT } from '../i18n/useT.tsx';
import { useApp } from '../app/useApp.ts';
import { store } from '../app/store.ts';
import { navigate, useRoute } from '../app/router.tsx';
import { Avatar, Lumi } from '../components/Art.tsx';
import { Notice, PageTitle } from '../components/common.tsx';
import type { AvatarId } from '../domain/types.ts';
import type { MessageKey } from '../i18n/index.ts';

const AVATARS: AvatarId[] = ['lumi', 'ruby', 'jade', 'topaz', 'sapphire', 'amethyst'];

export function StartPage() {
  const { t } = useT();
  const s = useApp();
  const route = useRoute();
  const next = route.query.get('next');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState<AvatarId>('lumi');
  const [grade, setGrade] = useState(3);
  const [error, setError] = useState('');

  const go = () => navigate(next && next.startsWith('/') ? next : '/dashboard');

  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError(t('start.nicknameRequired'));
      document.getElementById('nickname')?.focus();
      return;
    }
    await store.createProfile({ nickname, avatar, grade });
    go();
  };

  return (
    <div className="stack">
      <PageTitle title={t('start.title')}>{t('start.title')}</PageTitle>
      <p className="muted">{t('start.lead')}</p>
      <Notice kind="info">{t('storage.deviceOnly')}</Notice>

      {s.profiles.length > 0 && (
        <section aria-labelledby="existing-h">
          <h2 id="existing-h">{t('start.existing')}</h2>
          <ul className="grid" style={{ listStyle: 'none', padding: 0 }}>
            {s.profiles.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="card row"
                  style={{ width: '100%', cursor: 'pointer', font: 'inherit', textAlign: 'left', borderColor: p.id === s.activeId ? 'var(--primary)' : undefined }}
                  onClick={async () => {
                    await store.selectProfile(p.id);
                    go();
                  }}
                >
                  <Avatar id={p.avatar} size={52} />
                  <span>
                    <strong style={{ display: 'block' }}>{p.nickname}</strong>
                    <span className="small muted">{t('dash.grade', { n: p.grade })}</span>
                  </span>
                  <span className="sr-only">{t('start.continueAs', { name: p.nickname })}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card" aria-labelledby="new-h">
        <div className="row">
          <Lumi size={64} colour={avatar} />
          <h2 id="new-h" style={{ margin: 0 }}>
            {t('start.new')}
          </h2>
        </div>
        <form onSubmit={create} className="stack" noValidate>
          <div className="field">
            <label htmlFor="nickname">{t('start.nickname')}</label>
            <input
              id="nickname"
              type="text"
              maxLength={24}
              autoComplete="off"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              aria-describedby="nickname-help nickname-err"
              aria-invalid={!!error}
            />
            <span id="nickname-help" className="field-help">
              {t('start.nicknameHelp')}
            </span>
            <span id="nickname-err" className="error-text" role="alert">
              {error}
            </span>
          </div>
          <fieldset>
            <legend>{t('start.avatar')}</legend>
            <div className="row">
              {AVATARS.map((a) => (
                <div className="choice" key={a}>
                  <input type="radio" id={`av-${a}`} name="avatar" checked={avatar === a} onChange={() => setAvatar(a)} />
                  <label htmlFor={`av-${a}`}>
                    <Lumi size={34} colour={a} />
                    {t(`avatar.${a}` as MessageKey)}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="grade">{t('start.grade')}</label>
            <select id="grade" value={grade} onChange={(e) => setGrade(Number(e.target.value))} style={{ maxWidth: 220 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                <option key={g} value={g}>
                  {t('level.grade', { n: g })}
                </option>
              ))}
            </select>
          </div>
          <p className="small muted">{t('start.placementNote')}</p>
          <div>
            <button type="submit" className="btn btn-lg">
              {t('start.create')} →
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
