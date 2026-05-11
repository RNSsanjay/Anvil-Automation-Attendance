import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';
import { format } from 'date-fns';

export async function GET(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.companyId;
    const today = format(new Date(), 'yyyy-MM-dd');

    await dbConnect();

    const totalEmployees = await Employee.countDocuments({ companyId });
    const presentToday = await Attendance.countDocuments({ companyId, date: today });
    const absentToday = Math.max(0, totalEmployees - presentToday);
    
    // Simple monthly rate calculation
    const thisMonth = format(new Date(), 'yyyy-MM');
    const monthlyAttendance = await Attendance.countDocuments({ companyId, month: thisMonth });
    const monthlyRate = totalEmployees > 0 
      ? Math.round((monthlyAttendance / (totalEmployees * 30)) * 100) 
      : 0;

    return NextResponse.json({
      totalEmployees,
      presentToday,
      absentToday,
      monthlyRate,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
