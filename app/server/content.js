import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { readFile } from 'node:fs/promises';
import { root } from './config.js';

export const validSlug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
export function cleanHtml(value) {
  return sanitizeHtml(value, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'figure', 'figcaption', 'h1', 'h2'],
    allowedAttributes: { a: ['href', 'title'], img: ['src', 'alt', 'width', 'height'], '*': ['lang'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'], allowProtocolRelative: false
  });
}
export const markdown = body => cleanHtml(marked.parse(body));
export function postJson(post, includeBody = true) {
  const p = post.toObject ? post.toObject() : post;
  const { body, ...meta } = p;
  return { ...meta, read_minutes: Math.max(1, Math.ceil(body.trim().split(/\s+/u).length / 200)), ...(includeBody ? { body, html: markdown(body) } : {}) };
}
export const portfolio = JSON.parse(await readFile(`${root}/data/portfolio.json`, 'utf8'));
export const legacyRoutes = JSON.parse(await readFile(`${root}/data/legacy-routes.json`, 'utf8'));
export const staticPages = ['/', '/education', '/skills', '/projects', '/experience', '/interests', '/blog', '/login', '/register', '/logout', '/ar', '/AR', '/ar/test', '/ar/video', '/ar/chotabheem', '/ar/ironman', '/ar/spiderman', '/ar/tomnjerry', '/ar/hulk', '/test', '/call', '/wav2vec', '/balloon', '/chess', '/streak', '/streak/new', '/dhwani', '/deepseek-or-deepfake', '/admin', '/admin/stories', '/admin/stories/new', '/admin/scenes', '/admin/scenes/new', ];
