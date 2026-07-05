import mongoose from 'mongoose';

const WatchlistItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['company', 'trend', 'opportunity', 'simulation', 'report', 'signal', 'custom'],
    required: true
  },
  
  refId: { type: String },      // _id or slug of the referenced item
  title: { type: String, required: true },
  subtitle: { type: String },   // e.g., category, sector
  linkPath: { type: String },   // frontend route to navigate to, e.g. /trends/dollar-decline
  
  // Research features
  notes: { type: String, default: '' },
  tags: [String],
  priority: {
    type: String,
    enum: ['critical', 'high', 'normal', 'low'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['watching', 'investigating', 'actioned', 'archived'],
    default: 'watching'
  },
  
  pinnedAt: { type: Date, default: Date.now }
}, { timestamps: true });

WatchlistItemSchema.index({ itemType: 1, refId: 1 }, { unique: true });
WatchlistItemSchema.index({ status: 1, priority: 1 });

export default mongoose.model('WatchlistItem', WatchlistItemSchema);