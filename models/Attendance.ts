import mongoose, { Schema, model, models } from 'mongoose';

const AttendanceSchema = new Schema({
  companyId: { type: String, required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String, required: true },
  employeeEmail: { type: String, required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  month: { type: String, required: true }, // "YYYY-MM"
  checkInTime: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Ensure one attendance per day per company per employee
AttendanceSchema.index({ companyId: 1, employeeId: 1, date: 1 }, { unique: true });

export default models.Attendance || model('Attendance', AttendanceSchema);
