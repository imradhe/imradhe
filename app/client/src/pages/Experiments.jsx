import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useResource } from '../hooks';
import { Listen, Markdown, Resource, PageTitle } from '../components/Common';
const languages = { hi: 'Hindi', sa: 'Sanskrit', bn: 'Bangla', gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam', mr: 'Marathi', or: 'Odia', pa: 'Punjabi', ta: 'Tamil', te: 'Telugu', ur: 'Urdu' };
export function SpeechToText() {
  const [file, setFile] = useState(null); const [language, setLanguage] = useState('hi'); const [busy, setBusy] = useState(false); const [transcript, setTranscript] = useState(''); const [error, setError] = useState(''); const [url, setUrl] = useState('');
  useEffect(() => { if (!file) return; const objectUrl = URL.createObjectURL(file); setUrl(objectUrl); return () => URL.revokeObjectURL(objectUrl); }, [file]);
  async function submit(event) {
    event.preventDefault(); if (!file) return; setError(''); setBusy(true);
    let context;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('Choose an audio file smaller than 10 MB.');
      const format = file.name.toLowerCase().endsWith('.wav') ? 'wav' : file.name.toLowerCase().endsWith('.mp3') ? 'mp3' : '';
      if (!format) throw new Error('Choose a WAV or MP3 file.');
      const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
      context = new AudioContext();
      const decoded = await context.decodeAudioData(await file.arrayBuffer());
      const result = await api('/transcribe', { method: 'POST', body: { language, audioContent: dataUrl.split(',')[1], audioFormat: format, samplingRate: decoded.sampleRate } });
      setTranscript(result.transcript);
    } catch (e) { setError(e.message || 'Unable to read this audio.'); } finally { await context?.close(); setBusy(false); }
  }
  return <><PageTitle title="Speech to text"/><h1>Speech to text</h1><p className="lead">Transcribe WAV or MP3 audio in an Indian language.</p><form className="card editor" onSubmit={submit}><label>Language<select value={language} onChange={e => setLanguage(e.target.value)}>{Object.entries(languages).map(([id, name]) => <option value={id} key={id}>{name}</option>)}</select></label><label>Audio file<input type="file" accept=".wav,.mp3,audio/wav,audio/mpeg" required onChange={e => { setFile(e.target.files[0]); setTranscript(''); }}/></label>{url && <audio controls src={url}/>}<p className="muted">Submitting sends this audio to the configured speech recognition service.</p><button disabled={busy || !file}>{busy ? 'Transcribing…' : 'Convert to text'}</button>{error && <p className="error" role="alert">{error}</p>}</form>{transcript && <section><h2>Transcript</h2><pre className="transcript">{transcript}</pre></section>}</>;
}
export function SpeechDemo() {
  const [text, setText] = useState('Hello! Welcome to imradhe.com.');
  return <><PageTitle title="Speech synthesis"/><h1>Speech synthesis</h1><p>Try text to speech with the voices available on your device.</p><label>Text<textarea value={text} onChange={e => setText(e.target.value)} maxLength={10000}/></label><Listen html={text.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}/></>;
}
export function Call() {
  const [params] = useSearchParams(); const phone = (params.get('phone') || '').replace(/[^0-9+]/g, '');
  const [number, setNumber] = useState(phone);
  return <div className="auth card"><PageTitle title="Call"/><h1>Call</h1><label>Phone number<input type="tel" value={number} onChange={e => setNumber(e.target.value)} /></label>{/^\+?\d{3,15}$/.test(number) ? <a className="button" href={`tel:${number}`}>Call {number}</a> : <p>Enter a valid phone number.</p>}</div>;
}
export function ArchivedChat() {
  const resource = useResource('/chats'); const [selected, setSelected] = useState(0);
  return <><PageTitle title="Deepseek or deepfake?"/><h1>Deepseek or deepfake?</h1><p className="muted">Archived conversations from February 2025.</p><Resource resource={resource}>{data => <div className="chat-layout"><nav aria-label="Conversations">{data.chats.map((chat, i) => <button className={selected === i ? '' : 'secondary'} key={i} onClick={() => setSelected(i)}>{chat.title}</button>)}</nav><div>{data.chats[selected]?.messages.map((message, i) => {
    const thought = message.message.match(/<thinking>([\s\S]*?)<\/thinking>/); const body = message.message.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
    return <article className={`card message ${message.entity === 'User' ? 'user-message' : ''}`} key={i}><strong>{message.entity}</strong>{thought && <details><summary>Show reasoning</summary><Markdown>{thought[1]}</Markdown></details>}<Markdown>{body}</Markdown><button className="secondary" onClick={async e => { const button = e.currentTarget; try { await navigator.clipboard.writeText(body); button.textContent = 'Copied'; } catch { button.textContent = 'Copy unavailable'; } }}>Copy</button></article>;
  })}</div></div>}</Resource></>;
}
export function MarkerDemo() {
  const [enabled, setEnabled] = useState(false);
  const frame = useRef(null);
  return <><PageTitle title="Marker AR video"/><h1>Marker AR video</h1><p>Allow camera access, then point it at a Hiro marker to see the video. Camera AR needs HTTPS or localhost.</p><button onClick={() => setEnabled(v => !v)}>{enabled ? 'Stop camera' : 'Start camera'}</button>{enabled && <iframe ref={frame} className="marker-frame" src="/experiments/marker.html" title="Marker AR camera" allow="camera; autoplay; fullscreen"/>}</>;
}
