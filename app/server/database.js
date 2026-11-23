import mongoose from 'mongoose';
import './models.js';
let initialized = false;
export const databaseReady = () => initialized && mongoose.connection.readyState === 1;
export async function connectDatabase(uri) {
  initialized = false;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  // Explicit initialization keeps unique/TTL indexes in place with buffering disabled.
  for (const model of Object.values(mongoose.models)) {
    await model.createCollection();
    await model.createIndexes();
  }
  initialized = true;
}
