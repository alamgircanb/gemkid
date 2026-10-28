import { useState } from 'react';
import type { GameConfig } from '../../domain/types.ts';
import { GemDot } from '../../components/Art.tsx';
import { useT } from '../../i18n/useT.tsx';
import { GameShell, RoundFeedback } from './GameShell.tsx';
import { normalizeInteger } from '../../domain/answers.ts';

type Cfg = Extract<GameConfig, { type: 'gem-groups' }>;

export function GemGroups({ cfg, onComplete }: { cfg: Cfg; onComplete: () => void }) {
  const { t } = useT();
  const [round, setRound] = useState(0);
  const [baskets, setBaskets] = useState<number[]>([]);
  const [rows, setRows] = useState(1);
  const [cols, setCols] = useState(1);
  const [total, setTotal] = useState('');
  const [fb, setFb] = useState<{ kind: 'good' | 'bad'; text: string } | null>(null);
  const [finished, setFinished] = useState(false);
  const r = cfg.rounds[Math.min(round, cfg.rounds.length - 1)];
  const isArray = cfg.mode === 'array';

  const resetRound = () => {
    setBaskets([]);
    setRows(1);
    setCols(1);
    setTotal('');
    setFb(null);
  };
  const restart = () => {
    setRound(0);
    setFinished(false);
    resetRound();
  };

  const check = () => {
    const want = r.groups * r.itemsPerGroup;
    if (isArray) {
      if (rows !== r.groups) return setFb({ kind: 'bad', text: t('gg.wrongRows', { have: rows, want: r.groups }) });
      if (cols !== r.itemsPerGroup) return setFb({ kind: 'bad', text: t('gg.wrongCols', { have: cols, want: r.itemsPerGroup }) });
    } else {
      if (baskets.length !== r.groups) return setFb({ kind: 'bad', text: t('gg.wrongGroups', { have: baskets.length, want: r.groups }) });
      const bad = baskets.findIndex((b) => b !== r.itemsPerGroup);
      if (bad >= 0) return setFb({ kind: 'bad', text: t('gg.unequal', { n: bad + 1, have: baskets[bad], want: r.itemsPerGroup }) });
    }
    if (normalizeInteger(total) !== want)
      return setFb({ kind: 'bad', text: t('gg.wrongTotal', { expr: Array(r.groups).fill(r.itemsPerGroup).join(' + ') }) });
    setFb({ kind: 'good', text: `${t('game.well')} ${t('gg.right', { groups: r.groups, each: r.itemsPerGroup, total: want })}` });
  };

  const next = () => {
    if (round + 1 >= cfg.rounds.length) {
      setFinished(true);
      onComplete();
    } else {
      setRound(round + 1);
      resetRound();
    }
  };

  const goal = isArray ? t('gg.goalArray', { rows: r.groups, cols: r.itemsPerGroup }) : t('gg.goalGroups', { groups: r.groups, each: r.itemsPerGroup });

  return (
    <GameShell title={t('gg.title')} goal={goal} help={t('gg.help')} demo={t('gg.demo')} round={round} rounds={cfg.rounds.length} onRestart={restart} finished={finished}>
      {finished ? (
        <p className="center" style={{ fontWeight: 800 }}>
          🎉 {t('game.done')}
        </p>
      ) : (
        <>
          {isArray ? (
            <div className="stack">
              <div className="row">
                <Stepper label={t('gg.rows')} value={rows} min={1} max={6} onChange={(v) => { setRows(v); setFb(null); }} addLabel={t('gg.addRow')} removeLabel={t('gg.removeRow')} />
                <Stepper label={t('gg.perRow')} value={cols} min={1} max={8} onChange={(v) => { setCols(v); setFb(null); }} addLabel={t('gg.addCol')} removeLabel={t('gg.removeCol')} />
              </div>
              <div className="visual-wrap">
                <div
                  className="array-visual"
                  role="img"
                  aria-label={`${t('gg.rows')}: ${rows}. ${t('gg.perRow')}: ${cols}.`}
                  style={{ gridTemplateColumns: `repeat(${cols}, 24px)` }}
                >
                  {Array.from({ length: rows * cols }, (_, i) => (
                    <GemDot key={i} size={24} colour="#f97316" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="stack">
              <div className="row">
                <span style={{ fontWeight: 800 }}>{t('gg.baskets')}:</span>
                <button type="button" className="btn btn-secondary btn-sm" disabled={baskets.length >= 6} onClick={() => { setBaskets([...baskets, 0]); setFb(null); }}>
                  + {t('gg.addGroup')}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" disabled={baskets.length === 0} onClick={() => { setBaskets(baskets.slice(0, -1)); setFb(null); }}>
                  − {t('gg.removeGroup')}
                </button>
                <span aria-live="polite" className="tag tag-learning">
                  {baskets.length}
                </span>
              </div>
              <ul className="groups-visual" style={{ listStyle: 'none', padding: 0 }}>
                {baskets.map((n, i) => (
                  <li key={i} className="basket-edit">
                    <span className="label">
                      {t('gg.basketN', { n: i + 1 })}: {t('gg.gemsIn', { n })}
                    </span>
                    <div className="basket" aria-hidden="true">
                      {Array.from({ length: n }, (_, k) => (
                        <GemDot key={k} size={20} />
                      ))}
                    </div>
                    <div className="row" style={{ gap: '0.3rem' }}>
                      <button type="button" className="btn btn-ghost btn-sm" aria-label={t('gg.removeGem', { n: i + 1 })} disabled={n === 0} onClick={() => { setBaskets(baskets.map((b, k) => (k === i ? b - 1 : b))); setFb(null); }}>
                        −
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" aria-label={t('gg.addGem', { n: i + 1 })} disabled={n >= 8} onClick={() => { setBaskets(baskets.map((b, k) => (k === i ? b + 1 : b))); setFb(null); }}>
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="field" style={{ marginTop: '0.75rem' }}>
            <label htmlFor="gg-total">{t('gg.total')}</label>
            <input id="gg-total" className="number-input" type="text" inputMode="numeric" value={total} onChange={(e) => { setTotal(e.target.value); setFb(null); }} onKeyDown={(e) => e.key === 'Enter' && check()} />
          </div>
          <div className="controls">
            {fb?.kind !== 'good' ? (
              <button type="button" className="btn" onClick={check}>
                {t('game.check')}
              </button>
            ) : (
              <button type="button" className="btn" onClick={next} autoFocus>
                {round + 1 >= cfg.rounds.length ? t('lesson.continue') : t('game.nextRound')} →
              </button>
            )}
          </div>
          <RoundFeedback kind={fb?.kind ?? null}>{fb?.text}</RoundFeedback>
        </>
      )}
    </GameShell>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  addLabel,
  removeLabel,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  addLabel: string;
  removeLabel: string;
}) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <span style={{ fontWeight: 800 }}>{label}:</span>
      <button type="button" className="btn btn-ghost btn-sm" aria-label={removeLabel} disabled={value <= min} onClick={() => onChange(value - 1)}>
        −
      </button>
      <span className="count" aria-live="polite">
        {value}
      </span>
      <button type="button" className="btn btn-secondary btn-sm" aria-label={addLabel} disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
