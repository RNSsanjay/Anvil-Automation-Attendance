import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';

export async function POST(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session) {
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
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
