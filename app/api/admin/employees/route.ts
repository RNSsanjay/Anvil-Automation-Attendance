import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';

export async function GET() {
  try {
    const session = await getServerSession() as any;
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const employees = await Employee.find({ companyId: session.user.companyId }).sort({ createdAt: -1 });

    return NextResponse.json(employees);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
