// About, Help, Privacy and Terms. Body text is in English for now; other interface
// languages show an explicit notice instead of an unreviewed legal-style translation.
import type { ReactNode } from 'react';
import { useT } from '../i18n/useT.tsx';
import { Link } from '../app/router.tsx';
import { Notice, PageTitle } from '../components/common.tsx';
import { Lumi } from '../components/Art.tsx';
import type { MessageKey } from '../i18n/index.ts';

function StaticPage({ titleKey, children }: { titleKey: MessageKey; children: ReactNode }) {
  const { t, locale } = useT();
  return (
    <div className="stack prose">
      <PageTitle title={t(titleKey)}>{t(titleKey)}</PageTitle>
      {locale !== 'en' && <Notice kind="info">{locale === 'fr' ? 'Cette page est disponible en anglais seulement pour le moment.' : 'এই পাতাটি আপাতত শুধু ইংরেজিতে আছে।'}</Notice>}
      <div lang="en" className="stack">
        {children}
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <StaticPage titleKey="about.title">
      <div className="row">
        <Lumi size={90} mood="cheer" />
        <p style={{ flex: 1 }}>
          <strong>KidGem</strong> means every child is a gem. It is a learning portal idea for Grades 1–8, covering math, logic and brain games, coding,
          algorithms, English, French and Bengali.
        </p>
      </div>
      <h2>How lessons teach</h2>
      <p>
        Every lesson follows the same cycle: <strong>Discover</strong> (a picture and a worked example), <strong>Guided try</strong> (help is expected),
        <strong> Play</strong> (a short game linked to the idea), <strong>Practice</strong> (six questions, no timer), <strong>Challenge</strong> (two new
        situations) and <strong>Reflect</strong>, followed by a summary and one clear next step.
      </p>
      <h2>Mastery, not scores</h2>
      <p>
        A skill is marked mastered when a learner answers at least 5 of 6 practice questions and both challenge questions correctly on the first try
        without hints, in one session. Hints and retries are part of learning and are shown separately. This is a teaching guide, not a measure of
        intelligence or a diagnosis.
      </p>
      <h2>What this demo is — and is not</h2>
      <ul>
        <li>12 complete <strong>draft</strong> lessons, two per track. They have not been reviewed by educators or fluent-language reviewers yet.</li>
        <li>The Grades 1–8 sequence is a proposed skills plan, not alignment to an official curriculum.</li>
        <li>Progress is saved only in this browser. There are no accounts and no cloud sync.</li>
        <li>No advertising, chat, public profiles or child-facing purchases. Gems only unlock decorations.</li>
      </ul>
      <p>
        <Link to="/explore">Explore what is available now →</Link>
      </p>
    </StaticPage>
  );
}

export function HelpPage() {
  return (
    <StaticPage titleKey="help.title">
      <h2>Getting started</h2>
      <ol>
        <li>Choose “Try a lesson”, then add a learner with a nickname and a preset gem avatar.</li>
        <li>Your dashboard shows a large Continue card with the exact next lesson.</li>
        <li>Lessons save automatically. Use “Save &amp; exit” any time and come back later.</li>
      </ol>
      <h2>Using the keyboard or a screen reader</h2>
      <ul>
        <li>Every activity works without dragging. Choose a word or command, then use the arrow buttons to move it.</li>
        <li>Feedback is announced after you check an answer. Focus moves to the feedback or the Next button.</li>
        <li>Settings lets you reduce motion, raise contrast, enlarge text and turn on a read-aloud button.</li>
      </ul>
      <h2>Common questions</h2>
      <details>
        <summary>My progress disappeared.</summary>
        <p>
          Progress lives only in this browser on this device. Private browsing, clearing site data or switching browsers starts fresh. Parents can
          download a backup in the Parent Zone and import it later.
        </p>
      </details>
      <details>
        <summary>Why did I not get gems for replaying a lesson?</summary>
        <p>Gems are awarded once per lesson completion and once per mastery, so replaying cannot farm gems. Replaying is still great practice.</p>
      </details>
      <details>
        <summary>Why does the robot stop?</summary>
        <p>For safety, robot programs stop after 120 steps or if the robot reaches the edge or a rock. The message under the grid explains why.</p>
      </details>
      <details>
        <summary>Is there audio?</summary>
        <p>
          Recorded audio is not available yet. If you turn on the read-aloud button in Settings, KidGem uses your device’s built-in voices when one exists
          for the language. Bengali voices are often unavailable; the written text is always shown.
        </p>
      </details>
      <h2>Support</h2>
      <p>
        This is a demonstration build and does not yet have a staffed support channel. A support contact will be published here before any family beta.
      </p>
    </StaticPage>
  );
}

export function PrivacyPage() {
  return (
    <StaticPage titleKey="privacy.title">
      <Notice>This is a factual description of how the demo handles data. It is not a reviewed legal privacy policy.</Notice>
      <h2>What the demo stores</h2>
      <ul>
        <li>Learner nicknames, preset avatars, school grade, subject levels and preferences.</li>
        <li>Lesson progress, the answers given to questions, hint use and gem events.</li>
      </ul>
      <h2>Where it is stored</h2>
      <p>
        Everything is stored in your browser’s IndexedDB on this device. Nothing is sent to a KidGem server, because the demo has none. Anyone using this
        browser profile can see the records. Clearing site data deletes them.
      </p>
      <h2>What the demo does not do</h2>
      <ul>
        <li>No accounts, emails, birthdays, photos, school names or real names are requested.</li>
        <li>No analytics, advertising trackers, session recording or voice recording.</li>
        <li>No chat, public profiles or sharing between learners.</li>
      </ul>
      <h2>Your controls</h2>
      <p>
        In the <Link to="/parent">Parent Zone</Link> you can download all records as a file, import a backup, reset lesson progress or delete a learner.
      </p>
      <p className="muted small">
        The page is served by GitHub Pages, which, like any web host, may process technical request data such as IP addresses under GitHub’s own terms.
      </p>
    </StaticPage>
  );
}

export function TermsPage() {
  return (
    <StaticPage titleKey="terms.title">
      <Notice>These are plain-language demo notes, not reviewed legal terms.</Notice>
      <ul>
        <li>KidGem is an early demonstration provided as is, free of charge, for evaluation and family testing.</li>
        <li>Lessons are draft content. Please report mistakes so they can be corrected before review and publication.</li>
        <li>“KidGem” is a working name. No claim of trademark clearance or curriculum endorsement is made.</li>
        <li>Fonts are used under the SIL Open Font License. KidGem illustrations are original drawings made for this project.</li>
      </ul>
    </StaticPage>
  );
}

export function NotFoundPage() {
  const { t } = useT();
  return (
    <div className="stack center">
      <Lumi size={120} mood="think" />
      <PageTitle title={t('notfound.title')}>{t('notfound.title')}</PageTitle>
      <p>{t('notfound.text')}</p>
      <div>
        <Link to="/" className="btn">
          {t('nav.home')}
        </Link>
      </div>
    </div>
  );
}
