import mongoose, { Schema, model, models } from 'mongoose';

const AttendanceSchema = new Schema({
  companyId: { type: String, required: true },
  companyName: { type: String, required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String, required: true },
  employeeEmail: { type: String, required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  month: { type: String, required: true }, // "YYYY-MM"
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date }, // Check-out time
  formattedCheckInTime: { type: String }, // "10:30:45 AM"
  formattedCheckOutTime: { type: String }, // "06:30:45 PM"
  checkInPhotos: { type: [String] }, // Multiple snapshots for matching
  checkOutPhotos: { type: [String] }, // Check-out verification photos
  verificationMethod: { type: String, enum: ['face'], default: 'face' },
  status: { type: String, enum: ['checked-in', 'checked-out'], default: 'checked-in' },
  createdAt: { type: Date, default: Date.now },
});

// Ensure one attendance per day per company per employee
AttendanceSchema.index({ companyId: 1, employeeId: 1, date: 1 }, { unique: true });

export default models.Attendance || model('Attendance', AttendanceSchema);
