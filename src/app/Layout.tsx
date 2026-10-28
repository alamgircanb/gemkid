import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, navigate, type Route } from './router.tsx';
import { useApp } from './useApp.ts';
import { store } from './store.ts';
import { useT } from '../i18n/useT.tsx';
import { LOCALES } from '../i18n/index.ts';
import { GemLogo, Avatar } from '../components/Art.tsx';
import type { LangTag } from '../domain/types.ts';
import { recommendNext } from '../domain/recommend.ts';
import { LESSONS, isPlayable, lessonById } from '../content/curriculum.ts';

export function useMyPathTarget(): string {
  const s = useApp();
  const a = s.profiles.find((p) => p.id === s.activeId);
  if (!a) return '/start';
  const r = recommendNext({ lessons: LESSONS, isPlayable, progress: s.progress, masteryOf: store.masteryOf, placements: a.placements });
  const lid = 'lessonId' in r ? r.lessonId : null;
  const subj = lid ? lessonById(lid)?.subjectId : 'math';
  return `/path/${subj ?? 'math'}`;
}

function isActive(route: Route, section: string) {
  const first = route.segments[0] ?? '';
  if (section === 'home') return first === '' || first === 'dashboard';
  if (section === 'path') return ['path', 'chapter', 'lesson'].includes(first);
  if (section === 'explore') return first === 'explore';
  if (section === 'gems') return first === 'gems';
  return false;
}

export function Layout({ route, children }: { route: Route; children: ReactNode }) {
  const s = useApp();
  const { t, locale } = useT();
  const active = s.profiles.find((p) => p.id === s.activeId) ?? null;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathTarget = useMyPathTarget();
  const inLesson = route.segments[0] === 'lesson' || route.segments[0] === 'review-session';

  useEffect(() => {
    document.body.classList.add('has-bottom-nav');
    document.body.classList.toggle('in-lesson', inLesson);
  }, [inLesson]);

  useEffect(() => {
    setMenuOpen(false);
  }, [route.path]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    const onClick = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [menuOpen]);

  const homeTarget = active ? '/dashboard' : '/';
  const nav = [
    { key: 'home', to: homeTarget, icon: '🏠', label: t('nav.home') },
    { key: 'path', to: pathTarget, icon: '🧭', label: t('nav.path') },
    { key: 'explore', to: '/explore', icon: '🔭', label: t('nav.explore') },
    { key: 'gems', to: '/gems', icon: '💎', label: t('nav.gems') },
  ];

  return (
    <>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        {t('app.skip')}
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link to={homeTarget} className="brand">
            <GemLogo size={34} />
            <span>GemKid</span>
            <span className="demo-badge">{t('app.demoBadge')}</span>
            <span className="sr-only"> — {t('nav.home')}</span>
          </Link>
          <nav className="top-nav" aria-label={t('nav.main')}>
            {nav.map((n) => (
              <Link key={n.key} to={n.to} aria-current={isActive(route, n.key) ? 'page' : undefined}>
                <span aria-hidden="true">{n.icon}</span>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="header-tools">
            <label className="sr-only" htmlFor="lang-select">
              {t('nav.language')}
            </label>
            <select
              id="lang-select"
              className="lang-select"
              value={locale}
              onChange={(e) => void store.setPrefs({ uiLocale: e.target.value as LangTag })}
            >
              {LOCALES.map((l) => (
                <option key={l.id} value={l.id} lang={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
            <div className="menu" ref={menuRef}>
              <button
                type="button"
                className="btn btn-ghost icon-btn"
                aria-expanded={menuOpen}
                aria-controls="main-menu"
                onClick={() => setMenuOpen((o) => !o)}
              >
                {active ? <Avatar id={active.avatar} size={32} /> : <span aria-hidden="true">☰</span>}
                <span className={active ? 'sr-only' : 'menu-label'}>{t('nav.menu')}</span>
                {active && <span className="sr-only">: {active.nickname}</span>}
              </button>
              {menuOpen && (
                <div className="menu-panel" id="main-menu">
                  {active && (
                    <p className="small muted" style={{ padding: '0.3rem 0.75rem', margin: 0 }}>
                      {active.nickname}
                    </p>
                  )}
                  <Link to="/review">{t('nav.review')}</Link>
                  <Link to="/settings">{t('nav.settings')}</Link>
                  <Link to="/parent">{t('nav.parentZone')}</Link>
                  <Link to="/help">{t('nav.help')}</Link>
                  <Link to="/about">{t('nav.about')}</Link>
                  <button type="button" onClick={() => navigate('/start')}>
                    {t('nav.switchLearner')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container" aria-live="polite">
        {s.storageMode === 'memory' && (
          <div style={{ marginTop: '0.75rem' }} className="notice notice-danger" data-testid="storage-warning">
            <span aria-hidden="true">⛔</span>
            <div>{t('storage.memory')}</div>
          </div>
        )}
        {s.saveError && (
          <div style={{ marginTop: '0.75rem' }} className="notice notice-danger" data-testid="save-warning">
            <span aria-hidden="true">⛔</span>
            <div className="row" style={{ flex: 1 }}>
              <span style={{ flex: 1 }}>{t('storage.saveFailed')}</span>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => store.dismissSaveError()}>
                {t('storage.dismiss')}
              </button>
            </div>
          </div>
        )}
      </div>

      <main id="main" tabIndex={-1}>
        <div className="container">{children}</div>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p style={{ margin: 0 }}>
            <strong>GemKid</strong> — {t('app.tagline')}
          </p>
          <p className="muted small" style={{ margin: '0.3rem 0 0' }}>
            {t('footer.demo')}
          </p>
          <ul className="footer-links">
            <li>
              <Link to="/about">{t('footer.about')}</Link>
            </li>
            <li>
              <Link to="/help">{t('footer.help')}</Link>
            </li>
            <li>
              <Link to="/privacy">{t('footer.privacy')}</Link>
            </li>
            <li>
              <Link to="/terms">{t('footer.terms')}</Link>
            </li>
            <li>
              <Link to="/parent">{t('nav.parents')}</Link>
            </li>
          </ul>
        </div>
      </footer>

      <nav className="bottom-nav" aria-label={t('nav.main')}>
        {nav.map((n) => (
          <Link key={n.key} to={n.to} aria-current={isActive(route, n.key) ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">
              {n.icon}
            </span>
            {n.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
