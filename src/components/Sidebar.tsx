import React from 'react';
import { 
  Home, 
  Sparkles, 
  Clock, 
  Bookmark, 
  BarChart2, 
  PenTool, 
  ChevronDown, 
  X,
  Star
} from 'lucide-react';
import { ViewMode, AppSettings } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  settings: AppSettings;
  onOpenSettings: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  settings,
  onOpenSettings,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Home', icon: Home },
    { id: 'opportunities' as ViewMode, label: 'Opportunities', icon: Star },
    { id: 'history' as ViewMode, label: 'History', icon: Clock },
    { id: 'drafts' as ViewMode, label: 'Saved', icon: Bookmark },
    { id: 'analytics' as ViewMode, label: 'Analytics', icon: BarChart2 },
    { id: 'style_lab' as ViewMode, label: 'Style Lab', icon: PenTool },
  ];

  const userName = settings.creatorName || 'Arjun';
  const initial = userName.charAt(0).toUpperCase();

  const handleNavClick = (view: ViewMode) => {
    onSelectView(view);
    onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
        />
      )}

      {/* Main Sidebar (Desktop fixed, Mobile off-canvas drawer) */}
      <aside 
        className={`w-64 h-screen fixed left-0 top-0 z-50 flex flex-col justify-between border-r border-[#E8DFCFC0] dark:border-[#2D2822] bg-[#F7F2E9] dark:bg-[#181614] p-6 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Brand & Close Button on Mobile */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div 
              className="cursor-pointer space-y-0.5 select-none"
              onClick={() => handleNavClick('dashboard')}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-extrabold text-lg tracking-tight text-[#2A241F] dark:text-[#F3EDE6]">
                  SOULFLICK
                </span>
                <span className="font-sans font-bold text-sm text-[#C29358] tracking-normal">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-[#8C8173] dark:text-[#9E9283] font-medium tracking-wide">
                Cinema Intelligence & Strategy
              </p>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden text-[#8C8173] hover:text-[#2A241F] dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#EAE1D3] dark:bg-[#2B2621] text-[#221D18] dark:text-[#FDFBF7] shadow-sm font-bold'
                      : 'text-[#6B6154] dark:text-[#A89C8D] hover:text-[#221D18] dark:hover:text-white hover:bg-[#EFE7DA]/60 dark:hover:bg-[#241F1A]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#221D18] dark:text-[#F5EFEB]' : 'text-[#8E8274] dark:text-[#7A7063]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="space-y-4 pt-4 border-t border-[#E8DFCFC0]/60 dark:border-[#2D2822]">
          
          {/* Quote floating micro-card */}
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#201D1A]/80 border border-[#E5DACB] dark:border-[#332D26] shadow-sm flex items-start gap-2.5 text-xs text-[#6B6154] dark:text-[#B5A898]">
            <Sparkles className="w-3.5 h-3.5 text-[#C29358] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed font-medium">
              Generate with clarity.<br />Post with impact.
            </p>
          </div>

          {/* User profile pill */}
          <div 
            onClick={() => {
              onOpenSettings();
              onCloseMobile?.();
            }}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-[#EAE1D3]/70 dark:hover:bg-[#25211D] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8E8070] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {initial}
              </div>
              <div className="text-left truncate">
                <span className="block text-xs font-bold text-[#2A241F] dark:text-[#F3EDE6] truncate">
                  {userName}
                </span>
                <span className="block text-[10px] text-[#9E9283] font-mono truncate">
                  @{settings.creatorHandle || 'cinephile'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#9E9283]" />
          </div>

        </div>

      </aside>
    </>
  );
};
