import mongoose, { Schema, model, models } from 'mongoose';

const AdminSchema = new Schema({
  companyId: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  verified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default models.Admin || model('Admin', AdminSchema);
