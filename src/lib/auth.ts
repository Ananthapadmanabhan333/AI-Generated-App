import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Resiliency Fallbacks: Dynamically inject secrets at runtime if not defined in the hosting environment (Vercel)
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'TALENTOS_SUPER_SECRET_SALT_2026';
}

if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

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

        const emailInput = credentials.email.trim().toLowerCase();
        const passwordInput = credentials.password.trim();

        try {
          // Auto-seed admin user if they don't exist yet to make startup seamless!
          if (emailInput === 'admin@talentos.dev' && passwordInput === 'admin123') {
            let adminUser = null;
            try {
              adminUser = await prisma.user.findUnique({
                where: { email: 'admin@talentos.dev' },
              });
            } catch (err: any) {
              console.warn('Database offline or not configured. Logging into Sandbox Mode bypass:', err.message || err);
              return {
                id: 'sandbox-user-id',
                email: 'admin@talentos.dev',
                name: 'System Administrator (Sandbox)',
              };
            }

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
              } catch (err: any) {
                console.warn('Failed to seed admin user to DB, falling back to Sandbox Mode session:', err.message || err);
                return {
                  id: 'sandbox-user-id',
                  email: 'admin@talentos.dev',
                  name: 'System Administrator (Sandbox)',
                };
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
          let user = null;
          try {
            user = await prisma.user.findUnique({
              where: { email: emailInput },
            });
          } catch (err: any) {
            console.error('Database query failed for credential user:', err);
            throw new Error(
              `Database Connection Error: Failed searching for user in table. Make sure DATABASE_URL is configured. (Prisma: ${err.message || err})`
            );
          }

          if (!user || !user.password) {
            throw new Error('Invalid email or password credentials');
          }

          const isValidPassword = await bcrypt.compare(passwordInput, user.password);
          if (!isValidPassword) {
            throw new Error('Invalid email or password credentials');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error: any) {
          // Re-throw if it's already our custom descriptive errors
          if (error.message && (error.message.includes('Database Connection Error') || error.message.includes('Database Write Error') || error.message.includes('Invalid email'))) {
            throw error;
          }
          throw new Error(`Authentication Engine Failure: ${error.message || error}`);
        }
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
