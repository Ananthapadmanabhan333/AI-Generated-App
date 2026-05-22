'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/store/useAppStore';
import DashboardLayout from '@/components/dashboard-layout';
import {
  Terminal,
  Play,
  Loader2,
  HelpCircle,
  Database,
  ShieldCheck,
} from 'lucide-react';

export default function ApiExplorerPage() {
  const { data: session, status } = useSession();
  const { activeConfig } = useAppStore();

  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [endpoint, setEndpoint] = useState('');
  const [payloadText, setPayloadText] = useState('{\n  \n}');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [payloadError, setPayloadError] = useState<string | null>(null);

  // Set default endpoint to the active app plural slug
  useEffect(() => {
    if (activeConfig?.slug) {
      setEndpoint(activeConfig.slug);
    } else {
      setEndpoint('students');
    }
  }, [activeConfig]);

  // Set standard dummy payload depending on activeConfig fields or dummy schema
  useEffect(() => {
    if (method === 'GET' || method === 'DELETE') return;

    if (activeConfig?.config?.schema?.fields) {
      const template = activeConfig.config.schema.fields.reduce((acc: any, curr) => {
        if (curr.type === 'number') acc[curr.name] = curr.default !== undefined ? Number(curr.default) : 0;
        else if (curr.type === 'checkbox' || curr.type === 'boolean') acc[curr.name] = false;
        else acc[curr.name] = curr.default || '';
        return acc;
      }, {});
      setPayloadText(JSON.stringify(template, null, 2));
    } else {
      setPayloadText(
        JSON.stringify(
          {
            studentName: 'John Doe',
            email: 'john.doe@example.com',
            age: 22,
            status: 'Active',
          },
          null,
          2
        )
      );
    }
  }, [method, activeConfig]);

  const handlePayloadChange = (val: string) => {
    setPayloadText(val);
    if (method === 'GET' || method === 'DELETE') {
      setPayloadError(null);
      return;
    }
    try {
      JSON.parse(val);
      setPayloadError(null);
    } catch (err: any) {
      setPayloadError(`Invalid JSON format: ${err.message}`);
    }
  };

  const executeRequest = async () => {
    if (payloadError && (method === 'POST' || method === 'PUT')) return;

    setExecuting(true);
    setResponseBody(null);
    setResponseStatus(null);

    const baseUrl = '/api';
    // Remove slash prefix or suffix
    const cleanEndpoint = endpoint.trim().replace(/^\/|\/$/g, '');
    let url = `${baseUrl}/${cleanEndpoint}`;

    try {
      const options: RequestInit = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method === 'POST' || method === 'PUT') {
        options.body = payloadText;
      }

      // If DELETE or PUT requires id, support appending id in query params from payload if found
      if (method === 'DELETE' || method === 'PUT') {
        try {
          const parsed = JSON.parse(payloadText);
          if (parsed.id) {
            url = `${url}?id=${parsed.id}`;
          }
        } catch {
          // ignore
        }
      }

      const res = await fetch(url, options);
      setResponseStatus(res.status);
      const text = await res.text();

      try {
        const parsedBody = JSON.parse(text);
        setResponseBody(JSON.stringify(parsedBody, null, 2));
      } catch {
        setResponseBody(text);
      }
    } catch (err: any) {
      setResponseStatus(500);
      setResponseBody(
        JSON.stringify(
          {
            success: false,
            error: 'Request failed to execute',
            details: err?.message || String(err),
          },
          null,
          2
        )
      );
    } finally {
      setExecuting(false);
    }
  };

  if (status === 'loading') return null;
  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn font-sans h-full flex flex-col">
        
        {/* Page Header */}
        <div className="border-b border-zinc-900 pb-4">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <span>Dynamic REST API Explorer</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Test and interact with your compiled generic endpoint collections directly. Checks schemas, catches 400 bad payload errors.
          </p>
        </div>

        {/* Dynamic Interactive Request Builder Card */}
        <div className="p-5 border border-zinc-900 bg-zinc-950/40 rounded-2xl space-y-4">
          
          <div className="flex flex-col md:flex-row gap-3">
            
            {/* Method Select Dropdown */}
            <div className="w-full md:w-32">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer uppercase"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            {/* URL Input Bar */}
            <div className="flex-1 flex items-center relative">
              <div className="absolute left-3.5 text-[10px] font-bold text-zinc-500 font-mono select-none">
                http://localhost:3000/api/
              </div>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="students"
                className="w-full pl-[165px] pr-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 font-mono text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Request Trigger button */}
            <button
              onClick={executeRequest}
              disabled={executing || !!payloadError}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 text-xs font-semibold text-white rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-500/10 cursor-pointer shrink-0 active:scale-95"
            >
              {executing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Send Request</span>
                </>
              )}
            </button>

          </div>

          <div className="p-3.5 bg-zinc-900/30 border border-zinc-900/80 rounded-xl flex items-center space-x-2.5 text-[10px] text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Endpoints validate inputs against user-defined Zod schemas, write record rows, and run triggers asynchronously.
            </span>
          </div>

        </div>

        {/* Double-Split request payload vs response body panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
          
          {/* Payload Parameters block (Left) */}
          <div className="lg:col-span-5 flex flex-col space-y-3 min-h-[350px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase font-mono flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>JSON Request Payload Body</span>
              </span>
              
              {payloadError && (method === 'POST' || method === 'PUT') && (
                <span className="text-[8px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-mono animate-pulse">
                  Invalid JSON syntax
                </span>
              )}
            </div>

            <textarea
              value={payloadText}
              onChange={(e) => handlePayloadChange(e.target.value)}
              disabled={method === 'GET' || method === 'DELETE'}
              className="w-full flex-1 min-h-[350px] p-4 rounded-xl border border-zinc-900 bg-zinc-950 font-mono text-xs text-indigo-300 placeholder:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed selection:bg-indigo-500/25 select-all"
              style={{ resize: 'none' }}
              spellCheck="false"
            />
          </div>

          {/* Request Response Body block (Right) */}
          <div className="lg:col-span-7 flex flex-col space-y-3 min-h-[350px]">
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase font-mono flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>HTTP Response Headers &amp; Data</span>
              </span>

              {responseStatus && (
                <span
                  className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}
                >
                  Status: {responseStatus}
                </span>
              )}
            </div>

            <div className="flex-1 rounded-xl border border-zinc-900 bg-zinc-950 p-4 font-mono text-xs text-emerald-400 overflow-y-auto min-h-[350px] max-h-[50vh] relative select-all">
              {executing ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm">
                  <div className="flex flex-col items-center space-y-2 text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    <p className="text-[10px] font-bold tracking-widest uppercase">Awaiting transaction...</p>
                  </div>
                </div>
              ) : null}

              {responseBody ? (
                <pre className="whitespace-pre leading-relaxed">{responseBody}</pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-zinc-600 italic text-xs py-12">
                  No request executed yet. Select method and hit Send Request.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
