import { useState } from 'react';
import { useT } from '../i18n/useT.tsx';
import { useApp } from '../app/useApp.ts';
import { store } from '../app/store.ts';
import { balance, earned, rankFor, SHOP, owned } from '../domain/rewards.ts';
import { Lumi } from '../components/Art.tsx';
import { PageTitle } from '../components/common.tsx';
import { GemCount } from '../features/games/OtherGames.tsx';
import type { MessageKey } from '../i18n/index.ts';
import { StartPage } from './Start.tsx';

export function GemsPage() {
  const { t, date } = useT();
  const s = useApp();
  const [msg, setMsg] = useState('');
  const profile = s.profiles.find((p) => p.id === s.activeId);
  if (!profile) return <StartPage />;
  const bal = balance(s.rewards);
  const total = earned(s.rewards);
  const { rank, next } = rankFor(total);
  const mine = owned(s.rewards);
  const bg = profile.equipped.find((e) => e.startsWith('bg-'));

  return (
    <div className="stack">
      <PageTitle title={t('gems.title')}>💎 {t('gems.title')}</PageTitle>
      <div className="grid-2">
        <div className={`lumi-stage ${bg ?? ''}`}>
          <Lumi size={180} colour={profile.avatar} accessories={profile.equipped} mood="cheer" title={profile.nickname} />
        </div>
        <div className="card stack">
          <div>
            <p className="small muted" style={{ margin: 0 }}>
              {t('gems.balance')}
            </p>
            <p className="stat" data-testid="gem-balance">
              <GemCount n={bal} />
            </p>
          </div>
          <p style={{ margin: 0 }}>
            {t('gems.earned')}: <strong>{total}</strong>
          </p>
          <p style={{ margin: 0, fontWeight: 800 }}>{t('gems.rank', { rank: t(`rank.${rank}` as MessageKey) })}</p>
          <p className="small muted" style={{ margin: 0 }}>
            {next ? t('gems.nextRank', { n: next.min - total, rank: t(`rank.${next.id}` as MessageKey) }) : t('gems.topRank')}
          </p>
          <p className="small">{t('gems.how')}</p>
        </div>
      </div>

      <section aria-labelledby="shop-h">
        <h2 id="shop-h">{t('gems.shop')}</h2>
        <p className="sr-only" aria-live="polite">
          {msg}
        </p>
        <ul className="grid" style={{ listStyle: 'none', padding: 0 }}>
          {SHOP.map((item) => {
            const has = mine.includes(item.id);
            const worn = profile.equipped.includes(item.id);
            return (
              <li key={item.id} className="card shop-item">
                <strong>{t(`shop.${item.id}` as MessageKey)}</strong>
                {item.kind === 'accessory' ? (
                  <Lumi size={64} colour={profile.avatar} accessories={[item.id]} />
                ) : (
                  <div className={`lumi-stage ${item.id}`} style={{ width: 64, height: 64, padding: 0 }} aria-hidden="true" />
                )}
                {has ? (
                  <>
                    <span className="tag tag-mastered">✓ {t('gems.owned')}</span>
                    <button type="button" className="btn btn-sm btn-secondary" aria-pressed={worn} onClick={() => void store.toggleEquip(item.id)}>
                      {worn ? t('gems.remove') : t('gems.wear')}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-sm"
                    aria-disabled={bal < item.cost}
                    onClick={async () => {
                      const r = await store.purchase(item.id);
                      setMsg(r === 'ok' ? `✓ ${t(`shop.${item.id}` as MessageKey)}` : t('gems.notEnough'));
                    }}
                  >
                    {t('gems.buy', { n: item.cost })} 💎
                  </button>
                )}
                {!has && bal < item.cost && <span className="small muted">{t('gems.notEnough')}</span>}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card" aria-labelledby="hist-h">
        <h2 id="hist-h">{t('gems.history')}</h2>
        {s.rewards.length === 0 ? (
          <p className="muted">{t('gems.noHistory')}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <tbody>
                {[...s.rewards].reverse().map((r) => (
                  <tr key={r.sourceKey}>
                    <td>{date(r.timestamp)}</td>
                    <td>{t(`gems.reason.${r.reason}` as MessageKey)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800 }}>{r.delta > 0 ? `+${r.delta}` : r.delta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
