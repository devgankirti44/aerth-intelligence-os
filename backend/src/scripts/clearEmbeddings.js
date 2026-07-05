// backend/src/scripts/clearEmbeddings.js

import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  const eventsResult = await mongoose.connection.db.collection('events').updateMany(
    {},
    { $unset: { embedding: '', embeddedAt: '' } }
  );
  console.log(`✓ Cleared embeddings from ${eventsResult.modifiedCount} events`);

  const trendsResult = await mongoose.connection.db.collection('trends').deleteMany({});
  console.log(`✓ Deleted ${trendsResult.deletedCount} old trends`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});