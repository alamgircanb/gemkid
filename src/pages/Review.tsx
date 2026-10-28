import { useMemo, useState } from 'react';
import { useT } from '../i18n/useT.tsx';
import { useApp } from '../app/useApp.ts';
import { store } from '../app/store.ts';
import { Link } from '../app/router.tsx';
import { LESSONS, isPlayable, lessonById } from '../content/curriculum.ts';
import { lessonEvidence } from '../domain/mastery.ts';
import { reviewStatus, REVIEW_PASS, REVIEW_SET_SIZE } from '../domain/review.ts';
import { itemForSession } from '../domain/answers.ts';
import { newId } from '../domain/rng.ts';
import { ItemView } from '../features/lesson/ItemView.tsx';
import { Notice, PageTitle } from '../components/common.tsx';
import { StartPage } from './Start.tsx';

const SETS = [
  [0, 2, 4],
  [1, 3, 5],
  [0, 3, 5],
];

export function ReviewPage() {
  const { t, date } = useT();
  const s = useApp();
  if (!s.activeId) return <StartPage />;
  const now = store.now();
  const rows = LESSONS.filter(isPlayable)
    .map((l) => ({ l, r: reviewStatus(l.id, lessonEvidence(l, s.attempts, store.progressFor(l.id)).masteredAt, s.attempts, now) }))
    .filter((x) => x.r);
  const due = rows.filter((x) => x.r!.isDue);
  const upcoming = rows.filter((x) => !x.r!.isDue);
  return (
    <div className="stack">
      <PageTitle title={t('review.title')}>🔁 {t('review.title')}</PageTitle>
      <p className="muted">{t('review.lead')}</p>
      {rows.length === 0 && <Notice kind="info">{t('review.none')}</Notice>}
      {due.length > 0 && (
        <section className="card">
          <h2>{t('review.due')}</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {due.map(({ l, r }) => (
              <li key={l.id} className="lesson-row">
                <div style={{ flex: 1 }}>
                  <strong lang="en">{l.title}</strong>
                  <p className="small muted" style={{ margin: 0 }}>
                    {t('review.stepOf', { n: r!.stepsDone + 1 })}
                  </p>
                </div>
                <Link to={`/review-session/${l.id}`} className="btn btn-sm">
                  {t('review.start')}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {upcoming.length > 0 && (
        <section className="card">
          <h2>{t('review.upcoming')}</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {upcoming.map(({ l, r }) => (
              <li key={l.id} className="lesson-row">
                <strong lang="en" style={{ flex: 1 }}>
                  {l.title}
                </strong>
                <span className="small muted">{r!.dueAt ? t('review.dueOn', { date: date(r!.dueAt) }) : `★ ${t('review.allDone')}`}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export function ReviewSessionPage({ lessonId }: { lessonId?: string }) {
  const { t } = useT();
  const s = useApp();
  const lesson = lessonId ? lessonById(lessonId) : undefined;
  const [sessionId] = useState(() => newId('r-'));
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState<{ passed: boolean; n: number } | null>(null);
  const status = lesson ? reviewStatus(lesson.id, lessonEvidence(lesson, s.attempts, store.progressFor(lesson.id)).masteredAt, s.attempts, store.now()) : null;
  const [step] = useState(() => status?.stepsDone ?? 0);
  const items = useMemo(() => (lesson ? SETS[Math.min(step, 2)].map((i) => ({ base: lesson.practiceItems[i], shown: itemForSession(lesson.practiceItems[i], step + 1) })) : []), [lesson, step]);

  if (!s.activeId) return <StartPage />;
  if (!lesson || !status)
    return (
      <div className="stack">
        <h1>{t('review.title')}</h1>
        <Notice kind="info">{t('review.none')}</Notice>
        <Link to="/review">{t('common.back')}</Link>
      </div>
    );
  if (!status.isDue && !result)
    return (
      <div className="stack">
        <h1 lang="en">{lesson.title}</h1>
        <Notice kind="info">{status.dueAt ? t('review.notDue') : t('review.allDone')}</Notice>
        <Link to="/review">{t('common.back')}</Link>
      </div>
    );

  const finish = async () => {
    const mine = store.get().attempts.filter((a) => a.sessionId === sessionId);
    const firsts = new Map<string, (typeof mine)[number]>();
    for (const a of mine) if (!firsts.has(a.itemKey)) firsts.set(a.itemKey, a);
    const n = [...firsts.values()].filter((a) => a.correct && a.hintsUsed === 0).length;
    const passed = n >= REVIEW_PASS;
    if (passed) await store.awardReview(lesson.id, step);
    setResult({ passed, n });
  };

  return (
    <div className={`stack task subject-${lesson.subjectId}`}>
      <h1>
        🔁 {t('review.title')}: <span lang="en">{lesson.title}</span>
      </h1>
      <p className="muted">{t('review.stepOf', { n: step + 1 })}</p>
      {result ? (
        <section className="task-card stack">
          <h2>{result.passed ? `★ ${t('review.passed')}` : t('review.failed')}</h2>
          <p>{t('review.result', { n: result.n, total: REVIEW_SET_SIZE })}</p>
          <div className="row">
            <Link to="/review" className="btn">
              {t('review.title')}
            </Link>
            {!result.passed && (
              <Link to={`/lesson/${lesson.id}`} className="btn btn-secondary">
                {t('lesson.goBackDiscover')}
              </Link>
            )}
            <Link to="/dashboard" className="btn btn-ghost">
              {t('summary.dashboard')}
            </Link>
          </div>
        </section>
      ) : (
        <div lang="en">
          <ItemView
            key={idx}
            item={items[idx].shown}
            mode="assess"
            seed={sessionId}
            position={{ n: idx + 1, total: items.length }}
            onSubmit={(info) =>
              void store.recordAttempt({ lessonId: lesson.id, stage: 'review', base: items[idx].base, shown: items[idx].shown, sessionId, answer: info.answer, correct: info.correct, hintsUsed: info.hintsUsed })
            }
            onNext={() => (idx + 1 < items.length ? setIdx(idx + 1) : void finish())}
            nextLabel={idx + 1 < items.length ? t('lesson.next') : t('lesson.finish')}
          />
        </div>
      )}
    </div>
  );
}
