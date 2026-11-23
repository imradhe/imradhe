import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useResource } from '../hooks';
import { Markdown, Resource, ShareButton, PageTitle } from '../components/Common';
const tabs = ['About', 'Education', 'Skills', 'Projects', 'Experience', 'Interests'];
const skillGroups = {
  'Areas / Domains': 'Speech Synthesis (TTS), Automatic Speech Recognition (ASR), NLP, Product Development in EdTech, AR, and EventTech',
  'Programming Languages': 'Python, JavaScript, TypeScript, HTML, CSS/Sass, SQL, NoSQL, PHP, C/C++',
  'Libraries & Frameworks': 'Three.js, React, Node.js, Express, Django, Laravel, Angular, Bootstrap',
  Design: 'Figma, Photoshop, Illustrator, Canva, UI/UX',
  'Interpersonal & Cognitive Skills': 'First-Principles Thinking, Proactiveness, Deep Thinking, Efficient Problem Solving, Branding, Holistic Systems Design'
};
function Projects({ projects }) {
  const [tag, setTag] = useState('All');
  const tags = ['All', ...new Set(projects.flatMap(p => p.tags || []).sort())];
  return <><div className="filters" aria-label="Filter projects">{tags.map(t => <button key={t} className={tag === t ? '' : 'secondary'} aria-pressed={tag === t} onClick={() => setTag(t)}>{t}</button>)}</div>
    <div className="project-list">{projects.filter(p => tag === 'All' || p.tags?.includes(tag)).map(p => <article className="project card" key={p.title}>
      {p.imageUrl && <img src={p.imageUrl.startsWith('assets/') ? `/${p.imageUrl}` : p.imageUrl} alt={p.title} loading="lazy" />}
      <div><h2>{p.title}</h2><Markdown>{p.description}</Markdown><div className="actions">{Object.entries(p.links || {}).map(([name, url]) => <a className="button secondary" target="_blank" rel="noopener noreferrer" href={url} key={name}>{name}</a>)}</div></div>
    </article>)}</div></>;
}
export default function Portfolio() {
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [scriptIndex, setScriptIndex] = useState(0);
  const names = ['Radhe Shyam Salopanthula', 'రాధే శ్యామ్ సాళోపంతుల', 'राधे श्याम सालोपंतुल'];
  const section = pathname.slice(1) || 'about';
  const resource = useResource('/portfolio');
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setScriptIndex(i => (i + 1) % names.length), 4000);
    return () => clearInterval(id);
  }, []);
  return <div className="portfolio"><PageTitle title={section === 'about' ? 'Radhe Shyam Salopanthula' : section[0].toUpperCase() + section.slice(1)} />
    <div className="profile"><img className="avatar" src="/assets/img/imradhe.jpg" alt="Radhe Shyam Salopanthula" /><div><h1 className="name" aria-label={names[0]}>{names[scriptIndex]}</h1><p>PhD Scholar<br/><strong>IIIT Hyderabad</strong></p></div></div>
    <div className="socials"><a href="https://linkedin.com/in/imradhe" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="https://github.com/imradhe" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://instagram.com/imraadhe" target="_blank" rel="noopener noreferrer">Instagram</a><a href="https://twitter.com/imraadhe" target="_blank" rel="noopener noreferrer">Twitter</a><ShareButton /></div>
    <nav className="tabs" aria-label="Profile sections">{tabs.map(tab => <NavLink key={tab} end to={tab === 'About' ? '/' : `/${tab.toLowerCase()}`}>{tab}</NavLink>)}</nav>
    <section className="profile-content">
      {section === 'about' && <><blockquote>“Mighty Little Man enroute to pro”</blockquote><p><strong>PhD Researcher</strong> in <strong>Computational Linguistics</strong> at <strong>IIIT Hyderabad</strong>, working on rich speech processing and style- and context-aware speech translation for Indian languages.</p><p>Experienced in ASR, TTS, data collection, and low-resource NLP, with hands-on work at AI4Bharat, IIT Madras.</p>{expanded && <p>Also builds research-driven software tools and products at the intersection of language technology, education, and culture.</p>}<button className="text-button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Read less' : 'Read more'}</button><p className="center"><a className="button" href="/assets/docs/ImRadheResume.pdf" download>Download Resume</a></p></>}
      {section === 'skills' && Object.entries(skillGroups).map(([title, text]) => <div key={title}><h2>{title}</h2><p>{text}</p></div>)}
      {section === 'interests' && <><h2>Academic</h2><p>Knowledge Modeling, Language Modeling, Sanskrit NLP, Computational Linguistics, Speech Processing, Cultural Preservation, Philosophy & Behavioral Psychology</p><h2>Non Academic</h2><p>Chess, Carnatic Music, Singing/Songwriting, Music Production</p></>}
      {['education', 'experience', 'projects'].includes(section) && <Resource resource={resource}>{data => section === 'projects' ? <Projects projects={data.projects} /> : <div className="timeline">{data[section].map((item, i) => <article key={i}><h2>{item.institution || item.company}</h2><p className="muted">{item.start} – {item.end}</p><h3>{item.degree || item.position}</h3><Markdown>{item.description}</Markdown></article>)}</div>}</Resource>}
    </section>
  </div>;
}
