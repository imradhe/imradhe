import mongoose from 'mongoose';
import { connectDatabase } from '../database.js';
import { readFile, readdir } from 'node:fs/promises';
import { config, root } from '../config.js';
import { Story, Scene, Post } from '../models.js';
import { seedPortfolio } from '../portfolio.js';
import { cleanHtml, validSlug } from '../content.js';

export function parsePost(slug, source) {
  const raw = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = raw.match(/^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  const meta = {};
  if (match) for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon !== -1) meta[line.slice(0, colon).trim().toLowerCase()] = line.slice(colon + 1).trim().replace(/^(["'])(.*)\1$/, '$2');
  }
  const date = new Date(meta.date || '1970-01-01');
  return { slug, title: meta.title || slug.replaceAll('-', ' '), date: Number.isNaN(date.getTime()) ? new Date(0) : date,
    description: meta.description || '', tags: (meta.tags || '').split(',').map(s => s.trim()).filter(Boolean),
    draft: ['1', 'true', 'yes'].includes((meta.draft || '').toLowerCase()), body: match ? raw.slice(match[0].length) : raw };
}
export async function seedContent() {
  const data = JSON.parse(await readFile(`${root}/data/legacy-content.json`, 'utf8'));
  for (const story of data.stories) {
    await Story.updateOne({ storyID: story.storyID }, { $setOnInsert: story }, { upsert: true, runValidators: true, timestamps: false });
  }
  for (const scene of data.scenes) {
    scene.content = cleanHtml(scene.content);
    await Scene.updateOne({ sceneID: scene.sceneID }, { $setOnInsert: scene }, { upsert: true, runValidators: true, timestamps: false });
  }
  let posts = 0;
  for (const file of await readdir(`${root}/content/blog`)) {
    if (!file.endsWith('.md') || !validSlug(file.slice(0, -3))) continue;
    const post = parsePost(file.slice(0, -3), await readFile(`${root}/content/blog/${file}`, 'utf8'));
    await Post.updateOne({ slug: post.slug }, { $setOnInsert: post }, { upsert: true, runValidators: true });
    posts++;
  }
  const portfolio = await seedPortfolio();
  return { stories: data.stories.length, scenes: data.scenes.length, posts, portfolio };
}
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  try {
    await connectDatabase(config.mongoUri);
    console.log('Imported missing content (existing records preserved):', await seedContent());
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
}
