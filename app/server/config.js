import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const config = {
  port: Number(process.env.PORT || 8080),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imradhe',
  appUrl: process.env.APP_URL || 'http://localhost:8080',
  production: process.env.NODE_ENV === 'production',
  registration: process.env.ALLOW_REGISTRATION !== 'false',
  trustProxy: Number(process.env.TRUST_PROXY || 0),
  publicDir: path.join(root, 'public'),
  mediaDir: path.join(root, 'media/ar'),
  distDir: path.join(root, 'dist')
};
