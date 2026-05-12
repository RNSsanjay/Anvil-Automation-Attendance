import mongoose, { Schema, model, models } from 'mongoose';

const EmployeeSchema = new Schema({
  companyId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: false }, // Email is optional
  faceDescriptors: { type: [[Number]] }, // Array of face descriptors (128-dimension vectors)
  faceProfiles: { type: [String] }, // Keep for backward compatibility - stores face images
  createdAt: { type: Date, default: Date.now },
});

// Ensure unique employee per company using phone (primary identifier)
EmployeeSchema.index({ companyId: 1, phone: 1 }, { unique: true });

export default models.Employee || model('Employee', EmployeeSchema);
