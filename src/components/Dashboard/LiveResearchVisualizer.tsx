import React, { useEffect, useState } from 'react';
import { 
  Globe, 
  Layers, 
  ShieldCheck, 
  PenTool, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  Zap
} from 'lucide-react';

interface LiveResearchVisualizerProps {
  stageMessage: string;
  progressPercent: number;
}

export const LiveResearchVisualizer: React.FC<LiveResearchVisualizerProps> = ({
  stageMessage,
  progressPercent,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(progressPercent || 15);
  const [tickerMessage, setTickerMessage] = useState(stageMessage);

  const subMessages = [
    'Scanning current 24h entertainment trades (Variety, Deadline, THR)...',
    'Searching Reddit r/movies & r/cinematography discussions...',
    'Evaluating topic freshness & franchise saturation...',
    'Synthesizing curiosity gap and contrarian angles...',
    'Verifying factual claims & source attribution...',
    'Drafting 4 distinct personas (Primary, Smart, Spicy, Emotional)...',
    'Auditing hook strength and follower conversion metrics...'
  ];

  // Smooth automatic progress timer during live search
  useEffect(() => {
    let currentIdx = 0;
    const interval = setInterval(() => {
      setAnimatedProgress((prev) => {
        if (prev < 90) return prev + 2;
        return prev;
      });
      currentIdx = (currentIdx + 1) % subMessages.length;
      if (!stageMessage || stageMessage.includes('Executing Live')) {
        setTickerMessage(subMessages[currentIdx]);
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [stageMessage]);

  useEffect(() => {
    if (progressPercent > animatedProgress) {
      setAnimatedProgress(progressPercent);
    }
  }, [progressPercent]);

  const stages = [
    { id: 1, label: 'Google Search Grounding', desc: 'Current 24h-7d cinema trades & indexed discussions', icon: Globe },
    { id: 2, label: 'Opportunity Scoring', desc: 'Formula calculation & franchise fatigue audit', icon: Layers },
    { id: 3, label: 'Angle Discovery', desc: 'Curiosity vs Contrarian vs Behind-The-Scenes thesis', icon: Sparkles },
    { id: 4, label: 'Fact Verification', desc: 'Source corroboration & metric checking', icon: ShieldCheck },
    { id: 5, label: '4-Persona Drafting', desc: 'Primary, Smart, Spicy & Emotional variants', icon: PenTool },
    { id: 6, label: 'Quality & JSON Audit', desc: 'Hook strength, evidence, & follow conversion', icon: CheckCircle2 },
  ];

  const getActiveStep = () => {
    if (animatedProgress < 25) return 1;
    if (animatedProgress < 45) return 2;
    if (animatedProgress < 65) return 3;
    if (animatedProgress < 80) return 4;
    if (animatedProgress < 95) return 5;
    return 6;
  };

  const activeStep = getActiveStep();

  return (
    <div className="bg-cinema-900/90 border border-gold-500/30 rounded-2xl p-6 shadow-cinema-glow space-y-5 animate-pulse-subtle">
      
      {/* Header with Live Status & Cost Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cinema-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/40 flex items-center justify-center text-gold-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-white">
                Autonomous Grounded Research Pipeline
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Single Request Active
              </span>
            </div>
            <p className="text-xs text-cinema-400 font-mono mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" />
              <span>{tickerMessage}</span>
            </p>
          </div>
        </div>

        <div className="text-right font-mono text-xs text-gold-400 font-bold">
          {animatedProgress}% Complete
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-cinema-950 rounded-full h-2 overflow-hidden border border-cinema-800">
        <div 
          className="bg-gradient-to-r from-gold-500 to-amber-400 h-full transition-all duration-700 ease-out"
          style={{ width: `${animatedProgress}%` }}
        />
      </div>

      {/* Stage Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        {stages.map((st) => {
          const Icon = st.icon;
          const isDone = activeStep > st.id;
          const isCurrent = activeStep === st.id;

          return (
            <div
              key={st.id}
              className={`p-3 rounded-xl border text-xs transition-all ${
                isCurrent
                  ? 'bg-gold-500/10 border-gold-500/50 text-white shadow-sm'
                  : isDone
                  ? 'bg-cinema-950/60 border-cinema-800 text-emerald-400'
                  : 'bg-cinema-950/30 border-cinema-900 text-cinema-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-gold-400 animate-spin' : isDone ? 'text-emerald-400' : 'text-cinema-600'}`} />
                <span className="font-mono text-[10px]">
                  {isDone ? '✓' : `0${st.id}`}
                </span>
              </div>
              <p className="font-semibold truncate text-[11px]">{st.label}</p>
              <p className="text-[10px] text-cinema-400/80 truncate mt-0.5">{st.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-[11px] text-cinema-400 italic">
          Tip: Soulflick AI executes the entire live Google Search web crawl, fact check, angle discovery, and 4 persona drafts in ONE request.
        </p>
      </div>

    </div>
  );
};
