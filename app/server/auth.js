import { randomBytes, createHash, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { User, Session, Log } from './models.js';
import { config } from './config.js';

const scrypt = promisify(scryptCallback);
const cookieName = 'imradhe_session';
const cookieOptions = { httpOnly: true, sameSite: 'strict', secure: config.production, path: '/' };
export const digest = token => createHash('sha256').update(token).digest('hex');
export const publicUser = user => ({ id: String(user._id), name: user.name, email: user.email, role: user.role });
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${hash.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const [algorithm, salt, hex] = encoded.split(':');
  if (algorithm !== 'scrypt' || !salt || !/^[a-f0-9]{128}$/.test(hex || '')) return false;
  const expected = Buffer.from(hex, 'hex');
  const actual = await scrypt(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}
export async function startSession(req, res, user) {
  // Invalidate the browser's previous session before rotating the token.
  if (req.cookies[cookieName]) await Session.deleteOne({ tokenHash: digest(req.cookies[cookieName]) });
  const token = randomBytes(32).toString('hex');
  const csrf = randomBytes(32).toString('hex');
  const tokenHash = digest(token);
  await Session.create({ tokenHash, csrf, userId: user._id, expiresAt: new Date(Date.now() + 7 * 86400000) });
  await Log.create({ userId: user._id, email: user.email, loginID: tokenHash, ip: req.ip, browser: (req.get('user-agent') || '').slice(0, 500) });
  res.cookie(cookieName, token, { ...cookieOptions, maxAge: 7 * 86400000 });
  return { user: publicUser(user), csrf };
}
export async function requireUser(req, res, next) {
  const token = req.cookies[cookieName];
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return res.status(401).json({ message: 'Please log in.' });
  const session = await Session.findOne({ tokenHash: digest(token), expiresAt: { $gt: new Date() } });
  if (!session) return res.status(401).json({ message: 'Your session has expired. Please log in.' });
  const user = await User.findById(session.userId);
  if (!user) return res.status(401).json({ message: 'Please log in.' });
  req.user = user; req.session = session;
  next();
}
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Administrator access required.' });
  next();
}
export function requireCsrf(req, res, next) {
  if (!req.session || req.get('x-csrf-token') !== req.session.csrf) return res.status(403).json({ message: 'Invalid security token. Reload and try again.' });
  next();
}
export async function endSession(req, res) {
  await Session.deleteOne({ _id: req.session._id });
  await Log.updateOne({ loginID: req.session.tokenHash }, { loggedout: true, loggedoutat: new Date() });
  res.clearCookie(cookieName, cookieOptions).json({ message: 'Logged out.' });
}
