import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!companyId || (!email && !phone)) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    await dbConnect();

    const query: any = { companyId };
    if (email) query.email = email;
    if (phone) query.phone = phone;

    const employee = await Employee.findOne(query);

    if (!employee) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
