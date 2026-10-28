import { useEffect } from 'react';
import { lessonById, isPlayable } from '../content/curriculum.ts';
import { useApp } from '../app/useApp.ts';
import { useT } from '../i18n/useT.tsx';
import { Link } from '../app/router.tsx';
import { LessonPlayer } from '../features/lesson/LessonPlayer.tsx';
import { Notice } from '../components/common.tsx';

export function LessonPage({ lessonId }: { lessonId?: string }) {
  const { t } = useT();
  const s = useApp();
  const lesson = lessonId ? lessonById(lessonId) : undefined;
  useEffect(() => {
    document.title = `${lesson?.title ?? t('lesson.notFound')} · GemKid`;
  }, [lesson, t]);
  if (!lesson || !isPlayable(lesson))
    return (
      <div className="stack">
        <h1>{t('lesson.notFound')}</h1>
        <Link to="/explore" className="btn">
          {t('nav.explore')}
        </Link>
      </div>
    );
  if (!s.activeId)
    return (
      <div className="stack">
        <h1 lang="en">{lesson.title}</h1>
        <Notice kind="info">{t('lesson.needProfile')}</Notice>
        <Link to={`/start?next=/lesson/${lesson.id}`} className="btn btn-lg">
          {t('home.try')}
        </Link>
      </div>
    );
  return <LessonPlayer lesson={lesson} />;
}
