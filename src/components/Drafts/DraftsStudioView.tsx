import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Trash2, 
  Send, 
  Scissors, 
  Hash, 
  Sparkles, 
  Clock,
  Layers,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DraftItem } from '../../types';

interface DraftsStudioViewProps {
  drafts: DraftItem[];
  onUpdateDraft: (draft: DraftItem) => void;
  onDeleteDraft: (id: string) => void;
  onPostNow: (content: string, topicTitle: string, variant: string) => void;
}

export const DraftsStudioView: React.FC<DraftsStudioViewProps> = ({
  drafts,
  onUpdateDraft,
  onDeleteDraft,
  onPostNow,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'ready' | 'posted'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredDrafts = drafts.filter((d) => {
    if (activeTab === 'all') return true;
    return d.status === activeTab;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#F59E0B', '#38BDF8']
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cinema-900/80 border border-cinema-800 rounded-2xl p-6 shadow-cinema-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-gold-400" />
            <h1 className="font-display font-black text-2xl text-white tracking-tight">
              Drafts & Publishing Studio
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cinema-800 text-cinema-300 border border-cinema-700">
              {drafts.length} Total Drafts
            </span>
          </div>
          <p className="text-xs text-cinema-300">
            Refine your X cinema posts, review character counts, format threads, and log publications.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-cinema-950 p-1 rounded-xl border border-cinema-800 self-start md:self-center">
          {[
            { id: 'all', label: 'All' },
            { id: 'draft', label: 'In Progress' },
            { id: 'ready', label: 'Ready to Post' },
            { id: 'posted', label: 'Archived' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gold-500/20 text-gold-300 font-semibold border border-gold-500/30'
                  : 'text-cinema-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drafts Grid */}
      {filteredDrafts.length === 0 ? (
        <div className="text-center py-16 bg-cinema-900/40 border border-cinema-800 rounded-2xl">
          <FileText className="w-10 h-10 text-cinema-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-cinema-300">No Drafts in this tab</h3>
          <p className="text-xs text-cinema-500 max-w-sm mx-auto mt-1">
            Generate posts in the Hunter Console and click &quot;Save Draft&quot; to organize your pipeline here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDrafts.map((draft) => {
            const isEditing = editingId === draft.id;
            const charCount = draft.content.length;
            const isXStandard = charCount <= 280;

            return (
              <div
                key={draft.id}
                className="rounded-2xl bg-cinema-900/90 border border-cinema-800 hover:border-cinema-700 p-5 shadow-cinema-card flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  
                  {/* Draft Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gold-500/10 text-gold-300 border border-gold-500/30 font-bold">
                        {draft.variant_type}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        draft.status === 'ready' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        draft.status === 'posted' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                        'bg-cinema-950 text-cinema-400 border-cinema-800'
                      }`}>
                        {draft.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingId(isEditing ? null : draft.id)}
                        className="p-1.5 rounded-lg text-cinema-400 hover:text-gold-400 hover:bg-cinema-800 transition-colors"
                        title="Toggle edit mode"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteDraft(draft.id)}
                        className="p-1.5 rounded-lg text-cinema-400 hover:text-spicy-400 hover:bg-cinema-800 transition-colors"
                        title="Delete draft"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Topic Title */}
                  <h3 className="font-display font-bold text-sm text-white">
                    {draft.topic_title}
                  </h3>

                  {/* Content Area */}
                  {isEditing ? (
                    <textarea
                      value={draft.content}
                      onChange={(e) => onUpdateDraft({
                        ...draft,
                        content: e.target.value,
                        character_count: e.target.value.length
                      })}
                      rows={7}
                      className="w-full bg-cinema-950 border border-cinema-750 rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-gold-500"
                    />
                  ) : (
                    <div className="bg-cinema-950/80 p-3.5 rounded-xl border border-cinema-800/80 text-xs text-cinema-200 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                      {draft.content}
                    </div>
                  )}

                  {/* Hashtags */}
                  {draft.hashtags && draft.hashtags.length > 0 && (
                    <div className="flex gap-1.5">
                      {draft.hashtags.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-cinema-950 text-gold-300 border border-cinema-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-cinema-800/80 flex items-center justify-between gap-2">
                  
                  {/* Status Toggle & Character Counter */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isXStandard ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      {charCount} / {isXStandard ? '280' : 'Long'}
                    </span>

                    <select
                      value={draft.status}
                      onChange={(e) => onUpdateDraft({ ...draft, status: e.target.value as any })}
                      className="bg-cinema-950 border border-cinema-800 text-cinema-300 text-[10px] rounded-lg px-2 py-1 focus:outline-none"
                    >
                      <option value="draft">In Progress</option>
                      <option value="ready">Ready to Post</option>
                      <option value="posted">Posted</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(draft.id, draft.content)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-cinema-950 font-bold text-xs shadow-sm transition-all"
                    >
                      {copiedId === draft.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === draft.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => onPostNow(draft.content, draft.topic_title, draft.variant_type)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cinema-800 hover:bg-cinema-750 text-sky-400 border border-cinema-700 text-xs font-medium transition-all"
                      title="Move to Live Analytics Tracker"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
