import mongoose, { Schema, model, models } from 'mongoose';

const EmployeeSchema = new Schema({
  companyId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  faceProfile: { type: String }, // Base64 or URL of the reference face
  biometricId: { type: String }, // For WebAuthn/Fingerprint
  createdAt: { type: Date, default: Date.now },
});

// Ensure unique employee per company
EmployeeSchema.index({ companyId: 1, email: 1 }, { unique: true });

export default models.Employee || model('Employee', EmployeeSchema);
