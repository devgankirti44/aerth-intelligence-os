// backend/src/models/Signal.js

import mongoose from 'mongoose';

const SignalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'product_launch',
      'funding',
      'acquisition',
      'regulation',
      'partnership',
      'hiring',
      'research',
      'geopolitical'
    ],
    required: true
  },
  importance: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  company: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  source: {
    name: String,
    url: String
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Signal', SignalSchema);