import { useEffect, useRef, useState } from 'react';
import { download } from '../components/Common';
import OriginalMarkup from '../original/OriginalMarkup';
import useOriginalPage from '../original/useOriginalPage';
import template from '../original/dhwani.html?raw';
import css from '../original/styles/dhwani.css?raw';
import baseCss from '../original/styles/dhwani-base.css?raw';
export function srtTime(seconds) { const ms = Math.max(0, Math.round(seconds * 1000)); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; }
export function toSrt(lines, duration = 0) { const timed = lines.filter(l => Number.isFinite(l.start)); return timed.map((line, i) => `${i + 1}\n${srtTime(line.start)} --> ${srtTime(Math.max(line.start + 0.001, timed[i + 1]?.start ?? (duration > line.start ? duration : line.start + 3)))}\n${line.line}\n`).join('\n'); }
function time(value) { if (!Number.isFinite(value)) return '- -:- -:- -'; const mins = Math.floor(value / 60), secs = Math.floor(value % 60), ms = Math.round((value - Math.floor(value)) * 100); return [mins, secs, ms].map(n => String(n).padStart(2, '0')).join(':'); }
export default function Dhwani() {
  const [transcript, setTranscript] = useState(() => localStorage.getItem('transcript') || ''); const [url, setUrl] = useState(() => localStorage.getItem('audioUrl') || ''); const [source, setSource] = useState(url);
  const [lines, setLines] = useState(() => { try { return JSON.parse(localStorage.getItem('lines') || '[]'); } catch { return []; } });
  const [sync, setSync] = useState(false); const [current, setCurrent] = useState(0); const audio = useRef(null);
  const [small, setSmall] = useState(() => window.innerWidth <= 991);
  useOriginalPage({ styles: ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css', 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css'], css: baseCss + '\n' + css, bodyClass: '', title: 'Dhwani - Text & Audio Syncing' });
  useEffect(() => { localStorage.setItem('transcript', transcript); localStorage.setItem('lines', JSON.stringify(lines)); localStorage.setItem('audioUrl', source); }, [transcript, lines, source]);
  const parseTranscript = () => transcript.split('\n').map((line, id) => ({ id, line, start: id === 0 ? 0.01 : null }));
  function update(index, start) { setLines(value => value.map((line, i) => i === index ? { ...line, start } : line)); }
  const activeIndex = lines.findIndex((line, i) => Number.isFinite(line.start) && current >= line.start && current < (lines.slice(i + 1).find(next => next.start !== null)?.start ?? Infinity));
  useEffect(() => {
    function key(event) {
      if (event.shiftKey && event.code === 'Space') { event.preventDefault(); if (audio.current.paused) audio.current.play().catch(() => {}); else audio.current.pause(); return; }
      if (!sync) return;
      if (activeIndex < 0) { if (lines.length && lines[0].start === null) { event.preventDefault(); update(0, Number(audio.current.currentTime.toFixed(2))); } return; }
      if (event.code === 'ArrowDown' && lines[activeIndex + 1]) { event.preventDefault(); update(activeIndex + 1, Number(audio.current.currentTime.toFixed(2))); }
      if (event.code === 'ArrowUp') { event.preventDefault(); update(activeIndex, null); }
      if (event.code === 'ArrowLeft') { event.preventDefault(); update(activeIndex, Math.max(0, lines[activeIndex].start - .25)); }
      if (event.code === 'ArrowRight') { event.preventDefault(); update(activeIndex, lines[activeIndex].start + .25); }
    }
    document.addEventListener('keydown', key); return () => document.removeEventListener('keydown', key);
  }, [lines, activeIndex, sync]);
  function controls(line, i) {
    const enabled = Number.isFinite(line.start); const disabled = enabled ? '' : ' disabled text-muted';
    return <div className={`row my-2 line rounded-pill mx-2${activeIndex === i ? ' active' : ''}`} id={`line${line.id}`} key={line.id}><div className="col-auto d-flex align-items-center"><a className={`link btn-reset fs-4 mx-1${disabled}`} id={`reset${line.id}`} style={{ pointerEvents: enabled ? 'auto' : 'none' }} onClick={() => update(i, null)}><i className="bi bi-x"/></a><span className="text-nowrap time">{time(line.start)}</span>{' '}<a className={`link btn-minus fs-4 mx-1${disabled}`} id={`minus${line.id}`} style={{ pointerEvents: enabled ? 'auto' : 'none' }} onClick={() => { const start = Math.max(0, line.start - .25); update(i, start); audio.current.currentTime = start; }}><i className="bi bi-dash"/></a><a className={`link btn-plus fs-4 mx-1${disabled}`} id={`plus${line.id}`} style={{ pointerEvents: enabled ? 'auto' : 'none' }} onClick={() => { if (line.start < audio.current.duration - .25) { update(i, line.start + .25); audio.current.currentTime = line.start + .25; } }}><i className="bi bi-plus"/></a><a className={`link btn-play fs-4 mx-1${disabled}`} id={`play${line.id}`} style={{ pointerEvents: enabled ? 'auto' : 'none' }} onClick={() => { audio.current.currentTime = line.start; audio.current.play().catch(() => {}); }}><i className="bi bi-play-circle-fill"/></a></div><div className="col-lg-7 col-md-5 col-sm-5"><input title="line" className="form-control" type="text" defaultValue={line.line}/></div><div className="d-none col-auto d-flex"><a className="link btn-add fs-4 mx-1" id={`add${line.id}`}><i className="bi bi-plus-circle"/></a><a className="link btn-delete fs-4 mx-1 text-danger" id={`delete${line.id}`}><i className="bi bi-trash"/></a></div></div>;
  }
  return <OriginalMarkup html={template} replace={(node, render) => {
    const { id } = node.attribs;
    if (node.attribs.class === 'alert alert-warning d-none') return render(undefined, { className: `alert alert-warning${small ? '' : ' d-none'}` });
    if (node.attribs.class === 'container mt-5') return render(undefined, { style: small ? { display: 'none' } : undefined });
    if (id === 'transcript') return <textarea name="transcript" id="transcript" className="form-control" placeholder="Enter Transcript" value={transcript} onChange={e => setTranscript(e.target.value)}/>;
    if (id === 'pills-transcript-tab') return render(undefined, { className: `nav-link${!sync ? ' active' : ''}`, onClick: () => setSync(false), 'data-bs-toggle': undefined });
    if (id === 'pills-sync-tab') return render(undefined, { className: `nav-link${sync ? ' active' : ''}`, onClick: () => { setSync(true); if (!lines.length) setLines(parseTranscript()); }, 'data-bs-toggle': undefined });
    if (id === 'pills-transcript') return render(undefined, { className: `tab-pane${!sync ? ' show active' : ''}` });
    if (id === 'pills-sync') return render(undefined, { className: `tab-pane${sync ? ' show active' : ''}` });
    if (id === 'sync-container') return render(lines.map(controls));
    if (id === 'audio') return <audio id="audio" ref={audio} controls src={source || undefined} onTimeUpdate={e => setCurrent(e.currentTarget.currentTime)}/>;
    if (id === 'audio-url') return <input type="url" id="audio-url" className="form-control rounded-pill" placeholder="Enter audio URL" required value={url} onChange={e => setUrl(e.target.value)}/>;
    if (node.name === 'button' && node.children?.some(c => c.data?.trim() === 'Load Audio')) return render(undefined, { onClick: () => { if (source !== url) { setTranscript(''); setLines([]); } setSource(url); } });
    if (id === 'download') return render(undefined, { onClick: () => download('lines.json', JSON.stringify(lines, null, 2)) });
    if (id === 'resetSync') return render(undefined, { onClick: () => { setLines(parseTranscript()); audio.current.currentTime = 0; audio.current.play().catch(() => {}); } });
    if (id === 'reset') return render(undefined, { onClick: () => { setTranscript(''); setLines([]); setUrl(''); setSource(''); } });
  }}/>;
}
