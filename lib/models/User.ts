import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  timezone: { type: String },
}, {
  strict: false, // Because Better Auth manages other fields
});

export default mongoose.models.user || mongoose.model('user', UserSchema);
