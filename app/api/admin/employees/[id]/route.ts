import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession() as any;
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, email } = await req.json();
    await dbConnect();

    const employee = await Employee.findOneAndUpdate(
      { _id: params.id, companyId: session.user.companyId },
      { name, phone, email },
      { new: true }
    );

    if (!employee) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession() as any;
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const employee = await Employee.findOneAndDelete({
      _id: params.id,
      companyId: session.user.companyId,
    });

    if (!employee) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Employee deleted' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
