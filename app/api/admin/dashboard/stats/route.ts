import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';
import { getISTToday, getISTMonth } from '@/lib/ist';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.companyId;
    const today = getISTToday();

    await dbConnect();

    const totalEmployees = await Employee.countDocuments({ companyId });
    const presentToday = await Attendance.countDocuments({ companyId, date: today });
    const absentToday = Math.max(0, totalEmployees - presentToday);
    
    // Monthly attendance rate calculation
    const thisMonth = getISTMonth();
    const monthlyAttendance = await Attendance.countDocuments({ companyId, month: thisMonth });
    
    // Get days in current month
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    
    // Calculate rate based on days elapsed in month
    const monthlyRate = totalEmployees > 0 && currentDay > 0
      ? Math.min(100, Math.round((monthlyAttendance / (totalEmployees * currentDay)) * 100))
      : 0;

    return NextResponse.json({
      totalEmployees,
      presentToday,
      absentToday,
      monthlyRate,
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
