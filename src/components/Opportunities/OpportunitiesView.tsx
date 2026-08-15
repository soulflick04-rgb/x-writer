import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  Flame, 
  Clock, 
  Layers, 
  ExternalLink, 
  ArrowRight,
  Filter,
  ShieldCheck,
  RefreshCw,
  Search
} from 'lucide-react';
import { TopicOpportunity, AudienceType } from '../../types';

interface OpportunitiesViewProps {
  opportunities: TopicOpportunity[];
  onSelectTopicForPost: (topicTitle: string) => void;
  onRefreshOpportunities: () => void;
  isLoading: boolean;
  selectedAudience: AudienceType;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  onSelectTopicForPost,
  onRefreshOpportunities,
  isLoading,
  selectedAudience,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'high_score' | 'low_saturation' | 'craft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOpps = opportunities.filter((opp) => {
    if (searchQuery && !opp.title.toLowerCase().includes(searchQuery.toLowerCase()) && !opp.summary.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterType === 'high_score') return opp.score >= 88;
    if (filterType === 'low_saturation') return opp.saturation?.toLowerCase() === 'low';
    if (filterType === 'craft') return opp.suggested_content_type?.toLowerCase().includes('craft') || opp.best_angle?.toLowerCase().includes('craft');
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cinema-900/80 border border-cinema-800 rounded-2xl p-6 shadow-cinema-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-gold-400" />
            <h1 className="font-display font-black text-2xl text-white tracking-tight">
              Today&apos;s Ranked Cinema Opportunities
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gold-500/10 text-gold-300 border border-gold-500/30">
              Grounded Web Radar
            </span>
          </div>
          <p className="text-xs text-cinema-300">
            Current cinema developments ranked by Opportunity Score. Click any topic to draft 4 persona posts in 1 single request.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshOpportunities}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cinema-800 hover:bg-cinema-750 text-gold-300 border border-gold-500/30 text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Scanning Radar...' : 'Scan Fresh Topics (1-Req)'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-cinema-900/50 border border-cinema-800/80 rounded-xl p-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-cinema-400" />
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Opportunities' },
              { id: 'high_score', label: 'Top Tier (88+ Score)' },
              { id: 'low_saturation', label: 'Low Saturation Gem' },
              { id: 'craft', label: 'Craft & Auteur' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  filterType === f.id
                    ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 font-semibold'
                    : 'bg-cinema-950 text-cinema-400 hover:text-white border border-cinema-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-cinema-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic or keywords..."
            className="w-full bg-cinema-950 border border-cinema-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-cinema-500 focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOpps.map((opp, idx) => {
          const saturationColor = 
            opp.saturation === 'low' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
            opp.saturation === 'high' ? 'text-spicy-400 bg-spicy-500/10 border-spicy-500/30' :
            'text-amber-300 bg-amber-500/10 border-amber-500/30';

          return (
            <div
              key={opp.id || idx}
              className="group relative rounded-2xl bg-cinema-900/90 hover:bg-cinema-850 border border-cinema-800 hover:border-gold-500/50 p-5 shadow-cinema-card transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                
                {/* Header: Score & Freshness */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-black text-2xl text-gold-400">
                      {opp.score}
                    </span>
                    <span className="text-[10px] font-mono text-cinema-500">/ 100</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${saturationColor}`}>
                      {opp.saturation || 'medium'} saturation
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cinema-950 border border-cinema-800 text-cinema-400">
                      {opp.freshness || 'Last 24h'}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-base text-white group-hover:text-gold-300 transition-colors leading-snug">
                  {opp.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-cinema-300 leading-relaxed line-clamp-3">
                  {opp.summary}
                </p>

                {/* Standout Angle */}
                <div className="p-3 rounded-xl bg-cinema-950 border border-cinema-800 space-y-1 text-xs">
                  <span className="text-gold-400 font-mono text-[10px] font-bold uppercase block">
                    STANDOUT ANGLE:
                  </span>
                  <p className="text-cinema-200 text-[11px] leading-relaxed">
                    {opp.best_angle}
                  </p>
                </div>

                {/* Why Now */}
                {opp.why_now && (
                  <div className="text-[11px] text-cinema-400 italic">
                    <span className="font-semibold text-cinema-300">Trigger:</span> {opp.why_now}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-cinema-800/80">
                <button
                  onClick={() => onSelectTopicForPost(opp.title)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-gold-500/20 to-amber-600/20 hover:from-gold-500 hover:to-amber-500 text-gold-300 hover:text-cinema-950 font-bold text-xs border border-gold-500/40 hover:border-gold-400 transition-all duration-200 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Research & Draft Post (1-Req)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
