import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!companyId || !phone) {
      return NextResponse.json({ message: 'Company ID and phone are required' }, { status: 400 });
    }

    await dbConnect();

    const query: any = { companyId, phone };
    if (email) query.email = email;

    const employee = await Employee.findOne(query);

    if (!employee) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error('Get employee info error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
