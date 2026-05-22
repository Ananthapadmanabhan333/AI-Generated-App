'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import DashboardLayout from '@/components/dashboard-layout';
import DynamicRenderer from '@/components/dynamic/DynamicRenderer';
import {
  Sliders,
  Sparkles,
  Download,
  Save,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  FileCode,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const DEFAULT_JSON = {
  name: 'Student Portal',
  slug: 'students',
  config: {
    layout: {
      type: 'dashboard',
      children: [
        {
          type: 'stats',
          title: 'Enrollment Quick Statistics',
          metrics: [
            { label: 'Total Enrolled', value: 'count', source: 'students' },
            { label: 'Standard Classrooms', value: 'const', source: 8 },
          ],
        },
        {
          type: 'card',
          title: 'Student Registration Form',
          children: [
            {
              type: 'form',
              collection: 'students',
              title: 'Add New Student Record',
              fields: [
                { name: 'studentName', label: 'Student Name', type: 'text', required: true, minLength: 2 },
                { name: 'email', label: 'Academic Email Address', type: 'email', required: true },
                { name: 'age', label: 'Age Check', type: 'number', required: false, min: 16, max: 100 },
                { name: 'status', label: 'Enrollment Status', type: 'select', required: true, options: ['Active', 'On Leave', 'Graduated'], default: 'Active' },
              ],
            },
          ],
        },
        {
          type: 'card',
          title: 'Live Directory Database',
          children: [
            {
              type: 'table',
              collection: 'students',
              title: 'Registered Student Roster',
              columns: [
                { key: 'studentName', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'age', label: 'Age' },
                { key: 'status', label: 'Status' },
              ],
            },
          ],
        },
      ],
    },
    schema: {
      fields: [
        { name: 'studentName', type: 'text', required: true, minLength: 2 },
        { name: 'email', type: 'email', required: true },
        { name: 'age', type: 'number', required: false, min: 16, max: 100 },
        { name: 'status', type: 'select', required: true, options: ['Active', 'On Leave', 'Graduated'], default: 'Active' },
      ],
    },
  },
  workflows: [
    {
      trigger: 'form_submit',
      action: 'notification',
      config: { message: 'Alert: Student {{studentName}} successfully added!' },
    },
    {
      trigger: 'form_submit',
      action: 'log',
      config: { format: 'JSON' },
    },
  ],
};

export default function ConfigEditorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { activeConfig, saveConfig } = useAppStore();

  const [jsonText, setJsonText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // AI assistant state
  const [promptText, setPromptText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // Load editor contents on mount or config toggle
  useEffect(() => {
    if (activeConfig) {
      const formatted = {
        name: activeConfig.name,
        slug: activeConfig.slug,
        config: activeConfig.config,
        workflows: activeConfig.workflows || [],
      };
      setJsonText(JSON.stringify(formatted, null, 2));
      setCurrentConfig(formatted);
    } else {
      setJsonText(JSON.stringify(DEFAULT_JSON, null, 2));
      setCurrentConfig(DEFAULT_JSON);
    }
  }, [activeConfig]);

  // Live validator on change
  const handleTextChange = (val: string) => {
    setJsonText(val);
    setSaveSuccess(false);

    try {
      const parsed = JSON.parse(val);
      if (!parsed.name || !parsed.slug || !parsed.config) {
        setParseError('Missing mandatory properties: name, slug, or config node is absent.');
        return;
      }
      setParseError(null);
      setCurrentConfig(parsed);
    } catch (err: any) {
      setParseError(`JSON Syntax Error: ${err.message}`);
    }
  };

  const handleSaveToDB = async () => {
    if (parseError || !currentConfig) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await saveConfig(
        currentConfig.name,
        currentConfig.slug,
        currentConfig.config.layout,
        currentConfig.config.schema?.fields || [],
        currentConfig.workflows || []
      );

      if (res) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        setSaveError('Failed updating database application config record.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error occurred saving setup.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadConfig = () => {
    if (parseError || !currentConfig) return;
    try {
      const blob = new Blob([jsonText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentConfig.slug}-app-config.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed generating file stream:', err);
    }
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setGenerating(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        const payload = result.data;
        const formatted = JSON.stringify(payload, null, 2);
        setJsonText(formatted);
        setCurrentConfig(payload);
        setParseError(null);
        setPromptText('');
      } else {
        setAiError(result.error || 'AI generation failed.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Failed connecting to AI assistant.');
    } finally {
      setGenerating(false);
    }
  };

  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn font-sans h-full flex flex-col">
        
        {/* Editor Screen Header Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Config Editor Console</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Modify the JSON schema layout directly or prompt AI to build complex relational views.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadConfig}
              disabled={!!parseError}
              className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed bg-zinc-900/30 text-xs font-semibold text-zinc-300 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
              title="Download local JSON configuration bundle"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Schema</span>
            </button>

            <button
              onClick={handleSaveToDB}
              disabled={!!parseError || saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 text-xs font-semibold text-white rounded-lg flex items-center space-x-2 transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save &amp; Deploy App</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Prompt Generation Drawer Bar */}
        <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center space-x-2.5 shrink-0 self-start md:self-auto py-1">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Sparkles className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-zinc-300 uppercase">AI-Assisted App Creator</p>
              <p className="text-[9px] text-zinc-500">Auto-compiles fully interactive runtime screens</p>
            </div>
          </div>

          <form onSubmit={handleAIGenerate} className="flex-1 w-full flex items-center gap-3">
            <input
              type="text"
              placeholder="E.g., Onboard employee roster dashboard with salaries and marketing dropdown..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={generating || !promptText.trim()}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-xs font-semibold text-white border border-zinc-700/50 rounded-lg flex items-center justify-center space-x-2 shrink-0 transition-colors cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Generate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {aiError && (
          <div className="p-4 border border-rose-500/20 rounded-xl bg-rose-500/5 text-rose-300 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>AI Error: {aiError}</span>
          </div>
        )}

        {/* Global Save Action status banner logs */}
        {saveSuccess && (
          <div className="p-4 border border-emerald-500/20 rounded-xl bg-emerald-500/5 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Application config successfully written to PostgreSQL and deployed to Live Sandbox!</span>
          </div>
        )}

        {saveError && (
          <div className="p-4 border border-rose-500/20 rounded-xl bg-rose-500/5 text-rose-300 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Failed deploying application: {saveError}</span>
          </div>
        )}

        {/* Master Double-Split Panel Block */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 items-stretch">
          
          {/* JSON Text Editor Area Panel */}
          <div className="xl:col-span-5 flex flex-col space-y-3 min-h-[500px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase flex items-center space-x-1.5 font-mono">
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>Active JSON Configuration</span>
              </span>

              {parseError ? (
                <span className="text-[10px] font-bold text-rose-400 tracking-wide flex items-center bg-rose-500/5 border border-rose-500/20 px-2 py-0.5 rounded animate-pulse">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span>Invalid JSON</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-400 tracking-wide flex items-center bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  <span>Valid Config Syntax</span>
                </span>
              )}
            </div>

            <div className="flex-1 relative flex flex-col">
              <textarea
                value={jsonText}
                onChange={(e) => handleTextChange(e.target.value)}
                className="w-full flex-1 min-h-[550px] p-5 rounded-2xl border border-zinc-900 bg-zinc-950 font-mono text-xs text-indigo-200 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-zinc-800 transition-all overflow-y-auto selection:bg-indigo-500/25 leading-relaxed select-all"
                style={{ resize: 'none' }}
                spellCheck="false"
              />
              
              {parseError && (
                <div className="absolute bottom-4 left-4 right-4 p-4 border border-rose-500/20 rounded-xl bg-rose-500/90 text-white font-semibold shadow-2xl animate-slideUp text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="font-mono">{parseError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Dynamic Component Render Board Panel */}
          <div className="xl:col-span-7 flex flex-col space-y-3 min-h-[500px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase flex items-center space-x-1.5 font-mono">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Interactive Live Sandbox Preview</span>
              </span>
              <span className="text-[9px] text-zinc-600 font-mono font-medium">Hot-Reload compiler reactive</span>
            </div>

            <div className="flex-1 rounded-2xl border border-zinc-900 bg-zinc-950/20 p-5 shadow-inner overflow-y-auto min-h-[550px] max-h-[70vh] border-dashed border-2">
              {currentConfig?.config?.layout ? (
                <DynamicRenderer node={currentConfig.config.layout} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-2">
                  <Sliders className="w-10 h-10 text-zinc-700 animate-spin" />
                  <p className="text-xs text-zinc-500 font-medium">Rendering engine standing by...</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
