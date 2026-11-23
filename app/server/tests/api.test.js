import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp } from '../app.js';
import { connectDatabase } from '../database.js';
import { config } from '../config.js';
import { User, Story, Scene, Post, Flag, Session } from '../models.js';
import { seedContent } from '../scripts/seed.js';

let mongo, app, admin, adminCsrf, member, memberCsrf, dist;
before(async () => {
  mongo = await MongoMemoryServer.create({ binary: { downloadDir: '/tmp/imradhe-mongodb-binaries' } });
  await connectDatabase(mongo.getUri());
  dist = await mkdtemp(path.join(tmpdir(), 'imradhe-client-test-'));
  await writeFile(path.join(dist, 'index.html'), '<html><head><title>Original</title><meta name="description" content="original"/></head><body><div id="root"></div></body></html>');
  app = createApp({ settings: { ...config, distDir: dist, production: false, appUrl: 'http://localhost:8080' } });
  await seedContent();
  admin = request.agent(app);
  let response = await admin.post('/api/auth/register').send({ name: 'Site owner', email: 'owner@example.com', password: 'a long and private password', role: 'admin' }).expect(201);
  assert.equal(response.body.user.role, 'user'); adminCsrf = response.body.csrf;
  await User.updateOne({ email: 'owner@example.com' }, { $set: { role: 'admin' } });
  member = request.agent(app);
  response = await member.post('/api/auth/register').send({ name: 'Reader', email: 'reader@example.com', password: 'another private password' }).expect(201);
  memberCsrf = response.body.csrf;
});
after(async () => { await mongoose.disconnect(); await mongo?.stop(); if (dist) await rm(dist, { recursive: true, force: true }); });

