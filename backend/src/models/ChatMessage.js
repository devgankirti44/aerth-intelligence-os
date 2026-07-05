// backend/src/models/ChatMessage.js

import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  companySlug: { type: String, index: true },

  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },

  // Citations from RAG
  sources: [{
    eventId: mongoose.Schema.Types.ObjectId,
    title: String,
    url: String,
    source: String,
    publishedAt: Date,
    score: Number
  }],

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ChatMessage', ChatMessageSchema);