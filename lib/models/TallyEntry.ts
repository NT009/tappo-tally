import mongoose from 'mongoose';

const TallyEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  tallyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tally', required: true },
  date: { type: String, required: true }, // Format YYYY-MM-DD
  count: { type: Number, default: 0 },
}, {
  timestamps: true,
});

TallyEntrySchema.index({ tallyId: 1, date: 1 }, { unique: true });

export default mongoose.models.TallyEntry || mongoose.model('TallyEntry', TallyEntrySchema);
