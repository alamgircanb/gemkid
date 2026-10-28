import { useT } from '../i18n/useT.tsx';
import { Link } from '../app/router.tsx';
import { chapterById, lessonsInChapter, isPlayable } from '../content/curriculum.ts';
import { PageTitle, StatusTag, SubjectIcon, useLevelLabel, MasteryTag } from '../components/common.tsx';
import { store } from '../app/store.ts';
import { useApp } from '../app/useApp.ts';
import type { MessageKey } from '../i18n/index.ts';

export function ChapterPage({ chapterId }: { chapterId?: string }) {
  const { t } = useT();
  const s = useApp();
  const levelLabel = useLevelLabel();
  const c = chapterId ? chapterById(chapterId) : undefined;
  if (!c)
    return (
      <div className="stack">
        <h1>{t('notfound.title')}</h1>
        <Link to="/explore">{t('nav.explore')}</Link>
      </div>
    );
  const lessons = lessonsInChapter(c.id).filter(isPlayable);
  return (
    <div className={`stack subject-${c.subjectId}`}>
      <Link to={`/path/${c.subjectId}`}>← {t('chapter.back')}</Link>
      <div className="page-head">
        <SubjectIcon subject={c.subjectId} />
        <div>
          <p className="small muted" style={{ margin: 0 }}>
            {t(`subject.${c.subjectId}` as MessageKey)} · {levelLabel(c.level)}
          </p>
          <PageTitle title={c.title}>
            <span lang="en">{c.title}</span>
          </PageTitle>
        </div>
        <StatusTag status={c.availability === 'planned' ? 'planned' : 'draft'} />
      </div>
      {c.usefulSkill && <p lang="en">{c.usefulSkill}</p>}
      <section className="card">
        <h2>{t('chapter.objectives')}</h2>
        <ul lang="en">
          {lessons.map((l) => (
            <li key={l.id}>{l.objective}</li>
          ))}
          {c.plannedTopics?.map((x) => <li key={x}>{x}</li>)}
        </ul>
      </section>
      {lessons.length > 0 && (
        <section className="card">
          <h2>{t('chapter.lessons')}</h2>
          <ol className="path-list">
            {lessons.map((l, i) => (
              <li key={l.id} className="lesson-row">
                <span className="state-icon" aria-hidden="true">
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <Link to={`/lesson/${l.id}`} lang="en" style={{ fontWeight: 800 }}>
                    {l.title}
                  </Link>
                  <p className="small muted" style={{ margin: 0 }}>
                    {t('common.minutes', { n: l.estimatedMinutes })}
                  </p>
                </div>
                {s.activeId && <MasteryTag state={store.masteryOf(l.id)} />}
              </li>
            ))}
          </ol>
        </section>
      )}
      {lessons.length > 0 && (
        <section className="card">
          <h2>🏡 {t('chapter.offline')}</h2>
          {lessons.map((l) => (
            <p key={l.id} lang="en">
              {l.offlineActivity}
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
