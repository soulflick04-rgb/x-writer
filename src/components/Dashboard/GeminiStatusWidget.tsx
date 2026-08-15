import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ProviderMetadata } from '../../types';

interface GeminiStatusWidgetProps {
  metadata?: ProviderMetadata;
}

export const GeminiStatusWidget: React.FC<GeminiStatusWidgetProps> = ({ metadata }) => {
  // Cooldown countdown state in seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return metadata?.gemini_quota?.cooldown_seconds || 0;
  });

  const [capacityPercentage, setCapacityPercentage] = useState<number>(() => {
    if (metadata?.gemini_quota?.is_available === false) {
      return Math.max(15, 100 - (metadata.gemini_quota.usage_percentage || 80));
    }
    return 100;
  });

  // Sync with incoming metadata
  useEffect(() => {
    if (metadata?.gemini_quota) {
      if (!metadata.gemini_quota.is_available && metadata.gemini_quota.cooldown_seconds > 0) {
        setSecondsRemaining(metadata.gemini_quota.cooldown_seconds);
      } else {
        setSecondsRemaining(0);
        setCapacityPercentage(100);
      }
    }
  }, [metadata]);

  // Live timer interval to constantly update countdown and percentage refill
  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCapacityPercentage(100);
          return 0;
        }
        const next = prev - 1;
        // Refill capacity percentage gradually back to 100%
        const refilled = Math.min(100, Math.round(100 - (next / 60) * 85));
        setCapacityPercentage(refilled);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const isReady = secondsRemaining === 0;

  return (
    <div className="w-full max-w-md mx-auto mt-4 p-3.5 rounded-2xl bg-white/70 dark:bg-[#1E1B18]/70 border border-[#E8DEC\-B] dark:border-[#332D26] shadow-2xs backdrop-blur-xs transition-all">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
            isReady 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
          }`}>
            {isReady ? (
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold tracking-tight text-[#2A241F] dark:text-[#F3EDE6]">
                Gemini 2.5 Flash Engine
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold uppercase ${
                isReady
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
              }`}>
                {isReady ? 'Primary Active' : `Refilling (${secondsRemaining}s)`}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-mono font-bold text-[#2A241F] dark:text-[#F3EDE6]">
            {capacityPercentage}%
          </span>
          <span className="text-[9px] text-[#8C7A65] dark:text-[#9E9283] block">
            Capacity
          </span>
        </div>
      </div>

      {/* Cool animated refill progress bar */}
      <div className="w-full h-1.5 bg-[#EFE7DA] dark:bg-[#2C2620] rounded-full overflow-hidden relative">
        <div 
          className={`h-full transition-all duration-1000 ease-out rounded-full ${
            isReady 
              ? 'bg-gradient-to-r from-emerald-500 to-[#C29358]' 
              : 'bg-gradient-to-r from-amber-500 via-[#C29358] to-amber-400'
          }`}
          style={{ width: `${capacityPercentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[9.5px] text-[#8C7A65] dark:text-[#9E9283] mt-2 font-mono">
        <span className="flex items-center gap-1">
          {isReady ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Google Search Grounding Ready</span>
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Live Fallback Active (Auto-switches to Gemini on 0s)</span>
            </>
          )}
        </span>

        <span>
          {isReady ? 'Instant 1-Click' : `Refill: ${secondsRemaining}s`}
        </span>
      </div>
    </div>
  );
};
