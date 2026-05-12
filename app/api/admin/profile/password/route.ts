import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { sendPasswordResetOTP } from '@/lib/email';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Admin.findOneAndUpdate(
      { email: session.user.email },
      { resetPasswordOtp: otpCode, resetPasswordExpiry: otpExpiry }
    );

    await sendPasswordResetOTP(session.user.email, otpCode);

    return NextResponse.json({ message: 'OTP sent to your email' });
  } catch (error: any) {
    console.error('Send password OTP error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { otpCode, newPassword } = await req.json();
    if (!otpCode || !newPassword) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    await dbConnect();
    const admin = await Admin.findOne({ email: session.user.email });

    if (!admin || admin.resetPasswordOtp !== otpCode || new Date() > admin.resetPasswordExpiry) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    admin.passwordHash = passwordHash;
    admin.resetPasswordOtp = undefined;
    admin.resetPasswordExpiry = undefined;
    await admin.save();

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Update password error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
