import mongoose, { Schema, model, models } from 'mongoose';

const EmployeeSchema = new Schema({
  companyId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: false }, // Email is optional
  faceProfiles: { type: [String] }, // Multiple face samples for better matching
  createdAt: { type: Date, default: Date.now },
});

// Ensure unique employee per company using phone (primary identifier)
EmployeeSchema.index({ companyId: 1, phone: 1 }, { unique: true });

export default models.Employee || model('Employee', EmployeeSchema);
