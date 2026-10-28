import { useMemo } from 'react';
import { useT } from '../i18n/useT.tsx';
import { Link, navigate, useRoute } from '../app/router.tsx';
import { CHAPTERS, SUBJECTS, lessonsInChapter, isPlayable } from '../content/curriculum.ts';
import type { MessageKey } from '../i18n/index.ts';
import type { SubjectId } from '../domain/types.ts';
import { PageTitle, StatusTag, SubjectIcon, useLevelLabel, MasteryTag } from '../components/common.tsx';
import { store } from '../app/store.ts';
import { useApp } from '../app/useApp.ts';

export function ExplorePage() {
  const { t } = useT();
  const route = useRoute();
  const levelLabel = useLevelLabel();
  const s = useApp();
  const q = route.query;
  const subject = q.get('subject') ?? 'any';
  const grade = q.get('grade') ?? 'any';
  const avail = q.get('avail') ?? 'any';

  const set = (k: string, v: string) => {
    const n = new URLSearchParams(q);
    if (v === 'any') n.delete(k);
    else n.set(k, v);
    const qs = n.toString();
    navigate(`/explore${qs ? `?${qs}` : ''}`);
  };

  const chapters = useMemo(
    () =>
      CHAPTERS.filter((c) => {
        if (subject === 'languages' ? !['french', 'bengali'].includes(c.subjectId) : subject !== 'any' && c.subjectId !== subject) return false;
        if (grade !== 'any' && 'grade' in c.level && c.level.grade !== Number(grade)) return false;
        if (avail === 'playable' && c.availability !== 'available') return false;
        if (avail === 'planned' && c.availability !== 'planned') return false;
        return true;
      }).sort((a, b) => SUBJECTS.findIndex((x) => x.id === a.subjectId) - SUBJECTS.findIndex((x) => x.id === b.subjectId) || (a.availability === b.availability ? a.order - b.order : a.availability === 'available' ? -1 : 1)),
    [subject, grade, avail],
  );

  return (
    <div className="stack">
      <PageTitle title={t('explore.title')}>{t('explore.title')}</PageTitle>
      <p className="muted">{t('explore.lead')}</p>
      <form className="card row" onSubmit={(e) => e.preventDefault()} aria-label={t('explore.title')}>
        <div className="field">
          <label htmlFor="f-subject">{t('explore.subject')}</label>
          <select id="f-subject" value={subject} onChange={(e) => set('subject', e.target.value)}>
            <option value="any">{t('explore.any')}</option>
            {SUBJECTS.map((x) => (
              <option key={x.id} value={x.id}>
                {t(`subject.${x.id}` as MessageKey)}
              </option>
            ))}
            <option value="languages">{t('track.languages')}</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-grade">{t('explore.grade')}</label>
          <select id="f-grade" value={grade} onChange={(e) => set('grade', e.target.value)}>
            <option value="any">{t('explore.any')}</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
              <option key={g} value={g}>
                {t('level.grade', { n: g })}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-avail">{t('explore.availability')}</label>
          <select id="f-avail" value={avail} onChange={(e) => set('avail', e.target.value)}>
            <option value="any">{t('explore.any')}</option>
            <option value="playable">{t('explore.playable')}</option>
            <option value="planned">{t('explore.plannedOnly')}</option>
          </select>
        </div>
      </form>
      {grade !== 'any' && <p className="small muted">{t('explore.gradeNote')}</p>}
      <p aria-live="polite" className="small" style={{ fontWeight: 800 }}>
        {t('explore.results', { n: chapters.length })}
      </p>
      {chapters.length === 0 && <p>{t('explore.none')}</p>}
      <ul className="grid-2" style={{ listStyle: 'none', padding: 0 }}>
        {chapters.map((c) => {
          const lessons = lessonsInChapter(c.id).filter(isPlayable);
          return (
            <li key={c.id} className={`card card-accent subject-${c.subjectId}`}>
              <div className="row">
                <SubjectIcon subject={c.subjectId as SubjectId} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="small muted" style={{ margin: 0 }}>
                    {t(`subject.${c.subjectId}` as MessageKey)} · {levelLabel(c.level)}
                  </p>
                  <h2 style={{ fontSize: '1.15rem', margin: 0 }} lang="en">
                    {c.availability === 'available' ? <Link to={`/chapter/${c.id}`}>{c.title}</Link> : c.title}
                  </h2>
                </div>
                <StatusTag status={c.availability === 'planned' ? 'planned' : 'draft'} />
              </div>
              {c.availability === 'available' ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: '0.6rem 0 0' }}>
                  {lessons.map((l) => (
                    <li key={l.id} className="row" style={{ padding: '0.3rem 0' }}>
                      <Link to={`/lesson/${l.id}`} lang="en" style={{ fontWeight: 800 }}>
                        {l.title}
                      </Link>
                      <span className="small muted">{t('explore.minutes', { n: l.estimatedMinutes })}</span>
                      {s.activeId && <MasteryTag state={store.masteryOf(l.id)} />}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="small muted" style={{ margin: '0.5rem 0 0' }}>
                  {t('explore.notYet')}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
