import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function POST(req: Request) {
  try {
    const { email, otpCode } = await req.json();

    if (!email || !otpCode) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (admin.otpCode !== otpCode) {
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    if (new Date() > admin.otpExpiry) {
      return NextResponse.json({ message: 'OTP expired' }, { status: 400 });
    }

    admin.verified = true;
    admin.otpCode = undefined;
    admin.otpExpiry = undefined;
    await admin.save();

    return NextResponse.json({ message: 'Email verified successfully', companyId: admin.companyId }, { status: 200 });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
