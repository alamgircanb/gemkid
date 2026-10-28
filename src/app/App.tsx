import { Component, useEffect, type ReactNode } from 'react';
import { useRoute, type Route } from './router.tsx';
import { useApp } from './useApp.ts';
import { Layout } from './Layout.tsx';
import { useT } from '../i18n/useT.tsx';
import { translate } from '../i18n/index.ts';
import { store } from './store.ts';
import { HomePage } from '../pages/Home.tsx';
import { ExplorePage } from '../pages/Explore.tsx';
import { StartPage } from '../pages/Start.tsx';
import { DashboardPage } from '../pages/Dashboard.tsx';
import { PathPage } from '../pages/Path.tsx';
import { ChapterPage } from '../pages/Chapter.tsx';
import { LessonPage } from '../pages/Lesson.tsx';
import { ReviewPage, ReviewSessionPage } from '../pages/Review.tsx';
import { GemsPage } from '../pages/Gems.tsx';
import { ParentPage } from '../pages/Parent.tsx';
import { SettingsPage } from '../pages/Settings.tsx';
import { AboutPage, HelpPage, PrivacyPage, TermsPage, NotFoundPage } from '../pages/Static.tsx';

class ErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  render() {
    if (this.state.error) {
      const loc = store.prefs().uiLocale;
      return (
        <div className="card" role="alert">
          <h1>{translate(loc, 'error.title').text}</h1>
          <p>{translate(loc, 'error.text').text}</p>
          <button className="btn" type="button" onClick={() => window.location.reload()}>
            {translate(loc, 'error.reload').text}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Screen({ route }: { route: Route }) {
  const [first, second] = route.segments;
  switch (first) {
    case undefined:
      return <HomePage />;
    case 'explore':
      return <ExplorePage />;
    case 'start':
      return <StartPage />;
    case 'dashboard':
      return <DashboardPage />;
    case 'path':
      return <PathPage subjectId={second} />;
    case 'chapter':
      return <ChapterPage chapterId={second} />;
    case 'lesson':
      return <LessonPage key={second} lessonId={second} />;
    case 'review':
      return <ReviewPage />;
    case 'review-session':
      return <ReviewSessionPage key={second} lessonId={second} />;
    case 'gems':
      return <GemsPage />;
    case 'parent':
      return <ParentPage />;
    case 'settings':
      return <SettingsPage />;
    case 'about':
      return <AboutPage />;
    case 'help':
      return <HelpPage />;
    case 'privacy':
      return <PrivacyPage />;
    case 'terms':
      return <TermsPage />;
    default:
      return <NotFoundPage />;
  }
}

/** Applies language, theme, motion, contrast and text-size preferences to <html>. */
function usePreferenceEffects() {
  const s = useApp();
  const { locale } = useT();
  const active = s.profiles.find((p) => p.id === s.activeId);
  const prefs = active?.prefs ?? s.guestPrefs;
  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    const theme = prefs.theme === 'auto' ? (active && active.grade <= 3 ? 'younger' : active ? 'older' : 'younger') : prefs.theme;
    html.dataset.theme = theme;
    html.dataset.motion = prefs.motion;
    html.dataset.contrast = prefs.highContrast ? 'high' : 'normal';
    html.style.setProperty('--scale', String(prefs.textScale));
  }, [locale, prefs, active]);
}

export function App() {
  const route = useRoute();
  const s = useApp();
  usePreferenceEffects();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.path]);
  if (!s.ready) {
    return (
      <p className="container" role="status" style={{ padding: '2rem 16px' }}>
        Loading…
      </p>
    );
  }
  return (
    <Layout route={route}>
      <ErrorBoundary resetKey={route.path}>
        <Screen route={route} />
      </ErrorBoundary>
    </Layout>
  );
}
