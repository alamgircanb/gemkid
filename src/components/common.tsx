import { useEffect, useRef, type ReactNode } from 'react';
import type { Level, LessonStatus, MasteryState, SubjectId } from '../domain/types.ts';
import { SUBJECTS } from '../content/curriculum.ts';
import { useT } from '../i18n/useT.tsx';
import type { MessageKey } from '../i18n/index.ts';

export function useLevelLabel() {
  const { t } = useT();
  return (l: Level) => ('grade' in l ? t('level.grade', { n: l.grade }) : t(`level.${l.stage}` as MessageKey));
}

export function SubjectIcon({ subject }: { subject: SubjectId }) {
  const s = SUBJECTS.find((x) => x.id === subject)!;
  return (
    <span className={`subject-icon subject-${subject}`} aria-hidden="true" lang={subject === 'bengali' ? 'bn' : undefined}>
      {s.icon}
    </span>
  );
}

export function StatusTag({ status }: { status: LessonStatus | 'planned' }) {
  const { t } = useT();
  if (status === 'planned')
    return (
      <span className="tag tag-planned" title={t('status.plannedLong')}>
        <span aria-hidden="true">◌</span> {t('status.planned')}
      </span>
    );
  if (status === 'published') return <span className="tag tag-mastered">✓ {t('status.published')}</span>;
  return (
    <span className="tag tag-draft" title={t('status.draftLong')}>
      <span aria-hidden="true">✎</span> {t('status.draft')}
    </span>
  );
}

const MASTERY_ICON: Record<MasteryState, string> = { 'not-started': '○', learning: '◐', 'ready-for-review': '↻', mastered: '★' };
const MASTERY_CLASS: Record<MasteryState, string> = { 'not-started': 'tag-planned', learning: 'tag-learning', 'ready-for-review': 'tag-review', mastered: 'tag-mastered' };

export function MasteryTag({ state }: { state: MasteryState }) {
  const { t } = useT();
  return (
    <span className={`tag ${MASTERY_CLASS[state]}`}>
      <span aria-hidden="true">{MASTERY_ICON[state]}</span> {t(`mastery.${state}` as MessageKey)}
    </span>
  );
}

export function Notice({ kind = 'warn', children }: { kind?: 'warn' | 'info' | 'danger'; children: ReactNode }) {
  return (
    <div className={`notice ${kind === 'info' ? 'notice-info' : kind === 'danger' ? 'notice-danger' : ''}`}>
      <span aria-hidden="true">{kind === 'info' ? 'ℹ️' : kind === 'danger' ? '⛔' : '⚠️'}</span>
      <div>{children}</div>
    </div>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Sets the page title and moves focus to the main heading on route change. */
export function PageTitle({ children, title }: { children: ReactNode; title: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    document.title = `${title} · GemKid`;
  }, [title]);
  useEffect(() => {
    ref.current?.focus({ preventScroll: false });
  }, []);
  return (
    <h1 ref={ref} tabIndex={-1} style={{ outline: 'none' }}>
      {children}
    </h1>
  );
}

export function subjectTrackClass(subject: SubjectId) {
  return `subject-${subject}`;
}
