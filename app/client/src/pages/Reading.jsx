import { Link, useParams } from 'react-router-dom';
import { useResource } from '../hooks';
import { Resource, ShareButton, Listen, dateLabel, PageTitle } from '../components/Common';
export function BlogIndex() {
  const resource = useResource('/posts');
  return <><PageTitle title="Blog"/><h1>Blog</h1><p className="lead">Notes on speech, language, and building things.</p><Resource resource={resource}>{posts => posts.length ? <div className="reading-list">{posts.map(p => <article key={p.slug} className="card"><p className="muted">{dateLabel(p.date)} · {p.read_minutes} min read</p><h2><Link to={`/blog/${p.slug}`}>{p.title}</Link></h2><p>{p.description}</p><p className="tags">{p.tags.join(' · ')}</p></article>)}</div> : <p>No posts published yet. Check back soon.</p>}</Resource></>;
}
export function BlogPost() {
  const { slug } = useParams();
  const resource = useResource(`/posts/${encodeURIComponent(slug)}`);
  return <Resource resource={resource}>{post => <article className="reader"><PageTitle title={post.title} description={post.description}/><Link to="/blog">All posts</Link><h1>{post.title}</h1><p className="muted">{dateLabel(post.date)} · {post.read_minutes} min read</p><p className="lead">{post.description}</p><div className="actions"><Listen html={post.html}/><ShareButton/></div><div className="prose" dangerouslySetInnerHTML={{ __html: post.html }}/><p className="tags">{post.tags.join(' · ')}</p></article>}</Resource>;
}
export function Stories() {
  const resource = useResource('/stories');
  return <><PageTitle title="Stories"/><h1>Stories</h1><Resource resource={resource}>{stories => <div className="reading-list">{stories.map(s => <article className="card" key={s.storyID}><h2><Link to={`/stories/${s.storyID}`}>{s.title}</Link></h2><p className="muted">{s.author} · {s.genre}</p><p>{s.description}</p></article>)}</div>}</Resource></>;
}
export function Story() {
  const { slug } = useParams(); const resource = useResource(`/stories/${encodeURIComponent(slug)}`);
  return <Resource resource={resource}>{story => <><PageTitle title={story.title}/><h1>{story.title}</h1><p>{story.description}</p><p className="muted">By {story.author}</p><div className="reading-list">{story.scenes.length ? story.scenes.map(s => <article className="card" key={s.sceneID}><p className="muted">Act {s.actNumber} · Chapter {s.chapterNumber} · Scene {s.sceneNumber}</p><h2><Link to={`/scene/${s.sceneID}`}>{s.title}</Link></h2></article>) : <p>No scenes published yet.</p>}</div></>}</Resource>;
}
export function Scene() {
  const { slug } = useParams(); const resource = useResource(`/scenes/${encodeURIComponent(slug)}`);
  return <Resource resource={resource}>{scene => <article className="reader"><PageTitle title={scene.title}/><Link to={`/stories/${scene.storyID}`}>{scene.story.title}</Link><h1>{scene.title}</h1><p className="muted">Act {scene.actNumber} · Chapter {scene.chapterNumber} · {dateLabel(scene.createdDate)} · {Math.max(1, Math.ceil(scene.content.replace(/<[^>]+>/g, ' ').split(/\s+/u).length / 183))} min read</p><div className="actions"><Listen html={scene.content}/><ShareButton/></div><div className="prose" dangerouslySetInnerHTML={{ __html: scene.content }}/></article>}</Resource>;
}
