import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { databaseReady } from './database.js';
import { config } from './config.js';
import { Story, Scene, Post, User, Log, Flag, Entry, Page, Profile, Document, genres } from './models.js';
import { schemas, validateEntry, validateProfile, cleanPageText, pageKeys, pageText, publicPortfolio, defaultContact } from './portfolio.js';
import { hashPassword, verifyPassword, startSession, requireUser, requireAdmin, requireCsrf, publicUser, endSession } from './auth.js';
import { cleanHtml, postJson, legacyRoutes, staticPages, validSlug } from './content.js';

const pick = (body, fields) => Object.fromEntries(fields.filter(k => body[k] !== undefined).map(k => [k, body[k]]));
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const envelope = data => ({ data, message: 'Successful', status: 200 });
const safeUrl = value => typeof value === 'string' && (!value || /^\/(?!\/)/.test(value) || /^https?:\/\//.test(value) || /^[a-z0-9][a-z0-9 /._-]*$/i.test(value));
const roleNames = ['annotator', 'reviewer', 'superchecker'];
const published = { draft: false };

export function createApp({ settings = config, dbRequired = true } = {}) {
  const app = express();
  app.disable('x-powered-by');
  if (settings.trustProxy) app.set('trust proxy', settings.trustProxy);
  app.use(helmet({
    contentSecurityPolicy: { directives: {
      defaultSrc: ["'self'"], scriptSrc: ["'self'", 'https://smruthi.in', 'https://cdn.ckeditor.com', 'https://stackpath.bootstrapcdn.com', 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com', 'https://cdn.datatables.net', 'https://unpkg.com', 'https://aframe.io', 'https://raw.githack.com', "'wasm-unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://stackpath.bootstrapcdn.com', 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com', 'https://cdn.datatables.net', 'https://unpkg.com'], fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'], imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      mediaSrc: ["'self'", 'blob:', 'https:'], connectSrc: ["'self'", 'blob:', 'https://cdn.aframe.io', 'https://docs.google.com'],
      workerSrc: ["'self'", 'blob:'], frameSrc: ["'self'"], objectSrc: ["'none'"],
      upgradeInsecureRequests: settings.production ? [] : null
    } }, crossOriginEmbedderPolicy: false
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '16mb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.get('/health', (_req, res) => res.type('text').send('ok'));
  app.get('/api/health', (_req, res) => res.status(databaseReady() ? 200 : 503).json({ database: databaseReady() ? 'connected' : 'unavailable' }));
  // Cross-site requests cannot use cookies to mutate data, including login/register.
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const origin = req.get('origin');
      const allowed = [new URL(settings.appUrl).origin, ...(settings.production ? [] : ['http://localhost:5173', 'http://127.0.0.1:5173'])];
      if ((origin && !allowed.includes(origin)) || req.get('sec-fetch-site') === 'cross-site') return res.status(403).json({ message: 'Cross-site request rejected.' });
      const pdfUpload = req.is('application/pdf') && /^\/admin\/documents\/(cv|resume)$/.test(req.path);
      if (!req.is('application/json') && !pdfUpload) return res.status(415).json({ message: 'Send application/json.' });
    }
    next();
  });
  app.get('/api/portfolio', async (_req, res) => res.json(await publicPortfolio(databaseReady)));
  app.get('/api/routes', (_req, res) => res.json(envelope(legacyRoutes)));
  app.get('/api/chats', async (_req, res) => res.json(JSON.parse(await readFile(path.join(settings.publicDir, 'assets/data/chat.json'), 'utf8'))));
  app.get('/api/genres', (_req, res) => res.json(genres));
  app.get('/api/test', (req, res) => res.json(Object.fromEntries(['md5', 'sha1', 'sha256', 'sha512'].map(hash => [hash, createHash(hash).update(req.ip).digest('hex')]))));
  app.get('/api/example', async (_req, res) => {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return res.status(502).json({ message: 'Example service unavailable.' });
    res.json(envelope(await response.json()));
  });
  const authLimit = rateLimit({ windowMs: 15 * 60000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false });
  const audioLimit = rateLimit({ windowMs: 60000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false });
  app.post('/api/transcribe', audioLimit, async (req, res) => {
    if (!process.env.ASR_URL) return res.status(503).json({ message: 'Speech transcription is not configured. Set ASR_URL on the server.' });
    const { language, audioContent, audioFormat, samplingRate } = req.body;
    if (!['hi', 'sa', 'bn', 'gu', 'kn', 'ml', 'mr', 'or', 'pa', 'ta', 'te', 'ur'].includes(language) || typeof audioContent !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(audioContent) || !['wav', 'mp3'].includes(audioFormat) || !Number.isInteger(samplingRate) || samplingRate < 8000 || samplingRate > 192000) return res.status(400).json({ message: 'Invalid audio or language.' });
    const response = await fetch(process.env.ASR_URL, {
      method: 'POST', signal: AbortSignal.timeout(60000),
      headers: { 'Content-Type': 'application/json', ...(process.env.ASR_TOKEN ? { Authorization: `Bearer ${process.env.ASR_TOKEN}` } : {}) },
      body: JSON.stringify({ config: { language: { sourceLanguage: language }, transcriptionFormat: { value: 'transcript' }, audioFormat, samplingRate, postProcessors: null }, audio: [{ audioContent }], controlConfig: { dataTracking: false } })
    });
    if (!response.ok) return res.status(502).json({ message: 'Speech service could not process this audio.' });
    const data = await response.json();
    if (typeof data.output?.[0]?.source !== 'string') return res.status(502).json({ message: 'Speech service returned an invalid transcript.' });
    res.json({ transcript: data.output[0].source });
  });
  if (dbRequired) app.use('/api', (_req, res, next) => {
    if (!databaseReady()) return res.status(503).json({ message: 'Database unavailable. Start MongoDB and run npm run seed.' });
    next();
  });
  const login = async (req, res) => {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || password.length > 256) return res.status(400).json({ message: 'Enter your email and password.' });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    // Run the same expensive hash even for unknown users to reduce account enumeration.
    const encoded = user?.password || `scrypt:${'0'.repeat(32)}:${'0'.repeat(128)}`;
    if (!(await verifyPassword(password, encoded)) || !user) return res.status(401).json({ message: 'Email or password is incorrect.' });
    res.json(await startSession(req, res, user));
  };
  app.post(['/api/auth/login', '/api/login'], authLimit, login);
  app.post('/api/auth/register', authLimit, async (req, res) => {
    if (!settings.registration) return res.status(403).json({ message: 'Registration is closed.' });
    const { name, email, password, phone } = req.body;
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100 || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof password !== 'string' || password.length < 6 || password.length > 256) return res.status(400).json({ message: 'Enter a name, valid email, and a password of 6–256 characters.' });
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password: await hashPassword(password), phone: typeof phone === 'string' ? phone : '', role: 'user' });
    res.status(201).json(await startSession(req, res, user));
  });
  app.get('/api/auth/me', requireUser, (req, res) => res.json({ user: publicUser(req.user), csrf: req.session.csrf }));
  app.post(['/api/auth/logout', '/api/logout'], requireUser, requireCsrf, endSession);
  app.get('/api/stories', async (_req, res) => res.json(await Story.find().sort({ createdDate: -1 }).lean()));
  app.get('/api/stories/:slug', async (req, res) => {
    const story = await Story.findOne({ storyID: req.params.slug }).lean();
    if (!story) return res.status(404).json({ message: 'Story not found.' });
    const scenes = await Scene.find({ storyID: story.storyID }).select('-content').sort({ actNumber: 1, chapterNumber: 1, sceneNumber: 1 }).lean();
    res.json({ ...story, scenes });
  });
  app.get('/api/scenes/:slug', async (req, res) => {
    const scene = await Scene.findOne({ sceneID: req.params.slug }).lean();
    if (!scene) return res.status(404).json({ message: 'Scene not found.' });
    const story = await Story.findOne({ storyID: scene.storyID }).lean();
    if (!story) return res.status(404).json({ message: 'Story not found.' });
    res.json({ ...scene, content: cleanHtml(scene.content), story });
  });
  app.get('/api/posts', async (_req, res) => res.json((await Post.find(published).sort({ date: -1, slug: 1 })).map(p => postJson(p, false))));
  app.get('/api/posts/:slug', async (req, res) => {
    const post = validSlug(req.params.slug) && await Post.findOne({ ...published, slug: req.params.slug });
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json(postJson(post));
  });
  const admin = [requireUser, requireAdmin];
  const mutation = [...admin, requireCsrf];
  // A single allowlist for each resource prevents role changes and MongoDB operator injection.
  for (const [name, Model, id, fields] of [
    ['stories', Story, 'storyID', ['storyID', 'title', 'author', 'genre', 'cover', 'description', 'tags']],
    ['scenes', Scene, 'sceneID', ['title', 'storyID', 'actNumber', 'chapterNumber', 'sceneNumber', 'content']],
    ['posts', Post, 'slug', ['slug', 'title', 'description', 'date', 'tags', 'draft', 'highlight', 'body']]
  ]) {
    app.get(`/api/admin/${name}`, ...admin, async (_req, res) => res.json(await Model.find().sort({ createdDate: -1 }).lean()));
    app.get(`/api/admin/${name}/:slug`, ...admin, async (req, res) => {
      const item = await Model.findOne({ [id]: req.params.slug }).lean();
      if (!item) return res.status(404).json({ message: 'Record not found.' });
      res.json(item);
    });
    async function validateData(req, res, update) {
      const data = pick(req.body, fields);
      if (Object.values(data).some(v => v !== null && typeof v === 'object' && !Array.isArray(v))) {
        res.status(400).json({ message: 'Fields must contain text, numbers, booleans, or arrays of tags.' }); return;
      }
      if (data.tags !== undefined && (!Array.isArray(data.tags) || data.tags.length > 50 || data.tags.some(t => typeof t !== 'string'))) {
        res.status(400).json({ message: 'Tags must be an array of up to 50 strings.' }); return;
      }
      if (data.cover !== undefined && !safeUrl(data.cover)) { res.status(400).json({ message: 'Cover must be an HTTP(S) URL or a local asset path.' }); return; }
      if (name === 'scenes') {
        if (!update || ['storyID', 'actNumber', 'chapterNumber', 'sceneNumber'].some(k => k in data)) {
          if (!validSlug(data.storyID) || !await Story.exists({ storyID: data.storyID })) { res.status(400).json({ message: 'Choose an existing story.' }); return; }
          for (const field of ['actNumber', 'chapterNumber', 'sceneNumber']) {
            if (!Number.isInteger(Number(data[field])) || Number(data[field]) < 0 || Number(data[field]) > 9999) { res.status(400).json({ message: 'Scene numbers must be integers between 0 and 9999.' }); return; }
            data[field] = Number(data[field]);
          }
          data.sceneID = `${data.storyID}-${data.actNumber}-${data.chapterNumber}-${data.sceneNumber}`;
        }
        if (typeof data.content === 'string') data.content = cleanHtml(data.content);
      }
      if (name === 'posts' && 'highlight' in data) data.highlight = data.highlight === true || data.highlight === 'true' || data.highlight === 'on';
      if (update && name !== 'scenes') delete data[id];
      return data;
    }
    app.post(`/api/admin/${name}`, ...mutation, async (req, res) => {
      const data = await validateData(req, res, false); if (!data) return;
      const item = await Model.create(data);
      if (name === 'posts' && item.highlight && !item.draft) await Post.updateMany({ slug: { $ne: item.slug } }, { $set: { highlight: false } });
      res.status(201).json(item);
    });
    app.put(`/api/admin/${name}/:slug`, ...mutation, async (req, res) => {
      const data = await validateData(req, res, true); if (!data) return;
      const item = await Model.findOneAndUpdate({ [id]: req.params.slug }, { $set: data }, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ message: 'Record not found.' });
      // Only one published post can be the home-page highlight; choosing one clears the others. A draft waits until it is published.
      if (name === 'posts' && item.highlight && !item.draft) await Post.updateMany({ slug: { $ne: item.slug } }, { $set: { highlight: false } });
      res.json(item);
    });
    app.delete(`/api/admin/${name}/:slug`, ...mutation, async (req, res) => {
      if (name === 'stories' && await Scene.exists({ storyID: req.params.slug })) return res.status(409).json({ message: 'Delete the story’s scenes before deleting the story.' });
      const result = await Model.findOneAndDelete({ [id]: req.params.slug });
      if (!result) return res.status(404).json({ message: 'Record not found.' });
      res.json({ message: 'Deleted.' });
    });
  }
  // Portfolio sections: one collection with a per-kind allowlist; pages and profile links are singletons.
  // Admin responses are flat (fields at the top level, plus _id, kind and order) to match the forms.
  const flatEntry = e => ({ _id: e._id, kind: e.kind, order: e.order, ...e.data });
  app.get('/api/admin/entries', ...admin, async (req, res) => {
    const kind = String(req.query.kind || '');
    if (!schemas[kind]) return res.status(400).json({ message: 'Unknown section.' });
    res.json((await Entry.find({ kind }).sort({ order: 1, createdDate: 1 }).lean()).map(flatEntry));
  });
  app.post('/api/admin/entries', ...mutation, async (req, res) => {
    const { data, error } = validateEntry(req.body?.kind, req.body?.data ?? req.body);
    if (error) return res.status(400).json({ message: error });
    const count = await Entry.countDocuments({ kind: data.kind });
    const { kind, ...fields } = data;
    const entry = await Entry.create({ kind, data: fields, order: Number.isInteger(req.body.order) ? req.body.order : count });
    res.status(201).json(flatEntry(entry.toObject()));
  });
  app.put('/api/admin/entries/:id', ...mutation, async (req, res) => {
    const current = await Entry.findById(req.params.id).lean().catch(() => null);
    if (!current) return res.status(404).json({ message: 'Record not found.' });
    // Validate the merged record, so a reorder-only request (or a partial edit) cannot blank required fields.
    const { data, error } = validateEntry(current.kind, { ...current.data, ...(req.body?.data ?? {}) }, { update: true });
    if (error) return res.status(400).json({ message: error });
    const { kind, ...fields } = data;
    const update = { data: fields, ...(Number.isInteger(req.body.order) ? { order: req.body.order } : {}) };
    res.json(flatEntry((await Entry.findByIdAndUpdate(req.params.id, { $set: update }, { new: true })).toObject()));
  });
  app.delete('/api/admin/entries/:id', ...mutation, async (req, res) => {
    const result = await Entry.findByIdAndDelete(req.params.id).catch(() => null);
    if (!result) return res.status(404).json({ message: 'Record not found.' });
    res.json({ message: 'Deleted.' });
  });
  // CV and Resume PDFs. Uploads are raw PDF bytes (checked for the %PDF header and a 10 MB limit).
  app.get('/api/admin/documents', ...admin, async (_req, res) => {
    const stored = Object.fromEntries((await Document.find({}, { data: 0 }).lean()).map(d => [d.key, d]));
    res.json(['cv', 'resume'].map(key => ({ key, uploaded: Boolean(stored[key]), filename: stored[key]?.filename || '', size: stored[key]?.size || 0, updatedAt: stored[key]?.updatedAt || null })));
  });
  app.put('/api/admin/documents/:key', ...mutation, express.raw({ type: 'application/pdf', limit: '10mb' }), async (req, res) => {
    if (!['cv', 'resume'].includes(req.params.key)) return res.status(404).json({ message: 'Unknown document.' });
    const data = req.body;
    if (!Buffer.isBuffer(data) || data.length < 100 || data.subarray(0, 5).toString('latin1') !== '%PDF-') return res.status(400).json({ message: 'Upload a PDF file (up to 10 MB).' });
    const filename = `${req.params.key === 'cv' ? 'Radhe-Shyam-CV' : 'Radhe-Shyam-Resume'}.pdf`;
    await Document.findOneAndUpdate({ key: req.params.key }, { $set: { filename, size: data.length, data } }, { upsert: true });
    res.json({ key: req.params.key, filename, size: data.length });
  });
  app.delete('/api/admin/documents/:key', ...mutation, async (req, res) => {
    if (!['cv', 'resume'].includes(req.params.key)) return res.status(404).json({ message: 'Unknown document.' });
    await Document.deleteOne({ key: req.params.key });
    res.json({ message: 'Removed.' });
  });
  app.get('/api/admin/pages', ...admin, async (_req, res) => {
    const stored = Object.fromEntries((await Page.find().lean()).map(p => [p.key, p]));
    res.json(await Promise.all(pageKeys.map(async key => ({ key, text: stored[key]?.text ?? await pageText(key) }))));
  });
  app.put('/api/admin/pages/:key', ...mutation, async (req, res) => {
    if (!pageKeys.includes(req.params.key)) return res.status(404).json({ message: 'Unknown page.' });
    if (typeof req.body?.text !== 'string') return res.status(400).json({ message: 'Send the page text.' });
    const text = cleanPageText(req.body.text);
    if (text.length > 20000) return res.status(400).json({ message: 'Page is too long (20,000 characters maximum).' });
    res.json(await Page.findOneAndUpdate({ key: req.params.key }, { $set: { text } }, { upsert: true, new: true }));
  });
  app.get('/api/admin/profile', ...admin, async (_req, res) => {
    const profile = await Profile.findOne({ key: 'main' }).lean();
    res.json({ links: profile?.links || {}, contact: profile?.contact && Object.keys(profile.contact).length ? profile.contact : defaultContact });
  });
  app.put('/api/admin/profile', ...mutation, async (req, res) => {
    const { links, contact, error } = validateProfile(req.body);
    if (error) return res.status(400).json({ message: error });
    const saved = await Profile.findOneAndUpdate({ key: 'main' }, { $set: { links, contact } }, { upsert: true, new: true }).lean();
    res.json({ links: saved.links, contact: saved.contact });
  });
  app.get('/api/logs', ...admin, async (_req, res) => res.json(envelope(await Log.find().select('-loginID').sort({ createdAt: -1 }).limit(500).lean())));
  app.post('/api/flag', requireUser, requireCsrf, async (req, res) => {
    const data = pick(req.body, ['projectID', 'taskID', 'annotator', 'reviewer', 'superchecker', 'flag', 'segment', 'role']);
    if (Object.values(data).some(v => typeof v !== 'string')) return res.status(400).json({ message: 'Flag fields must be strings.' });
    if (req.user.role !== 'admin' && (!roleNames.includes(data.role) || data[data.role] !== req.user.email)) return res.status(403).json({ message: 'Use your own email for your flag role.' });
    const flag = await Flag.create({ ...data, createdBy: req.user._id });
    res.status(201).json({ ...envelope(flag), taskID: flag.taskID });
  });
  app.get('/api/flags', ...admin, async (_req, res) => res.json(envelope(await Flag.find().sort({ time: -1 }).limit(1000).lean())));
  for (const role of roleNames) {
    app.get(`/api/flags/${role}s`, ...admin, async (_req, res) => {
      const rows = await Flag.aggregate([{ $group: { _id: `$${role}`, flag_count: { $sum: 1 } } }, { $sort: { flag_count: -1 } }]);
      res.json(envelope(rows.map(({ _id, flag_count }) => ({ [role]: _id, flag_count }))));
    });
    app.get(`/api/flags/${role}/:email`, requireUser, async (req, res) => {
      if (req.user.role !== 'admin' && req.user.email !== req.params.email.toLowerCase()) return res.status(403).json({ message: 'Access denied.' });
      res.json(envelope(await Flag.find({ [role]: req.params.email }).limit(1000).lean()));
    });
  }
  // Latest article for the home page: the post the owner highlighted, or else the newest published post.
  app.get('/api/home/articles', async (_req, res) => {
    if (!databaseReady()) return res.json({ article: null });
    const article = await Post.findOne({ ...published, highlight: true }).sort({ date: -1 }).lean() || await Post.findOne(published).sort({ date: -1, slug: 1 }).lean();
    res.json({ article: article ? postJson(article, false) : null });
  });
  app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found.' }));
  app.get(['/aibro', '/adcast'], (req, res) => { const name = req.path.slice(1); res.redirect(302, `https://${name}.imradhe.com/${name}`); });
  app.use((req, res, next) => {
    if (req.path.length > 1 && req.path.endsWith('/')) return res.redirect(302, req.path.replace(/\/+$/, '') + req.url.slice(req.path.length));
    next();
  });
  // Serve only explicit public directories, never the project root, SQL, config or source.
  app.use('/assets/ar', express.static(settings.mediaDir, { maxAge: '1d', dotfiles: 'deny' }));
  app.use(['/experiments', '/test'], helmet.contentSecurityPolicy({ directives: { defaultSrc: ["'self'", 'https:', 'blob:', 'data:'], scriptSrc: ["'self'", 'https://smruthi.in', 'https://cdn.ckeditor.com', 'https://stackpath.bootstrapcdn.com', 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com', 'https://cdn.datatables.net', 'https://unpkg.com', 'https://aframe.io', 'https://raw.githack.com', "'unsafe-eval'"], styleSrc: ["'self'", "'unsafe-inline'"], objectSrc: ["'none'"], upgradeInsecureRequests: settings.production ? [] : null } }));
  app.use(express.static(settings.publicDir, { index: false, dotfiles: 'deny' }));
  app.use(express.static(settings.distDir, { index: false, dotfiles: 'deny' }));
  // Public download of the CV and Resume. The Resume falls back to the bundled file until one is uploaded.
  app.get('/files/:key.pdf', async (req, res) => {
    const key = req.params.key;
    if (!['cv', 'resume'].includes(key)) return res.status(404).type('text').send('Not found');
    const stored = databaseReady() ? await Document.findOne({ key }).lean() : null;
    res.set('Cache-Control', 'public, max-age=300');
    if (stored) { res.attachment(stored.filename); res.setHeader('Content-Type', 'application/pdf'); return res.send(Buffer.from(stored.data.buffer)); }
    if (key === 'resume') return res.attachment('Radhe-Shyam-Resume.pdf').sendFile(path.join(settings.publicDir, 'assets/docs/ImRadheResume.pdf'));
    res.status(404).type('text').send('Not found');
  });
  app.get('/sitemap.xml', async (_req, res) => {
    let pages = ['/', '/education', '/skills', '/projects', '/experience', '/interests', '/publications', '/blog', '/stories'];
    if (databaseReady()) {
      pages = [...pages, ...(await Post.find(published).select('slug').lean()).map(p => `/blog/${p.slug}`), ...(await Scene.find().select('sceneID').lean()).map(s => `/scene/${s.sceneID}`)];
    }
    res.type('xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p => `<url><loc>${escape(new URL(p, settings.appUrl).href)}</loc></url>`).join('')}</urlset>`);
  });
  // Admin screens that exist in the client; anything else under /admin is a real 404.
  const adminPage = /^\/admin(?:\/?$|\/(?:stories|scenes|posts)(?:\/(?:new|(?:edit|delete)\/[a-z0-9-]+))?$|\/entries\/(?:education|experience|project|publication)(?:\/new|\/edit\/[a-f0-9]{24})?$|\/profile$|\/documents$|\/pages\/(?:about|skills|interests)$)/;
  app.get('/{*path}', async (req, res) => {
    let title = 'Radhe Shyam Salopanthula';
    let description = 'PhD researcher in Computational Linguistics at IIIT Hyderabad. Speech, language technology, and research-driven products.';
    let found = staticPages.includes(req.path) || adminPage.test(req.path) || req.path === '/publications';
    const match = req.path.match(/^\/(blog|scene)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
    if (match) {
      if (!databaseReady()) return res.status(503).type('text').send('Database unavailable. Please try again shortly.');
      const [Model, field] = match[1] === 'blog' ? [Post, 'slug'] : match[1] === 'scene' ? [Scene, 'sceneID'] : [Story, 'storyID'];
      const item = await Model.findOne({ [field]: match[2], ...(match[1] === 'blog' ? published : {}) }).lean();
      found = !!item;
      if (item) { title = `${item.title} · Radhe Shyam`; description = item.description || item.title; }
    }
    if (!found) title = 'Page not found · Radhe Shyam';
    let html;
    try { html = await readFile(path.join(settings.distDir, 'index.html'), 'utf8'); }
    catch { return res.status(503).type('text').send('Client build missing. Run npm run build, or use http://localhost:5173 during development.'); }
    html = html.replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escape(description)}"/>`)
      .replace('</head>', `<link rel="canonical" href="${escape(new URL(req.path, settings.appUrl).href)}"/><meta property="og:title" content="${escape(title)}"/><meta property="og:description" content="${escape(description)}"/>${found ? '' : '<meta name="robots" content="noindex"/>'}</head>`);
    res.status(found ? 200 : 404).type('html').send(html);
  });
  app.use((err, _req, res, _next) => {
    if (err.code === 11000) return res.status(409).json({ message: 'That email or identifier is already in use.' });
    if (err.name === 'ValidationError' || err.name === 'CastError' || err.type === 'entity.parse.failed') return res.status(400).json({ message: err.name === 'ValidationError' ? Object.values(err.errors).map(e => e.message).join(' ') : 'Invalid request.' });
    if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Upload is too large (maximum request: 16 MB).' });
    console.error(err.message);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  });
  return app;
}
