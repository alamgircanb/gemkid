import { useMemo, useRef, useState } from 'react';
import type { Item, LangTag } from '../../domain/types.ts';
import { evaluate } from '../../domain/answers.ts';
import { scramble } from '../../domain/rng.ts';
import { programToText, type Block } from '../../domain/robot.ts';
import { Visual } from './Visuals.tsx';
import { OrderBuilder } from './OrderBuilder.tsx';
import { RobotEditor } from './RobotEditor.tsx';
import { Shape } from '../../components/Art.tsx';
import { useT } from '../../i18n/useT.tsx';
import { store } from '../../app/store.ts';
import { useApp } from '../../app/useApp.ts';

export type ItemMode = 'guided' | 'assess' | 'preview';

export interface SubmitInfo {
  answer: string;
  correct: boolean;
  hintsUsed: number;
}

/** Read text aloud with the device's voices, only when the learner turned read-aloud on. */
export function ListenButton({ text, lang }: { text: string; lang: LangTag }) {
  const { t } = useT();
  useApp();
  const [msg, setMsg] = useState('');
  if (!store.prefs().sound) return null;
  const speak = () => {
    const synth = globalThis.speechSynthesis;
    const voices = synth?.getVoices() ?? [];
    const voice = voices.find((v) => v.lang.toLowerCase().startsWith(lang));
    if (!synth || !voice) {
      setMsg(t('lesson.noVoice'));
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    synth.speak(u);
    setMsg('');
  };
  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm" onClick={speak}>
        🔊 {t('lesson.listen')}
      </button>
      {msg && (
        <p className="small muted" role="status">
          {msg}
        </p>
      )}
    </>
  );
}

function answerText(item: Item): string {
  switch (item.type) {
    case 'numeric':
      return String(item.answerRule.value);
    case 'choice':
      return item.options.filter((o) => item.answerRule.correctOptionIds.includes(o.id)).map((o) => o.text).join(', ');
    case 'order': {
      const ids = item.answerRule.accepted[0];
      return ids.map((id) => item.tokens.find((tk) => tk.id === id)!.text).join(item.layout === 'steps' ? ' → ' : ' ');
    }
    case 'robot':
      return '';
  }
}

