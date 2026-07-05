// backend/src/models/Insight.js

import mongoose from 'mongoose';

const InsightSchema = new mongoose.Schema({
  companySlug: { type: String, required: true, index: true },

  // AI-generated executive summary
  summary: String,

  // Strategic themes AI detected
  themes: [String],

  // Recent strategic moves
  strategicMoves: [{
    move: String,
    evidence: String,
    date: Date
  }],

  // Competitive positioning insight
  competitivePosition: String,

  // Risks and opportunities
  risks: [String],
  opportunities: [String],

  generatedAt: { type: Date, default: Date.now },
  eventCount: Number  // how many events this insight is based on
});

export default mongoose.model('Insight', InsightSchema);