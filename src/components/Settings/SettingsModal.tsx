import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Key, 
  Zap, 
  ShieldCheck, 
  Check, 
  Copy, 
  RefreshCw, 
  Download, 
  X,
  FileCode,
  Globe
} from 'lucide-react';
import { AppSettings } from '../../types';
import { supabaseService } from '../../services/supabaseClient';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClearCache: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearCache,
}) => {
  const [form, setForm] = useState<AppSettings>(settings);
  const [testingDb, setTestingDb] = useState(false);
  const [dbStatusMessage, setDbStatusMessage] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  if (!isOpen) return null;

  const handleTestSupabase = async () => {
    setTestingDb(true);
    setDbStatusMessage(null);
    onSaveSettings(form);
    const res = await supabaseService.testConnection();
    setDbStatusMessage(res);
    setTestingDb(false);
  };

  const handleSave = () => {
    onSaveSettings(form);
    onClose();
  };

  const handleClearCache = () => {
    onClearCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  const sqlSchema = `-- ==============================================================================
-- SOULFLICK AI - SUPABASE SCHEMA MIGRATION
-- Run in your Supabase SQL Editor:
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    x_handle TEXT,
    cinema_niche TEXT DEFAULT 'Global Cinema & Auteurs',
    avatar_url TEXT,
    tier TEXT DEFAULT 'creator_pro',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    default_audience TEXT DEFAULT 'Hollywood / Global Cinema',
    default_language TEXT DEFAULT 'English',
    default_tone TEXT DEFAULT 'Human / Conversational',
    default_intensity INTEGER DEFAULT 6,
    default_length TEXT DEFAULT 'Medium',
    default_media TEXT DEFAULT 'Recommend image',
    default_hashtags TEXT DEFAULT 'Auto',
    default_depth TEXT DEFAULT 'Standard',
    custom_instructions TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.research_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    run_type TEXT NOT NULL,
    content_type TEXT NOT NULL,
    audience TEXT NOT NULL,
    language TEXT NOT NULL,
    tone TEXT NOT NULL,
    intensity INTEGER DEFAULT 6,
    recommended_topic_title TEXT,
    opportunity_score INTEGER,
    why_now TEXT,
    research_summary TEXT,
    selected_angle TEXT,
    raw_response JSONB NOT NULL,
    cache_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_run_id UUID REFERENCES public.research_runs(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_title TEXT NOT NULL,
    variant_type TEXT NOT NULL,
    content TEXT NOT NULL,
    character_count INTEGER NOT NULL,
    hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.posted_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_title TEXT NOT NULL,
    content TEXT NOT NULL,
    variant_type TEXT DEFAULT 'primary',
    posted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.post_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posted_post_id UUID NOT NULL REFERENCES public.posted_posts(id) ON DELETE CASCADE UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    impressions INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    quotes INTEGER DEFAULT 0,
    profile_visits INTEGER DEFAULT 0,
    followers_gained INTEGER DEFAULT 0,
    engagement_rate NUMERIC(5,2) DEFAULT 0.0,
    follower_conversion_rate NUMERIC(5,2) DEFAULT 0.0,
    why_it_worked_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    why_underperformed_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    diagnostic_notes TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posted_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own profiles" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can access own research_runs" ON public.research_runs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own drafts" ON public.drafts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own posted_posts" ON public.posted_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own post_metrics" ON public.post_metrics FOR ALL USING (auth.uid() = user_id);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-cinema-900 border border-cinema-750 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cinema-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-white">Workstation Configuration</h2>
              <p className="text-xs text-cinema-400 font-mono">Supabase Auth, Database, Gemini Grounding & Cost Optimizations</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cinema-400 hover:text-white hover:bg-cinema-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-5 text-xs max-h-[65vh] overflow-y-auto pr-1">
          
          {/* Creator Profile */}
          <div className="space-y-3 bg-cinema-950 p-4 rounded-xl border border-cinema-800">
            <h3 className="font-bold text-white uppercase text-[11px] font-mono text-gold-400">
              Creator Identity
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-cinema-400 block mb-1">X Handle (without @)</label>
                <input
                  type="text"
                  value={form.creatorHandle}
                  onChange={(e) => setForm({ ...form, creatorHandle: e.target.value })}
                  placeholder="cinephile_x"
                  className="w-full bg-cinema-900 border border-cinema-750 rounded-lg p-2 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-cinema-400 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={form.creatorName}
                  onChange={(e) => setForm({ ...form, creatorName: e.target.value })}
                  placeholder="Cinema Strategist"
                  className="w-full bg-cinema-900 border border-cinema-750 rounded-lg p-2 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Gemini Grounding Multi-API Key Pool */}
          <div className="space-y-3 bg-cinema-950 p-4 rounded-xl border border-cinema-800">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white uppercase text-[11px] font-mono text-gold-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                Gemini API Keys Pool (Multi-Key Failover)
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">Auto Rate-Limit Failover</span>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-cinema-400 block mb-1">Primary Gemini Key (Google AI Studio)</label>
                <input
                  type="password"
                  value={form.geminiApiKey || ''}
                  onChange={(e) => setForm({ ...form, geminiApiKey: e.target.value })}
                  placeholder="AQ.Ab8RN6... or AIzaSy..."
                  className="w-full bg-cinema-900 border border-cinema-750 rounded-lg p-2 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-cinema-400 block mb-1">Backup / Secondary Gemini Key (Optional Failover)</label>
                <input
                  type="password"
                  value={form.geminiApiKey2 || ''}
                  onChange={(e) => setForm({ ...form, geminiApiKey2: e.target.value })}
                  placeholder="AQ.Ab8RN6... (Switches automatically if Primary hits rate limit)"
                  className="w-full bg-cinema-900 border border-cinema-750 rounded-lg p-2 text-white font-mono text-xs"
                />
              </div>
            </div>

            <p className="text-[11px] text-cinema-400">
              Supports both <code className="text-gold-400">AQ...</code> and <code className="text-gold-400">AIzaSy...</code> keys. Soulflick AI automatically rotates across your keys if one ever hits a temporary rate limit.
            </p>
          </div>

          {/* Supabase Connection */}
          <div className="space-y-3 bg-cinema-950 p-4 rounded-xl border border-cinema-800">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white uppercase text-[11px] font-mono text-gold-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Supabase PostgreSQL & Auth
              </h3>
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={testingDb}
                className="text-[11px] font-mono text-gold-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${testingDb ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-cinema-400 block mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  value={form.supabaseUrl}
                  onChange={(e) => setForm({ ...form, supabaseUrl: e.target.value })}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-cinema-900 border border-cinema-750 rounded-lg p-2 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-cinema-400 block mb-1">Supabase Anon Key</label>
                <input
                  type="password"
                  value={form.supabaseAnonKey}
                  onChange={(e) => setForm({ ...form, supabaseAnonKey: e.target.value })}
                  placeholder="eyJhbGciOi..."
                  className="w-full bg-cinema-900 border border-cinema-750 rounded-lg p-2 text-white font-mono text-xs"
                />
              </div>
            </div>

            {dbStatusMessage && (
              <div className={`p-2.5 rounded-lg text-xs font-mono ${
                dbStatusMessage.success ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-spicy-500/10 text-spicy-300 border border-spicy-500/30'
              }`}>
                {dbStatusMessage.message}
              </div>
            )}
          </div>

          {/* Edge Function Switch */}
          <div className="space-y-3 bg-cinema-950 p-4 rounded-xl border border-cinema-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs">Route through Supabase Edge Function</span>
              <input
                type="checkbox"
                checked={form.useEdgeFunction}
                onChange={(e) => setForm({ ...form, useEdgeFunction: e.target.checked })}
                className="w-4 h-4 accent-gold-500"
              />
            </div>
            {form.useEdgeFunction && (
              <div>
                <label className="text-cinema-400 block mb-1">Edge Function Endpoint URL</label>
                <input
                  type="text"
                  value={form.edgeFunctionUrl}
                  onChange={(e) => setForm({ ...form, edgeFunctionUrl: e.target.value })}
                  placeholder="https://xyzcompany.supabase.co/functions/v1/research-and-create"
                  className="w-full bg-cinema-900 border border-cinema-750 rounded-lg p-2 text-white font-mono text-xs"
                />
              </div>
            )}
          </div>

          {/* Zero-Cost Caching Controls */}
          <div className="space-y-3 bg-cinema-950 p-4 rounded-xl border border-cinema-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs block">Client-Side Grounding Cache</span>
                <span className="text-[11px] text-cinema-400">Re-uses recent identical grounded queries to guarantee 0 API spend.</span>
              </div>
              <button
                type="button"
                onClick={handleClearCache}
                className="px-3 py-1 rounded bg-cinema-800 text-cinema-300 hover:text-white text-xs border border-cinema-700"
              >
                {cacheCleared ? 'Cleared!' : 'Clear Cache'}
              </button>
            </div>
          </div>

          {/* SQL Migration Viewer */}
          <div className="space-y-2 bg-cinema-950 p-4 rounded-xl border border-cinema-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-gold-400" />
                Supabase SQL Schema Migration
              </span>
              <button
                type="button"
                onClick={copySql}
                className="text-[11px] text-gold-400 hover:underline font-mono flex items-center gap-1"
              >
                {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copied SQL' : 'Copy SQL Schema'}</span>
              </button>
            </div>
            <pre className="p-3 bg-cinema-900 border border-cinema-800 rounded-lg text-[10px] font-mono text-cinema-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
              {sqlSchema}
            </pre>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 pt-3 border-t border-cinema-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cinema-800 text-cinema-300 text-xs hover:bg-cinema-750 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-cinema-950 font-bold text-xs shadow-sm transition-all"
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
};
