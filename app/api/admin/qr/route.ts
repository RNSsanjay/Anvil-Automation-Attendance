import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
    }

    await dbConnect();

    const admin = await Admin.findOne({ companyId }).select('companyName location');

    if (!admin) {
      return NextResponse.json({ message: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json(admin);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
