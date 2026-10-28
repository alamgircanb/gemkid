import { useState } from 'react';
import { useT } from '../i18n/useT.tsx';
import { useApp } from '../app/useApp.ts';
import { store } from '../app/store.ts';
import { Link, navigate } from '../app/router.tsx';
import { CHAPTERS, LESSONS, SUBJECTS, isPlayable, levelsFor, lessonsInChapter, skillById, lessonById } from '../content/curriculum.ts';
import { recommendNext, sameLevel, levelKey } from '../domain/recommend.ts';
import { reviewStatus } from '../domain/review.ts';
import { lessonEvidence } from '../domain/mastery.ts';
import { MasteryTag, Notice, PageTitle, StatusTag, SubjectIcon, useLevelLabel } from '../components/common.tsx';
import type { Lesson, Level, SubjectId } from '../domain/types.ts';
import type { MessageKey } from '../i18n/index.ts';
import { readLocal, writeLocal } from '../services/safeLocal.ts';
import { StartPage } from './Start.tsx';

export function PathPage({ subjectId }: { subjectId?: string }) {
  const { t } = useT();
  const s = useApp();
  const levelLabel = useLevelLabel();
  const profile = s.profiles.find((p) => p.id === s.activeId);
  const subject = SUBJECTS.find((x) => x.id === subjectId);
  const placement = subject && profile ? profile.placements[subject.id] : undefined;
  const [shownLevel, setShownLevel] = useState<Level | undefined>(placement);
  const [view, setView] = useState<'list' | 'map'>(() => (readLocal('kidgem.pathView') === 'map' ? 'map' : 'list'));

  if (!profile) return <StartPage />;
  if (!subject)
    return (
      <div className="stack">
        <h1>{t('notfound.title')}</h1>
        <Link to="/explore">{t('nav.explore')}</Link>
      </div>
    );

  const sid = subject.id as SubjectId;
  const level = shownLevel ?? placement ?? levelsFor(sid)[0];
  const chapters = CHAPTERS.filter((c) => c.subjectId === sid && sameLevel(c.level, level)).sort((a, b) => (a.availability === b.availability ? a.order - b.order : a.availability === 'available' ? -1 : 1));
  const levelLessons = LESSONS.filter((l) => l.subjectId === sid && sameLevel(l.level, level) && isPlayable(l)).sort((a, b) => a.order - b.order);
  const rec = recommendNext({ lessons: LESSONS, isPlayable, progress: s.progress, masteryOf: store.masteryOf, placements: { ...profile.placements, [sid]: level }, subjectId: sid });
  const recId = 'lessonId' in rec ? rec.lessonId : null;
  const recLesson = recId ? lessonById(recId) : undefined;
  const now = store.now();
  const subjectName = t(`subject.${sid}` as MessageKey);

  const setV = (v: 'list' | 'map') => {
    setView(v);
    writeLocal('kidgem.pathView', v);
  };

  const lessonState = (l: Lesson) => {
    const m = store.masteryOf(l.id);
    const p = s.progress.find((x) => x.lessonId === l.id);
    const ev = lessonEvidence(l, s.attempts, p);
    const rv = reviewStatus(l.id, ev.masteredAt, s.attempts, now);
    const inProgress = p && !p.completedAt && !(p.stage === 'discover' && p.itemIndex === 0 && p.completions === 0) ? true : false;
    const unmet = l.prerequisiteSkillIds.filter((sk) => {
      const teacher = LESSONS.find((x) => x.skillIds.includes(sk) && isPlayable(x));
      return teacher && store.masteryOf(teacher.id) !== 'mastered';
    });
    return { m, p, rv, inProgress, unmet };
  };

  const go = async (l: Lesson, kind: 'start' | 'retry' | 'replay') => {
    if (kind === 'retry') await store.restart(l.id, 'practice');
    if (kind === 'replay') await store.restart(l.id, 'discover');
    navigate(`/lesson/${l.id}`);
  };

  return (
    <div className={`stack subject-${sid}`}>
      <div className="page-head">
        <SubjectIcon subject={sid} />
        <PageTitle title={t('path.title', { subject: subjectName })}>{t('path.title', { subject: subjectName })}</PageTitle>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="level">{t('path.level')}</label>
          <select id="level" value={levelKey(level)} onChange={(e) => setShownLevel(levelsFor(sid).find((l) => levelKey(l) === e.target.value))}>
            {levelsFor(sid).map((l) => (
              <option key={levelKey(l)} value={levelKey(l)}>
                {levelLabel(l)}
              </option>
            ))}
          </select>
        </div>
        {placement && <p className="small muted" style={{ margin: '1.6rem 0 0' }}>{t('path.placement', { level: levelLabel(placement) })}</p>}
        <span className="spacer" />
        <div role="group" aria-label={t('path.view')} className="segmented">
          <button type="button" aria-pressed={view === 'list'} onClick={() => setV('list')}>
            ☰ {t('path.listView')}
          </button>
          <button type="button" aria-pressed={view === 'map'} onClick={() => setV('map')}>
            🗺 {t('path.mapView')}
          </button>
        </div>
      </div>

      {recLesson && recLesson.subjectId === sid ? (
        <section className="card" aria-labelledby="next-h" style={{ borderColor: 'var(--primary)', borderWidth: 2 }}>
          <h2 id="next-h" style={{ fontSize: '1.1rem' }}>
            ⭐ {t('path.next')}
          </h2>
          <div className="row">
            <strong lang="en" style={{ flex: 1 }}>
              {recLesson.title}
            </strong>
            <button type="button" className="btn" onClick={() => void go(recLesson, rec.kind === 'retry' ? 'retry' : 'start')}>
              {rec.kind === 'resume' ? t('path.resume') : rec.kind === 'retry' ? t('path.retry') : t('path.start')} →
            </button>
          </div>
          <details>
            <summary>{t('path.why')}</summary>
            <p lang="en">{rec.reason}</p>
          </details>
        </section>
      ) : levelLessons.length ? (
        <Notice kind="info">{t('path.complete')}</Notice>
      ) : (
        <Notice kind="info">{t('path.noLessons')}</Notice>
      )}

      {view === 'map' && levelLessons.length > 0 && <PathMap lessons={levelLessons} recId={recId} />}

      {chapters.map((c, ci) => {
        const lessons = lessonsInChapter(c.id).filter(isPlayable);
        return (
          <section key={c.id} className="card card-accent" aria-labelledby={`ch-${c.id}`}>
            <div className="row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="small muted" style={{ margin: 0 }}>
                  {t('path.chapter', { n: ci + 1 })} · {c.availability === 'available' ? t('path.lessons', { n: lessons.length }) : ''}
                </p>
                <h2 id={`ch-${c.id}`} style={{ margin: 0 }} lang="en">
                  {c.title}
                </h2>
                {c.usefulSkill && (
                  <p className="muted" style={{ margin: '0.2rem 0 0' }} lang="en">
                    {c.usefulSkill}
                  </p>
                )}
              </div>
              <StatusTag status={c.availability === 'planned' ? 'planned' : 'draft'} />
            </div>
            {c.availability === 'planned' ? (
              <>
                <p className="small" style={{ fontWeight: 800, marginBottom: 0 }}>
                  {t('path.plannedTopics')}:
                </p>
                <ul lang="en" className="small">
                  {c.plannedTopics?.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <ol className="path-list">
                  {lessons.map((l, i) => {
                    const st = lessonState(l);
                    const isRec = l.id === recId;
                    const prereqNames = l.prerequisiteSkillIds.map((sk) => {
                      const taught = LESSONS.some((x) => x.skillIds.includes(sk) && isPlayable(x));
                      return `${skillById(sk)?.title ?? sk}${taught ? '' : ` ${t('path.prereqAssumed')}`}`;
                    });
                    return (
                      <li key={l.id} className={`lesson-row${isRec ? ' is-current' : ''}`}>
                        <span className="state-icon" aria-hidden="true">
                          {st.m === 'mastered' ? '★' : st.inProgress ? '◐' : i + 1}
                        </span>
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <Link to={`/lesson/${l.id}`} lang="en" style={{ fontWeight: 800 }}>
                            {l.title}
                          </Link>
                          <div className="row" style={{ gap: '0.35rem', marginTop: '0.2rem' }}>
                            {isRec && <span className="tag tag-current">➜ {t('mastery.current')}</span>}
                            {st.inProgress ? <span className="tag tag-learning">◐ {t('mastery.inProgress')}</span> : <MasteryTag state={st.m} />}
                            {st.rv?.isDue && <span className="tag tag-review">🔁 {t('review.due')}</span>}
                          </div>
                          {prereqNames.length > 0 && (
                            <p className="small muted" style={{ margin: '0.2rem 0 0' }}>
                              {t('path.prereq', { skills: prereqNames.join(', ') })}
                            </p>
                          )}
                          {st.unmet.length > 0 && st.m !== 'mastered' && (
                            <p className="small" style={{ margin: '0.2rem 0 0', fontWeight: 700 }}>
                              ⓘ {t('path.suggestPrereq', { lesson: LESSONS.find((x) => x.skillIds.includes(st.unmet[0]))?.title ?? '' })}
                            </p>
                          )}
                        </div>
                        <div className="row">
                          {st.inProgress ? (
                            <button type="button" className="btn btn-sm" onClick={() => void go(l, 'start')}>
                              {t('path.resume')}
                            </button>
                          ) : st.p && st.p.completions > 0 ? (
                            <>
                              {st.m !== 'mastered' && (
                                <button type="button" className="btn btn-sm" onClick={() => void go(l, 'retry')}>
                                  {t('path.retry')}
                                </button>
                              )}
                              <button type="button" className="btn btn-sm btn-ghost" onClick={() => void go(l, 'replay')}>
                                {t('path.replay')}
                              </button>
                            </>
                          ) : (
                            <button type="button" className={`btn btn-sm${isRec ? '' : ' btn-secondary'}`} onClick={() => void go(l, 'start')}>
                              {t('path.start')}
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <Link to={`/chapter/${c.id}`} className="small">
                  {t('path.openChapter')} →
                </Link>
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}

/** Optional illustrated map. Every node is a link to the same lesson listed above. */
function PathMap({ lessons, recId }: { lessons: Lesson[]; recId: string | null }) {
  const { t } = useT();
  const w = 640;
  const h = 70 + lessons.length * 0 + 150;
  const pts = lessons.map((_, i) => ({ x: 70 + (i * (w - 140)) / Math.max(1, lessons.length - 1), y: i % 2 ? 70 : 150 }));
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
  return (
    <figure style={{ margin: 0 }}>
      <svg className="path-map" viewBox={`0 0 ${w} ${h}`} role="group" aria-label={t('path.mapLabel')}>
        <path d={d} stroke="#c7d2fe" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} stroke="#6366f1" strokeWidth="3" strokeDasharray="6 8" fill="none" />
        {lessons.map((l, i) => {
          const m = store.masteryOf(l.id);
          const p = pts[i];
          return (
            <a key={l.id} href={`#/lesson/${l.id}`} aria-label={`${i + 1}. ${l.title}: ${t(`mastery.${m}` as MessageKey)}${l.id === recId ? `, ${t('mastery.current')}` : ''}`}>
              <circle cx={p.x} cy={p.y} r={l.id === recId ? 30 : 24} fill={m === 'mastered' ? '#166534' : l.id === recId ? '#4f46e5' : '#ffffff'} stroke="#4f46e5" strokeWidth="3" />
              <text x={p.x} y={p.y + 6} textAnchor="middle" fontSize="18" fontWeight="900" fill={m === 'mastered' || l.id === recId ? '#fff' : '#312e81'}>
                {m === 'mastered' ? '★' : i + 1}
              </text>
              <text x={p.x} y={p.y + (i % 2 ? -40 : 50)} textAnchor="middle" fontSize="13" fontWeight="700" fill="#20243a">
                {l.title.length > 26 ? l.title.slice(0, 24) + '…' : l.title}
              </text>
            </a>
          );
        })}
      </svg>
    </figure>
  );
}
