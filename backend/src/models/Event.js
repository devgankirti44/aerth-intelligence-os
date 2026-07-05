import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  companySlug: { type: String, required: true, index: true },

  type: {
    type: String,
    enum: [
      'news',
      'product_launch',
      'funding',
      'acquisition',
      'partnership',
      'hiring',
      'leadership_change',
      'regulation',
      'github_release',
      'world_signal'
    ],
    default: 'news'
  },

  // NEW: macro domain for world signals
  domain: {
    type: String,
    enum: [
      'india_agriculture',
      'food_security',
      'commodities',
      'currency_macro',
      'geopolitics',
      'energy_transition',
      'india_manufacturing',
      'company'
    ],
    default: 'company',
    index: true
  },

  region: { type: String, index: true },
  keywords: [String],

  title: { type: String, required: true },
  summary: String,
  url: String,
  source: String,
  imageUrl: String,

  publishedAt: { type: Date, default: Date.now, index: true },
  createdAt: { type: Date, default: Date.now },

  significance: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  categories: [String],
  sentiment: Number,

  embedding: {
    type: [Number],
    default: null,
    select: false
  },
  embeddedAt: Date
});

EventSchema.index({ companySlug: 1, publishedAt: -1 });
EventSchema.index({ domain: 1, publishedAt: -1 });
EventSchema.index({ title: 'text', summary: 'text' });

export default mongoose.model('Event', EventSchema);