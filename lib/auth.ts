import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await dbConnect();
        const admin = await Admin.findOne({ email: credentials.email });

        if (!admin) {
          throw new Error('No user found with this email');
        }

        if (!admin.verified) {
          throw new Error('Please verify your email before logging in');
        }

        const isValid = await bcrypt.compare(credentials.password, admin.passwordHash);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.companyName,
          companyId: admin.companyId,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.companyId = (user as any).companyId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).companyId = token.companyId;
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
