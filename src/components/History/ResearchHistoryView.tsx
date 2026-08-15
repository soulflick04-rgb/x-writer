import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  Calendar, 
  ShieldCheck,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { ResearchRunRecord, GroundedResearchResult } from '../../types';

interface ResearchHistoryViewProps {
  history: ResearchRunRecord[];
  onOpenRun: (result: GroundedResearchResult) => void;
}

export const ResearchHistoryView: React.FC<ResearchHistoryViewProps> = ({
  history,
  onOpenRun,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = history.filter((run) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      run.recommended_topic_title.toLowerCase().includes(q) ||
      run.content_type.toLowerCase().includes(q) ||
      run.why_now?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cinema-900/80 border border-cinema-800 rounded-2xl p-6 shadow-cinema-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-gold-400" />
            <h1 className="font-display font-black text-2xl text-white tracking-tight">
              Grounded Research Vault
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cinema-800 text-cinema-300 border border-cinema-700">
              {history.length} Runs Cached
            </span>
          </div>
          <p className="text-xs text-cinema-300">
            Every past research run is stored locally. Re-opening any past research run has 0 API cost and requires zero tokens.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-cinema-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past research runs..."
            className="w-full bg-cinema-950 border border-cinema-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-cinema-500 focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      {/* History List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-cinema-900/40 border border-cinema-800 rounded-2xl">
          <History className="w-10 h-10 text-cinema-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-cinema-300">No Research Runs Found</h3>
          <p className="text-xs text-cinema-500 max-w-sm mx-auto mt-1">
            When you run research on the Hunter Console, your grounded runs will be saved here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((run) => {
            const dateStr = new Date(run.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={run.id}
                onClick={() => onOpenRun(run.data)}
                className="group cursor-pointer rounded-2xl bg-cinema-900/80 hover:bg-cinema-850 border border-cinema-800 hover:border-gold-500/50 p-4 sm:p-5 shadow-cinema-card transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gold-500/10 text-gold-300 border border-gold-500/30 font-semibold">
                      {run.content_type}
                    </span>
                    <span className="text-[10px] font-mono text-cinema-400">
                      {run.audience}
                    </span>
                    <span className="text-[10px] font-mono text-cinema-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {dateStr}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-white group-hover:text-gold-300 transition-colors">
                    {run.recommended_topic_title}
                  </h3>

                  {run.why_now && (
                    <p className="text-xs text-cinema-300 line-clamp-1">
                      <span className="font-semibold text-cinema-400">Why now:</span> {run.why_now}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <div className="font-display font-black text-xl text-gold-400">
                      {run.opportunity_score || 85}
                    </div>
                    <span className="text-[9px] font-mono uppercase text-cinema-500">Score</span>
                  </div>

                  <button className="p-2.5 rounded-xl bg-cinema-950 border border-cinema-800 group-hover:border-gold-500/40 text-cinema-400 group-hover:text-gold-400 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
