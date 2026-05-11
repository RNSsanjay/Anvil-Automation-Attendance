import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function GET() {
  try {
    const session = await getServerSession() as any;
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const admin = await Admin.findOne({ email: session.user.email }).select('-passwordHash -otpCode -resetPasswordOtp');

    if (!admin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json(admin);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession() as any;
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { companyName, location } = await req.json();
    await dbConnect();

    const update: any = {};
    if (companyName) update.companyName = companyName;
    if (location) update.location = location;

    const admin = await Admin.findOneAndUpdate(
      { email: session.user.email },
      update,
      { new: true }
    ).select('-passwordHash');

    return NextResponse.json(admin);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
