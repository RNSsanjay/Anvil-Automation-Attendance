import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';
import { format } from 'date-fns';

export async function POST(req: Request) {
  try {
    const { companyId, name, phone, email } = await req.json();

    if (!companyId || !name || !phone || !email) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // 1. Find or create employee
    let employee = await Employee.findOne({ companyId, email });
    if (!employee) {
      employee = new Employee({ companyId, name, phone, email });
      await employee.save();
    }

    // 2. Check if already checked in today
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingAttendance = await Attendance.findOne({
      companyId,
      employeeId: employee._id,
      date: today,
    });

    if (existingAttendance) {
      return NextResponse.json({ message: "You've already marked attendance today ✓" }, { status: 409 });
    }

    // 3. Create attendance record
    const month = format(new Date(), 'yyyy-MM');
    const attendance = new Attendance({
      companyId,
      employeeId: employee._id,
      employeeName: name,
      employeeEmail: email,
      date: today,
      month,
      checkInTime: new Date(),
    });

    await attendance.save();

    return NextResponse.json({ message: 'Attendance marked successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
