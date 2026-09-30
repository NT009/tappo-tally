import mongoose from 'mongoose';

const TallySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true, maxlength: 50 },
  color: { type: String, required: true },
  incrementRate: { type: Number, default: 1 },
}, {
  timestamps: true,
});

export default mongoose.models.Tally || mongoose.model('Tally', TallySchema);
