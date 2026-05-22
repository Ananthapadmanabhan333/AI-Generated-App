import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Developer Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'admin@talentos.dev' },
        password: { label: 'Password', type: 'password', placeholder: 'admin123' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password');
        }

        // Auto-seed admin user if they don't exist yet to make startup seamless!
        if (credentials.email === 'admin@talentos.dev' && credentials.password === 'admin123') {
          let adminUser = await prisma.user.findUnique({
            where: { email: 'admin@talentos.dev' },
          });

          if (!adminUser) {
            try {
              const hashedPassword = await bcrypt.hash('admin123', 10);
              adminUser = await prisma.user.create({
                data: {
                  email: 'admin@talentos.dev',
                  name: 'System Administrator',
                  password: hashedPassword,
                },
              });
            } catch (err) {
              console.error('Failed to auto-seed admin user:', err);
            }
          }
          if (adminUser) {
            return {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name,
            };
          }
        }

        // Look up other credentials users in the database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password credentials');
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error('Invalid email or password credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || 'MOCK_GITHUB_ID',
      clientSecret: process.env.GITHUB_SECRET || 'MOCK_GITHUB_SECRET',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'MOCK_GOOGLE_CLIENT_ID',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'MOCK_GOOGLE_CLIENT_SECRET',
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'TALENTOS_SUPER_SECRET_SALT_2026',
};
export default authOptions;
