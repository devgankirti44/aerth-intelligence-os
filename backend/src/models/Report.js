import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String },
  type: { 
    type: String, 
    enum: ['weekly', 'custom', 'sector', 'geographic'], 
    default: 'custom' 
  },
  
  sections: {
    executiveSummary: String,
    stateOfWorld: String,
    topTrends: [{ name: String, insight: String }],
    opportunities: [{ title: String, rationale: String, score: Number }],
    risks: [String],
    recommendations: [String]
  },
  
  meta: {
    signalsAnalyzed: Number,
    trendsReferenced: Number,
    opportunitiesReferenced: Number,
    generationTimeMs: Number
  },
  
  status: { type: String, enum: ['generating', 'ready', 'failed'], default: 'ready' },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

ReportSchema.index({ generatedAt: -1 });

export default mongoose.model('Report', ReportSchema);