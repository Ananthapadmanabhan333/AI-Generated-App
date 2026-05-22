import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Ensure NEXTAUTH_SECRET is available when the API route initializes
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'TALENTOS_SUPER_SECRET_SALT_2026';
}

if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
