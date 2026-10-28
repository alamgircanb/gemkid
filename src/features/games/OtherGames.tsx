import { useMemo, useState } from 'react';
import type { GameConfig, ShapeId } from '../../domain/types.ts';
import { Shape, GemDot } from '../../components/Art.tsx';
import { useT } from '../../i18n/useT.tsx';
import { GameShell, RoundFeedback } from './GameShell.tsx';
import { OrderBuilder } from '../lesson/OrderBuilder.tsx';
import { RobotEditor } from '../lesson/RobotEditor.tsx';
import { orderMatches } from '../../domain/answers.ts';
import { scramble } from '../../domain/rng.ts';
import type { Block } from '../../domain/robot.ts';

type Props<T extends GameConfig['type']> = { cfg: Extract<GameConfig, { type: T }>; onComplete: () => void };

function useRounds(count: number, onComplete: () => void) {
  const [round, setRound] = useState(0);
  const [finished, setFinished] = useState(false);
  const [nonce, setNonce] = useState(0);
  const next = () => {
    if (round + 1 >= count) {
      setFinished(true);
      onComplete();
    } else setRound(round + 1);
  };
  const restart = () => {
    setRound(0);
    setFinished(false);
    setNonce((n) => n + 1);
  };
  return { round, finished, next, restart, nonce };
}

function Done() {
  const { t } = useT();
  return (
    <p className="center" style={{ fontWeight: 800 }}>
      🎉 {t('game.done')}
    </p>
  );
}

// ---------------- Pattern Bridge ----------------
export function PatternBridge({ cfg, onComplete }: Props<'pattern-bridge'>) {
  const { t } = useT();
  const g = useRounds(cfg.rounds.length, onComplete);
  const r = cfg.rounds[g.round];
  const [picked, setPicked] = useState<ShapeId | null>(null);
  const [fb, setFb] = useState<{ kind: 'good' | 'bad'; text: string } | null>(null);
  const reset = () => {
    setPicked(null);
    setFb(null);
  };
  const choose = (s: ShapeId) => {
    setPicked(s);
    if (s === r.answer) setFb({ kind: 'good', text: `${t('game.well')} ${t('pb.right', { n: r.unit, shape: s })}` });
    else setFb({ kind: 'bad', text: t('pb.wrong', { shape: s }) });
  };
  return (
    <GameShell title={t('pb.title')} goal={t('pb.goal')} help={t('pb.help')} demo={t('pb.demo')} round={g.round} rounds={cfg.rounds.length} onRestart={() => { g.restart(); reset(); }} finished={g.finished}>
      {g.finished ? (
        <Done />
      ) : (
        <>
          <ol className="pattern-visual" aria-label={r.sequence.map((s, i) => (s ?? (picked && fb?.kind === 'good' && i === r.sequence.indexOf(null) ? picked : t('pb.gap')))).join(', ')}>
            {r.sequence.map((s, i) => {
              const filled = s ?? (fb?.kind === 'good' ? picked : null);
              return (
                <li key={i}>
                  {filled ? <Shape shape={filled} size={44} /> : <span className="gap-tile">?</span>}
                  <span>{filled ?? t('pb.gap')}</span>
                </li>
              );
            })}
          </ol>
          <p style={{ fontWeight: 800 }} id="pb-choose">
            {t('pb.choose')}
          </p>
          <div className="row" role="group" aria-labelledby="pb-choose">
            {r.options.map((s) => (
              <button key={s} type="button" className="btn btn-ghost" aria-pressed={picked === s} disabled={fb?.kind === 'good'} onClick={() => choose(s)}>
                <Shape shape={s} size={30} /> {s}
              </button>
            ))}
          </div>
          <RoundFeedback kind={fb?.kind ?? null}>{fb?.text}</RoundFeedback>
          {fb?.kind === 'good' && (
            <div className="controls">
              <button type="button" className="btn" autoFocus onClick={() => { reset(); g.next(); }}>
                {g.round + 1 >= cfg.rounds.length ? t('lesson.continue') : t('game.nextRound')} →
              </button>
            </div>
          )}
        </>
      )}
    </GameShell>
  );
}

