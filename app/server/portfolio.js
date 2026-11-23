import { readFile } from 'node:fs/promises';
import { root } from './config.js';
import { Entry, Page, Profile, Entries } from './models.js';

// Per-kind field rules. Only these keys are ever written, so requests cannot inject other fields.
export const schemas = {
  education: { label: 'Education', text: { institution: [200, true], degree: [200, false], start: [50, false], end: [50, false], description: [10000, false] } },
  experience: { label: 'Experience', text: { company: [200, true], position: [200, false], start: [50, false], end: [50, false], description: [10000, false] } },
  project: { label: 'Projects', text: { title: [200, true], description: [10000, false], imageUrl: [2000, false] }, links: true, tags: true },
  publication: { label: 'Publications', text: { title: [300, true], authors: [1000, false], venue: [300, false], url: [2000, false], description: [10000, false] }, year: true }
};
export const profileKeys = ['scholar', 'linkedin', 'github', 'instagram', 'twitter'];
export const pageKeys = ['about', 'skills', 'interests'];
// Pages are plain text. The client turns it into the page markup, so no HTML is ever stored.
export const cleanPageText = value => String(value ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/[ \t]+$/gm, '').trim();

export const safeLink = value => typeof value === 'string' && value.length <= 2000 && (/^https?:\/\/[^\s]+$/.test(value) || /^\/(?!\/)[^\s]*$/.test(value) || /^assets\/[^\s]+$/.test(value));

// Returns { data } on success or { error } with a message the admin UI can show.
export function validateEntry(kind, input, { update = false } = {}) {
  const schema = schemas[kind];
  if (!schema) return { error: 'Unknown section.' };
  const source = input && typeof input === 'object' ? input : {};
  const data = {};
  for (const [key, [max, required]] of Object.entries(schema.text)) {
    const value = source[key] === undefined || source[key] === null ? '' : String(source[key]).trim();
    if (value.length > max) return { error: `${key} must be ${max} characters or fewer.` };
    if (required && !value) return { error: `${key} is required.` };
    data[key] = value;
  }
  if (data.imageUrl && !safeLink(data.imageUrl)) return { error: 'Image must be an http(s) link or a local asset path.' };
  if (data.url && !safeLink(data.url)) return { error: 'Link must be an http(s) link or a local path.' };
  if (schema.year) {
    const year = source.year === '' || source.year === undefined || source.year === null ? null : Number(source.year);
    if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2100)) return { error: 'Year must be between 1900 and 2100.' };
    data.year = year;
  }
  if (schema.tags) {
    const raw = Array.isArray(source.tags) ? source.tags : String(source.tags ?? '').split(',');
    const tags = raw.map(t => String(t).trim()).filter(Boolean);
    if (tags.length > 50 || tags.some(t => t.length > 100)) return { error: 'Use up to 50 tags of 100 characters or fewer.' };
    data.tags = tags;
  }
  if (schema.links) {
    const entries = typeof source.links === 'string' ? source.links.split('\n').map(line => line.split('|').map(s => s.trim())).filter(([label]) => label) : Object.entries(source.links ?? {});
    const links = {};
    for (const [label, url] of entries) {
      if (String(label).length > 60) return { error: 'Link labels must be 60 characters or fewer.' };
      if (!safeLink(String(url))) return { error: `Link "${label}" must be an http(s) URL.` };
      links[String(label)] = String(url);
    }
    if (Object.keys(links).length > 20) return { error: 'Use up to 20 links.' };
    data.links = links;
  }
  if (!update) data.kind = kind;
  return { data };
}

export const linksText = links => Object.entries(links || {}).map(([label, url]) => `${label} | ${url}`).join('\n');
export const validateProfile = input => {
  const source = input && typeof input === 'object' ? input : {};
  const links = {};
  for (const key of profileKeys) {
    const value = String(source[key] ?? '').trim();
    if (value && !safeLink(value)) return { error: `${key} must be an http(s) link.` };
    if (value) links[key] = value;
  }
  return { links };
};

const readJson = async file => JSON.parse(await readFile(`${root}/${file}`, 'utf8'));
// First-run import only: existing records are never overwritten, so admin edits survive re-seeding.
export async function seedPortfolio() {
  const portfolio = await readJson('data/portfolio.json');
  const counts = {};
  for (const [kind, key] of [['education', 'education'], ['experience', 'experience'], ['project', 'projects']]) {
    if (await Entry.exists({ kind })) continue;
    const items = portfolio[key] || [];
    await Entry.insertMany(items.map((item, order) => ({ kind, order, data: item })));
    counts[kind] = items.length;
  }
  if (!(await Entry.exists({ kind: 'publication' }))) counts.publication = 0;
  for (const key of pageKeys) {
    if (await Page.exists({ key })) continue;
    await Page.create({ key, text: await pageText(key) });
    counts[`page:${key}`] = 1;
  }
  if (!(await Profile.exists({ key: 'main' }))) await Profile.create({ key: 'main', links: {
    linkedin: 'https://linkedin.com/in/imradhe', github: 'https://github.com/imradhe', instagram: 'https://instagram.com/imraadhe', twitter: 'https://twitter.com/imraadhe' } });
  return counts;
}

// Public payload. Falls back to the bundled JSON when the database is unavailable.
// Bundled text, used for the first import and when the database is unavailable.
export async function pageText(key) {
  return cleanPageText(await readFile(`${root}/data/pages/${key}.txt`, 'utf8'));
}
export async function publicPortfolio(databaseReady) {
  if (!databaseReady()) {
    const portfolio = await readJson('data/portfolio.json');
    const pages = Object.fromEntries(await Promise.all(pageKeys.map(async key => [key, await pageText(key)])));
    return { education: portfolio.education, experience: portfolio.experience, projects: portfolio.projects, publications: [], pages, links: {} };
  }
  const entries = await Entry.find().sort({ order: 1, createdDate: 1 }).lean();
  const of = kind => entries.filter(e => e.kind === kind).map(e => e.data);
  const stored = Object.fromEntries((await Page.find().lean()).map(p => [p.key, p.text]));
  const pages = Object.fromEntries(await Promise.all(pageKeys.map(async key => [key, stored[key] ?? await pageText(key)])));
  const profile = await Profile.findOne({ key: 'main' }).lean();
  return { education: of('education'), experience: of('experience'), projects: of('project'), publications: of('publication'),
    pages, links: profile?.links || {} };
}
export { Entries };
