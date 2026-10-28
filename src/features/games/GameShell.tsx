import type { ReactNode } from 'react';
import { useT } from '../../i18n/useT.tsx';

export function GameShell({
  title,
  goal,
  help,
  demo,
  round,
  rounds,
  onRestart,
  children,
  finished,
}: {
  title: string;
  goal: string;
  help: string;
  demo: string;
  round: number;
  rounds: number;
  onRestart: () => void;
  children: ReactNode;
  finished: boolean;
}) {
  const { t } = useT();
  return (
    <section className="game" aria-labelledby="game-title">
      <div className="game-head">
        <h2 id="game-title">🎮 {title}</h2>
        <span className="spacer" />
        {!finished && <span className="tag tag-learning">{t('game.round', { n: round + 1, total: rounds })}</span>}
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRestart}>
          ↺ {t('game.restart')}
        </button>
      </div>
      <div className="game-goal">
        <span className="sr-only">{t('game.goal')}: </span>
        🎯 {goal}
      </div>
      <div className="row" style={{ marginBottom: '0.6rem' }}>
        <details>
          <summary>❓ {t('game.help')}</summary>
          <p>{help}</p>
        </details>
        <details>
          <summary>👀 {t('game.demo')}</summary>
          <p>{demo}</p>
        </details>
      </div>
      <div className="game-board">{children}</div>
    </section>
  );
}

export function RoundFeedback({ kind, children }: { kind: 'good' | 'bad' | 'info' | null; children: ReactNode }) {
  return (
    <div className={`feedback ${kind ?? ''}`} aria-live="polite" role="status">
      {children}
    </div>
  );
}
