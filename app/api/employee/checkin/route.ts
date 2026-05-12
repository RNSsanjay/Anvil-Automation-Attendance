import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';
import Admin from '@/models/Admin';
import { isWithinRange } from '@/lib/geofence';
import { sendCheckinNotification } from '@/lib/email';
import { getISTToday, getISTMonth, getISTTime, getISTDate } from '@/lib/ist';

// Face matching helper - Euclidean distance calculation
function euclideanDistance(desc1: number[], desc2: number[]): number {
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
}

// Find best matching face from stored descriptors
function findBestMatch(currentDescriptor: number[], storedDescriptors: number[][]): { distance: number; isMatch: boolean } {
  if (!storedDescriptors || storedDescriptors.length === 0) {
    return { distance: Infinity, isMatch: false };
  }

  let minDistance = Infinity;
  for (const stored of storedDescriptors) {
    const distance = euclideanDistance(currentDescriptor, stored);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }

  // Threshold: 0.6 is standard for face recognition (lower = more similar)
  return { distance: minDistance, isMatch: minDistance < 0.6 };
}

export async function POST(req: Request) {
  try {
    const { companyId, name, phone, email, location, facePhotos, faceDescriptors } = await req.json();

    if (!companyId || !name || !phone || !location) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (!faceDescriptors || faceDescriptors.length === 0) {
      return NextResponse.json({ message: 'Face recognition failed. Please try again.' }, { status: 400 });
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

    // 1. Find or create employee with face verification
    let employee = await Employee.findOne({ companyId, phone });
    
    if (!employee) {
      // First time registration - store face descriptors and photos
      if (!name) {
        return NextResponse.json({ message: 'First-time registration requires name' }, { status: 400 });
      }
      employee = new Employee({ 
        companyId, 
        name, 
        phone, 
        email: email || '', // Email is optional
        faceDescriptors: faceDescriptors, // Store face descriptors (128-dimension vectors)
        faceProfiles: facePhotos // Keep photos for backward compatibility
      });
      await employee.save();
    } else {
      // Returning employee - verify face match
      if (employee.faceDescriptors && employee.faceDescriptors.length > 0) {
        const matchResult = findBestMatch(faceDescriptors[0], employee.faceDescriptors);
        
        if (!matchResult.isMatch) {
          return NextResponse.json({ 
            message: 'Face verification failed. Face does not match registered profile.',
            matchDistance: matchResult.distance.toFixed(2),
            threshold: 0.6
          }, { status: 403 });
        }
        
        console.log(`Face matched for ${employee.name} with distance: ${matchResult.distance.toFixed(3)}`);
      }
      // If no descriptors stored (old data), update with new descriptors
      if (!employee.faceDescriptors || employee.faceDescriptors.length === 0) {
        employee.faceDescriptors = faceDescriptors;
        await employee.save();
      }
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
