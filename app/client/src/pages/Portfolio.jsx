import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { marked } from 'marked';
import { useResource } from '../hooks';
import OriginalMarkup, { escapeHtml } from '../original/OriginalMarkup';
import useOriginalPage, { loadScript } from '../original/useOriginalPage';
import template from '../original/portfolio.html?raw';
import { pageToHtml } from '../original/pageText';
import css from '../original/styles/portfolio.css?raw';
const iconMap = { Website: 'bi-globe', GitHub: 'bi-github', Docs: 'bi-journal-text', Demo: 'bi-play-circle', Video: 'bi-youtube', 'Play Store': 'bi-google-play', 'App Store': 'bi-apple', Colab: 'bi-cpu', 'Google Colab': 'bi-cpu', 'Research Paper': 'bi-file-earmark-text', Paper: 'bi-file-earmark-text', Publication: 'bi-file-earmark-text', Slides: 'bi-sliders', ArXiv: 'bi-file-earmark-pdf', HuggingFace: 'bi-emoji-smile', Kaggle: 'bi-bar-chart', 'Semantic Scholar': 'bi-mortarboard', Spotify: 'bi-spotify' };
const capitalize = str => str ? str[0].toUpperCase() + str.slice(1).toLowerCase() : str;
function Projects({ projects }) {
  const [tag, setTag] = useState('all');
  const tags = [...new Set(projects.flatMap(project => project.tags || []))].sort();
  return <><div id="project-filters" className="mb-3 d-flex flex-wrap gap-2"><button className={`btn btn-sm ${tag === 'all' ? 'btn-dark border border-dark active' : 'btn-outline-dark border border-dark'}`} data-tag="all" onClick={() => setTag('all')}>All</button>{tags.map(value => <button key={value} className={`btn btn-sm ${tag === value ? 'btn-dark text-white active' : 'btn-outline-dark'} border border-dark`} data-tag={value} onClick={() => setTag(value)}>{value}</button>)}</div><div className="projects mb-5 pb-5">{projects.filter(project => tag === 'all' || project.tags?.includes(tag)).map(project => <OriginalMarkup key={project.title} html={`
    <div class="card mb-3 border border-1 shadow-sm position-relative" style="max-width: 768px;">
      <div class="row g-0 align-items-center justify-content-center"><div class="col-md-5"><img src="${escapeHtml(project.imageUrl.startsWith('assets/') ? '/' + project.imageUrl : project.imageUrl)}" class="img-fluid rounded-start" alt="${escapeHtml(project.title)}"></div>
      <div class="col-md-7"><div class="card-body"><h5 class="card-title text-dark">${escapeHtml(project.title)}</h5><p class="card-text text-dark">${marked.parse(project.description)}</p><div class="mt-2">${Object.entries(project.links || {}).map(([name, url]) => `<a target="_blank" href="${escapeHtml(url)}" class="btn btn-sm btn-outline-dark me-2 mb-2 d-inline-flex align-items-center"><i class="bi ${iconMap[name] || 'bi-link-45deg'} me-1"></i>${escapeHtml(name)}</a>`).join('')}</div></div></div></div></div>`}/>)}</div></>;
}
function Timeline({ section, data }) {
  if (section === 'education') return <div className="timeline education mb-5 pb-5">{data.map((item, i) => <div className="timeline-item position-relative mb-5" key={i}><div className="timeline-dot"/><div className="timeline-content ms-4"><h4 className="fw-bold mb-1">{item.institution}</h4><h6 className="mb-1">{item.start} - {capitalize(item.end)}</h6><h5 className="fw-bolder mb-1">{item.degree}</h5><div className="mb-2"><OriginalMarkup html={marked.parse(item.description)}/></div></div></div>)}</div>;
  const companies = {};
  for (const role of data) (companies[role.company] ||= []).push(role);
  return <div className="timeline experiences mb-5 pb-5">{Object.entries(companies).map(([company, roles]) => <div className="timeline-item position-relative mb-5" key={company}><div className="timeline-dot"/><div className="timeline-content ms-4"><h4 className="company fw-bold mb-1">{company}{roles.some(role => role.end.toLowerCase() === 'present') && <span className="badge bg-dark text-light rounded ms-2">Current</span>}</h4>{[...roles].sort((a, b) => new Date(b.start) - new Date(a.start)).map((role, i) => <div className="role-block mb-3" key={i}><h6 className="mb-1">{role.start} - {capitalize(role.end)}</h6><h5 className="fw-bolder mb-1">{role.position}</h5><div className="mb-2"><OriginalMarkup html={marked.parse(role.description)}/></div></div>)}</div></div>)}</div>;
}
function Contact({ contact }) {
  if (!contact || !(contact.academicEmail || contact.personalEmail || contact.phone)) return null;
  return <div className="text-center mt-4 mb-5 pb-5"><h5 className="fw-bold mb-3">Contact</h5>{contact.academicEmail && <div className="mb-1"><i className="bi bi-envelope me-2"/><a href={`mailto:${contact.academicEmail}`}>{contact.academicEmail}</a> <span className="text-muted small">(academic)</span></div>}{contact.personalEmail && <div className="mb-1"><i className="bi bi-envelope-at me-2"/><a href={`mailto:${contact.personalEmail}`}>{contact.personalEmail}</a> <span className="text-muted small">(professional)</span></div>}{contact.phone && <div><i className="bi bi-telephone me-2"/><a href={`tel:${contact.phone.replace(/[^+0-9]/g, '')}`}>{contact.phone}</a></div>}</div>;
}
function Publications({ publications, scholar }) {
  return <div className="publications mb-5 pb-5">{publications.length === 0 && <p className="text-muted">Publications will appear here.</p>}{publications.map((item, index) => <div className="mb-4 ps-3 border-start border-4" key={index}><div className="fw-bold">{item.url ? <a href={item.url} target="_blank" rel="noopener" className="text-dark text-decoration-none">{item.title}</a> : item.title}</div>{item.authors && <div className="small text-muted">{item.authors}</div>}<div className="small">{[item.venue, item.year].filter(Boolean).join(', ')}</div>{item.description && <p className="mb-0 mt-1">{item.description}</p>}</div>)}{scholar && <p className="mt-4"><a href={scholar} target="_blank" rel="noopener" className="text-decoration-none"><i className="bi bi-mortarboard me-1"/>View all publications on Google Scholar</a></p>}</div>;
}
export default function Portfolio() {
  const { pathname } = useLocation();
  const section = pathname.slice(1) || 'about';
  const resource = useResource('/portfolio');
  const [name, setName] = useState('రాధే శ్యామ్ సాళోపంతుల​ ');
  const [readMore, setReadMore] = useState(false);
  const [copied, setCopied] = useState(false);
  useOriginalPage({ css, title: `${section === 'experience' ? 'Radhe Shyam Salopanthula' : 'Radhe Shyam Salopanthula - PhD Scholar @ IIIT Hyderabad'} | ${['skills', 'projects', 'experience', 'interests'].includes(section) ? capitalize(section) : 'About'}` });
  useEffect(() => {
    let timer, cancelled = false;
    const original = 'రాధే శ్యామ్ సాళోపంతుల​ ';
    const scripts = ['romanization', 'telugu', 'devanagari', 'iast', 'tamil', 'kannada', 'malayalam', 'bengali', 'gujarati', 'gurmukhi', 'oriya'];
    let index = 0;
    loadScript('https://smruthi.in/test/assets/sanscript/sanscript.js').then(() => {
      if (cancelled) return;
      function flicker() {
        try {
          let text = window.Sanscript.t(original, 'telugu', scripts[index] === 'romanization' ? 'iast' : scripts[index]);
          if (scripts[index] === 'romanization') text = text.replace(/[āàáâãäå]/g, 'a').replace(/[īìíîï]/g, 'i').replace(/[ūùúûü]/g, 'u').replace(/[ēèéêë]/g, 'e').replace(/[ōòóôõö]/g, 'o').replace(/ṅ/g, 'ng').replace(/ṇ/g, 'n').replace(/ñ/g, 'n').replace(/t/g, 'th').replace(/ṭ/g, 't').replace(/ḍ/g, 'd').replace(/ṛ/g, 'r').replace(/ḷ/g, 'l').replace(/ś/g, 'sh').replace(/ṣ/g, 'sh').replace(/ḥ/g, 'h').replace(/ṃ/g, 'n').replace(/[^a-zA-Z\s]/g, '');
          setName(text);
        } catch { setName(original); }
        index = (index + 1) % scripts.length;
      }
      flicker(); timer = setInterval(flicker, 2000);
    }).catch(() => {});
    const active = document.querySelector('#myTab .nav-link.active'); const container = active?.closest('.nav');
    if (active && container?.scrollTo) { const navRect = container.getBoundingClientRect(); const rect = active.getBoundingClientRect(); container.scrollTo({ left: container.scrollLeft + rect.left - navRect.left + rect.width / 2 - navRect.width / 2, behavior: 'smooth' }); }
    return () => { cancelled = true; clearInterval(timer); };
  }, [section]);
  function aboutReplace(node, render) {
    if (node.attribs?.id === 'expand') return render(undefined, { className: `collapse${readMore ? ' show' : ''}` });
    if (node.name === 'a' && node.attribs['data-bs-target'] === '#expand') return render(<span style={readMore ? { display: 'none' } : undefined}>Read More</span>, { 'data-bs-toggle': undefined, 'data-bs-target': undefined, onClick: event => { event.preventDefault(); setReadMore(true); } });
  }
  const pageKey = ['skills', 'interests'].includes(section) ? section : 'about';
  let content = <OriginalMarkup html={pageToHtml(pageKey, resource.data?.pages?.[pageKey] || '')} replace={aboutReplace}/>;
  if (section === 'about') content = <>{content}<Contact contact={resource.data?.contact}/></>;
  if (section === 'publications') content = resource.data ? <Publications publications={resource.data.publications || []} scholar={resource.data.links?.scholar}/> : null;
  if (['education', 'experience', 'projects'].includes(section)) content = resource.data ? section === 'projects' ? <Projects projects={resource.data.projects}/> : <Timeline section={section} data={resource.data[section]}/> : resource.error ? <p className="text-danger" role="alert">{resource.error.message}</p> : null;
  return <OriginalMarkup html={template} replace={(node, render) => {
    const attrs = node.attribs;
    if (attrs.id === 'about-tab-pane') return render(content);
    if (node.name === 'a' && attrs['data-profile'] && resource.data) { const url = resource.data.links?.[attrs['data-profile']]; return url ? render(undefined, { href: url }) : <></>; }
    if (attrs.class?.includes('name-flicker')) return render(name);
    if (node.name === 'a' && attrs.class?.includes('nav-link')) return render(undefined, { className: attrs.class + (attrs.href === pathname ? ' active' : ''), role: 'tab', 'aria-selected': attrs.href === pathname });
    if (attrs.id === 'shareUrl') return <input type="url" className="form-control" id="shareUrl" readOnly value={window.location.href}/>;
    if (attrs.id === 'copyBtn') return render(copied ? 'Copied!' : 'copy', { onClick: async () => { try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1000); } catch {} } });
  }}/>;
}
