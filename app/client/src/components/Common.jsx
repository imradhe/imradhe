import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
export function Markdown({ children }) { return <div className="prose"><ReactMarkdown>{children || ''}</ReactMarkdown></div>; }
export function Resource({ resource, children }) {
  if (resource.loading) return <p role="status">Loading…</p>;
  if (resource.error) return <div role="alert" className="notice"><h2>{resource.error.status === 404 ? 'Page not found' : 'Unable to load this page'}</h2><p>{resource.error.message}</p><button onClick={resource.reload}>Try again</button> <Link to="/">Back home</Link></div>;
  return children(resource.data);
}
export function ShareButton() {
  const [label, setLabel] = useState('Share');
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: document.title, url: location.href });
      else { await navigator.clipboard.writeText(location.href); setLabel('Link copied'); }
    } catch (error) { if (error.name !== 'AbortError') setLabel('Copy the address from your browser'); }
  }
  return <button className="secondary" onClick={share}>{label}</button>;
}
export function Listen({ html }) {
  const [state, setState] = useState('idle');
  const utterance = useRef(null);
  useEffect(() => () => window.speechSynthesis?.cancel(), [html]);
  if (!('speechSynthesis' in window)) return <p className="muted">Read aloud is unavailable in this browser.</p>;
  function play() {
    const element = document.createElement('div'); element.innerHTML = html;
    const message = new SpeechSynthesisUtterance(element.textContent);
    message.onend = () => setState('idle'); message.onerror = () => setState('idle');
    utterance.current = message;
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(message); setState('playing');
  }
  return <div className="actions">
    {state === 'idle' ? <button onClick={play}>Listen</button> : <>
      <button onClick={() => { if (state === 'paused') window.speechSynthesis.resume(); else window.speechSynthesis.pause(); setState(state === 'paused' ? 'playing' : 'paused'); }}>{state === 'paused' ? 'Resume' : 'Pause'}</button>
      <button className="secondary" onClick={() => { window.speechSynthesis.cancel(); setState('idle'); }}>Stop</button>
    </>}
  </div>;
}
export function PageTitle({ title, description }) {
  useEffect(() => {
    document.title = `${title} · Radhe Shyam`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = description || `${title} by Radhe Shyam Salopanthula`;
  }, [title, description]);
  return null;
}
export const dateLabel = value => value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
export function download(name, data, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
