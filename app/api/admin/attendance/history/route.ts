import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const companyId = session.user.companyId;

    if (!month) {
      return NextResponse.json({ message: 'Month is required' }, { status: 400 });
    }

    await dbConnect();

    const attendance = await Attendance.find({ 
      companyId, 
      month 
    }).sort({ date: -1, checkInTime: -1 });

    return NextResponse.json(attendance);
  } catch (error: any) {
    console.error('Get attendance history error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
