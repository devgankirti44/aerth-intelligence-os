import mongoose from 'mongoose';

const TrendSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  title: { type: String },
  category: { type: String },
  description: { type: String },
  keywords: [String],
  momentum: { type: Number, default: 50 },
  velocity: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['emerging', 'accelerating', 'peaking', 'declining', 'stable'], 
    default: 'emerging' 
  },
  signals: {
    eventCount: { type: Number, default: 0 },
    companiesInvolved: [String],
    lastActivityAt: { type: Date },
    growthRate: { type: Number, default: 0 }
  },
  aiSummary: { type: String },
  aiPrediction: { type: String },
  aiOpportunities: [String],
  history: [{
    date: Date,
    momentum: Number,
    eventCount: Number
  }],
  supportingEventIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  lastAnalyzedAt: { type: Date },
}, { timestamps: true });

// Always sync title from name
TrendSchema.pre('save', function(next) {
  if (this.name && !this.title) this.title = this.name;
  next();
});

export default mongoose.model('Trend', TrendSchema);