export function ItemView({
  item,
  mode,
  seed,
  onSubmit,
  onNext,
  onReveal,
  nextLabel,
  position,
}: {
  item: Item;
  mode: ItemMode;
  seed: string;
  onSubmit?: (s: SubmitInfo) => void;
  onNext?: () => void;
  onReveal?: () => void;
  nextLabel?: string;
  position?: { n: number; total: number };
}) {
  const { t } = useT();
  const idp = `it-${item.id}`;
  const [num, setNum] = useState('');
  const [choice, setChoice] = useState<string>('');
  const [order, setOrder] = useState<string[]>([]);
  const [program, setProgram] = useState<Block[]>([]);
  const [hints, setHints] = useState(0);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'right' | 'revealed'>('idle');
  const [wrongCount, setWrongCount] = useState(0);
  const [detail, setDetail] = useState<string | undefined>();
  const [inputError, setInputError] = useState('');
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const options = useMemo(() => (item.type === 'choice' ? scramble(item.options, seed + item.id) : []), [item, seed]);
  const tokens = useMemo(() => (item.type === 'order' ? scramble(item.tokens, seed + item.id) : []), [item, seed]);

  const answer = (): string => {
    switch (item.type) {
      case 'numeric':
        return num;
      case 'choice':
        return choice;
      case 'order':
        return order.join('|');
      case 'robot':
        return programToText(program);
    }
  };

  const done = status === 'right' || status === 'revealed';

  const check = () => {
    const a = answer();
    if (!a.trim()) {
      setInputError(item.type === 'numeric' ? t('lesson.typeNumber') : item.type === 'order' ? t('order.empty') : item.type === 'robot' ? t('rr.empty') : t('pb.choose'));
      return;
    }
    setInputError('');
    const ev = evaluate(item, a);
    onSubmit?.({ answer: a, correct: ev.correct, hintsUsed: hints });
    setDetail(ev.detail);
    if (ev.correct) {
      setStatus('right');
      requestAnimationFrame(() => nextRef.current?.focus());
    } else {
      setStatus('wrong');
      setWrongCount((c) => c + 1);
      // Teach after an error: reveal the next hint, which is specific to this item's misconception.
      setHints((h) => Math.min(item.hints.length, Math.max(h, 1) + (h > 0 ? 1 : 0)));
      requestAnimationFrame(() => feedbackRef.current?.focus());
    }
  };

  const reveal = () => {
    setStatus('revealed');
    setHints(item.hints.length);
    onReveal?.();
    requestAnimationFrame(() => nextRef.current?.focus());
  };

  const choiceIsBn = item.type === 'choice' && item.options.some((o) => o.lang === 'bn');

  return (
    <div className="task-card">
      {position && (
        <p className="small muted" style={{ margin: 0 }}>
          {t('lesson.itemOf', { n: position.n, total: position.total })}
        </p>
      )}
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <h2 className="prompt" id={`${idp}-prompt`} lang={item.promptLang ?? 'en'} style={{ flex: 1 }}>
          {item.prompt}
        </h2>
        <ListenButton text={item.prompt} lang={item.promptLang ?? 'en'} />
      </div>
      {item.visual && <Visual v={item.visual} />}

      {item.type === 'numeric' && (
        <div className="field">
          <label htmlFor={`${idp}-num`}>{t('lesson.yourAnswer')}</label>
          <input
            id={`${idp}-num`}
            className="number-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={num}
            disabled={done}
            aria-describedby={inputError ? `${idp}-err` : undefined}
            onChange={(e) => {
              setNum(e.target.value);
              if (status === 'wrong') setStatus('idle');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !done) check();
            }}
          />
        </div>
      )}

      {item.type === 'choice' && (
        <fieldset>
          <legend className="sr-only">{item.prompt}</legend>
          <div className={`choice-list${choiceIsBn ? ' choice-bn' : ''}`}>
            {options.map((o) => (
              <div className="choice" key={o.id}>
                <input
                  type="radio"
                  id={`${idp}-${o.id}`}
                  name={idp}
                  value={o.id}
                  checked={choice === o.id}
                  disabled={done}
                  onChange={() => {
                    setChoice(o.id);
                    if (status === 'wrong') setStatus('idle');
                  }}
                />
                <label htmlFor={`${idp}-${o.id}`}>
                  {o.shape && <Shape shape={o.shape} size={30} />}
                  {o.symbol && <span aria-hidden="true">{o.symbol}</span>}
                  <span lang={o.lang}>{o.text}</span>
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      )}

      {item.type === 'order' && (
        <OrderBuilder
          tokens={tokens}
          value={order}
          layout={item.layout}
          disabled={done}
          idPrefix={idp}
          onChange={(v) => {
            setOrder(v);
            if (status === 'wrong') setStatus('idle');
          }}
        />
      )}

      {item.type === 'robot' && (
        <RobotEditor
          grid={item.grid}
          allowRepeat={item.allowRepeat}
          program={program}
          maxBlocks={item.answerRule.maxBlocks}
          requireRepeat={item.answerRule.requireRepeat}
          disabled={done}
          idPrefix={idp}
          onChange={(p) => {
            setProgram(p);
            if (status === 'wrong') setStatus('idle');
          }}
        />
      )}

      {inputError && (
        <p className="error-text" id={`${idp}-err`} role="alert">
          {inputError}
        </p>
      )}

      {hints > 0 && (
        <div className="hint-box" aria-live="polite">
          <ol>
            {item.hints.slice(0, hints).map((h, i) => (
              <li key={i}>
                <span className="sr-only">{t('lesson.hintN', { n: i + 1, total: item.hints.length })}: </span>
                {h}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div ref={feedbackRef} tabIndex={-1} aria-live="assertive" className={`feedback ${status === 'right' ? 'good' : status === 'wrong' ? 'bad' : status === 'revealed' ? 'info' : ''}`}>
        {status === 'right' && (
          <>
            <strong>✓ {t('lesson.correct')}</strong>
            {detail && item.type === 'robot' ? <span>{detail} </span> : null}
            {item.explanation}
          </>
        )}
        {status === 'wrong' && (
          <>
            <strong>✗ {t('lesson.notYet')}</strong>
            {detail ? <span>{detail} </span> : null}
            <span>💡 {t('lesson.hintN', { n: Math.max(1, hints), total: item.hints.length })}</span>
          </>
        )}
        {status === 'revealed' && (
          <>
            <strong>{answerText(item) ? t('lesson.answerWas', { answer: answerText(item) }) : t('lesson.showAnswer')}</strong>
            {item.explanation}
          </>
        )}
      </div>

      <div className="controls">
        {!done && item.type !== 'robot' && (
          <button type="button" className="btn btn-lg" onClick={check}>
            {t('lesson.check')}
          </button>
        )}
        {!done && item.type === 'robot' && (
          <button type="button" className="btn btn-lg" onClick={check}>
            {t('rr.useProgram')}
          </button>
        )}
        {!done && hints < item.hints.length && (
          <button type="button" className="btn btn-ghost" onClick={() => setHints((h) => h + 1)}>
            💡 {t('lesson.hint')}
          </button>
        )}
        {!done && hints >= item.hints.length && hints > 0 && <span className="small muted">{t('lesson.noMoreHints')}</span>}
        {!done && wrongCount >= 2 && (
          <button type="button" className="btn btn-ghost" onClick={reveal}>
            {t('lesson.showAnswer')}
          </button>
        )}
        {done && onNext && (
          <button type="button" className="btn btn-lg" ref={nextRef} onClick={onNext}>
            {nextLabel ?? t('lesson.next')} →
          </button>
        )}
      </div>
      {mode === 'guided' && status === 'idle' && hints === 0 && <p className="small muted" style={{ marginTop: '0.6rem' }}>{t('lesson.guidedNote')}</p>}
    </div>
  );
}
