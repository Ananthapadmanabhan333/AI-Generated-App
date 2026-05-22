'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Sliders,
  GitBranch,
  Terminal,
  LogOut,
  Menu,
  X,
  Zap,
  User,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sandboxMode = useAppStore((state) => state.sandboxMode);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Config Editor', href: '/editor', icon: Sliders },
    { name: 'Workflow Builder', href: '/workflows', icon: GitBranch },
    { name: 'API Explorer', href: '/explorer', icon: Terminal },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      
      {/* Top Banner with micro-gradient */}
      <header className="h-16 border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 border border-zinc-800 bg-zinc-900/40 rounded-lg md:hidden text-zinc-400 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Zap className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="flex items-center">
              <span className="font-bold text-sm tracking-wider uppercase text-white bg-clip-text">
                Talent<span className="text-indigo-400 font-extrabold">OS</span>
              </span>
              <span className="hidden sm:inline-block text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-md ml-2 font-mono uppercase font-semibold">
                Runtime Platform
              </span>
              {sandboxMode && (
                <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-md ml-2 font-mono uppercase font-bold animate-pulse flex items-center">
                  <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                  Sandbox
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* User Account / Context Info */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-zinc-900">
            <div className="text-right">
              <p className="text-xs font-semibold text-zinc-200">
                {session?.user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                {session?.user?.email || 'admin@talentos.dev'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-zinc-900 bg-zinc-950/80 p-4 justify-between">
          <div className="space-y-6">
            <div className="px-2">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">
                Generator Console
              </p>
            </div>
            <nav className="space-y-1.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-white shadow-md'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-200'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Controls */}
          <div className="border-t border-zinc-900/60 pt-4 space-y-3">
            {sandboxMode ? (
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1.5">
                <div className="flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">In-Memory Sandbox</p>
                </div>
                <p className="text-[9px] text-zinc-400 leading-normal">
                  Neon PostgreSQL not linked. Database is running in-memory and will reset periodically.
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-zinc-900/30 border border-zinc-800/80 rounded-xl flex items-center space-x-3">
                <Shield className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-[10px] font-semibold text-zinc-300">Resilient Node Active</p>
                  <p className="text-[9px] text-zinc-500">Auto-containment logs</p>
                </div>
              </div>
            )}
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg text-xs font-semibold tracking-wide transition-all border border-transparent hover:border-rose-500/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-zinc-500 hover:text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            
            {/* Sidebar drawer content */}
            <div className="relative w-64 bg-zinc-950 border-r border-zinc-900 p-5 flex flex-col justify-between z-10 animate-slideRight">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <span className="font-bold text-xs uppercase tracking-wider text-white">
                    TalentOS Platform
                  </span>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1 border border-zinc-800 bg-zinc-900/40 rounded text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-white'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-zinc-500" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-zinc-900 pt-4 space-y-4">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Display Window */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-zinc-950 font-sans">
          <div className="max-w-7xl mx-auto h-full">{children}</div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
