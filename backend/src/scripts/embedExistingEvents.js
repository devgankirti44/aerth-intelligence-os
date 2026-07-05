// backend/src/scripts/embedExistingEvents.js
// Run this once to backfill embeddings for events already in DB

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { embedAllUnembedded } from '../services/embeddingService.js';

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  const count = await embedAllUnembedded();
  console.log(`Done. Embedded ${count} events.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});