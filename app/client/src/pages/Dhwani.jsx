import { useEffect, useRef, useState } from 'react';
import { useStoredState } from '../hooks';
import { download, PageTitle } from '../components/Common';
export function srtTime(seconds) {
  const ms = Math.max(0, Math.round(seconds * 1000));
  return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
}
export function toSrt(lines, duration = 0) {
  const timed = lines.filter(l => Number.isFinite(l.start));
  return timed.map((line, i) => `${i + 1}\n${srtTime(line.start)} --> ${srtTime(Math.max(line.start + 0.001, timed[i + 1]?.start ?? (duration > line.start ? duration : line.start + 3)))}\n${line.line}\n`).join('\n');
}
function legacyDraft() {
  try { return { transcript: localStorage.getItem('transcript') || '', url: localStorage.getItem('audioUrl') || '', lines: JSON.parse(localStorage.getItem('lines') || '[]') }; }
  catch { return { transcript: '', url: '', lines: [] }; }
}
export default function Dhwani() {
  const [draft, setDraft] = useStoredState('imradhe:dhwani', legacyDraft());
  const [fileUrl, setFileUrl] = useState(''); const [current, setCurrent] = useState(0); const [error, setError] = useState('');
  const audio = useRef(null); const [syncing, setSyncing] = useState(false);
  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);
  useEffect(() => {
    function key(event) { if (event.shiftKey && event.code === 'Space' && audio.current?.src) { event.preventDefault(); if (audio.current.paused) audio.current.play().catch(() => setError('Unable to play audio.')); else audio.current.pause(); } }
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, []);
  function updateLine(index, start) { setDraft(d => ({ ...d, lines: d.lines.map((l, i) => i === index ? { ...l, start } : l) })); }
  const source = fileUrl || (/^(https?:\/\/|\/)/.test(draft.url) ? draft.url : '');
  const ordered = draft.lines.filter(l => Number.isFinite(l.start));
  const invalidOrder = ordered.some((l, i) => i > 0 && l.start <= ordered[i - 1].start);
  return <><PageTitle title="Dhwani"/><p className="eyebrow">Audio · Text · Alignment</p><h1>Dhwani</h1><p className="lead">Synchronize a transcript with audio and export subtitles.</p><div className="card"><label>Audio URL<input type="url" value={draft.url} onChange={e => { setDraft(d => ({ ...d, url: e.target.value })); setFileUrl(''); }} placeholder="https://example.com/audio.wav"/></label><label>Or choose an audio file<input type="file" accept="audio/*" onChange={e => { if (e.target.files[0]) setFileUrl(URL.createObjectURL(e.target.files[0])); }}/></label><audio ref={audio} controls src={source || undefined} onTimeUpdate={e => setCurrent(e.currentTarget.currentTime)} onError={() => setError('This audio could not be loaded. Check the URL or choose another file.')}/><p className="muted">Shift + Space toggles playback. Your draft is saved in this browser.</p><label>Transcript (one line per subtitle)<textarea className="large" value={draft.transcript} onChange={e => setDraft(d => ({ ...d, transcript: e.target.value }))}/></label><button disabled={!draft.transcript.trim()} onClick={() => { setDraft(d => ({ ...d, lines: d.transcript.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map((line, id) => ({ id, line, start: null })) })); setSyncing(true); setError(''); }}>Prepare alignment</button></div>
    {(syncing || draft.lines.length > 0) && <><h2>Align lines</h2><p>Play the audio, then mark each line at its starting time.</p><ol className="alignment">{draft.lines.map((line, i) => <li key={i} className={Number.isFinite(line.start) && current >= line.start && current < (draft.lines[i + 1]?.start ?? Infinity) ? 'active' : ''}><p>{line.line}</p><div className="actions"><output>{Number.isFinite(line.start) ? `${line.start.toFixed(2)}s` : 'Not timed'}</output><button disabled={!source} onClick={() => updateLine(i, Number((audio.current?.currentTime || 0).toFixed(3)))}>Mark time</button><button className="secondary" disabled={!Number.isFinite(line.start)} onClick={() => { audio.current.currentTime = line.start; audio.current.play().catch(() => setError('Choose playable audio first.')); }}>Play line</button><button className="secondary" disabled={!Number.isFinite(line.start)} onClick={() => updateLine(i, Math.max(0, Number((line.start - 0.1).toFixed(3))))}>− 0.1s</button><button className="secondary" disabled={!Number.isFinite(line.start)} onClick={() => updateLine(i, Number((line.start + 0.1).toFixed(3)))}>+ 0.1s</button><button className="secondary" onClick={() => updateLine(i, null)}>Clear time</button></div></li>)}</ol>{invalidOrder && <p className="error" role="alert">Start times must increase from one timed line to the next.</p>}<div className="actions"><button onClick={() => download('lines.json', JSON.stringify(draft.lines, null, 2))}>Download JSON</button><button disabled={!ordered.length || invalidOrder} onClick={() => download('subtitles.srt', toSrt(draft.lines, audio.current.duration), 'application/x-subrip')}>Download SRT</button><button className="secondary" onClick={() => setDraft(d => ({ ...d, lines: d.lines.map(l => ({ ...l, start: null })) }))}>Reset timing</button></div></>}
    {error && <p className="error" role="alert">{error}</p>}<p><button className="secondary" onClick={() => { if (window.confirm('Clear this alignment draft?')) { audio.current.pause(); setDraft({ transcript: '', url: '', lines: [] }); setFileUrl(''); setSyncing(false); setError(''); } }}>Clear draft</button></p></>;
}
