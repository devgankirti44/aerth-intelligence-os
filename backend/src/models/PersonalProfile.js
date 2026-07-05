import mongoose from 'mongoose';

const PersonalProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, ref: 'User' },

  // Who they are
  situation: { 
    type: String, 
    enum: ['student', 'homemaker', 'employed', 'unemployed', 'freelancer', 'retired', 'other'],
    default: 'student'
  },
  degree: String,          // e.g., "BSc Botany", "BTech CS", "Class 12 pass"
  currentSkills: [String], // e.g., ["Python", "cooking", "photography"]
  interests: [String],     // e.g., ["agriculture", "content creation"]
  
  // Constraints
  city: String,            // e.g., "Ludhiana", "Bangalore"
  cityTier: { type: String, enum: ['metro', 'tier2', 'tier3', 'rural'], default: 'tier2' },
  hoursPerDay: { type: Number, default: 3 },
  capital: { type: Number, default: 0 }, // in INR
  
  // Goals
  goal: { 
    type: String, 
    enum: ['side_income', 'full_income', 'skill_learning', 'business', 'exploring'],
    default: 'side_income'
  },
  targetMonthlyIncome: { type: Number, default: 20000 }, // in INR
  
  // Cached AI opportunities (6h TTL)
  cachedOpportunities: mongoose.Schema.Types.Mixed,
  cachedAt: Date,
  
}, { timestamps: true });

export default mongoose.model('PersonalProfile', PersonalProfileSchema);