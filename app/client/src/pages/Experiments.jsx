import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { marked } from 'marked';
import { api } from '../api';
import { useResource } from '../hooks';
import OriginalMarkup, { escapeHtml } from '../original/OriginalMarkup';
import useOriginalPage, { loadScript } from '../original/useOriginalPage';
import speechTemplate from '../original/speech.html?raw';
import speechCss from '../original/styles/speech.css?raw';
import chatTemplate from '../original/chat.html?raw';
import chatCss from '../original/styles/chat.css?raw';
import thoughtIcon from '../original/chat-thought-icon.html?raw';
import markerTemplate from '../original/marker.html?raw';
export function SpeechToText() {
  const [transcript, setTranscript] = useState(''); const [url, setUrl] = useState(''); const [busy, setBusy] = useState(false);
  useOriginalPage({ styles: [], css: speechCss, bodyClass: '', title: 'Speech to Text' });
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  async function submit(event) {
    event.preventDefault(); const form = event.currentTarget; const file = form.elements.audio.files[0];
    if (!file) { window.alert('Please select an audio file.'); return; }
    let context; setBusy(true);
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('Choose an audio file smaller than 10 MB.');
      const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
      setUrl(URL.createObjectURL(file)); context = new AudioContext();
      const decoded = await context.decodeAudioData(await file.arrayBuffer());
      const result = await api('/transcribe', { method: 'POST', body: { language: form.elements.language.value, audioContent: dataUrl.split(',')[1], audioFormat: file.name.toLowerCase().endsWith('.mp3') ? 'mp3' : 'wav', samplingRate: decoded.sampleRate } });
      const words = result.transcript.split(' '); const lines = []; for (let i = 0; i < words.length; i += 8) lines.push(words.slice(i, i + 8).join(' ')); setTranscript(lines.join('\n') + '\n');
    } catch (error) { console.error(error.message); setTranscript(error.message); }
    finally { await context?.close(); setBusy(false); }
  }
  return <OriginalMarkup html={speechTemplate} replace={(node, render) => {
    const { id } = node.attribs;
    if (id === 'speechToTextForm') return render(undefined, { onSubmit: submit });
    if (node.attribs.type === 'submit') return <input type="submit" value="Convert to Text" disabled={busy}/>;
    if (id === 'audioPlayerContainer') return render(undefined, { style: { display: url ? 'block' : 'none' } });
    if (id === 'audioPlayer') return <audio controls id="audioPlayer" src={url || undefined}/>;
    if (id === 'transcript') return render(transcript);
  }}/>;
}
export function SpeechDemo() {
  useOriginalPage({ styles: [], bodyClass: '', title: '' });
  // The original /balloon route was a WebSocket scratchpad with no visible UI.
  return null;
}
export function Call() {
  const [params] = useSearchParams(); const phone = (params.get('phone') || '').replace(/[^0-9+]/g, '');
  useOriginalPage({ styles: [], bodyClass: '', title: '' });
  useEffect(() => { if (phone) window.location.href = `tel:${phone}`; }, [phone]);
  return phone ? null : <>No phone number provided.</>;
}
export function ArchivedChat() {
  const resource = useResource('/chats'); const [sidebarOpen, setSidebarOpen] = useState(false);
  const thoughtTimes = useMemo(() => resource.data?.chats[0]?.messages.map(() => Math.floor(Math.random() * 30) + 5) || [], [resource.data]);
  useOriginalPage({ styles: ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css', 'https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css'], css: chatCss, bodyClass: '', title: "Deepseek or deepfake? China's Yet Another case of Copy to Cope" });
  useEffect(() => { loadScript('/assets/bootstrap/js/bootstrap.bundle.min.js').catch(() => {}); }, []);
  const chat = resource.data?.chats[0];
  return <OriginalMarkup html={chatTemplate} replace={(node, render) => {
    const attrs = node.attribs;
    if (attrs.class?.includes('sidebar-toggle')) return render(undefined, { onClick: () => setSidebarOpen(!sidebarOpen) });
    if (attrs.id === 'sidebar') return render(undefined, { className: attrs.class + (sidebarOpen ? ' open' : '') });
    if (attrs.id === 'chat-title') return render(chat?.title || '');
    if (attrs.id === 'chat-content') return render(chat?.messages.map((msg, index) => {
      const thought = msg.message.match(/<thinking>([\s\S]*?)<\/thinking>/); const isUser = msg.entity === 'User';
      const html = `<div class='chat-message my-3 ${isUser ? 'user-message' : 'bg-dark'}'><strong class='message-entity'>${escapeHtml(msg.entity)}</strong>${thought ? `<div><button class="btn btn-secondary btn-sm my-2 toggle-thought collapse show d-flex justify-content-center align-items-center" data-bs-toggle="collapse" data-bs-target="#thought${index}">${thoughtIcon} Thought for ${thoughtTimes[index]} seconds <i class="ms-2 bi bi-chevron-down"></i></button></div><div class='collapse show' id='thought${index}'><blockquote class='bg-dark border-start px-2 mt-2'>${marked.parse(thought[1])}</blockquote></div>` : ''}<p>${marked.parse(msg.message.replace(/<thinking>[\s\S]*?<\/thinking>/, ''))}</p></div>${!isUser ? '<div class="message-actions"><button class="btn btn-dark btn-sm"><i class="bi bi-clipboard"></i></button> <button class="btn btn-dark btn-sm"><i class="bi bi-arrow-repeat"></i></button> <button class="btn btn-dark btn-sm"><i class="bi bi-hand-thumbs-up"></i></button> <button class="btn btn-dark btn-sm"><i class="bi bi-hand-thumbs-down"></i></button></div>' : ''}`;
      return <OriginalMarkup key={index} html={html}/>;
    }));
  }}/>;
}
export function MarkerDemo() {
  useOriginalPage({ styles: [], bodyClass: '', bodyStyle: 'margin: 0; overflow: hidden;', title: 'AR Video on Image Target' });
  useEffect(() => {
    loadScript('https://aframe.io/releases/1.2.0/aframe.min.js').then(() => loadScript('https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js')).catch(() => {});
    return () => { document.querySelectorAll('video').forEach(video => video.srcObject?.getTracks?.().forEach(track => track.stop())); };
  }, []);
  return <OriginalMarkup html={markerTemplate}/>;
}
