import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  
  myCompany: {
    name: String,
    sector: String,
    size: { type: String, enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
    description: String,
    website: String,
    country: String,
    detectedCompetitors: [String],
    interests: [String],
    registeredAt: Date
  },
  
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  lastLoginAt: Date
}, { timestamps: true });

export default mongoose.model('User', UserSchema);