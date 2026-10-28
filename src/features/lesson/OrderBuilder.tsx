// Select-then-place ordering with button-based reordering: an accessible
// alternative to drag and drop that works with keyboard, touch and screen readers.
import { useRef, useState } from 'react';
import type { OrderToken } from '../../domain/types.ts';
import { useT } from '../../i18n/useT.tsx';

export function OrderBuilder({
  tokens,
  value,
  onChange,
  layout,
  disabled,
  idPrefix,
}: {
  tokens: OrderToken[];
  value: string[];
  onChange: (ids: string[]) => void;
  layout: 'words' | 'steps';
  disabled?: boolean;
  idPrefix: string;
}) {
  const { t } = useT();
  const [announce, setAnnounce] = useState('');
  const builtRef = useRef<HTMLOListElement>(null);
  const byId = new Map(tokens.map((tk) => [tk.id, tk]));
  const pool = tokens.filter((tk) => !value.includes(tk.id));

  const focusLater = (sel: string) => requestAnimationFrame(() => document.getElementById(sel)?.focus());

  const add = (id: string) => {
    onChange([...value, id]);
    setAnnounce(t('lesson.moved', { word: byId.get(id)!.text }));
    const rest = pool.filter((p) => p.id !== id);
    if (rest.length) focusLater(`${idPrefix}-pool-${rest[0].id}`);
    else focusLater(`${idPrefix}-built-${id}-text`);
  };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setAnnounce(`${byId.get(value[i])!.text}: ${j + 1}/${value.length}`);
    focusLater(`${idPrefix}-built-${value[i]}-${d < 0 ? 'up' : 'down'}`);
  };
  const remove = (i: number) => {
    const id = value[i];
    onChange(value.filter((_, k) => k !== i));
    setAnnounce(t('order.remove', { word: byId.get(id)!.text }));
    focusLater(`${idPrefix}-pool-${id}`);
  };

  return (
    <div>
      <p className="small" style={{ fontWeight: 800, margin: 0 }} id={`${idPrefix}-built-label`}>
        {t('order.built')}
      </p>
      <ol className={`order-built ${layout}`} aria-labelledby={`${idPrefix}-built-label`} ref={builtRef}>
        {value.length === 0 && (
          <li className="muted small" style={{ alignSelf: 'center' }}>
            {t('order.empty')}
          </li>
        )}
        {value.map((id, i) => {
          const tk = byId.get(id)!;
          return (
            <li key={id} className="token">
              <span className="t-text" id={`${idPrefix}-built-${id}-text`} tabIndex={-1} lang={tk.lang}>
                {layout === 'steps' && <span aria-hidden="true">{i + 1}. </span>}
                {tk.text}
              </span>
              {!disabled && (
                <span>
                  <button type="button" className="mini" id={`${idPrefix}-built-${id}-up`} aria-label={t('order.moveUp', { word: tk.text })} disabled={i === 0} onClick={() => move(i, -1)}>
                    {layout === 'steps' ? '↑' : '←'}
                  </button>
                  <button type="button" className="mini" id={`${idPrefix}-built-${id}-down`} aria-label={t('order.moveDown', { word: tk.text })} disabled={i === value.length - 1} onClick={() => move(i, 1)}>
                    {layout === 'steps' ? '↓' : '→'}
                  </button>
                  <button type="button" className="mini" aria-label={t('order.remove', { word: tk.text })} onClick={() => remove(i)}>
                    ✕
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {pool.length > 0 && (
        <>
          <p className="small" style={{ fontWeight: 800, margin: 0 }} id={`${idPrefix}-pool-label`}>
            {t('order.available')}
          </p>
          <ul className={`order-pool ${layout}`} aria-labelledby={`${idPrefix}-pool-label`}>
            {pool.map((tk) => (
              <li key={tk.id}>
                <button
                  type="button"
                  className="token-btn"
                  id={`${idPrefix}-pool-${tk.id}`}
                  disabled={disabled}
                  aria-label={t('order.add', { word: tk.text })}
                  onClick={() => add(tk.id)}
                >
                  <span lang={tk.lang}>{tk.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {value.length > 0 && !disabled && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { onChange([]); focusLater(`${idPrefix}-pool-${tokens[0].id}`); }}>
          {t('order.clear')}
        </button>
      )}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
