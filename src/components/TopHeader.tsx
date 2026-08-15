import React from 'react';
import { Sun, Moon, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { AppSettings } from '../types';

interface TopHeaderProps {
  settings: AppSettings;
  onOpenSettings: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isLiveConfigured: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  settings,
  onOpenSettings,
  isDark,
  onToggleTheme,
  isLiveConfigured,
}) => {
  const userName = settings.creatorName || 'Arjun';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="w-full flex items-center justify-end gap-3 px-6 py-4 fixed top-0 right-0 z-20 pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto">
        
        {/* Subtle Live AI Grounding status */}
        {isLiveConfigured && (
          <div 
            onClick={onOpenSettings}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-[#1E1B18]/70 border border-[#E5DACB] dark:border-[#332D26] text-[11px] text-[#6B6154] dark:text-[#A89C8D] cursor-pointer hover:border-[#C29358] transition-colors shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] font-medium">Gemini 2.5 Grounding</span>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="w-10 h-8 rounded-full bg-white/80 dark:bg-[#201D1A]/80 border border-[#E5DACB] dark:border-[#383129] flex items-center justify-center text-[#5C5042] dark:text-[#D4A373] hover:border-[#C29358] shadow-sm transition-all"
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5" />
          ) : (
            <Sun className="w-3.5 h-3.5" />
          )}
        </button>

        {/* User Profile Avatar Pill */}
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open settings"
          className="w-8 h-8 rounded-full bg-[#8E8070] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:ring-2 hover:ring-[#C29358]/40 transition-all"
        >
          {initial}
        </button>

      </div>
    </header>
  );
};
