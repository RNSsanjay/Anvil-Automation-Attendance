import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { month } = await req.json();
    const companyId = session.user.companyId;

    if (!month) {
      return NextResponse.json({ message: 'Month is required' }, { status: 400 });
    }

    await dbConnect();

    // Delete attendance records for that month and company
    await Attendance.deleteMany({ 
      companyId, 
      month 
    });

    return NextResponse.json({ message: `Attendance for ${month} deleted successfully` });
  } catch (error: any) {
    console.error('Export attendance error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
