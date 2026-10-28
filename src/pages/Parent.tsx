import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useT } from '../i18n/useT.tsx';
import { useApp } from '../app/useApp.ts';
import { store } from '../app/store.ts';
import { LESSONS, SUBJECTS, isPlayable, levelsFor } from '../content/curriculum.ts';
import { lessonEvidence } from '../domain/mastery.ts';
import { reviewStatus, reviewSessions } from '../domain/review.ts';
import { recommendNext, levelKey } from '../domain/recommend.ts';
import { Avatar } from '../components/Art.tsx';
import { MasteryTag, Notice, PageTitle, useLevelLabel } from '../components/common.tsx';
import type { Attempt, LessonProgress, Profile, SubjectId } from '../domain/types.ts';
import type { MessageKey } from '../i18n/index.ts';
import { lessonById } from '../content/curriculum.ts';

let unlocked = false; // per page load; a convenience gate, not security

export function ParentPage() {
  const { t } = useT();
  const s = useApp();
  const [open, setOpen] = useState(unlocked);
  const [ans, setAns] = useState('');
  const [err, setErr] = useState('');
  const q = useMemo(() => ({ a: 6 + Math.floor(Math.random() * 4), b: 7 + Math.floor(Math.random() * 3) }), []);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (Number(ans.trim()) === q.a * q.b) {
      unlocked = true;
      setOpen(true);
    } else setErr(t('parent.gateWrong'));
  };

  if (!open)
    return (
      <div className="stack" style={{ maxWidth: 560 }}>
        <PageTitle title={t('parent.title')}>{t('parent.title')}</PageTitle>
        <p>{t('parent.gateLead')}</p>
        <form className="card stack" onSubmit={submit}>
          <div className="field">
            <label htmlFor="gate">{t('parent.gateQ', { a: q.a, b: q.b })}</label>
            <input id="gate" type="text" inputMode="numeric" value={ans} onChange={(e) => setAns(e.target.value)} aria-describedby="gate-err" style={{ maxWidth: 160 }} />
            <span id="gate-err" className="error-text" role="alert">
              {err}
            </span>
          </div>
          <div>
            <button type="submit" className="btn">
              {t('parent.enter')}
            </button>
          </div>
          <p className="small muted" style={{ margin: 0 }}>
            {t('parent.gateNote')}
          </p>
        </form>
      </div>
    );

  const exportAll = async () => {
    const json = await store.exportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemkid-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importFile = async (f: File) => {
    const text = await f.text();
    const r = await store.importJson(text);
    setMsg(r.ok ? t('parent.importOk', { n: r.count }) : t('parent.importBad'));
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="stack">
      <PageTitle title={t('parent.title')}>{t('parent.title')}</PageTitle>
      <p className="muted">{t('parent.lead')}</p>
      <Notice kind="info">{t('parent.noRanking')}</Notice>
      <Notice>{t('storage.deviceOnly')}</Notice>
      <p role="status" aria-live="polite" style={{ fontWeight: 800 }}>
        {msg}
      </p>
      {s.profiles.length === 0 && <p>{t('parent.noProfiles')}</p>}
      {s.profiles.map((p) => (
        <LearnerPanel key={p.id} profile={p} onMessage={setMsg} />
      ))}
      <section className="card stack" aria-labelledby="data-h">
        <h2 id="data-h">{t('parent.data')}</h2>
        <div className="row">
          <button type="button" className="btn btn-secondary" onClick={() => void exportAll()}>
            ⬇ {t('parent.export')}
          </button>
          <div className="field">
            <label htmlFor="import-file">{t('parent.import')}</label>
            <input id="import-file" ref={fileRef} type="file" accept="application/json,.json" onChange={(e) => e.target.files?.[0] && void importFile(e.target.files[0])} />
          </div>
        </div>
      </section>
    </div>
  );
}

function useLearnerData(profile: Profile) {
  const s = useApp();
  const [data, setData] = useState<{ attempts: Attempt[]; progress: LessonProgress[] } | null>(null);
  const isActive = s.activeId === profile.id;
  // For learners other than the active one, read their records from storage.
  useEffect(() => {
    if (isActive) return;
    let live = true;
    void store.recordsFor(profile.id).then((d) => live && setData(d));
    return () => {
      live = false;
    };
  }, [isActive, profile.id, s.profiles]);
  return isActive ? { attempts: s.attempts, progress: s.progress } : data ?? { attempts: [], progress: [] };
}

