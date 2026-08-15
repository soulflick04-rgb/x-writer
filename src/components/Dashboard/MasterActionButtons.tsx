import React from 'react';
import { Sparkles, Compass, Zap, Flame, Loader2 } from 'lucide-react';

interface MasterActionButtonsProps {
  onResearchAndCreate: () => void;
  onFindTodaysTopics: () => void;
  isLoading: boolean;
  loadingMode: 'create' | 'topics' | null;
}

export const MasterActionButtons: React.FC<MasterActionButtonsProps> = ({
  onResearchAndCreate,
  onFindTodaysTopics,
  isLoading,
  loadingMode,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
      
      {/* Primary Master Button: RESEARCH & CREATE (2 cols) */}
      <div className="md:col-span-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={onResearchAndCreate}
          className={`w-full group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 ${
            isLoading && loadingMode === 'create'
              ? 'bg-cinema-850 border border-gold-500/50 cursor-wait'
              : 'bg-gradient-to-r from-gold-500 via-amber-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-cinema-950 font-bold shadow-cinema-glow hover:shadow-cinema-glow hover:scale-[1.008] active:scale-[0.995] border border-amber-300/40'
          }`}
        >
          {/* Ambient visual shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                isLoading && loadingMode === 'create' ? 'bg-gold-500/20 text-gold-400' : 'bg-cinema-950/20 text-cinema-950'
              }`}>
                {isLoading && loadingMode === 'create' ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
                ) : (
                  <Sparkles className="w-6 h-6 fill-current animate-pulse-subtle" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight uppercase">
                    {isLoading && loadingMode === 'create' ? 'Synthesizing Grounded Pipeline...' : 'RESEARCH & CREATE'}
                  </span>
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-cinema-950/20 text-cinema-950 font-bold border border-cinema-950/30">
                    1 Gemini Request
                  </span>
                </div>
                <p className="text-xs text-cinema-950/80 font-medium tracking-normal mt-0.5">
                  Web Grounding → Story Angle → Fact Check → 4 Persona Drafts (Primary, Smart, Spicy, Emotional)
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1 font-mono text-xs text-cinema-950/90 font-semibold">
              <span>EXECUTE</span>
              <span className="text-base font-bold">→</span>
            </div>
          </div>
        </button>
      </div>

      {/* Secondary Button: JUST FIND TODAY'S BEST TOPICS (1 col) */}
      <div className="md:col-span-1">
        <button
          type="button"
          disabled={isLoading}
          onClick={onFindTodaysTopics}
          className={`w-full h-full group relative rounded-2xl p-5 text-left transition-all duration-200 ${
            isLoading && loadingMode === 'topics'
              ? 'bg-cinema-850 border border-cinema-700 cursor-wait'
              : 'bg-cinema-900/90 hover:bg-cinema-850 border border-cinema-750 hover:border-cinema-600 text-white shadow-cinema-card hover:scale-[1.008] active:scale-[0.995]'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-cinema-800 border border-cinema-700 text-gold-400 flex-shrink-0 mt-0.5">
              {isLoading && loadingMode === 'topics' ? (
                <Loader2 className="w-5 h-5 animate-spin text-gold-400" />
              ) : (
                <Compass className="w-5 h-5 text-gold-400 group-hover:rotate-45 transition-transform duration-300" />
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-sm tracking-tight text-white uppercase">
                  JUST FIND TOPICS
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cinema-800 text-cinema-400 border border-cinema-700">
                  1-Req
                </span>
              </div>
              <p className="text-[11px] text-cinema-400 leading-snug">
                Scan trades & Reddit to return 5-8 ranked cinema opportunities.
              </p>
            </div>
          </div>
        </button>
      </div>

    </div>
  );
};
