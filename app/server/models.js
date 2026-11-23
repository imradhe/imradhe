import mongoose from 'mongoose';

mongoose.set('bufferCommands', false);
mongoose.set('autoCreate', false);
mongoose.set('autoIndex', false);
const { Schema } = mongoose;
const text = (max = 255) => ({ type: String, required: true, trim: true, maxlength: max });
const slug = { ...text(), match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, unique: true };
const dates = { timestamps: { createdAt: 'createdDate', updatedAt: 'modifiedDate' } };
export const genres = ['literaryFiction', 'mystery', 'thriller', 'horror', 'historical', 'romance', 'western', 'scienceFiction', 'fantasy', 'dystopian', 'magicalRealism', 'realistLiterature', 'fable', 'fairyTale', 'fiction', 'historicalFiction', 'folklore', 'drama', 'humor', 'mythology', 'poetry', 'shortStory', 'essay', 'narrativeNonFiction', 'nonFiction', 'speech', 'romanticComedy'];

export const Story = mongoose.model('Story', new Schema({
  storyID: slug, title: text(), author: text(), genre: { type: String, enum: genres, required: true },
  cover: { type: String, maxlength: 2000, default: '' }, description: text(10000), tags: [{ type: String, maxlength: 100 }]
}, dates));
export const Scene = mongoose.model('Scene', new Schema({
  sceneID: slug, storyID: { ...text(), index: true }, title: text(),
  actNumber: { type: Number, required: true, min: 0, max: 9999, validate: Number.isInteger },
  chapterNumber: { type: Number, required: true, min: 0, max: 9999, validate: Number.isInteger },
  sceneNumber: { type: Number, required: true, min: 0, max: 9999, validate: Number.isInteger },
  content: text(1000000)
}, dates));
export const Post = mongoose.model('Post', new Schema({
  slug, title: text(), description: { type: String, maxlength: 10000, default: '' },
  date: { type: Date, default: Date.now }, tags: [{ type: String, maxlength: 100 }],
  draft: { type: Boolean, default: false }, highlight: { type: Boolean, default: false }, body: text(1000000)
}, dates));
// Downloadable PDFs (CV and Resume), uploaded from the admin panel.
export const Document = mongoose.model('Document', new Schema({
  key: { type: String, enum: ['cv', 'resume'], required: true, unique: true },
  filename: String, size: Number, data: Buffer
}, dates));
export const Entries = ['education', 'experience', 'project', 'publication'];
export const Entry = mongoose.model('Entry', new Schema({
  kind: { type: String, enum: Entries, required: true, index: true },
  order: { type: Number, default: 0 },
  data: { type: Schema.Types.Mixed, default: {} }
}, dates));
export const Page = mongoose.model('Page', new Schema({
  key: { type: String, enum: ['about', 'skills', 'interests'], required: true, unique: true },
  text: { type: String, maxlength: 20000, default: '' }
}, dates));
export const Profile = mongoose.model('Profile', new Schema({
  key: { type: String, default: 'main', unique: true },
  links: { type: Schema.Types.Mixed, default: {} },
  contact: { type: Schema.Types.Mixed, default: {} }
}, dates));
export const User = mongoose.model('User', new Schema({
  name: text(100), phone: { type: String, maxlength: 30, default: '' }, email: { ...text(254), lowercase: true, unique: true },
  password: { ...text(512), select: false }, role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, dates));
export const Session = mongoose.model('Session', new Schema({
  tokenHash: { ...text(), unique: true }, userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  csrf: text(), expiresAt: { type: Date, required: true, expires: 0 }
}, { timestamps: true }));
export const Log = mongoose.model('Log', new Schema({
  userId: Schema.Types.ObjectId, email: String, loginID: String,
  ip: String, browser: String, loggedout: { type: Boolean, default: false }, loggedoutat: Date
}, { timestamps: true }));
export const Flag = mongoose.model('Flag', new Schema({
  projectID: text(), taskID: text(), annotator: { type: String, maxlength: 254, default: '' },
  reviewer: { type: String, maxlength: 254, default: '' }, superchecker: { type: String, maxlength: 254, default: '' },
  flag: text(5000), segment: { type: String, maxlength: 10000, default: '' },
  role: { type: String, enum: ['annotator', 'reviewer', 'superchecker'], required: true },
  time: { type: Date, default: Date.now }, createdBy: Schema.Types.ObjectId
}));