function LearnerPanel({ profile, onMessage }: { profile: Profile; onMessage: (m: string) => void }) {
  const { t, date } = useT();
  const levelLabel = useLevelLabel();
  const { attempts, progress } = useLearnerData(profile);
  const [confirm, setConfirm] = useState<null | 'reset' | 'delete'>(null);
  const [word, setWord] = useState('');
  const now = store.now();
  const masteryOf = (id: string) => lessonEvidence(lessonById(id)!, attempts, progress.find((p) => p.lessonId === id)).state;
  const rec = recommendNext({ lessons: LESSONS, isPlayable, progress, masteryOf, placements: profile.placements });
  const recLesson = 'lessonId' in rec ? lessonById(rec.lessonId) : undefined;
  const last = attempts.at(-1)?.timestamp ?? progress.map((p) => p.updatedAt).sort().at(-1);

  const doConfirm = async () => {
    if (confirm === 'reset' && word === 'RESET') {
      await store.resetProgress(profile.id, false);
      onMessage(t('parent.resetDone'));
    } else if (confirm === 'delete' && word === 'DELETE') {
      await store.deleteProfile(profile.id);
      onMessage(t('parent.deleted'));
    } else return;
    setConfirm(null);
    setWord('');
  };

  return (
    <section className="card stack" aria-labelledby={`lp-${profile.id}`}>
      <div className="row">
        <Avatar id={profile.avatar} size={52} />
        <div>
          <h2 id={`lp-${profile.id}`} style={{ margin: 0 }}>
            {profile.nickname}
          </h2>
          <p className="small muted" style={{ margin: 0 }}>
            {t('dash.grade', { n: profile.grade })}
            {last ? ` · ${t('parent.lastActive', { date: date(last) })}` : ''} · {t('parent.attempts', { n: attempts.length })} ·{' '}
            {t('parent.assisted', { n: attempts.filter((a) => a.hintsUsed > 0).length })}
          </p>
        </div>
      </div>

      <h3>{t('parent.evidence')}</h3>
      <div className="table-wrap">
        <table>
          <tbody>
            {LESSONS.filter(isPlayable).map((l) => {
              const p = progress.find((x) => x.lessonId === l.id);
              const ev = lessonEvidence(l, attempts, p);
              const best = ev.best;
              const rv = reviewStatus(l.id, ev.masteredAt, attempts, now);
              const lastReview = reviewSessions(attempts, l.id).at(-1);
              return (
                <tr key={l.id}>
                  <td style={{ width: '40%' }}>
                    <strong lang="en">{l.title}</strong>
                    <br />
                    <span className="small muted">{t(`subject.${l.subjectId}` as MessageKey)}</span>
                  </td>
                  <td>
                    <MasteryTag state={ev.state} />
                    <div className="small">
                      {best ? t('parent.evidenceShort', { p: best.practiceIndependent, c: best.challengeIndependent }) : t('parent.notStarted')}
                      {ev.masteredAt && ` · ${t('parent.masteredOn', { date: date(ev.masteredAt) })}`}
                      {lastReview && ` · ${t('parent.reviewedOn', { date: date(lastReview.at) })}`}
                      {rv?.isDue && ` · 🔁 ${t('review.due')}`}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3>{t('parent.nextSteps')}</h3>
      {recLesson ? (
        <>
          <p style={{ margin: 0 }}>
            <strong lang="en">{recLesson.title}</strong> — <span lang="en">{rec.reason}</span>
          </p>
          <p className="small">
            🏡 {t('chapter.offline')}: <span lang="en">{recLesson.offlineActivity}</span>
          </p>
        </>
      ) : (
        <p>{t('dash.allDone')}</p>
      )}

      <details>
        <summary>{t('parent.placement')}</summary>
        <p className="small muted">{t('parent.placementHelp')}</p>
        <div className="grid">
          {SUBJECTS.map((sub) => {
            const cur = profile.placements[sub.id];
            return (
              <div className="field" key={sub.id}>
                <label htmlFor={`pl-${profile.id}-${sub.id}`}>{t(`subject.${sub.id}` as MessageKey)}</label>
                <select
                  id={`pl-${profile.id}-${sub.id}`}
                  value={cur ? levelKey(cur) : ''}
                  onChange={async (e) => {
                    const to = levelsFor(sub.id).find((l) => levelKey(l) === e.target.value);
                    if (to) {
                      await store.setPlacement(profile.id, sub.id as SubjectId, to);
                      onMessage(t('parent.placementChanged'));
                    }
                  }}
                >
                  {levelsFor(sub.id).map((l) => (
                    <option key={levelKey(l)} value={levelKey(l)}>
                      {levelLabel(l)}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
        {profile.placementHistory.some((h) => h.by === 'parent') && (
          <>
            <h4>{t('parent.history')}</h4>
            <ul className="small">
              {profile.placementHistory
                .filter((h) => h.by === 'parent')
                .map((h, i) => (
                  <li key={i}>
                    {date(h.at)}: {t(`subject.${h.subjectId}` as MessageKey)} {h.from ? levelLabel(h.from) : '—'} → {levelLabel(h.to)}
                  </li>
                ))}
            </ul>
          </>
        )}
      </details>

      <div className="row">
        <button type="button" className="btn btn-ghost" onClick={() => { setConfirm('reset'); setWord(''); }}>
          {t('parent.reset')}
        </button>
        <button type="button" className="btn btn-ghost" style={{ color: '#991b1b' }} onClick={() => { setConfirm('delete'); setWord(''); }}>
          {t('parent.delete')}
        </button>
      </div>
      {confirm && (
        <div className="notice notice-danger" role="alertdialog" aria-labelledby={`cf-${profile.id}`}>
          <div className="stack" style={{ width: '100%' }}>
            <p id={`cf-${profile.id}`} style={{ margin: 0 }}>
              {confirm === 'reset' ? t('parent.resetConfirm', { name: profile.nickname }) : t('parent.deleteConfirm', { name: profile.nickname })}
            </p>
            <div className="field">
              <label htmlFor={`cw-${profile.id}`}>{t('parent.confirmWord')}</label>
              <input id={`cw-${profile.id}`} type="text" value={word} onChange={(e) => setWord(e.target.value)} autoFocus style={{ maxWidth: 200 }} />
            </div>
            <div className="row">
              <button type="button" className="btn btn-danger" disabled={word !== (confirm === 'reset' ? 'RESET' : 'DELETE')} onClick={() => void doConfirm()}>
                {t('parent.confirm')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirm(null)}>
                {t('parent.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
