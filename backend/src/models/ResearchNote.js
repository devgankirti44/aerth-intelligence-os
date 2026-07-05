import mongoose from 'mongoose';

const ResearchNoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
  title: { type: String, required: true },
  topic: { type: String },
  content: { type: String, default: '' },
  tags: [String],
  aiSummary: String,
  aiKeyPoints: [String],
  aiRelatedTrends: [String],
  status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active' }
}, { timestamps: true });

ResearchNoteSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model('ResearchNote', ResearchNoteSchema);