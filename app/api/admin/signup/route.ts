import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendOTPEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { companyName, email, password, location } = await req.json();

    if (!companyName || !email || !password || !location) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const companyId = uuidv4();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const admin = new Admin({
      companyId,
      companyName,
      email,
      passwordHash,
      location,
      otpCode,
      otpExpiry,
    });

    await admin.save();
    await sendOTPEmail(email, otpCode);

    return NextResponse.json({ message: 'Admin registered. Please verify your email.' }, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
