import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';
import { format } from 'date-fns';
import Admin from '@/models/Admin';
import { isWithinRange } from '@/lib/geofence';
import { sendCheckinNotification } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { companyId, name, phone, email, location } = await req.json();

    if (!companyId || !name || !phone || !email || !location) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // 0. Geo-fence check
    const admin = await Admin.findOne({ companyId });
    if (!admin) {
      return NextResponse.json({ message: 'Invalid company workspace' }, { status: 404 });
    }

    const inRange = isWithinRange(
      location.lat, 
      location.lng, 
      admin.location.lat, 
      admin.location.lng,
      100 // 100 meters radius
    );

    if (!inRange) {
      return NextResponse.json({ 
        message: 'You are outside the office geo-fence. Please move closer to check in.',
        outOfRange: true 
      }, { status: 403 });
    }

    // 1. Find or create employee
    let employee = await Employee.findOne({ companyId, email });
    if (!employee) {
      employee = new Employee({ companyId, name, phone, email });
      await employee.save();
    }

    // 2. Check if already checked in today
    const checkInTime = new Date();
    const today = format(checkInTime, 'yyyy-MM-dd');
    const existingAttendance = await Attendance.findOne({
      companyId,
      employeeId: employee._id,
      date: today,
    });

    if (existingAttendance) {
      return NextResponse.json({ message: "You've already marked attendance today ✓" }, { status: 409 });
    }

    // 3. Create attendance record
    const month = format(checkInTime, 'yyyy-MM');
    const attendance = new Attendance({
      companyId,
      employeeId: employee._id,
      employeeName: name,
      employeeEmail: email,
      date: today,
      month,
      checkInTime: checkInTime,
    });

    await attendance.save();

    // 4. Send Notification (Optional)
    const formattedTime = format(checkInTime, 'hh:mm aa');
    if (email) {
      try {
        await sendCheckinNotification(email, name, formattedTime, admin.companyName);
      } catch (err) {
        console.error('Failed to send check-in email:', err);
      }
    }

    return NextResponse.json({ 
      message: 'Attendance marked successfully',
      checkInTime: formattedTime 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
