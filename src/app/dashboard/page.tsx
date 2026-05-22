'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import DashboardLayout from '@/components/dashboard-layout';
import {
  Sparkles,
  Layers,
  ArrowRight,
  GitBranch,
  Database,
  Sliders,
  Calendar,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { configs, fetchConfigs, isLoading, deleteConfig, setActiveConfig } = useAppStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated') {
      fetchConfigs();
    }
  }, [status, router, fetchConfigs]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this application? All records and workflows will be permanently deleted.')) {
      await deleteConfig(id);
    }
  };

  const handleLaunchApp = (config: any) => {
    setActiveConfig(config);
    router.push('/editor');
  };

  // Render a loading skeletons block
  if (status === 'loading' || (isLoading && configs.length === 0)) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-10 bg-zinc-900 rounded-lg w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-zinc-900 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-zinc-900 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  // Double check session
  if (!session) return null;

  // Simple statistics calculations
  const totalApps = configs.length;
  const totalWorkflows = configs.reduce((acc, curr) => acc + (curr.workflows?.length || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fadeIn font-sans">
        
        {/* Visual Splash Welcome Banner */}
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/10 to-zinc-950 border border-indigo-500/20 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-48 h-48 text-indigo-400" />
          </div>
          <div className="max-w-xl space-y-3 z-10 relative">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold tracking-wider uppercase">
              <Zap className="w-3 h-3 text-indigo-400 animate-pulse" />
              <span>Platform Active</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Welcome back, <span className="text-indigo-300">{session.user?.name || 'Developer'}</span>!
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Design relational models, layout responsive forms/tables, write triggers, and preview fully production-grade apps instantly using declarative JSON schemas.
            </p>
            <div className="pt-2">
              <Link
                href="/editor"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-200"
              >
                <span>Launch Config Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Telemetry Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 flex items-center justify-between group hover:border-zinc-800 transition-colors">
            <div className="space-y-1">
              <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Active Dynamic Apps</p>
              <p className="text-2xl font-bold tracking-tight text-white">{totalApps}</p>
            </div>
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 flex items-center justify-between group hover:border-zinc-800 transition-colors">
            <div className="space-y-1">
              <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Configured Triggers</p>
              <p className="text-2xl font-bold tracking-tight text-white">{totalWorkflows}</p>
            </div>
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-cyan-400">
              <GitBranch className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 flex items-center justify-between group hover:border-zinc-800 transition-colors">
            <div className="space-y-1">
              <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Storage Cluster Type</p>
              <p className="text-xs font-semibold text-white tracking-wide mt-1">PostgreSQL JSONB</p>
              <p className="text-[10px] text-zinc-500">Neon Cluster Compatible</p>
            </div>
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* Dynamic Generated Apps Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
            Your Dynamic Applications
          </h2>

          {configs.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-zinc-900 bg-zinc-950/20 rounded-2xl text-center space-y-4 flex flex-col items-center justify-center">
              <div className="p-4 bg-zinc-900/40 rounded-full text-zinc-500 border border-zinc-800">
                <Sliders className="w-8 h-8" />
              </div>
              <div className="max-w-xs space-y-1">
                <h3 className="text-sm font-bold text-white">No applications generated yet</h3>
                <p className="text-xs text-zinc-500">
                  Bootstrap your first platform instantly by declarative schema configurations or let our AI agent write it.
                </p>
              </div>
              <div>
                <Link
                  href="/editor"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition-colors inline-block"
                >
                  Create Application Config
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {configs.map((app) => {
                const fieldsCount = (app.config as any)?.schema?.fields?.length || 0;
                const layoutType = (app.config as any)?.layout?.type || 'dashboard';

                return (
                  <div
                    key={app.id}
                    onClick={() => handleLaunchApp(app)}
                    className="group border border-zinc-900 hover:border-zinc-800/80 bg-zinc-950/40 rounded-2xl p-5 shadow-md flex flex-col justify-between hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
                  >
                    {/* Visual glowing slide overlays */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                            <span>{app.name}</span>
                          </h3>
                          <span className="text-[9px] font-mono text-zinc-500">
                            /api/{app.slug}
                          </span>
                        </div>
                        <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md font-mono capitalize">
                          {layoutType}
                        </span>
                      </div>

                      {/* Config summary details */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-900/60 font-mono text-zinc-500">
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-zinc-600">Model Fields</span>
                          <span className="text-zinc-300 font-semibold">{fieldsCount} mapped</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-zinc-600">Automations</span>
                          <span className="text-zinc-300 font-semibold">{app.workflows?.length || 0} active</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-900/60 mt-5 pt-3.5 flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-zinc-500 text-[10px]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Created {new Date(app.createdAt || '').toLocaleDateString()}</span>
                      </div>
                      
                      <button
                        onClick={(e) => handleDelete(e, app.id!)}
                        className="px-2.5 py-1.5 border border-transparent hover:border-rose-500/10 hover:bg-rose-500/5 rounded-md text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Delete application"
                      >
                        Delete
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
