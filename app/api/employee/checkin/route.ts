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
    const { companyId, name, phone, email, location, facePhotos } = await req.json();

    if (!companyId || !name || !phone || !location || !facePhotos || facePhotos.length === 0) {
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
    let employee = await Employee.findOne({ companyId, phone });
    
    if (!employee) {
      // First time registration - store face profiles
      if (!name) {
        return NextResponse.json({ message: 'First-time registration requires name' }, { status: 400 });
      }
      employee = new Employee({ 
        companyId, 
        name, 
        phone, 
        email: email || '', // Email is optional
        faceProfiles: facePhotos // Store all 5 face samples
      });
      await employee.save();
    }

    // 2. Check if already checked in today (using IST date)
    // BUSINESS RULE: One check-in and one check-out per day maximum
    // - First scan of the day = Check-in (creates new attendance record)
    // - Second scan of the day = Check-out (updates same record, changes status)
    // - Third+ scan of the day = Rejected with error message
    const today = getISTToday();
    const existingAttendance = await Attendance.findOne({
      companyId,
      employeeId: employee._id,
      date: today,
    });

    if (existingAttendance) {
      // Check current status
      if (existingAttendance.status === 'checked-in') {
        // Allow check-out (second scan of the day)
        existingAttendance.checkOutTime = getISTDate();
        existingAttendance.formattedCheckOutTime = getISTTime();
        existingAttendance.checkOutPhotos = facePhotos;
        existingAttendance.status = 'checked-out';
        await existingAttendance.save();

        // Send check-out notification
        if (email && email.trim()) {
          try {
            await sendCheckinNotification(email, employee.name, getISTTime(), admin.companyName, true);
          } catch (err) {
            console.error('Email failed:', err);
          }
        }

        return NextResponse.json({ 
          message: 'Check-out recorded successfully!',
          employeeName: employee.name,
          checkInTime: existingAttendance.formattedCheckInTime,
          checkOutTime: getISTTime(),
          companyName: admin.companyName,
          isCheckOut: true
        }, { status: 200 });
      } else if (existingAttendance.status === 'checked-out') {
        // Already completed both check-in and check-out for today
        // This is the third+ scan attempt - should be rejected
        return NextResponse.json({ 
          message: "Attendance complete for today!",
          detail: `Check-In: ${existingAttendance.formattedCheckInTime} | Check-Out: ${existingAttendance.formattedCheckOutTime}`,
          employeeName: employee.name,
          checkInTime: existingAttendance.formattedCheckInTime,
          checkOutTime: existingAttendance.formattedCheckOutTime,
          companyName: admin.companyName,
          alreadyComplete: true
        }, { status: 200 });
      }
    }

    // 3. Create new check-in attendance record
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
      checkInPhotos: facePhotos,
      verificationMethod: 'face',
      formattedCheckInTime: getISTTime(),
      status: 'checked-in'
    });

    await attendance.save();

    // 4. Send Notification (Optional - only if email provided)
    if (email && email.trim()) {
      try {
        await sendCheckinNotification(email, employee.name, getISTTime(), admin.companyName);
      } catch (err) {
        console.error('Email failed:', err);
      }
    }

    return NextResponse.json({ 
      message: 'Check-in recorded successfully!',
      employeeName: employee.name,
      checkInTime: getISTTime(),
      companyName: admin.companyName,
      isCheckIn: true,
      reminderMessage: 'Remember to check out when you leave!'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Check-in API error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
