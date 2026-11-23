import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useResource } from '../hooks';
import OriginalMarkup, { interpolate } from '../original/OriginalMarkup';
import useOriginalPage from '../original/useOriginalPage';
import NotFound from './NotFound';
import sceneTemplate from '../original/scene.html?raw';
import sceneCss from '../original/styles/scene.css?raw';
const appName = 'Radhe Shyam Salopanthula';
const appTitle = 'Radhe Shyam Salopanthula - PhD Scholar @ IIIT Hyderabad';
const dateLabel = value => value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
function Footer() { return <h4 className="footer mt-5">Developed By{' '}<a rel="noopener" href="https://github.com/imradhe" target="_blank" style={{ textDecoration: 'none' }}>Radhe Shyam Salopanthula</a></h4>; }
function Metadata({ post }) { return <>{post.date && <><time dateTime={new Date(post.date).toISOString().slice(0, 10)}>{dateLabel(post.date)}</time> · </>}{post.read_minutes} min read{post.tags.map(tag => <span className="badge bg-light text-dark border ms-1" key={tag}>{tag}</span>)}</>; }
export function BlogIndex() {
  const resource = useResource('/posts');
  useOriginalPage({ title: `Blog | ${appName}` });
  return <div className="d-flex justify-content-center"><main className="px-3 py-4 w-100" style={{ maxWidth: '800px' }}><a href="/" className="text-decoration-none small">← {appName}</a><h1 className="h2 fw-bolder mt-3 mb-4">Blog</h1>{resource.error && <p className="text-danger" role="alert">{resource.error.message}</p>}{resource.data?.length === 0 && <p className="text-muted">No posts yet. Check back soon.</p>}{resource.data?.map(post => <article className="mb-4 pb-3 border-bottom" key={post.slug}><h2 className="h5 fw-bold mb-1"><a href={`/blog/${post.slug}`} className="text-decoration-none">{post.title}</a></h2><div className="small text-muted mb-2"><Metadata post={post}/></div>{post.description && <p className="mb-0">{post.description}</p>}</article>)}<Footer/></main></div>;
}
export function BlogPost() {
  const { slug } = useParams(); const resource = useResource(`/posts/${encodeURIComponent(slug)}`); const post = resource.data;
  useOriginalPage({ title: post ? `${post.title} | Blog | ${appName}` : `Blog | ${appName}` });
  if (resource.error?.status === 404) return <NotFound/>;
  return <div className="d-flex justify-content-center"><main className="px-3 py-4 w-100" style={{ maxWidth: '800px' }}><a href="/blog" className="text-decoration-none small">← Blog</a>{post && <article className="mt-3"><h1 className="h2 fw-bolder mb-2">{post.title}</h1><div className="small text-muted mb-4"><Metadata post={post}/></div><div id="post-body" style={{ whiteSpace: 'normal' }}><OriginalMarkup html={post.html}/></div></article>}{resource.error && <p role="alert">{resource.error.message}</p>}<Footer/></main></div>;
}
function roman(number) { const values = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let result = ''; for (const [value, text] of values) while (number >= value) { result += text; number -= value; } return result; }
export function Scene() {
  const { slug } = useParams(); const resource = useResource(`/scenes/${encodeURIComponent(slug)}`); const scene = resource.data;
  const [dark, setDark] = useState(false); const [themeTouched, setThemeTouched] = useState(false); const [speaking, setSpeaking] = useState('idle'); const [copied, setCopied] = useState(false);
  useOriginalPage({ styles: ['/assets/bootstrap/css/bootstrap.min.css', '/assets/bootstrap/icons/icons.css', '/assets/css/app.css'], css: sceneCss, bodyClass: `light${dark ? ' dark' : ''}`, title: scene ? `${scene.title} - ${scene.story.title}` : appTitle });
  useEffect(() => () => window.speechSynthesis?.cancel(), [slug]);
  if (resource.error?.status === 404) return <NotFound/>;
  if (!scene) return resource.error ? <p role="alert">{resource.error.message}</p> : null;
  const html = interpolate(sceneTemplate, { title: scene.title, storyTitle: scene.story.title, storyID: scene.storyID, chapter: scene.chapterNumber, act: roman(scene.actNumber), content: scene.content, url: window.location.href }, ['content']);
  function listen() {
    if (!('speechSynthesis' in window)) { window.alert('Text to Speech not available'); return; }
    window.speechSynthesis.cancel(); const message = new SpeechSynthesisUtterance(document.querySelector('.content').innerText); const voice = window.speechSynthesis.getVoices()[1]; if (voice) message.voice = voice;
    message.onstart = () => setSpeaking('playing'); message.onend = () => setSpeaking('idle'); message.onerror = () => setSpeaking('idle'); window.speechSynthesis.speak(message);
  }
  return <OriginalMarkup html={html} replace={(node, render) => {
    const attrs = node.attribs;
    if (node.name === 'img') return render(undefined, { className: attrs.class?.includes('img-fluid') ? attrs.class : `${attrs.class || ''} img-fluid` });
    if (attrs.id === 'date') { const d = new Date(scene.createdDate); return render(d.toLocaleString('default', { month: 'short' }) + ' ' + d.getDate() + ', ' + d.getFullYear()); }
    if (attrs.id === 'words') { const words = scene.content.replace(/<[^>]+>/g, ' ').match(/\b[-?(\w+)?]+\b/gi)?.length || 0; return render(`${Math.ceil(words / 183)} mins read`); }
    if (attrs.class?.includes('btn-theme')) return render(<i className={dark ? 'bi bi-sun-fill text-dark fs-4' : `bi bi-moon-fill text-white ${themeTouched ? 'fs-4' : 'fs-6'}`}/>, { className: `btn ${dark ? 'btn-light light' : 'btn-dark'} btn-theme position-fixed`, onClick: () => { setDark(!dark); setThemeTouched(true); } });
    if (attrs.class?.startsWith('title ')) return render(undefined, { className: attrs.class.replace('bg-white', dark ? 'bg-black' : 'bg-white') });
    if (attrs.id === 'play') return render(undefined, { className: `btn-play${speaking !== 'idle' ? ' d-none' : ''} p-0 m-0 text-decoration-none`, onClick: listen });
    if (attrs.id === 'pause') return render(undefined, { className: `btn-pause${speaking !== 'playing' ? ' d-none' : ''} p-0 m-0 text-decoration-none`, onClick: () => { window.speechSynthesis.pause(); setSpeaking('paused'); } });
    if (attrs.id === 'resume') return render(undefined, { className: `btn-resume${speaking !== 'paused' ? ' d-none' : ''} p-0 m-0 text-decoration-none`, onClick: () => { window.speechSynthesis.resume(); setSpeaking('playing'); } });
    if (attrs.id === 'shareUrl') return <input type="url" className="form-control" id="shareUrl" readOnly value={window.location.href}/>;
    if (attrs.id === 'copyBtn') return render(copied ? 'Copied!' : 'copy', { onClick: async () => { try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1000); } catch {} } });
  }}/>;
}