// ---------------- Robot Route ----------------
export function RobotRoute({ cfg, onComplete }: Props<'robot-route'>) {
  const { t } = useT();
  const g = useRounds(cfg.levels.length, onComplete);
  const [program, setProgram] = useState<Block[]>([]);
  const [solved, setSolved] = useState(false);
  const level = cfg.levels[g.round];
  return (
    <GameShell title={t('rr.title')} goal={t('rr.goal')} help={t('rr.help')} demo={t('rr.demo')} round={g.round} rounds={cfg.levels.length} onRestart={() => { g.restart(); setProgram([]); setSolved(false); }} finished={g.finished}>
      {g.finished ? (
        <Done />
      ) : (
        <>
          <RobotEditor
            key={`${g.round}-${g.nonce}`}
            grid={level}
            allowRepeat={cfg.allowRepeat}
            program={program}
            onChange={(p) => { setProgram(p); setSolved(false); }}
            onRun={(r) => setSolved(r.outcome === 'reached-goal')}
            idPrefix={`rr-game-${g.round}`}
          />
          {solved && (
            <div className="controls">
              <span className="tag tag-mastered">✓ {t('game.well')}</span>
              <button type="button" className="btn" onClick={() => { setProgram([]); setSolved(false); g.next(); }}>
                {g.round + 1 >= cfg.levels.length ? t('lesson.continue') : t('game.nextRound')} →
              </button>
            </div>
          )}
        </>
      )}
    </GameShell>
  );
}

// ---------------- Treasure Search ----------------
export function TreasureSearch({ cfg, onComplete }: Props<'treasure-search'>) {
  return cfg.mode === 'linear' ? <LinearSearch cfg={cfg} onComplete={onComplete} /> : <ClueSearch cfg={cfg} onComplete={onComplete} />;
}

