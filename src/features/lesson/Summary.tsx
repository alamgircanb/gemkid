import type { Lesson, LessonProgress } from '../../domain/types.ts';
import { evaluateSessions, lessonEvidence } from '../../domain/mastery.ts';
import { recommendNext } from '../../domain/recommend.ts';
import { store } from '../../app/store.ts';
import { useApp } from '../../app/useApp.ts';
import { useT } from '../../i18n/useT.tsx';
import { LESSONS, isPlayable, lessonById } from '../../content/curriculum.ts';
import { Link, navigate } from '../../app/router.tsx';
import { Lumi } from '../../components/Art.tsx';
import { GemCount } from '../games/OtherGames.tsx';
import { MasteryTag } from '../../components/common.tsx';

export function Summary({ lesson, progress, gems }: { lesson: Lesson; progress: LessonProgress; gems: { completion: number; mastery: number } | null }) {
  const { t } = useT();
  const s = useApp();
  const profile = s.profiles.find((p) => p.id === s.activeId)!;
  const sessions = evaluateSessions(lesson, s.attempts);
  const session = sessions.find((x) => x.sessionId === progress.sessionId) ?? sessions.at(-1);
  const ev = lessonEvidence(lesson, s.attempts, progress);
  const mastered = ev.state === 'mastered';
  const guidedHints = s.attempts.filter((a) => a.lessonId === lesson.id && a.sessionId === progress.sessionId && a.stage === 'guided' && a.hintsUsed > 0).length;
  const rec = recommendNext({ lessons: LESSONS, isPlayable, progress: s.progress, masteryOf: store.masteryOf, placements: profile.placements, subjectId: lesson.subjectId });
  const recAll = rec.kind === 'path-complete' ? recommendNext({ lessons: LESSONS, isPlayable, progress: s.progress, masteryOf: store.masteryOf, placements: profile.placements }) : rec;
  const recLesson = 'lessonId' in recAll ? lessonById(recAll.lessonId) : undefined;
  const totalGems = gems ? gems.completion + gems.mastery : 0;

  return (
    <section className="task-card stack" aria-labelledby="summary-title">
      <div className="row">
        <Lumi size={84} colour={profile.avatar} accessories={profile.equipped} mood="cheer" />
        <div style={{ flex: 1 }}>
          <h2 id="summary-title">{t('summary.title')}</h2>
          <MasteryTag state={ev.state} />
        </div>
        {gems && totalGems > 0 && (
          <span className="tag tag-mastered pop" style={{ fontSize: '1rem' }}>
            <GemCount n={totalGems} /> {t('summary.gems', { n: totalGems })}
          </span>
        )}
      </div>

      <p style={{ fontWeight: 800 }}>{mastered ? `★ ${t('summary.mastered')}` : t('summary.notMastered')}</p>

      <h3>{t('summary.learned')}</h3>
      <p lang="en">{lesson.objective}</p>

      {session && (
        <div className="grid-2">
          <div className="card">
            <h3>{t('summary.independent')}</h3>
            <p style={{ margin: 0 }} data-testid="summary-practice">
              {t('summary.practice', { n: session.practiceIndependent, total: session.practiceTotal })}
            </p>
            <p style={{ margin: 0 }} data-testid="summary-challenge">
              {t('summary.challenge', { n: session.challengeIndependent, total: session.challengeTotal })}
            </p>
          </div>
          <div className="card">
            <h3>{t('summary.assisted')}</h3>
            <p style={{ margin: 0 }}>{t('summary.assistedCount', { n: session.practiceAssisted + session.challengeAssisted + guidedHints })}</p>
          </div>
        </div>
      )}
      {session && session.staleItems > 0 && <p className="muted">{t('summary.stale')}</p>}
      {gems && totalGems === 0 && <p className="muted">{t('summary.noGems')}</p>}

      <h3>{t('summary.next')}</h3>
      {recLesson ? (
        <div className="card">
          <p style={{ margin: 0, fontWeight: 800 }} lang="en">
            {recLesson.title}
          </p>
          <p className="small muted" lang="en">
            {recAll.reason}
          </p>
          <button
            type="button"
            className="btn btn-lg"
            onClick={async () => {
              if (recAll.kind === 'retry' && recLesson.id === lesson.id) {
                await store.restart(lesson.id, 'practice');
              } else if (recAll.kind === 'retry') {
                await store.restart(recLesson.id, 'practice');
                navigate(`/lesson/${recLesson.id}`);
              } else navigate(`/lesson/${recLesson.id}`);
            }}
          >
            {recAll.kind === 'retry' ? t('summary.freshSet') : recAll.kind === 'resume' ? t('path.resume') : t('path.start')} →
          </button>
        </div>
      ) : (
        <p>{t('dash.allDone')}</p>
      )}
      <div className="controls">
        {!(recAll.kind === 'retry' && recLesson?.id === lesson.id) && (
          <button type="button" className="btn btn-secondary" onClick={() => void store.restart(lesson.id, 'practice')}>
            {t('summary.freshSet')}
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={() => void store.restart(lesson.id, 'discover')}>
          ↺ {t('summary.replay')}
        </button>
        <Link to="/dashboard" className="btn btn-ghost">
          {t('summary.dashboard')}
        </Link>
      </div>
    </section>
  );
}
