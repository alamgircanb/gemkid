import { useEffect } from 'react';
import { useT } from '../i18n/useT.tsx';
import { Link } from '../app/router.tsx';
import { useApp } from '../app/useApp.ts';
import { Lumi } from '../components/Art.tsx';
import { ItemView } from '../features/lesson/ItemView.tsx';
import { lessonById } from '../content/curriculum.ts';
import { STAGES, type TrackId } from '../domain/types.ts';
import type { MessageKey } from '../i18n/index.ts';
import { Notice } from '../components/common.tsx';

const TRACKS: { id: TrackId; icon: string; subject: string }[] = [
  { id: 'math', icon: '➗', subject: 'math' },
  { id: 'logic', icon: '🧩', subject: 'logic' },
  { id: 'coding', icon: '🤖', subject: 'coding' },
  { id: 'algorithms', icon: '🔎', subject: 'algorithms' },
  { id: 'english', icon: '📖', subject: 'english' },
  { id: 'languages', icon: 'অ', subject: 'french' },
];

export function HomePage() {
  const { t } = useT();
  const s = useApp();
  useEffect(() => {
    document.title = `GemKid · ${t('app.tagline')}`;
  }, [t]);
  const preview = lessonById('math-g3-equal-groups-01')!.guidedTasks[0];
  return (
    <div>
      <section className="hero">
        <div>
          <h1>{t('home.title')}</h1>
          <p className="lead">{t('home.lead')}</p>
          <div className="row">
            <Link to={s.activeId ? '/dashboard' : '/start'} className="btn btn-lg">
              {s.activeId ? t('home.continue') : t('home.try')} →
            </Link>
            <Link to="/explore" className="btn btn-lg btn-secondary">
              {t('home.explore')}
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <div className="float">
            <Lumi size={220} mood="cheer" title="Lumi, the GemKid mascot" />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="preview-h">
        <h2 id="preview-h">{t('home.previewTitle')}</h2>
        <p className="muted">{t('home.previewText')}</p>
        <div className="task" lang="en">
          <ItemView item={preview} mode="preview" seed="home" />
        </div>
      </section>

      <section className="section" aria-labelledby="tracks-h">
        <h2 id="tracks-h">{t('home.subjectsTitle')}</h2>
        <ul className="grid" style={{ listStyle: 'none', padding: 0 }}>
          {TRACKS.map((tr) => (
            <li key={tr.id} className={`card card-accent subject-${tr.id}`}>
              <div className="row">
                <span className="subject-icon" aria-hidden="true" lang={tr.id === 'languages' ? 'bn' : undefined}>
                  {tr.icon}
                </span>
                <h3 style={{ margin: 0 }}>{t(`track.${tr.id}` as MessageKey)}</h3>
              </div>
              <p className="muted" style={{ marginTop: '0.5rem' }}>
                {t(`track.${tr.id}.text` as MessageKey)}
              </p>
              <Link to={`/explore?subject=${tr.id === 'languages' ? 'languages' : tr.subject}`}>
                {t('home.explore')}
                <span className="sr-only">: {t(`track.${tr.id}` as MessageKey)}</span> →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="loop-h">
        <h2 id="loop-h">{t('home.loopTitle')}</h2>
        <p className="muted">{t('home.loopText')}</p>
        <ol className="loop">
          {STAGES.filter((x) => x !== 'summary').map((st) => (
            <li key={st}>
              <strong style={{ display: 'block' }}>{t(`stage.${st}` as MessageKey)}</strong>
              <span className="small muted">{t(`stage.${st}.text` as MessageKey)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="section grid-2" aria-labelledby="ages-h">
        <h2 id="ages-h" className="sr-only">
          {t('home.agesTitle')}
        </h2>
        <div className="card">
          <div className="row">
            <Lumi size={56} colour="topaz" />
            <h3 style={{ margin: 0 }}>{t('home.agesYoung')}</h3>
          </div>
          <p>{t('home.agesYoungText')}</p>
        </div>
        <div className="card">
          <div className="row">
            <span className="subject-icon subject-coding" aria-hidden="true">
              {'</>'}
            </span>
            <h3 style={{ margin: 0 }}>{t('home.agesOld')}</h3>
          </div>
          <p>{t('home.agesOldText')}</p>
        </div>
      </section>

      <section className="section card" aria-labelledby="parents-h">
        <h2 id="parents-h">{t('home.parentsTitle')}</h2>
        <p>{t('home.parentsText')}</p>
        <Link to="/parent" className="btn btn-secondary">
          {t('home.parentsCta')}
        </Link>
      </section>

      <div className="section">
        <Notice>{t('home.honest')}</Notice>
      </div>
    </div>
  );
}