function LinearSearch({ cfg, onComplete }: { cfg: Extract<Props<'treasure-search'>['cfg'], { mode: 'linear' }>; onComplete: () => void }) {
  const { t } = useT();
  const g = useRounds(cfg.rounds.length, onComplete);
  const r = cfg.rounds[g.round];
  const [opened, setOpened] = useState<number[]>([]);
  const pos = r.items.indexOf(r.target);
  const found = opened.includes(pos);
  return (
    <GameShell title={t('ts.title')} goal={t('ts.goalLinear', { target: r.target })} help={t('ts.help')} demo={t('ts.demo')} round={g.round} rounds={cfg.rounds.length} onRestart={() => { g.restart(); setOpened([]); }} finished={g.finished}>
      {g.finished ? (
        <Done />
      ) : (
        <>
          <ul className="chest-row">
            {r.items.map((it, i) => {
              const isOpen = opened.includes(i);
              return (
                <li key={i}>
                  <button
                    type="button"
                    className={`chest${isOpen && i === pos ? ' found' : ''}`}
                    aria-pressed={isOpen}
                    aria-label={isOpen ? `${t('ts.box', { n: i + 1 })}: ${it}` : `${t('ts.open', { n: i + 1 })} (${t('ts.closed')})`}
                    disabled={found || isOpen}
                    onClick={() => setOpened([...opened, i])}
                  >
                    <span className="small">{t('ts.box', { n: i + 1 })}</span>
                    <span aria-hidden="true">{isOpen ? it : '🧰'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p aria-live="polite" style={{ fontWeight: 800, marginTop: '0.6rem' }}>
            {t('ts.checks', { n: opened.length })}
          </p>
          <RoundFeedback kind={found ? 'good' : null}>
            {found && (
              <>
                {t('ts.found', { target: r.target, pos: pos + 1, n: opened.length })} {t('ts.trace', { pos: pos + 1, n: pos + 1 })}
              </>
            )}
          </RoundFeedback>
          {found && (
            <div className="controls">
              <button type="button" className="btn" autoFocus onClick={() => { setOpened([]); g.next(); }}>
                {g.round + 1 >= cfg.rounds.length ? t('lesson.continue') : t('game.nextRound')} →
              </button>
            </div>
          )}
        </>
      )}
    </GameShell>
  );
}

function ClueSearch({ cfg, onComplete }: { cfg: Extract<Props<'treasure-search'>['cfg'], { mode: 'clues' }>; onComplete: () => void }) {
  const { t } = useT();
  const g = useRounds(cfg.rounds.length, onComplete);
  const r = cfg.rounds[g.round];
  const [crossed, setCrossed] = useState<string[]>([]);
  const [fb, setFb] = useState<{ kind: 'good' | 'bad'; text: string } | null>(null);
  const reset = () => {
    setCrossed([]);
    setFb(null);
  };
  const sizeWord = (s: 'big' | 'small') => t(s === 'big' ? 'ts.size.big' : 'ts.size.small');
  return (
    <GameShell title={t('ts.title')} goal={t('ts.goalClues')} help={t('ts.helpClues')} demo={t('ts.demoClues')} round={g.round} rounds={cfg.rounds.length} onRestart={() => { g.restart(); reset(); }} finished={g.finished}>
      {g.finished ? (
        <Done />
      ) : (
        <>
          <h3>{t('ts.clues')}</h3>
          <ol lang="en">
            {r.clues.map((c) => (
              <li key={c} style={{ fontWeight: 700 }}>
                {c}
              </li>
            ))}
          </ol>
          <ul className="chest-row">
            {r.boxes.map((b) => {
              const isCrossed = crossed.includes(b.id);
              const desc = `${b.label}: ${sizeWord(b.size)}, ${b.colour}, ${b.shape}`;
              return (
                <li key={b.id}>
                  <div className={`clue-box${isCrossed ? ' crossed' : ''}`}>
                    <span>{b.label}</span>
                    <span style={{ transform: b.size === 'big' ? 'scale(1.3)' : 'scale(0.85)', display: 'inline-block' }}>
                      <Shape shape={b.shape} size={34} />
                    </span>
                    <span className="small" lang="en">
                      {sizeWord(b.size)} · {b.colour} · {b.shape}
                    </span>
                    {isCrossed && <span className="sr-only">{t('ts.crossed')}</span>}
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      aria-label={isCrossed ? t('ts.restore', { label: desc }) : t('ts.crossOut', { label: desc })}
                      disabled={fb?.kind === 'good'}
                      onClick={() => setCrossed(isCrossed ? crossed.filter((x) => x !== b.id) : [...crossed, b.id])}
                    >
                      {isCrossed ? '↺' : '✕'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      aria-label={t('ts.choose', { label: desc })}
                      disabled={fb?.kind === 'good'}
                      onClick={() =>
                        setFb(b.id === r.answerId ? { kind: 'good', text: `${t('game.well')} ${r.explanation}` } : { kind: 'bad', text: t('ts.wrongBox', { label: b.label }) })
                      }
                    >
                      ✓
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <RoundFeedback kind={fb?.kind ?? null}>{fb?.text}</RoundFeedback>
          {fb?.kind === 'good' && (
            <div className="controls">
              <button type="button" className="btn" autoFocus onClick={() => { reset(); g.next(); }}>
                {g.round + 1 >= cfg.rounds.length ? t('lesson.continue') : t('game.nextRound')} →
              </button>
            </div>
          )}
        </>
      )}
    </GameShell>
  );
}

// ---------------- Sentence Workshop ----------------
export function SentenceWorkshop({ cfg, onComplete }: Props<'sentence-workshop'>) {
  const { t } = useT();
  const g = useRounds(cfg.rounds.length, onComplete);
  const r = cfg.rounds[g.round];
  const [order, setOrder] = useState<string[]>([]);
  const [fb, setFb] = useState<{ kind: 'good' | 'bad'; text: string } | null>(null);
  const tokens = useMemo(() => scramble(r.tokens, `sw-${g.round}-${g.nonce}`), [r, g.round, g.nonce]);
  const reset = () => {
    setOrder([]);
    setFb(null);
  };
  const check = () => {
    if (order.length < r.tokens.length) return setFb({ kind: 'bad', text: t('order.empty') });
    setFb(orderMatches(r.tokens, r.accepted, order) ? { kind: 'good', text: `${t('game.well')} ${r.explanation}` } : { kind: 'bad', text: t('sw.wrong') });
  };
  return (
    <GameShell title={cfg.layout === 'steps' ? t('sw.titleSteps') : t('sw.title')} goal={t('sw.goal')} help={t('sw.help')} demo={t('sw.demo')} round={g.round} rounds={cfg.rounds.length} onRestart={() => { g.restart(); reset(); }} finished={g.finished}>
      {g.finished ? (
        <Done />
      ) : (
        <>
          <OrderBuilder key={`${g.round}-${g.nonce}`} tokens={tokens} value={order} onChange={(v) => { setOrder(v); setFb(null); }} layout={cfg.layout} disabled={fb?.kind === 'good'} idPrefix={`sw-${g.round}`} />
          <div className="controls">
            {fb?.kind !== 'good' ? (
              <button type="button" className="btn" onClick={check}>
                {t('game.check')}
              </button>
            ) : (
              <button type="button" className="btn" autoFocus onClick={() => { reset(); g.next(); }}>
                {g.round + 1 >= cfg.rounds.length ? t('lesson.continue') : t('game.nextRound')} →
              </button>
            )}
          </div>
          <RoundFeedback kind={fb?.kind ?? null}>{fb?.text}</RoundFeedback>
        </>
      )}
    </GameShell>
  );
}

// ---------------- Word Garden ----------------
export function WordGarden({ cfg, onComplete }: Props<'word-garden'>) {
  const { t } = useT();
  const g = useRounds(cfg.rounds.length, onComplete);
  const r = cfg.rounds[g.round];
  const [sel, setSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [fb, setFb] = useState<{ kind: 'good' | 'bad'; text: string } | null>(null);
  const rights = useMemo(() => scramble(r.pairs.map((_, i) => i), `wg-${g.round}-${g.nonce}`), [r, g.round, g.nonce]);
  const allDone = matched.length === r.pairs.length;
  const reset = () => {
    setSel(null);
    setMatched([]);
    setFb(null);
  };
  const pickRight = (i: number) => {
    if (sel === null) return;
    if (sel === i) {
      setMatched([...matched, i]);
      setFb({ kind: 'good', text: `${t('wg.pairDone', { a: r.pairs[i].left.text, b: r.pairs[i].right.text })} ${r.pairs[i].why}` });
      setSel(null);
    } else {
      setFb({ kind: 'bad', text: t('wg.wrong', { a: r.pairs[sel].left.text, b: r.pairs[i].right.text }) });
    }
  };
  return (
    <GameShell title={t('wg.title')} goal={t('wg.goal')} help={t('wg.help')} demo={t('wg.demo')} round={g.round} rounds={cfg.rounds.length} onRestart={() => { g.restart(); reset(); }} finished={g.finished}>
      {g.finished ? (
        <Done />
      ) : (
        <>
          <div className="match-cols">
            <div>
              <h3 id="wg-left">{t('wg.left')}</h3>
              <ul aria-labelledby="wg-left">
                {r.pairs.map((p, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className={`match-btn${matched.includes(i) ? ' matched' : ''}`}
                      aria-pressed={sel === i}
                      disabled={matched.includes(i)}
                      onClick={() => { setSel(i); setFb(null); }}
                    >
                      {p.left.symbol && <span aria-hidden="true">{p.left.symbol} </span>}
                      <span lang={p.left.lang}>{p.left.text}</span>
                      {matched.includes(i) && <span className="small"> ✓ {t('wg.matched')}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 id="wg-right">{t('wg.right')}</h3>
              <ul aria-labelledby="wg-right">
                {rights.map((i) => {
                  const p = r.pairs[i];
                  return (
                    <li key={i}>
                      <button type="button" className={`match-btn${matched.includes(i) ? ' matched' : ''}`} disabled={matched.includes(i) || sel === null} onClick={() => pickRight(i)}>
                        {p.right.symbol && <span aria-hidden="true">{p.right.symbol} </span>}
                        <span lang={p.right.lang}>{p.right.text}</span>
                        {matched.includes(i) && <span className="small"> ✓ {t('wg.matched')}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          {sel !== null && (
            <p className="small" aria-live="polite" style={{ marginTop: '0.5rem' }}>
              {t('wg.selected', { word: r.pairs[sel].left.text })}
            </p>
          )}
          <RoundFeedback kind={fb?.kind ?? null}>{fb?.text}</RoundFeedback>
          {allDone && (
            <div className="controls">
              <button type="button" className="btn" autoFocus onClick={() => { reset(); g.next(); }}>
                {g.round + 1 >= cfg.rounds.length ? t('lesson.continue') : t('game.nextRound')} →
              </button>
            </div>
          )}
        </>
      )}
    </GameShell>
  );
}

export function GemCount({ n }: { n: number }) {
  return (
    <span className="row" style={{ gap: '0.25rem', display: 'inline-flex' }}>
      <GemDot size={18} /> <strong>{n}</strong>
    </span>
  );
}
