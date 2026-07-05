import mongoose from 'mongoose';

const SimulationSchema = new mongoose.Schema({
  scenario: { type: String, required: true },
  category: { type: String },
  
  analysis: {
    executiveVerdict: String,
    cascadeChain: [String],
    probability: Number,
    timeToImpact: String,
    confidenceScore: Number,
    
    trendImpacts: [{
      trendName: String,
      direction: { type: String, enum: ['accelerate', 'decelerate', 'reverse', 'unchanged'] },
      magnitude: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
      reasoning: String
    }],
    
    sectorImpacts: [{
      sector: String,
      impact: { type: String, enum: ['boom', 'growth', 'neutral', 'decline', 'collapse'] },
      reasoning: String
    }],
    
    winners: [{ name: String, why: String }],
    losers: [{ name: String, why: String }],
    
    emergingOpportunities: [String],
    hiddenRisks: [String],
    strategicPlaybook: [String]
  },
  
  meta: {
    trendsAnalyzed: Number,
    signalsReferenced: Number,
    generationTimeMs: Number
  },
  
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

SimulationSchema.index({ createdAt: -1 });

export default mongoose.model('Simulation', SimulationSchema);