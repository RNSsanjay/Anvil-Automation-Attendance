import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';
import Admin from '@/models/Admin';
import { isWithinRange } from '@/lib/geofence';
import { sendCheckinNotification } from '@/lib/email';
import { getISTToday, getISTMonth, getISTTime, getISTDate } from '@/lib/ist';

export async function POST(req: Request) {
  try {
    const { companyId, name, phone, email, location, checkInPhoto, verificationMethod } = await req.json();

    if (!companyId || !email || !location) {
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
        message: 'Out of range. Please move closer to the office.',
        outOfRange: true 
      }, { status: 403 });
    }

    // 1. Find or create employee
    let employee = await Employee.findOne({ companyId, email });
    
    if (!employee) {
      // First time registration
      if (!name || !phone || !checkInPhoto) {
        return NextResponse.json({ message: 'First-time registration requires name, phone, and face snapshot' }, { status: 400 });
      }
      employee = new Employee({ 
        companyId, 
        name, 
        phone, 
        email, 
        faceProfile: checkInPhoto // Store the registration face
      });
      await employee.save();
    }

    // 2. Face/Biometric verification (Simulated for speed, storing evidence)
    // In a real production with face-api.js, we would compare checkInPhoto with employee.faceProfile here.
    // For now, we store the snapshot as evidence for the admin report.

    // 3. Check if already checked in today (using IST date)
    const today = getISTToday();
    const existingAttendance = await Attendance.findOne({
      companyId,
      employeeId: employee._id,
      date: today,
    });

    if (existingAttendance) {
      return NextResponse.json({ 
        message: "Attendance already marked for today",
        employeeName: employee.name,
        checkInTime: existingAttendance.formattedTime || getISTTime()
      }, { status: 200 });
    }

    // 4. Create attendance record
    const month = getISTMonth();
    const attendance = new Attendance({
      companyId,
      companyName: admin.companyName,
      employeeId: employee._id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      date: today,
      month,
      checkInTime: getISTDate(),
      checkInPhoto: checkInPhoto, // Save the actual check-in snapshot
      verificationMethod: verificationMethod || 'face',
      formattedTime: getISTTime() // Store readable IST time
    });

    await attendance.save();

    // 5. Send Notification (Optional)
    if (email) {
      try {
        await sendCheckinNotification(email, employee.name, getISTTime(), admin.companyName);
      } catch (err) {
        console.error('Email failed:', err);
      }
    }

    return NextResponse.json({ 
      message: 'Attendance marked successfully',
      employeeName: employee.name,
      checkInTime: getISTTime(),
      companyName: admin.companyName
    }, { status: 201 });

  } catch (error: any) {
    console.error('Check-in API error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
