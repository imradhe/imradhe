import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { cleanHtml, markdown, validSlug, portfolio } from '../content.js';
import { hashPassword, verifyPassword } from '../auth.js';
import { parsePost } from '../scripts/seed.js';

test('passwords use distinct salts and verify only the original password', async () => {
  const first = await hashPassword('correct horse battery staple');
  const second = await hashPassword('correct horse battery staple');
  assert.notEqual(first, second);
  assert.equal(await verifyPassword('correct horse battery staple', first), true);
  assert.equal(await verifyPassword('incorrect password', first), false);
  assert.equal(await verifyPassword('anything', 'md5'), false);
});
test('HTML sanitization retains reading content but removes active markup', () => {
  const html = cleanHtml('<h1>Title</h1><script>alert(1)</script><img src="/assets/test.png" onerror="alert(1)"><a href="javascript:alert(1)">x</a><iframe src="https://example.com"></iframe>');
  assert.match(html, /<h1>Title<\/h1>/); assert.match(html, /src="\/assets\/test.png"/);
  assert.doesNotMatch(html, /script|onerror|iframe|javascript:/);
  assert.match(markdown('**Hello**\n\n[Bad](javascript:alert)'), /<strong>Hello<\/strong>/);
});
test('slug validation rejects path traversal and hidden drafts', () => {
  for (const s of ['short-stories', 'hello-123']) assert.equal(validSlug(s), true);
  for (const s of ['_example', '../config', 'hello--world', 'hello/', { $ne: null }]) assert.equal(validSlug(s), false);
});
test('Markdown import retains content, metadata, dates, and draft state', () => {
  const post = parsePost('sample-post', '\uFEFF---\r\ntitle: "Sample post"\r\ndate: 2026-11-23\r\ntags: speech, nlp\r\ndraft: yes\r\n---\r\n# Body\r\n');
  assert.equal(post.title, 'Sample post'); assert.equal(post.draft, true);
  assert.deepEqual(post.tags, ['speech', 'nlp']); assert.equal(post.body, '# Body\n');
  assert.equal(post.date.toISOString(), '2026-11-23T00:00:00.000Z');
});
test('all original portfolio entries and story relationships were migrated', async () => {
  const data = JSON.parse(await readFile(new URL('../../data/legacy-content.json', import.meta.url), 'utf8'));
  assert.equal(data.stories.length, 3); assert.equal(data.scenes.length, 3); assert.equal(portfolio.projects.length, 15);
  for (const scene of data.scenes) {
    assert.ok(data.stories.some(s => s.storyID === scene.storyID));
    assert.ok(scene.content.length > 100); assert.doesNotMatch(scene.content, /\\['"]/);
  }
});
