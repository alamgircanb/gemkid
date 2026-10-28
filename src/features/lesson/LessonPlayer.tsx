import { useEffect, useMemo, useRef, useState } from 'react';
import type { Item, Lesson, StageId } from '../../domain/types.ts';
import { STAGES } from '../../domain/types.ts';
import { store } from '../../app/store.ts';
import { useApp } from '../../app/useApp.ts';
import { useT } from '../../i18n/useT.tsx';
import type { MessageKey } from '../../i18n/index.ts';
import { ConceptBlocks } from './Visuals.tsx';
import { ItemView, ListenButton, type SubmitInfo } from './ItemView.tsx';
import { itemForSession } from '../../domain/answers.ts';
import { GemGroups } from '../games/GemGroups.tsx';
import { PatternBridge, RobotRoute, TreasureSearch, SentenceWorkshop, WordGarden } from '../games/OtherGames.tsx';
import { Summary } from './Summary.tsx';
import { Link, navigate } from '../../app/router.tsx';
import { Notice } from '../../components/common.tsx';
import { chapterById } from '../../content/curriculum.ts';
import { Lumi } from '../../components/Art.tsx';
import { analytics } from '../../services/analytics.ts';

const NEXT_STAGE: Record<StageId, StageId> = {
  discover: 'guided',
  guided: 'play',
  play: 'practice',
  practice: 'challenge',
  challenge: 'reflect',
  reflect: 'summary',
  summary: 'summary',
};

