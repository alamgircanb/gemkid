import { useT } from '../i18n/useT.tsx';
import { useApp } from '../app/useApp.ts';
import { store } from '../app/store.ts';
import { Link, navigate } from '../app/router.tsx';
import { LESSONS, SUBJECTS, isPlayable, lessonById } from '../content/curriculum.ts';
import { recommendNext, lessonsInPathOrder } from '../domain/recommend.ts';
import { reviewStatus } from '../domain/review.ts';
import { lessonEvidence } from '../domain/mastery.ts';
import { balance } from '../domain/rewards.ts';
import { Lumi } from '../components/Art.tsx';
import { PageTitle, ProgressBar, SubjectIcon, useLevelLabel } from '../components/common.tsx';
import { GemCount } from '../features/games/OtherGames.tsx';
import type { MessageKey } from '../i18n/index.ts';
import type { StageId } from '../domain/types.ts';
import { StartPage } from './Start.tsx';

export function DashboardPage() {
  const { t } = useT();
  const s = useApp();
  const levelLabel = useLevelLabel();
  const profile = s.profiles.find((p) => p.id === s.activeId);
  if (!profile) return <StartPage />;

  const playable = LESSONS.filter(isPlayable);
  const rec = recommendNext({ lessons: LESSONS, isPlayable, progress: s.progress, masteryOf: store.masteryOf, placements: profile.placements });
  const recLesson = 'lessonId' in rec ? lessonById(rec.lessonId) : undefined;
  const done = playable.filter((l) => (s.progress.find((p) => p.lessonId === l.id)?.completions ?? 0) > 0).length;
  const masteredCount = playable.filter((l) => store.masteryOf(l.id) === 'mastered').length;
  const now = store.now();
  const due = playable
    .map((l) => reviewStatus(l.id, lessonEvidence(l, s.attempts, store.progressFor(l.id)).masteredAt, s.attempts, now))
    .filter((r) => r?.isDue);
  const dueLesson = due[0] ? lessonById(due[0].lessonId) : undefined;
  const hasProgress = s.progress.length > 0;

  const go = async () => {
    if (!recLesson) return;
    if (rec.kind === 'retry') await store.restart(recLesson.id, 'practice');
    navigate(`/lesson/${recLesson.id}`);
  };

  return (
    <div className="stack">
      <div className="row">
        <Lumi size={72} colour={profile.avatar} accessories={profile.equipped} />
        <div>
          <PageTitle title={t('nav.home')}>{t('dash.hello', { name: profile.nickname })}</PageTitle>
          <p className="muted" style={{ margin: 0 }}>
            {t('dash.grade', { n: profile.grade })}
          </p>
        </div>
        <span className="spacer" />
        <Link to="/gems" className="btn btn-ghost" aria-label={`${t('nav.gems')}: ${balance(s.rewards)}`}>
          <GemCount n={balance(s.rewards)} />
        </Link>
      </div>

      {recLesson ? (
        <section className="continue-card" aria-labelledby="continue-h">
          <div style={{ flex: 1, minWidth: 220 }}>
            <p className="eyebrow">{rec.kind === 'resume' ? t('dash.continue') : hasProgress ? t('path.next') : t('dash.startHere')}</p>
            <h2 id="continue-h">
              <span lang="en">{recLesson.title}</span>
            </h2>
            <p style={{ margin: 0 }}>
              {t(`subject.${recLesson.subjectId}` as MessageKey)} · {levelLabel(recLesson.level)}
              {rec.kind === 'resume' && <> · {t(`stage.${rec.stage as StageId}` as MessageKey)}</>}
            </p>
            <details>
              <summary>{t('dash.why')}</summary>
              <p lang="en" style={{ margin: 0 }}>
                {rec.reason}
              </p>
            </details>
          </div>
          <button type="button" className="btn btn-lg" onClick={() => void go()}>
            {rec.kind === 'resume' ? t('dash.continue') : rec.kind === 'retry' ? t('path.retry') : t('path.start')} →
          </button>
        </section>
      ) : (
        <section className="card">
          <p style={{ margin: 0, fontWeight: 800 }}>{rec.kind === 'path-complete' ? t('dash.allDone') : t('dash.empty')}</p>
        </section>
      )}

      <div className="card">
        <p style={{ margin: '0 0 0.4rem', fontWeight: 800 }}>
          {t('dash.progress', { done, total: playable.length })} · {t('dash.mastered', { n: masteredCount })}
        </p>
        <ProgressBar value={done} max={playable.length} label={t('dash.progress', { done, total: playable.length })} />
      </div>

      <section aria-labelledby="subjects-h">
        <h2 id="subjects-h">{t('dash.subjects')}</h2>
        <ul className="grid" style={{ listStyle: 'none', padding: 0 }}>
          {SUBJECTS.map((sub) => {
            const lvl = profile.placements[sub.id];
            const path = lvl ? lessonsInPathOrder(playable, sub.id, lvl) : [];
            const d = path.filter((l) => (s.progress.find((p) => p.lessonId === l.id)?.completions ?? 0) > 0).length;
            return (
              <li key={sub.id} className={`card card-accent subject-${sub.id}`}>
                <div className="row">
                  <SubjectIcon subject={sub.id} />
                  <div>
                    <h3 style={{ margin: 0 }}>{t(`subject.${sub.id}` as MessageKey)}</h3>
                    <span className="small muted">{lvl ? levelLabel(lvl) : ''}</span>
                  </div>
                </div>
                <p className="small" style={{ margin: '0.5rem 0' }}>
                  {t('dash.lessonsIn', { done: d, total: path.length })}
                </p>
                <ProgressBar value={d} max={Math.max(1, path.length)} label={`${t(`subject.${sub.id}` as MessageKey)}: ${t('dash.lessonsIn', { done: d, total: path.length })}`} />
                <Link to={`/path/${sub.id}`} className="btn btn-secondary btn-sm" style={{ marginTop: '0.6rem' }}>
                  {t('dash.openPath')}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card" aria-labelledby="review-h">
        <h2 id="review-h" style={{ fontSize: '1.1rem' }}>
          🔁 {t('dash.review')}
        </h2>
        {dueLesson ? (
          <div className="row">
            <p style={{ margin: 0, flex: 1 }}>{t('dash.reviewDue', { lesson: dueLesson.title })}</p>
            <Link to={`/review-session/${dueLesson.id}`} className="btn btn-secondary btn-sm">
              {t('review.start')}
            </Link>
          </div>
        ) : (
          <p className="muted" style={{ margin: 0 }}>
            {t('dash.reviewNone')}
          </p>
        )}
      </section>
    </div>
  );
}
