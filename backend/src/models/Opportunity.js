import mongoose from 'mongoose';

const OpportunitySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  sector: { type: String, required: true }, // e.g., "Agri-Tech", "Semiconductors", "Fintech"
  score: { type: Number, default: 50 }, // 0 to 100
  horizon: { type: String, enum: ['short', 'medium', 'long'], default: 'mid' },
  
  strategicRationale: { type: String }, // Why this opportunity exists
  actionPlan: [String], // Step-by-step strategic moves to exploit this
  risks: [String], // Threat analysis/barriers to entry
  
  associatedTrendSlugs: [String], // Trends that trigger this opportunity
  supportingEventIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  lastAnalyzedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Opportunity', OpportunitySchema);