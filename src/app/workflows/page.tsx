'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import DashboardLayout from '@/components/dashboard-layout';
import {
  GitBranch,
  PlayCircle,
  Activity,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
  Database,
} from 'lucide-react';

export default function WorkflowsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { activeConfig, workflowLogs, fetchWorkflowLogs } = useAppStore();
  const [loading, setLoading] = useState(false);

  const reloadLogs = async () => {
    setLoading(true);
    await fetchWorkflowLogs();
    setLoading(false);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated') {
      fetchWorkflowLogs();
    }
  }, [status, router, fetchWorkflowLogs]);

  if (!session) return null;

  // Extract workflows bound to the active app config
  const activeWorkflows = activeConfig?.workflows || [];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fadeIn font-sans">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-indigo-400" />
              <span>Workflow Automation Designer</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Audit trigger bindings, inspect variable replacements, and track transaction execution logs.
            </p>
          </div>

          <button
            onClick={reloadLogs}
            disabled={loading}
            className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 text-xs font-semibold text-zinc-300 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload Logs</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* Active Workflows Definitions Panel (Left) */}
          <div className="xl:col-span-5 space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-zinc-500 uppercase flex items-center space-x-1.5 font-mono">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Active Action Triggers</span>
            </h2>

            {activeWorkflows.length === 0 ? (
              <div className="p-6 border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/20 text-center space-y-3">
                <PlayCircle className="w-8 h-8 text-zinc-700 mx-auto" />
                <div>
                  <h3 className="text-xs font-bold text-white">No active triggers bound</h3>
                  <p className="text-[10px] text-zinc-500 max-w-xs mx-auto mt-1 leading-normal">
                    Open the Config Editor and add a &quot;workflows&quot; array block inside your application setup to enable automations.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/editor')}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-white rounded-lg transition-colors cursor-pointer"
                >
                  Configure Workflows
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeWorkflows.map((wf, idx) => (
                  <div
                    key={wf.id || idx}
                    className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-3 group hover:border-zinc-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-mono uppercase font-bold">
                        <span>Trigger</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">Rule #{idx + 1}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold text-white">
                      <span className="font-mono text-zinc-400">{wf.trigger}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="font-mono text-emerald-400 capitalize">{wf.action}</span>
                    </div>

                    <div className="text-[10px] bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-900 font-mono text-zinc-500 space-y-1">
                      <span className="block text-[8px] uppercase tracking-wider text-zinc-600 font-bold">Action Parameters</span>
                      <pre className="text-zinc-300 overflow-x-auto select-all leading-relaxed whitespace-pre-wrap">
                        {JSON.stringify(wf.config || {}, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workflow Execution Telemetry Logs Grid Panel (Right) */}
          <div className="xl:col-span-7 space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-zinc-500 uppercase flex items-center space-x-1.5 font-mono">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Real-Time Telemetry Logs</span>
            </h2>

            <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 overflow-hidden min-h-[400px]">
              <div className="p-4 bg-zinc-900/10 border-b border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                <span>Recent Background executions trace</span>
                <span>Max 50 logs loaded</span>
              </div>

              <div className="divide-y divide-zinc-900 overflow-y-auto max-h-[60vh] scrollbar-thin">
                {workflowLogs.length === 0 ? (
                  <div className="p-12 text-center text-xs text-zinc-500 font-medium italic">
                    No background executions logged yet. Triggers are executed asynchronously on form submissions.
                  </div>
                ) : (
                  workflowLogs.map((log) => {
                    const isSuccess = log.status === 'SUCCESS';
                    return (
                      <div key={log.id} className="p-4 hover:bg-zinc-900/20 transition-colors space-y-3 group">
                        
                        {/* Log Status Banner Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {isSuccess ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                              {log.action}
                            </span>
                            <span className="text-[9px] text-zinc-600 font-mono">({log.trigger})</span>
                          </div>

                          <div className="flex items-center space-x-1 text-[9px] text-zinc-500 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-300 font-mono pl-6 leading-relaxed">
                          {log.message}
                        </p>

                        {/* Expandable JSON Payload Block */}
                        <div className="pl-6">
                          <details className="text-[9px] border border-zinc-900 rounded bg-zinc-950/60 p-2 cursor-pointer transition-colors duration-200">
                            <summary className="text-zinc-500 select-none outline-none font-semibold">
                              Inspect Trigger Payload Block
                            </summary>
                            <div className="mt-2 text-emerald-400 overflow-x-auto whitespace-pre font-mono p-1 text-[8px] select-all leading-normal">
                              {JSON.stringify(log.payload || {}, null, 2)}
                            </div>
                          </details>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-3 bg-zinc-950/80 border-t border-zinc-900/60 flex items-center justify-between text-[9px] text-zinc-500 font-medium">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-zinc-500" />
                  <span>Telemetry logged automatically inside DB</span>
                </span>
                <span>Platform Cluster active</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
