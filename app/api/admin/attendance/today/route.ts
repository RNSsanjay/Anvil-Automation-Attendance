import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import { format } from 'date-fns';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.companyId;
    const today = format(new Date(), 'yyyy-MM-dd');

    await dbConnect();

    const attendance = await Attendance.find({ 
      companyId, 
      date: today 
    }).sort({ checkInTime: -1 });

    return NextResponse.json(attendance);
  } catch (error: any) {
    console.error('Get today attendance error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
