import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Flame, 
  ThumbsUp, 
  ThumbsDown, 
  Zap, 
  Plus, 
  Trash2, 
  Save, 
  AlertTriangle,
  FileCode,
  Check
} from 'lucide-react';
import { StyleProfile } from '../../types';
import { styleEngine } from '../../services/styleEngine';

interface StyleLabViewProps {
  styleProfile: StyleProfile;
  onSaveProfile: (profile: StyleProfile) => void;
}

export const StyleLabView: React.FC<StyleLabViewProps> = ({
  styleProfile,
  onSaveProfile,
}) => {
  const [profile, setProfile] = useState<StyleProfile>(styleProfile);
  const [newRespondsTo, setNewRespondsTo] = useState('');
  const [newIgnores, setNewIgnores] = useState('');
  const [newTaboo, setNewTaboo] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fatigueStatus = styleEngine.checkFranchiseFatigue(profile.recent_topics_history);
  const compactAiPrompt = styleEngine.formatCompactStylePrompt(profile);

  const handleSave = () => {
    onSaveProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const addRespondsTo = () => {
    if (!newRespondsTo.trim()) return;
    setProfile({
      ...profile,
      responds_to: [...profile.responds_to, newRespondsTo.trim()],
    });
    setNewRespondsTo('');
  };

  const removeRespondsTo = (idx: number) => {
    setProfile({
      ...profile,
      responds_to: profile.responds_to.filter((_, i) => i !== idx),
    });
  };

  const addIgnores = () => {
    if (!newIgnores.trim()) return;
    setProfile({
      ...profile,
      ignores: [...profile.ignores, newIgnores.trim()],
    });
    setNewIgnores('');
  };

  const removeIgnores = (idx: number) => {
    setProfile({
      ...profile,
      ignores: profile.ignores.filter((_, i) => i !== idx),
    });
  };

  const addTaboo = () => {
    if (!newTaboo.trim()) return;
    setProfile({
      ...profile,
      taboo_phrases: [...profile.taboo_phrases, newTaboo.trim()],
    });
    setNewTaboo('');
  };

  const removeTaboo = (idx: number) => {
    setProfile({
      ...profile,
      taboo_phrases: profile.taboo_phrases.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cinema-900/80 border border-cinema-800 rounded-2xl p-6 shadow-cinema-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-5 h-5 text-gold-400" />
            <h1 className="font-display font-black text-2xl text-white tracking-tight">
              Style Lab & Audience Memory
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gold-500/10 text-gold-300 border border-gold-500/30">
              Active Persona Engine
            </span>
          </div>
          <p className="text-xs text-cinema-300">
            Train Soulflick AI on what your specific cinema audience responds to, what they ignore, and enforce strict franchise diversification.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-cinema-950 font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Profile Saved!' : 'Save Style Profile'}</span>
        </button>
      </div>

      {/* Franchise Fatigue Monitor */}
      <div className={`p-4 rounded-2xl border ${
        fatigueStatus.isFatigued 
          ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' 
          : 'bg-cinema-900/70 border-cinema-800 text-cinema-300'
      }`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${fatigueStatus.isFatigued ? 'text-amber-400' : 'text-cinema-500'}`} />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-white">Topic Diversification & Fatigue Monitor</h3>
            <p className="text-xs leading-relaxed">{fatigueStatus.recommendation}</p>
            <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-cinema-400">
              <span className="text-cinema-500">Recent topic memory:</span>
              {profile.recent_topics_history.map((t, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-cinema-950 border border-cinema-800 text-cinema-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Audience Resonance Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Things My Audience Responds To */}
        <div className="bg-cinema-900/90 border border-cinema-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-display font-bold text-sm">
            <ThumbsUp className="w-4 h-4" />
            <span>Things My Audience Responds To (Boosted Hooks)</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newRespondsTo}
              onChange={(e) => setNewRespondsTo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRespondsTo()}
              placeholder="e.g., Tactical lens choices, Box office break-even math..."
              className="flex-1 bg-cinema-950 border border-cinema-750 rounded-lg px-3 py-1.5 text-xs text-white placeholder-cinema-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={addRespondsTo}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold border border-emerald-500/40"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {profile.responds_to.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-cinema-950 border border-cinema-800 text-xs text-cinema-200"
              >
                <span>✓ {item}</span>
                <button
                  onClick={() => removeRespondsTo(idx)}
                  className="text-cinema-500 hover:text-spicy-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Things My Audience Ignores */}
        <div className="bg-cinema-900/90 border border-cinema-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-spicy-400 font-display font-bold text-sm">
            <ThumbsDown className="w-4 h-4" />
            <span>Things My Audience Ignores (Avoided Angles)</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newIgnores}
              onChange={(e) => setNewIgnores(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addIgnores()}
              placeholder="e.g., Generic trailer hype, Lazy viral clickbait..."
              className="flex-1 bg-cinema-950 border border-cinema-750 rounded-lg px-3 py-1.5 text-xs text-white placeholder-cinema-500 focus:outline-none focus:border-spicy-500"
            />
            <button
              onClick={addIgnores}
              className="px-3 py-1.5 rounded-lg bg-spicy-500/20 text-spicy-300 hover:bg-spicy-500/30 text-xs font-semibold border border-spicy-500/40"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {profile.ignores.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-cinema-950 border border-cinema-800 text-xs text-cinema-200"
              >
                <span>✕ {item}</span>
                <button
                  onClick={() => removeIgnores(idx)}
                  className="text-cinema-500 hover:text-spicy-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Taboo Cliché Blacklist */}
      <div className="bg-cinema-900/90 border border-cinema-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold-400" />
            Taboo Buzzword Blacklist (AI Cliché Filter)
          </h3>
          <span className="text-[11px] font-mono text-cinema-400">
            Never allowed in generated drafts
          </span>
        </div>

        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={newTaboo}
            onChange={(e) => setNewTaboo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTaboo()}
            placeholder="e.g., 'Game changer', 'Mind blown'..."
            className="flex-1 bg-cinema-950 border border-cinema-750 rounded-lg px-3 py-1.5 text-xs text-white placeholder-cinema-500 focus:outline-none focus:border-gold-500"
          />
          <button
            onClick={addTaboo}
            className="px-3 py-1.5 rounded-lg bg-gold-500/20 text-gold-300 hover:bg-gold-500/30 text-xs font-semibold border border-gold-500/40"
          >
            Add Taboo
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {profile.taboo_phrases.map((phrase, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cinema-950 border border-cinema-800 text-xs text-cinema-300 font-mono"
            >
              <span>🚫 &quot;{phrase}&quot;</span>
              <button
                onClick={() => removeTaboo(idx)}
                className="text-cinema-500 hover:text-spicy-400 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Compact Prompt Payload Preview */}
      <div className="bg-cinema-900/60 border border-cinema-800 rounded-2xl p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-cinema-400 flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-gold-400" />
            Compact Memory Injected into Single Gemini Request:
          </span>
          <span className="text-[10px] font-mono text-cinema-500">Token-optimized</span>
        </div>
        <pre className="p-3.5 rounded-xl bg-cinema-950 border border-cinema-800 text-[11px] font-mono text-cinema-300 whitespace-pre-wrap leading-relaxed">
          {compactAiPrompt}
        </pre>
      </div>

    </div>
  );
};
