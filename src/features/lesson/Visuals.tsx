import type { ConceptBlock, ItemVisual } from '../../domain/types.ts';
import { GemDot, Shape } from '../../components/Art.tsx';
import { useT } from '../../i18n/useT.tsx';

export function Visual({ v }: { v: ItemVisual }) {
  const { t } = useT();
  switch (v.type) {
    case 'groups':
      return (
        <div className="visual-wrap">
          <div className="groups-visual" role="img" aria-label={v.altText}>
            {Array.from({ length: v.groups }, (_, g) => (
              <div className="basket" key={g}>
                {Array.from({ length: v.itemsPerGroup }, (_, i) => (
                  <GemDot key={i} size={20} />
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    case 'array':
      return (
        <div className="visual-wrap">
          <div className="array-visual" role="img" aria-label={v.altText} style={{ gridTemplateColumns: `repeat(${v.cols}, 22px)` }}>
            {Array.from({ length: v.rows * v.cols }, (_, i) => (
              <GemDot key={i} size={22} colour="#f97316" />
            ))}
          </div>
        </div>
      );
    case 'pattern':
      return (
        <ol className="pattern-visual" aria-label={v.altText}>
          {v.sequence.map((s, i) => (
            <li key={i}>
              {s ? <Shape shape={s} size={44} /> : <span className="gap-tile">?</span>}
              <span>{s ?? t('pb.gap')}</span>
            </li>
          ))}
        </ol>
      );
    case 'passage':
      return (
        <article className="passage" lang={v.lang ?? 'en'}>
          <h3>{v.title}</h3>
          {v.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
      );
    case 'boxes':
      return (
        <ol className="boxes-visual" aria-label={v.altText}>
          {v.boxes.map((b, i) => (
            <li key={i}>
              <b>{b.label}</b>
              {b.contents}
            </li>
          ))}
        </ol>
      );
    case 'letter':
      return (
        <div className="big-glyph" lang={v.lang} role="img" aria-label={`${v.altText} ${v.glyph}`}>
          {v.glyph}
        </div>
      );
  }
}

export function ConceptBlocks({ blocks }: { blocks: ConceptBlock[] }) {
  const { t } = useT();
  return (
    <div className="stack">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'text':
            return (
              <p key={i} lang={b.lang} style={{ fontSize: '1.08rem' }}>
                {b.text}
              </p>
            );
          case 'visual':
            return <Visual key={i} v={b.visual} />;
          case 'example':
            return (
              <section key={i} className="card" aria-labelledby={`ex-${i}`}>
                <h3 id={`ex-${i}`}>
                  {t('lesson.workedExample')}: {b.title}
                </h3>
                <ol className="example-steps">
                  {b.steps.map((s, j) => (
                    <li key={j}>{s}</li>
                  ))}
                </ol>
              </section>
            );
          case 'vocab':
            return (
              <section key={i} aria-labelledby={`vocab-${i}`}>
                <h3 id={`vocab-${i}`}>{t('lesson.vocab')}</h3>
                <div className="vocab">
                  {b.entries.map((e) => (
                    <div key={e.term}>
                      <span className="term" lang={e.lang}>
                        {e.symbol && <span aria-hidden="true">{e.symbol} </span>}
                        {e.term}
                      </span>
                      <span>{e.meaning}</span>
                      {e.note && <p className="small muted" style={{ margin: '0.2rem 0 0' }}>{e.note}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
        }
      })}
    </div>
  );
}