test('health, portfolio, archived chat, route inventory and genres are reachable', async () => {
  assert.equal((await request(app).get('/health').expect(200)).text, 'ok');
  await request(app).get('/api/health').expect(200);
  assert.equal((await request(app).get('/api/portfolio').expect(200)).body.projects.length, 15);
  assert.ok((await request(app).get('/api/chats').expect(200)).body.chats.length);
  assert.ok((await request(app).get('/api/routes').expect(200)).body.data.includes('scene/{slug}'));
  assert.ok((await request(app).get('/api/genres').expect(200)).body.includes('literaryFiction'));
});
test('seed preserves all dates, scenes and content and never overwrites an edited record', async () => {
  assert.equal(await Story.countDocuments(), 3); assert.equal(await Scene.countDocuments(), 3);
  const scene = await Scene.findOne({ sceneID: 'short-stories-1-1-1' });
  assert.equal(scene.createdDate.toISOString(), '2023-03-17T03:03:30.000Z');
  await Story.updateOne({ storyID: 'short-stories' }, { title: 'Edited short stories' });
  await seedContent();
  assert.equal((await Story.findOne({ storyID: 'short-stories' })).title, 'Edited short stories');
});
test('public reading routes return ordered scenes and distinguish missing records', async () => {
  const story = (await request(app).get('/api/stories/short-stories').expect(200)).body;
  assert.deepEqual(story.scenes.map(s => s.sceneID), ['short-stories-1-1-1', 'short-stories-1-2-1']);
  const scene = (await request(app).get('/api/scenes/short-stories-1-1-1').expect(200)).body;
  assert.equal(scene.title, 'The Dark'); assert.match(scene.content, /Pondicherry/);
  await request(app).get('/api/scenes/missing').expect(404);
  await request(app).get('/api/stories/missing').expect(404);
});
test('public registration validates passwords, prevents role injection and duplicate accounts', async () => {
  await request(app).post('/api/auth/register').send({ name: 'Test', email: 'invalid', password: 'short' }).expect(400);
  await request(app).post('/api/auth/register').send({ name: 'Test', email: 'reader@example.com', password: 'another private password' }).expect(409);
  const user = await User.findOne({ email: 'reader@example.com' }).select('+password');
  assert.equal(user.role, 'user'); assert.match(user.password, /^scrypt:/);
});
test('login rejects injection and wrong credentials and rotates HttpOnly sessions', async () => {
  await request(app).post('/api/login').send({ email: { $ne: null }, password: 'anything' }).expect(400);
  await request(app).post('/api/login').send({ email: 'reader@example.com', password: 'wrong' }).expect(401);
  const agent = request.agent(app);
  const login = await agent.post('/api/login').send({ email: 'READER@example.com', password: 'another private password' }).expect(200);
  assert.match(login.headers['set-cookie'][0], /HttpOnly/); assert.match(login.headers['set-cookie'][0], /SameSite=Strict/);
  assert.equal(login.body.user.email, 'reader@example.com'); assert.equal(login.body.user.password, undefined);
  const first = login.headers['set-cookie'][0];
  const again = await agent.post('/api/auth/login').send({ email: 'reader@example.com', password: 'another private password' }).expect(200);
  assert.notEqual(again.headers['set-cookie'][0], first);
  await request(app).get('/api/auth/me').set('Cookie', first).expect(401);
  await agent.post('/api/logout').set('x-csrf-token', again.body.csrf).send({}).expect(200);
  await agent.get('/api/auth/me').expect(401);
});
test('sensitive routes require authentication, admin role, CSRF and same-origin JSON', async () => {
  await request(app).get('/api/admin/stories').expect(401);
  await member.get('/api/admin/stories').expect(403);
  await member.get('/api/logs').expect(403);
  await admin.post('/api/admin/stories').send({}).expect(403);
  await admin.post('/api/admin/stories').set('x-csrf-token', adminCsrf).set('Origin', 'https://evil.example').send({}).expect(403);
  await admin.post('/api/admin/stories').set('x-csrf-token', adminCsrf).type('form').send({ title: 'X' }).expect(415);
  await admin.get('/api/admin/stories').expect(200);
});
test('story and scene CRUD validate parent references, sanitize content and block orphaning', async () => {
  const body = { storyID: 'test-story', title: 'A test story', author: 'Test author', genre: 'fiction', cover: '', description: 'A story created during testing', tags: ['test'] };
  await admin.post('/api/admin/stories').set('x-csrf-token', adminCsrf).send(body).expect(201);
  await admin.post('/api/admin/stories').set('x-csrf-token', adminCsrf).send(body).expect(409);
  await admin.post('/api/admin/stories').set('x-csrf-token', adminCsrf).send({ ...body, storyID: 'bad-cover', cover: 'javascript:alert(1)' }).expect(400);
  const scene = { storyID: 'test-story', title: 'A test scene', actNumber: 1, chapterNumber: 2, sceneNumber: 3, content: '<p>Hello</p><script>bad()</script><img src="/ok.png" onerror="bad()">' };
  await admin.post('/api/admin/scenes').set('x-csrf-token', adminCsrf).send({ ...scene, storyID: 'missing' }).expect(400);
  await admin.post('/api/admin/scenes').set('x-csrf-token', adminCsrf).send({ ...scene, actNumber: 1.1 }).expect(400);
  const created = await admin.post('/api/admin/scenes').set('x-csrf-token', adminCsrf).send(scene).expect(201);
  assert.equal(created.body.sceneID, 'test-story-1-2-3'); assert.doesNotMatch(created.body.content, /script|onerror/);
  await admin.put('/api/admin/scenes/test-story-1-2-3').set('x-csrf-token', adminCsrf).send({ title: 'Updated scene', content: '<p>Updated</p>' }).expect(200);
  await admin.delete('/api/admin/stories/test-story').set('x-csrf-token', adminCsrf).send({}).expect(409);
  await admin.delete('/api/admin/scenes/test-story-1-2-3').set('x-csrf-token', adminCsrf).send({}).expect(200);
  await admin.delete('/api/admin/stories/test-story').set('x-csrf-token', adminCsrf).send({}).expect(200);
  await admin.delete('/api/admin/stories/test-story').set('x-csrf-token', adminCsrf).send({}).expect(404);
});
test('blog supports Markdown, drafts, CRUD, safe HTML and search metadata', async () => {
  const draft = { slug: 'private-post', title: 'A private draft', body: '**Private**', draft: true };
  await admin.post('/api/admin/posts').set('x-csrf-token', adminCsrf).send(draft).expect(201);
  await request(app).get('/api/posts/private-post').expect(404);
  await request(app).get('/blog/private-post').expect(404);
  const publicPost = { slug: 'public-post', title: 'Safe <title>', description: 'A "description"', body: '# Hello\n\n**World**\n\n<script>alert(1)</script>', draft: false, tags: ['speech'] };
  await admin.post('/api/admin/posts').set('x-csrf-token', adminCsrf).send(publicPost).expect(201);
  const post = (await request(app).get('/api/posts/public-post').expect(200)).body;
  assert.match(post.html, /<strong>World<\/strong>/); assert.doesNotMatch(post.html, /script/);
  const posts = (await request(app).get('/api/posts').expect(200)).body;
  assert.equal(posts.length, 1); assert.equal(posts[0].body, undefined);
  const page = await request(app).get('/blog/public-post').expect(200);
  assert.match(page.text, /Safe &lt;title&gt;/); assert.match(page.text, /A &quot;description&quot;/);
  await admin.put('/api/admin/posts/public-post').set('x-csrf-token', adminCsrf).send({ title: 'Updated public post' }).expect(200);
});
test('flag endpoints preserve legacy envelopes and enforce ownership and admin aggregates', async () => {
  const flag = { projectID: 'p1', taskID: 't1', annotator: 'reader@example.com', reviewer: 'owner@example.com', superchecker: '', flag: 'Check audio', segment: '0-10', role: 'annotator' };
  await member.post('/api/flag').set('x-csrf-token', memberCsrf).send({ ...flag, annotator: 'someone@example.com' }).expect(403);
  const result = await member.post('/api/flag').set('x-csrf-token', memberCsrf).send(flag).expect(201);
  assert.equal(result.body.taskID, 't1');
  await member.get('/api/flags').expect(403);
  await member.get('/api/flags/reviewer/owner@example.com').expect(403);
  assert.equal((await member.get('/api/flags/annotator/reader@example.com').expect(200)).body.data.length, 1);
  const aggregate = (await admin.get('/api/flags/annotators').expect(200)).body.data;
  assert.deepEqual(aggregate, [{ annotator: 'reader@example.com', flag_count: 1 }]);
  assert.equal((await admin.get('/api/flags').expect(200)).body.data.length, 1);
});
test('expired sessions are rejected immediately before MongoDB TTL cleanup', async () => {
  const agent = request.agent(app);
  const response = await agent.post('/api/auth/login').send({ email: 'reader@example.com', password: 'another private password' }).expect(200);
  const user = await User.findOne({ email: 'reader@example.com' });
  await Session.updateMany({ userId: user._id, csrf: response.body.csrf }, { expiresAt: new Date(0) });
  await agent.get('/api/auth/me').expect(401);
});
test('page routes, assets, redirects, sitemap and missing pages keep correct HTTP behavior', async () => {
  for (const route of ['/', '/education', '/skills', '/projects', '/experience', '/interests', '/blog', '/ar', '/ar/ironman', '/ar/spiderman', '/ar/chotabheem', '/ar/test', '/test', '/chess', '/streak', '/streak/new', '/dhwani', '/wav2vec', '/balloon', '/call', '/admin', '/admin/stories/new']) await request(app).get(route).expect(200);
  await request(app).get('/assets/img/imradhe.jpg').expect(200);
  await request(app).get('/assets/docs/ImRadheResume.pdf').expect(200);
  await request(app).get('/scene/short-stories-1-1-1').expect(200);
  assert.equal((await request(app).get('/blog/?page=2').expect(302)).headers.location, '/blog?page=2');
  assert.equal((await request(app).get('/adcast').expect(302)).headers.location, 'https://adcast.imradhe.com/adcast');
  assert.match((await request(app).get('/sitemap.xml').expect(200)).text, /scene\/short-stories-1-1-1/);
  for (const route of ['/missing', '/config.php', '/.env', '/server/app.js', '/data/legacy-content.json', '/blog/_example', '/ar/missing']) await request(app).get(route).expect(404);
  await request(app).get('/api/missing').expect(404);
  await request(app).get('/testmail').expect(410);
});
test('unconfigured transcription returns a useful error without forwarding audio', async () => {
  await request(app).post('/api/transcribe').send({}).expect(503);
});
test('portfolio and liveness survive a database outage while data routes report 503', async () => {
  await mongoose.disconnect();
  await request(app).get('/health').expect(200);
  await request(app).get('/api/portfolio').expect(200);
  await request(app).get('/api/stories').expect(503);
  await request(app).get('/api/health').expect(503);
});
