import mongoose from 'mongoose';
import { createApp } from './app.js';
import { connectDatabase } from './database.js';
import { config } from './config.js';

// Public portfolio and liveness remain available during a database outage.
connectDatabase(config.mongoUri).catch(err => console.error('MongoDB connection failed:', err.message));
const server = createApp().listen(config.port, '0.0.0.0', () => console.log(`imradhe.com API and production client: http://localhost:${config.port}`));
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => {
  server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  setTimeout(() => process.exit(1), 10000).unref();
});
