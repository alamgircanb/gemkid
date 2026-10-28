import { useEffect, useRef, useState } from 'react';
import type { RobotGrid } from '../../domain/types.ts';
import { countBlocks, LIMITS, runProgram, usesRepeat, type Block, type RunResult, type RobotState } from '../../domain/robot.ts';
import { Robot, GemDot } from '../../components/Art.tsx';
import { useT } from '../../i18n/useT.tsx';
import type { MessageKey } from '../../i18n/index.ts';

type Target = 'main' | number;

function prefersReduced() {
  const m = document.documentElement.dataset.motion;
  if (m === 'reduce') return true;
  if (m === 'full') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function RobotEditor({
  grid,
  allowRepeat,
  program,
  onChange,
  onRun,
  maxBlocks,
  requireRepeat,
  disabled,
  idPrefix,
}: {
  grid: RobotGrid;
  allowRepeat: boolean;
  program: Block[];
  onChange: (p: Block[]) => void;
  onRun?: (r: RunResult) => void;
  maxBlocks?: number;
  requireRepeat?: boolean;
  disabled?: boolean;
  idPrefix: string;
}) {
  const { t } = useT();
  const [target, setTarget] = useState<Target>('main');
  const [shown, setShown] = useState<{ state: RobotState; pointer: number[] | null; trail: string[]; crash?: { x: number; y: number } }>({
    state: grid.start,
    pointer: null,
    trail: [],
  });
  const [stepIdx, setStepIdx] = useState(0);
  const [message, setMessage] = useState('');
  const timer = useRef<number | null>(null);
  const result = useRef<RunResult | null>(null);

  const stop = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  const resetRobot = () => {
    stop();
    result.current = null;
    setStepIdx(0);
    setShown({ state: grid.start, pointer: null, trail: [] });
    setMessage('');
  };

  // Any edit invalidates the last run.
  const change = (p: Block[]) => {
    resetRobot();
    onChange(p);
  };

  const showStep = (r: RunResult, i: number) => {
    const step = r.trace[i];
    const trail = r.trace.slice(0, i + 1).map((s) => `${s.state.x},${s.state.y}`);
    const last = i === r.trace.length - 1;
    setShown({ state: step.state, pointer: step.pointer, trail, crash: last ? r.crashAt : undefined });
    setMessage(t('rr.stepping', { n: i + 1 }));
    if (last) finish(r);
  };

  const finish = (r: RunResult) => {
    setMessage(r.message);
    onRun?.(r);
  };

  const run = () => {
    resetRobot();
    const r = runProgram(grid, program);
    result.current = r;
    if (!r.trace.length) {
      finish(r);
      return;
    }
    if (prefersReduced()) {
      showStep(r, r.trace.length - 1);
      return;
    }
    let i = 0;
    showStep(r, 0);
    timer.current = window.setInterval(() => {
      i++;
      if (i >= r.trace.length) return stop();
      showStep(r, i);
      if (i === r.trace.length - 1) stop();
    }, Math.max(40, Math.min(280, Math.round(5000 / r.trace.length))));
  };

  const step = () => {
    stop();
    let r = result.current;
    let i = stepIdx;
    if (!r || i >= r.trace.length) {
      r = runProgram(grid, program);
      result.current = r;
      i = 0;
      setShown({ state: grid.start, pointer: null, trail: [] });
    }
    if (!r.trace.length) {
      finish(r);
      return;
    }
    showStep(r, i);
    setStepIdx(i + 1);
  };

  const insert = (b: Block) => {
    if (target === 'main') change([...program, b]);
    else {
      const next = program.map((x, i) => (i === target && x.op === 'repeat' ? { ...x, body: [...x.body, b] } : x));
      change(next);
    }
  };
  const addRepeat = () => {
    const next: Block[] = [...program, { op: 'repeat', times: 2, body: [] }];
    change(next);
    setTarget(next.length - 1);
  };

  const moveIn = (list: Block[], i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return list;
    const n = list.slice();
    [n[i], n[j]] = [n[j], n[i]];
    return n;
  };

  const label = (b: Block) => (b.op === 'repeat' ? t('rr.repeat') : t(`rr.${b.op}` as MessageKey));
  const active = (path: number[]) => !!shown.pointer && shown.pointer.length === path.length && shown.pointer.every((v, k) => v === path[k]);

  const blocks = countBlocks(program);
  const robotDirName = t(`rr.dir.${shown.state.dir}` as MessageKey);

  return (
    <div className="robot-layout">
      <div>
        <div
          className="robot-grid"
          role="img"
          aria-label={`${t('rr.grid')}. ${t('rr.robotAt', { x: shown.state.x + 1, y: shown.state.y + 1, dir: robotDirName })} ${t('rr.gemAt', { x: grid.goal.x + 1, y: grid.goal.y + 1 })}${grid.walls.length ? ` ${grid.walls.map((w) => `${t('rr.rock')} ${w.x + 1},${w.y + 1}`).join('; ')}` : ''}`}
          style={{ gridTemplateColumns: `repeat(${grid.width}, 1fr)` }}
        >
          {Array.from({ length: grid.width * grid.height }, (_, k) => {
            const x = k % grid.width;
            const y = Math.floor(k / grid.width);
            const rock = grid.walls.some((w) => w.x === x && w.y === y);
            const isRobot = shown.state.x === x && shown.state.y === y;
            const isGoal = grid.goal.x === x && grid.goal.y === y;
            const trail = shown.trail.includes(`${x},${y}`);
            const crash = shown.crash && shown.crash.x === x && shown.crash.y === y;
            return (
              <div key={k} className={`cell${rock ? ' rock' : ''}${trail && !isRobot ? ' trail' : ''}${crash ? ' crash' : ''}`}>
                {rock && <span aria-hidden="true">🪨</span>}
                {isGoal && !isRobot && <GemDot size={26} />}
                {isRobot && <Robot dir={shown.state.dir} size={30} />}
              </div>
            );
          })}
        </div>
        <p className="small muted center" style={{ marginTop: '0.4rem' }}>
          {t('rr.robotAt', { x: shown.state.x + 1, y: shown.state.y + 1, dir: robotDirName })}
        </p>
        <p aria-live="polite" className="center" style={{ fontWeight: 800, minHeight: '1.6em' }} data-testid="robot-message">
          {message}
        </p>
      </div>
      <div>
        <div className="row" role="group" aria-label={t('rr.program')}>
          <button type="button" className="btn btn-secondary btn-sm" disabled={disabled} onClick={() => insert({ op: 'forward' })}>
            ⬆ {t('rr.forward')}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" disabled={disabled} onClick={() => insert({ op: 'left' })}>
            ↶ {t('rr.left')}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" disabled={disabled} onClick={() => insert({ op: 'right' })}>
            ↷ {t('rr.right')}
          </button>
          {allowRepeat && (
            <button type="button" className="btn btn-secondary btn-sm" disabled={disabled} onClick={addRepeat}>
              🔁 {t('rr.repeat')}
            </button>
          )}
        </div>
        {allowRepeat && program.some((b) => b.op === 'repeat') && (
          <div className="field" style={{ marginTop: '0.6rem' }}>
            <label htmlFor={`${idPrefix}-target`}>{t('rr.addingTo')}</label>
            <select id={`${idPrefix}-target`} value={String(target)} onChange={(e) => setTarget(e.target.value === 'main' ? 'main' : Number(e.target.value))}>
              <option value="main">{t('rr.main')}</option>
              {program.map((b, i) => (b.op === 'repeat' ? <option key={i} value={i}>{t('rr.insideRepeat', { n: i + 1 })}</option> : null))}
            </select>
          </div>
        )}
        <h3 style={{ marginTop: '0.8rem' }}>
          {t('rr.program')} <span className="small muted">({t('rr.blocks', { n: blocks })})</span>
        </h3>
        {(maxBlocks || requireRepeat) && (
          <p className="small" style={{ margin: 0 }}>
            {maxBlocks ? t('rr.maxBlocks', { n: maxBlocks }) : ''} {requireRepeat ? t('rr.needRepeat') : ''}
          </p>
        )}
        {program.length === 0 ? (
          <p className="muted">{t('rr.empty')}</p>
        ) : (
          <ol className="program">
            {program.map((b, i) => (
              <li key={i}>
                <div className={`cmd${active([i]) ? ' active' : ''}`}>
                  <span>
                    {i + 1}. {label(b)}
                  </span>
                  {b.op === 'repeat' && (
                    <>
                      <label className="sr-only" htmlFor={`${idPrefix}-times-${i}`}>
                        {t('rr.timesLabel', { n: i + 1 })}
                      </label>
                      <input
                        id={`${idPrefix}-times-${i}`}
                        className="repeat-count"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={LIMITS.maxRepeat}
                        value={b.times}
                        disabled={disabled}
                        onChange={(e) => {
                          const v = Math.max(1, Math.min(LIMITS.maxRepeat, Math.round(Number(e.target.value) || 1)));
                          change(program.map((x, k) => (k === i && x.op === 'repeat' ? { ...x, times: v } : x)));
                        }}
                      />
                      <span>{t('rr.times')}</span>
                    </>
                  )}
                  <span className="spacer" />
                  {!disabled && (
                    <>
                      <button type="button" className="mini" aria-label={t('rr.moveUp', { n: i + 1 })} disabled={i === 0} onClick={() => change(moveIn(program, i, -1))}>
                        ↑
                      </button>
                      <button type="button" className="mini" aria-label={t('rr.moveDown', { n: i + 1 })} disabled={i === program.length - 1} onClick={() => change(moveIn(program, i, 1))}>
                        ↓
                      </button>
                      <button
                        type="button"
                        className="mini"
                        aria-label={t('rr.delete', { n: i + 1 })}
                        onClick={() => {
                          change(program.filter((_, k) => k !== i));
                          setTarget('main');
                        }}
                      >
                        ✕
                      </button>
                    </>
                  )}
                  {b.op === 'repeat' && (
                    <ol className="program repeat-body">
                      {b.body.length === 0 && <li className="small muted">{t('rr.empty')}</li>}
                      {b.body.map((c, j) => (
                        <li key={j}>
                          <div className={`cmd${active([i, j]) ? ' active' : ''}`}>
                            <span>
                              {i + 1}.{j + 1} {label(c)}
                            </span>
                            <span className="spacer" />
                            {!disabled && (
                              <>
                                <button type="button" className="mini" aria-label={t('rr.moveUp', { n: `${i + 1}.${j + 1}` })} disabled={j === 0} onClick={() => change(program.map((x, k) => (k === i && x.op === 'repeat' ? { ...x, body: moveIn(x.body, j, -1) } : x)))}>
                                  ↑
                                </button>
                                <button type="button" className="mini" aria-label={t('rr.moveDown', { n: `${i + 1}.${j + 1}` })} disabled={j === b.body.length - 1} onClick={() => change(program.map((x, k) => (k === i && x.op === 'repeat' ? { ...x, body: moveIn(x.body, j, 1) } : x)))}>
                                  ↓
                                </button>
                                <button type="button" className="mini" aria-label={t('rr.delete', { n: `${i + 1}.${j + 1}` })} onClick={() => change(program.map((x, k) => (k === i && x.op === 'repeat' ? { ...x, body: x.body.filter((_, m) => m !== j) } : x)))}>
                                  ✕
                                </button>
                              </>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
        <div className="row">
          <button type="button" className="btn" onClick={run} disabled={program.length === 0}>
            ▶ {t('rr.run')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={step} disabled={program.length === 0}>
            ⏭ {t('rr.step')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={resetRobot}>
            ↺ {t('rr.resetRobot')}
          </button>
          {!disabled && program.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => change([])}>
              {t('rr.clear')}
            </button>
          )}
        </div>
        <p className="small muted">{t('rr.limitNote')}</p>
        {requireRepeat && !usesRepeat(program) && program.length > 0 && <span className="sr-only">{t('rr.needRepeat')}</span>}
      </div>
    </div>
  );
}
