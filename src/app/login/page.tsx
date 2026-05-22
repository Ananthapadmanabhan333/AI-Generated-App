'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState('admin@talentos.dev');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // NextAuth v4 returns CredentialsSignin for standard errors, or bubbles up custom Error messages
        if (result.error === 'CredentialsSignin') {
          setErrorMsg('Invalid login details. Please check and try again.');
        } else {
          setErrorMsg(result.error);
        }
      } else {
        router.replace('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch {
      setErrorMsg(`Failed establishing OAuth connection via ${provider}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background glowing blurred circles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-indigo-600/10 blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px]" />

      <div className="w-full max-w-md space-y-6 z-10">
        
        {/* Logo / Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl shadow-xl shadow-indigo-600/20 mb-2">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Access Developer Console
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Manage, generate, and preview your metadata-driven applications.
          </p>
        </div>

        {/* Credentials Form Box */}
        <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/60 shadow-2xl backdrop-blur-md space-y-5">
          
          {errorMsg && (
            <div className="p-4 border border-rose-500/20 rounded-xl bg-rose-500/5 text-rose-300 text-xs flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-zinc-300 tracking-wide flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
                <span>Developer Email</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@talentos.dev"
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/50 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-zinc-300 tracking-wide flex items-center">
                  <Lock className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
                  <span>Access Password</span>
                </label>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/50 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-xs font-semibold text-white rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg shadow-indigo-500/10 cursor-pointer active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Establishing Credentials Auth...</span>
                </>
              ) : (
                <span>Launch Console</span>
              )}
            </button>

          </form>

          {/* Social OAuth Sign In Partition */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-zinc-900 w-full" />
            <span className="absolute bg-zinc-950 px-3 text-[10px] uppercase font-bold text-zinc-600 tracking-widest font-mono">
              OAuth Identity Providers
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            
            <button
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading}
              className="py-2.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 rounded-lg text-xs font-medium text-zinc-300 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-white fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              <span>GitHub</span>
            </button>

            <button
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className="py-2.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 rounded-lg text-xs font-medium text-zinc-300 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 0 12 0 7.35 0 3.37 2.67 1.45 6.57l3.89 3.02c.9-2.73 3.46-4.55 6.66-4.55z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-1.99 3.43-4.92 3.43-8.6z"/>
                <path fill="#FBBC05" d="M5.34 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.45 6.68C.53 8.52 0 10.59 0 12.79s.53 4.27 1.45 6.11l3.89-3.01z"/>
                <path fill="#34A853" d="M12 18.96c-3.2 0-5.76-1.82-6.66-4.55L1.45 17.43C3.37 21.33 7.35 24 12 24c2.98 0 5.76-1.07 7.74-2.91l-3.7-2.87c-1.08.72-2.46 1.14-4.04 1.14z"/>
              </svg>
              <span>Google</span>
            </button>

          </div>

          {/* Seeding credentials display card */}
          <div className="mt-4 p-4 border border-indigo-500/10 rounded-xl bg-indigo-500/5 shadow-inner space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <h4 className="text-[10px] font-bold tracking-wider text-indigo-300 uppercase">
                Seed Mode Credentials Enabled
              </h4>
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal">
              To evaluate local databases seamlessly, log in using:
            </p>
            <div className="font-mono text-[10px] text-indigo-200/90 bg-zinc-950 p-2 rounded border border-zinc-900 space-y-1 select-all">
              <p>Email: <span className="text-white font-semibold">admin@talentos.dev</span></p>
              <p>Pass: <span className="text-white font-semibold">admin123</span></p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
