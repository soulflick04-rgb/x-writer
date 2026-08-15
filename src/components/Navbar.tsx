import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Compass, 
  History, 
  FileText, 
  BarChart3, 
  Sliders, 
  BookOpen, 
  Settings as SettingsIcon,
  Film,
  Zap,
  CheckCircle2,
  Database
} from 'lucide-react';
import { ViewMode, AppSettings } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  settings: AppSettings;
  onOpenSettings: () => void;
  supabaseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  settings,
  onOpenSettings,
  supabaseConnected,
}) => {
  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Hunter Console', icon: Sparkles, badge: '1-Req' },
    { id: 'opportunities' as ViewMode, label: "Today's Opportunities", icon: Compass },
    { id: 'history' as ViewMode, label: 'Research Vault', icon: History },
    { id: 'drafts' as ViewMode, label: 'Drafts Studio', icon: FileText },
    { id: 'analytics' as ViewMode, label: 'Posted & Analytics', icon: BarChart3 },
    { id: 'style_lab' as ViewMode, label: 'Style & Audience Lab', icon: Sliders },
    { id: 'reference_library' as ViewMode, label: 'Reference Anatomy', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cinema-800/80 bg-cinema-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectView('dashboard')}>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 via-amber-600 to-cinema-900 p-0.5 shadow-cinema-glow">
              <div className="w-full h-full bg-cinema-950 rounded-[10px] flex items-center justify-center">
                <Film className="w-5 h-5 text-gold-400 animate-pulse-subtle" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg tracking-tight text-white">
                  SOULFLICK <span className="text-gold-400 font-mono text-sm uppercase px-1.5 py-0.5 rounded bg-gold-500/10 border border-gold-500/30">AI</span>
                </span>
              </div>
              <p className="text-[11px] text-cinema-400 tracking-wide font-medium hidden sm:block">
                Cinema Intelligence & X Strategy Workstation
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'text-white bg-cinema-850 border border-gold-500/40 shadow-sm'
                      : 'text-cinema-300 hover:text-white hover:bg-cinema-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold-400' : 'text-cinema-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-gold-500/20 text-gold-300 border border-gold-500/30">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold-400 to-amber-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-3">
            {/* 1-Gemini Request Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cinema-900 border border-cinema-750 text-cinema-300 text-xs">
              <Zap className="w-3.5 h-3.5 text-gold-400" />
              <span className="font-mono text-[11px] text-cinema-300">
                1-Req / Grounded
              </span>
            </div>

            {/* Supabase Status */}
            <button
              onClick={onOpenSettings}
              title={supabaseConnected ? "Supabase Connected" : "Local Storage Mode (Click to configure Supabase)"}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                supabaseConnected
                  ? 'bg-verify-500/10 border-verify-500/30 text-verify-400'
                  : 'bg-cinema-900 border-cinema-750 text-cinema-400 hover:border-cinema-600'
              }`}
            >
              <Database className="w-3 h-3" />
              <span className="hidden md:inline font-mono text-[11px]">
                {supabaseConnected ? 'Cloud DB' : 'Local Mode'}
              </span>
            </button>

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-cinema-900 border border-cinema-750 text-cinema-300 hover:text-white hover:border-cinema-600 transition-colors"
              title="Workstation Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-cinema-850 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'text-white bg-cinema-850 border border-gold-500/40'
                    : 'text-cinema-400 hover:text-white bg-cinema-900/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold-400' : 'text-cinema-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
