import mongoose from 'mongoose';
import { connectDatabase } from '../database.js';
import { User } from '../models.js';
import { config } from '../config.js';

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes('@')) {
  console.error('Usage: npm run admin -- you@example.com (register the account first)');
  process.exitCode = 1;
} else {
  try {
    await connectDatabase(config.mongoUri);
    const user = await User.findOneAndUpdate({ email }, { $set: { role: 'admin' } }, { new: true, runValidators: true });
    if (!user) throw new Error('Account not found. Register it through /register first.');
    console.log(`Administrator access enabled for ${user.email}.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
}
