// backend/src/models/Company.js

import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  tagline: String,
  description: String,
  website: String,
  logo: String,
  industry: String,
  founded: Number,
  headquarters: String,
  employees: String,
  funding: String,
  valuation: String,
  status: {
    type: String,
    enum: ['public', 'private', 'acquired'],
    default: 'private'
  },
  github: String,
  twitter: String,
  competitors: [String],
  categories: [String],
  isTracked: { type: Boolean, default: true },
  lastFetchedNews: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Company', CompanySchema);