function stageItems(lesson: Lesson, stage: StageId): Item[] {
  if (stage === 'guided') return lesson.guidedTasks;
  if (stage === 'practice') return lesson.practiceItems;
  if (stage === 'challenge') return lesson.challenges;
  return [];
}

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const { t, locale } = useT();
  const s = useApp();
  const profile = s.profiles.find((p) => p.id === s.activeId)!;
  const progress = s.progress.find((p) => p.lessonId === lesson.id);
  const [resumed, setResumed] = useState(false);
  const [gems, setGems] = useState<{ completion: number; mastery: number } | null>(null);
  const [reflectChoice, setReflectChoice] = useState<string>('');
  const [reflectShown, setReflectShown] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const chapter = chapterById(lesson.chapterId);

  useEffect(() => {
    const existing = store.progressFor(lesson.id);
    if (existing && !(existing.stage === 'discover' && existing.itemIndex === 0) && existing.stage !== 'summary') setResumed(true);
    // If the learner left right after answering, continue with the next question.
    if (existing?.itemDone) void store.moveTo(lesson.id, existing.stage, existing.itemIndex + 1);
    void store.ensureProgress(lesson);
  }, [lesson]);

  // Normalise: an exhausted stage moves on (e.g. reload right after the last answer).
  useEffect(() => {
    if (!progress) return;
    const items = stageItems(lesson, progress.stage);
    if (items.length && progress.itemIndex >= items.length) void store.moveTo(lesson.id, NEXT_STAGE[progress.stage], 0);
  }, [progress, lesson]);

  // A replay or fresh set starts a new session: clear per-run local state.
  const sessionKey = progress?.sessionId;
  useEffect(() => {
    setReflectChoice('');
    setReflectShown(false);
    setGems(null);
  }, [sessionKey]);

  const stage = progress?.stage ?? 'discover';
  useEffect(() => {
    topRef.current?.focus();
  }, [stage]);

  const seed = progress ? `${progress.sessionId}` : 'seed';

  const goStage = async (next: StageId) => {
    analytics.track('stage_completed', { lessonId: lesson.id, stage });
    await store.moveTo(lesson.id, next, 0);
  };

  const submit = (stageId: 'guided' | 'practice' | 'challenge', base: Item, shown: Item) => (info: SubmitInfo) => {
    if (!progress) return;
    if (info.hintsUsed > 0) analytics.track('hint_requested', { lessonId: lesson.id });
    void store.recordAttempt({ lessonId: lesson.id, stage: stageId, base, shown, sessionId: progress.sessionId, answer: info.answer, correct: info.correct, hintsUsed: info.hintsUsed });
    if (info.correct) void store.moveTo(lesson.id, progress.stage, progress.itemIndex, { itemDone: true });
  };

  const stageIdx = STAGES.indexOf(stage);
  const isLang = lesson.subjectId === 'french' || lesson.subjectId === 'bengali';

  if (!progress) return <p role="status">{t('app.loading')}</p>;

  const items = stageItems(lesson, stage);
  const idx = Math.min(progress.itemIndex, Math.max(0, items.length - 1));
  const base = items[idx];
  const shown = base && (stage === 'practice' || stage === 'challenge') ? itemForSession(base, progress.sessionNumber) : base;

  const advanceItem = async () => {
    if (idx + 1 < items.length) await store.moveTo(lesson.id, stage, idx + 1);
    else await goStage(NEXT_STAGE[stage]);
  };

  const stageNote: Partial<Record<StageId, MessageKey>> = { practice: 'lesson.practiceNote', challenge: 'lesson.challengeNote' };
  const nextLabelFor = (st: StageId): string =>
    st === 'guided' ? t('lesson.continue') : st === 'practice' ? t('lesson.toChallenge') : t('lesson.toReflect');

  return (
    <div className={`subject-${lesson.subjectId}`}>
      <div className="lesson-top">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to={`/path/${lesson.subjectId}`}>{t(`subject.${lesson.subjectId}` as MessageKey)}</Link>
          {' › '}
          {chapter && <Link to={`/chapter/${chapter.id}`}>{chapter.title}</Link>}
        </nav>
        <span className="spacer" />
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
          💾 {t('lesson.exit')}
        </button>
      </div>
      <h1 ref={topRef as never} tabIndex={-1} style={{ outline: 'none' }} lang="en">
        {lesson.title}
      </h1>
      <p style={{ marginTop: '-0.3rem' }}>
        <strong>{t('lesson.objective')}:</strong> <span lang="en">{lesson.objective}</span>
      </p>

      <ol className="stages" aria-label={t('lesson.stages')}>
        {STAGES.map((st, i) => (
          <li key={st}>
            <span className={`stage-pill${i < stageIdx ? ' done' : ''}${i === stageIdx ? ' current' : ''}`} aria-current={i === stageIdx ? 'step' : undefined}>
              <span className="bar" aria-hidden="true" />
              <span className="label">
                {i < stageIdx ? '✓ ' : ''}
                {t(`stage.${st}` as MessageKey)}
              </span>
              <span className="sr-only">{i < stageIdx ? ' (done)' : ''}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="sr-only" aria-live="polite">
        {t('lesson.stageOf', { n: stageIdx + 1, total: STAGES.length, name: t(`stage.${stage}` as MessageKey) })}
      </p>

      <div className="stack task">
        {resumed && stage !== 'summary' && (
          <Notice kind="info">
            {t('lesson.resumed')} ({t(`stage.${stage}` as MessageKey)})
          </Notice>
        )}
        {locale !== 'en' && (
          <Notice kind="info">
            <span>{t('lesson.englishOnly')}</span>
          </Notice>
        )}
        {stage === 'discover' && (
          <Notice>
            <span>{isLang ? t('lesson.languageDraftNotice') : t('lesson.draftNotice')}</span>
          </Notice>
        )}
        {stageNote[stage] && <p className="muted">{t(stageNote[stage]!)}</p>}

        {stage === 'discover' && (
          <section className="task-card">
            <div className="row">
              <Lumi size={64} colour={profile.avatar} accessories={profile.equipped} mood="think" />
              <h2 style={{ flex: 1 }}>{t('stage.discover')}</h2>
              <ListenButton text={lesson.conceptBlocks.filter((b) => b.type === 'text').map((b) => (b as { text: string }).text).join(' ')} lang="en" />
            </div>
            <div lang="en">
              <ConceptBlocks blocks={lesson.conceptBlocks} />
            </div>
            <div className="controls">
              <button type="button" className="btn btn-lg" onClick={() => void goStage('guided')}>
                {t('lesson.startGuided')} →
              </button>
            </div>
          </section>
        )}

        {(stage === 'guided' || stage === 'practice' || stage === 'challenge') && shown && (
          <ItemView
            key={`${stage}-${idx}-${progress.sessionId}`}
            item={shown}
            mode={stage === 'guided' ? 'guided' : 'assess'}
            seed={seed}
            position={{ n: idx + 1, total: items.length }}
            onSubmit={submit(stage, base, shown)}
            onReveal={() => void store.moveTo(lesson.id, stage, idx, { itemDone: true })}
            onNext={() => void advanceItem()}
            nextLabel={idx + 1 < items.length ? t('lesson.next') : nextLabelFor(stage)}
          />
        )}

        {stage === 'play' && (
          <div className="stack">
            <GameFor lesson={lesson} onComplete={() => void store.moveTo(lesson.id, 'play', 0, { gameCompleted: true })} />
            <div className="controls">
              {progress.gameCompleted ? (
                <>
                  <span className="tag tag-mastered">✓ {t('lesson.gameDone')}</span>
                  <button type="button" className="btn btn-lg" onClick={() => void goStage('practice')}>
                    {t('lesson.toPractice')} →
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-ghost" onClick={() => void store.moveTo(lesson.id, 'practice', 0, { gameSkipped: true })}>
                  {t('lesson.skipGame')}
                </button>
              )}
            </div>
          </div>
        )}

        {stage === 'reflect' && (
          <section className="task-card">
            <h2>{t('lesson.reflectPrompt')}</h2>
            <fieldset>
              <legend className="prompt" lang="en">
                {lesson.reflection.prompt}
              </legend>
              <div className="choice-list">
                {lesson.reflection.options.map((o) => (
                  <div className="choice" key={o.id}>
                    <input type="radio" id={`rf-${o.id}`} name="reflect" checked={reflectChoice === o.id} onChange={() => setReflectChoice(o.id)} disabled={reflectShown} />
                    <label htmlFor={`rf-${o.id}`} lang="en">
                      {o.text}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
            <div className={`feedback ${reflectShown ? 'info' : ''}`} aria-live="polite">
              {reflectShown && <span lang="en">{lesson.reflection.explanation}</span>}
            </div>
            <div className="controls">
              {!reflectShown ? (
                <button type="button" className="btn btn-lg" disabled={!reflectChoice} onClick={() => { setReflectShown(true); void store.moveTo(lesson.id, 'reflect', 0, { reflectionChoice: reflectChoice }); }}>
                  {t('lesson.check')}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-lg"
                  autoFocus
                  onClick={async () => {
                    const r = await store.completeLesson(lesson.id);
                    setGems({ completion: r.completionGems, mastery: r.masteryGems });
                  }}
                >
                  {t('lesson.finish')} ✓
                </button>
              )}
            </div>
          </section>
        )}

        {stage === 'summary' && <Summary lesson={lesson} progress={progress} gems={gems} />}

        {(stage === 'practice' || stage === 'challenge' || stage === 'guided') && (
          <details className="card">
            <summary>📘 {t('lesson.goBackDiscover')}</summary>
            <div lang="en">
              <ConceptBlocks blocks={lesson.conceptBlocks} />
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

function GameFor({ lesson, onComplete }: { lesson: Lesson; onComplete: () => void }) {
  const g = lesson.game;
  const content = useMemo(() => {
    switch (g.type) {
      case 'gem-groups':
        return <GemGroups cfg={g} onComplete={onComplete} />;
      case 'pattern-bridge':
        return <PatternBridge cfg={g} onComplete={onComplete} />;
      case 'robot-route':
        return <RobotRoute cfg={g} onComplete={onComplete} />;
      case 'treasure-search':
        return <TreasureSearch cfg={g} onComplete={onComplete} />;
      case 'sentence-workshop':
        return <SentenceWorkshop cfg={g} onComplete={onComplete} />;
      case 'word-garden':
        return <WordGarden cfg={g} onComplete={onComplete} />;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g]);
  return <div>{content}</div>;
}
