import React from 'react';
import { Sun, Moon, Sparkles, Menu } from 'lucide-react';
import { AppSettings } from '../types';

interface TopHeaderProps {
  settings: AppSettings;
  onOpenSettings: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isLiveConfigured: boolean;
  onOpenMobileMenu?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  settings,
  onOpenSettings,
  isDark,
  onToggleTheme,
  isLiveConfigured,
  onOpenMobileMenu,
}) => {
  const userName = settings.creatorName || 'Arjun';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 fixed top-0 left-0 right-0 z-30 pointer-events-none md:justify-end">
      
      {/* Mobile Brand & Hamburger Button */}
      <div className="flex items-center gap-2.5 pointer-events-auto md:hidden">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open mobile menu"
          className="w-9 h-9 rounded-xl bg-white/85 dark:bg-[#201D1A]/90 border border-[#E5DACB] dark:border-[#383129] flex items-center justify-center text-[#2A241F] dark:text-[#F3EDE6] shadow-sm active:scale-95 transition-all"
        >
          <Menu className="w-4 h-4" />
        </button>
        <span className="font-extrabold text-sm tracking-tight text-[#2A241F] dark:text-[#F3EDE6]">
          SOULFLICK <span className="text-[#C29358]">AI</span>
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        
        {/* Subtle Live AI Grounding status */}
        {isLiveConfigured && (
          <div 
            onClick={onOpenSettings}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-[#1E1B18]/70 border border-[#E5DACB] dark:border-[#332D26] text-[11px] text-[#6B6154] dark:text-[#A89C8D] cursor-pointer hover:border-[#C29358] transition-colors shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] font-medium">Multi-AI Connected</span>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-full bg-white/85 dark:bg-[#201D1A]/90 border border-[#E5DACB] dark:border-[#383129] flex items-center justify-center text-[#5C5042] dark:text-[#D4A373] hover:border-[#C29358] shadow-sm transition-all"
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
