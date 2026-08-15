import React, { useState, useRef, useEffect } from 'react';
import { 
  Film, 
  Globe, 
  Languages, 
  Smile, 
  ChevronDown, 
  Sparkles, 
  Loader2, 
  Lock, 
  Check, 
  X,
  AlignLeft,
  Hash
} from 'lucide-react';
import { 
  ContentType, 
  AudienceType, 
  LanguageType, 
  ToneType, 
  LengthType, 
  HashtagOption 
} from '../types';

interface HeroHunterProps {
  userName: string;
  contentType: ContentType;
  setContentType: (val: ContentType) => void;
  audience: AudienceType;
  setAudience: (val: AudienceType) => void;
  language: LanguageType;
  setLanguage: (val: LanguageType) => void;
  tone: ToneType;
  setTone: (val: ToneType) => void;
  length: LengthType;
  setLength: (val: LengthType) => void;
  hashtags: HashtagOption;
  setHashtags: (val: HashtagOption) => void;
  specificTopic: string;
  setSpecificTopic: (val: string) => void;
  onResearchAndCreate: () => void;
  onFindTodaysTopics: () => void;
  isLoading: boolean;
  loadingMode: 'create' | 'topics' | null;
}

export const HeroHunter: React.FC<HeroHunterProps> = ({
  userName = 'Arjun',
  contentType,
  setContentType,
  audience,
  setAudience,
  language,
  setLanguage,
  tone,
  setTone,
  length,
  setLength,
  hashtags,
  setHashtags,
  specificTopic,
  setSpecificTopic,
  onResearchAndCreate,
  onFindTodaysTopics,
  isLoading,
  loadingMode,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<'content' | 'audience' | 'language' | 'tone' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const contentTypes: ContentType[] = [
    'Viral / High Reach',
    'Controversial',
    'Smart Film Analysis',
    'Emotional / Nostalgic',
    'Breaking News',
    'Did You Know?',
    'Actor Story',
    'Director Story',
    'Behind The Scenes',
    'Box Office / Industry',
    'Fan Theory',
    'Debate',
    'Recommendation',
    'Thread',
    'Surprise Me',
  ];

  const audiences: AudienceType[] = [
    'Hollywood / Global Cinema',
    'Indian Cinema',
    'Mixed',
    'Custom'
  ];

  const languages: LanguageType[] = [
    'English',
    'Hinglish',
    'Hindi',
    'Tamil',
    'Telugu',
    'Bengali',
  ];

  const tones: ToneType[] = [
    'Human / Conversational',
    'Intelligent Critic',
    'Emotional',
    'Funny',
    'Brutal',
    'Calm',
    'Provocative',
    'Balanced',
  ];

  const lengths: LengthType[] = ['Short', 'Medium', 'Long'];
  const hashtagOptions: HashtagOption[] = ['Auto', '1', '2', 'None'];

  const getAudienceDisplay = (aud: AudienceType) => {
    if (aud === 'Hollywood / Global Cinema') return 'Hollywood / Global';
    return aud;
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center py-4 sm:py-8 lg:py-10 px-3 sm:px-6 space-y-6 sm:space-y-7" ref={containerRef}>
      
      {/* 1. Greeting & Editorial Headline */}
      <div className="space-y-2 sm:space-y-3 max-w-3xl pt-2 sm:pt-0">
        <p className="text-xs sm:text-sm text-[#746A5E] dark:text-[#A89C8D] font-medium tracking-wide">
          {getGreeting()}, {userName} 👋
        </p>

        <h1 className="font-editorial text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#221D18] dark:text-[#F8F4EE] leading-[1.12] sm:leading-[1.08] font-normal tracking-tight">
          What story shall<br />we tell today?
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-[#7B7163] dark:text-[#9E9283] font-normal tracking-normal pt-0.5">
          AI research. Sharp angles. Posts that connect.
        </p>
      </div>

      {/* 2. The 4 Horizontal Pill Selectors */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 relative z-20">
        
        {/* Pill 1: Content Type */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === 'content' ? null : 'content')}
            className={`w-full h-14 sm:h-16 flex items-center justify-between px-3.5 sm:px-4 rounded-2xl bg-white/85 dark:bg-[#1E1B18]/90 backdrop-blur-md border transition-all duration-200 shadow-pill-card text-left ${
              activeDropdown === 'content'
                ? 'border-[#BFA88F] dark:border-[#8E785D] ring-2 ring-[#BFA88F]/20'
                : 'border-[#EBE3D5] dark:border-[#332D26] hover:border-[#D6C7B2]'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 truncate">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#F6F0E6] dark:bg-[#2A241F] flex items-center justify-center text-[#5C5042] dark:text-[#D4A373] flex-shrink-0">
                <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="truncate">
                <span className="block text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-[#9E9283]">
                  Content Type
                </span>
                <span className="block text-xs sm:text-sm font-bold text-[#2A241F] dark:text-[#F3EDE6] truncate">
                  {contentType}
                </span>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#9E9283] transition-transform flex-shrink-0 ml-1 ${activeDropdown === 'content' ? 'rotate-180' : ''}`} />
          </button>

          {activeDropdown === 'content' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E1B18] border border-[#E5DACB] dark:border-[#3A332B] rounded-2xl p-2 shadow-editorial-card z-50 max-h-60 overflow-y-auto animate-fade-in text-left">
              {contentTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setContentType(type);
                    setActiveDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    contentType === type
                      ? 'bg-[#F4EFE6] dark:bg-[#2B241E] text-[#2A241F] dark:text-white font-bold'
                      : 'text-[#6B6154] dark:text-[#A89C8D] hover:bg-[#FAF6EF] dark:hover:bg-[#26211C]'
                  }`}
                >
                  <span className="truncate">{type}</span>
                  {contentType === type && <Check className="w-3.5 h-3.5 text-[#C29358]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pill 2: Audience */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === 'audience' ? null : 'audience')}
            className={`w-full h-14 sm:h-16 flex items-center justify-between px-3.5 sm:px-4 rounded-2xl bg-white/85 dark:bg-[#1E1B18]/90 backdrop-blur-md border transition-all duration-200 shadow-pill-card text-left ${
              activeDropdown === 'audience'
                ? 'border-[#BFA88F] dark:border-[#8E785D] ring-2 ring-[#BFA88F]/20'
                : 'border-[#EBE3D5] dark:border-[#332D26] hover:border-[#D6C7B2]'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 truncate">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#F6F0E6] dark:bg-[#2A241F] flex items-center justify-center text-[#5C5042] dark:text-[#D4A373] flex-shrink-0">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="truncate">
                <span className="block text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-[#9E9283]">
                  Audience
                </span>
                <span className="block text-xs sm:text-sm font-bold text-[#2A241F] dark:text-[#F3EDE6] truncate">
                  {getAudienceDisplay(audience)}
                </span>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#9E9283] transition-transform flex-shrink-0 ml-1 ${activeDropdown === 'audience' ? 'rotate-180' : ''}`} />
          </button>

          {activeDropdown === 'audience' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E1B18] border border-[#E5DACB] dark:border-[#3A332B] rounded-2xl p-2 shadow-editorial-card z-50 animate-fade-in text-left">
              {audiences.map((aud) => (
                <button
                  key={aud}
                  type="button"
                  onClick={() => {
                    setAudience(aud);
                    setActiveDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    audience === aud
                      ? 'bg-[#F4EFE6] dark:bg-[#2B241E] text-[#2A241F] dark:text-white font-bold'
                      : 'text-[#6B6154] dark:text-[#A89C8D] hover:bg-[#FAF6EF] dark:hover:bg-[#26211C]'
                  }`}
                >
                  <span className="truncate">{getAudienceDisplay(aud)}</span>
                  {audience === aud && <Check className="w-3.5 h-3.5 text-[#C29358]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pill 3: Language */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === 'language' ? null : 'language')}
            className={`w-full h-14 sm:h-16 flex items-center justify-between px-3.5 sm:px-4 rounded-2xl bg-white/85 dark:bg-[#1E1B18]/90 backdrop-blur-md border transition-all duration-200 shadow-pill-card text-left ${
              activeDropdown === 'language'
                ? 'border-[#BFA88F] dark:border-[#8E785D] ring-2 ring-[#BFA88F]/20'
                : 'border-[#EBE3D5] dark:border-[#332D26] hover:border-[#D6C7B2]'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 truncate">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#F6F0E6] dark:bg-[#2A241F] flex items-center justify-center text-[#5C5042] dark:text-[#D4A373] flex-shrink-0">
                <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="truncate">
                <span className="block text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-[#9E9283]">
                  Language
                </span>
                <span className="block text-xs sm:text-sm font-bold text-[#2A241F] dark:text-[#F3EDE6] truncate">
                  {language}
                </span>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#9E9283] transition-transform flex-shrink-0 ml-1 ${activeDropdown === 'language' ? 'rotate-180' : ''}`} />
          </button>

          {activeDropdown === 'language' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E1B18] border border-[#E5DACB] dark:border-[#3A332B] rounded-2xl p-2 shadow-editorial-card z-50 animate-fade-in text-left">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setLanguage(lang);
                    setActiveDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    language === lang
                      ? 'bg-[#F4EFE6] dark:bg-[#2B241E] text-[#2A241F] dark:text-white font-bold'
                      : 'text-[#6B6154] dark:text-[#A89C8D] hover:bg-[#FAF6EF] dark:hover:bg-[#26211C]'
                  }`}
                >
                  <span>{lang}</span>
                  {language === lang && <Check className="w-3.5 h-3.5 text-[#C29358]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pill 4: Tone */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === 'tone' ? null : 'tone')}
            className={`w-full h-14 sm:h-16 flex items-center justify-between px-3.5 sm:px-4 rounded-2xl bg-white/85 dark:bg-[#1E1B18]/90 backdrop-blur-md border transition-all duration-200 shadow-pill-card text-left ${
              activeDropdown === 'tone'
                ? 'border-[#BFA88F] dark:border-[#8E785D] ring-2 ring-[#BFA88F]/20'
                : 'border-[#EBE3D5] dark:border-[#332D26] hover:border-[#D6C7B2]'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 truncate">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#F6F0E6] dark:bg-[#2A241F] flex items-center justify-center text-[#5C5042] dark:text-[#D4A373] flex-shrink-0">
                <Smile className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="truncate">
                <span className="block text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-[#9E9283]">
                  Tone
                </span>
                <span className="block text-xs sm:text-sm font-bold text-[#2A241F] dark:text-[#F3EDE6] truncate">
                  {tone}
                </span>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#9E9283] transition-transform flex-shrink-0 ml-1 ${activeDropdown === 'tone' ? 'rotate-180' : ''}`} />
          </button>

          {activeDropdown === 'tone' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E1B18] border border-[#E5DACB] dark:border-[#3A332B] rounded-2xl p-2 shadow-editorial-card z-50 animate-fade-in text-left">
              {tones.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTone(t);
                    setActiveDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    tone === t
                      ? 'bg-[#F4EFE6] dark:bg-[#2B241E] text-[#2A241F] dark:text-white font-bold'
                      : 'text-[#6B6154] dark:text-[#A89C8D] hover:bg-[#FAF6EF] dark:hover:bg-[#26211C]'
                  }`}
                >
                  <span>{t}</span>
                  {tone === t && <Check className="w-3.5 h-3.5 text-[#C29358]" />}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 3. Optional Specific Topic Input Bar */}
      <div className="w-full max-w-xl mx-auto relative z-10">
        <div className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 rounded-full bg-white/80 dark:bg-[#1E1B18]/90 backdrop-blur-md border border-[#EBE3D5] dark:border-[#332D26] focus-within:border-[#C29358] focus-within:ring-2 focus-within:ring-[#C29358]/20 shadow-pill-card transition-all">
          <Sparkles className="w-3.5 h-3.5 text-[#C29358] flex-shrink-0" />
          <input
            type="text"
            placeholder="Focus on a movie, director, or topic... (Optional)"
            value={specificTopic || ''}
            onChange={(e) => setSpecificTopic(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-[#2A241F] dark:text-[#F3EDE6] placeholder-[#9E9283] focus:outline-none"
          />
          {specificTopic && (
            <button
              type="button"
              onClick={() => setSpecificTopic('')}
              className="text-xs text-[#9E9283] hover:text-[#2A241F] dark:hover:text-white p-0.5 rounded-full hover:bg-black/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Post Length & Hashtags Quick Selectors */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-medium text-[#6B6154] dark:text-[#A89C8D]">
        
        {/* Length Selector */}
        <div className="flex items-center gap-1 bg-white/70 dark:bg-[#1E1B18]/80 px-2.5 py-1 rounded-full border border-[#EBE3D5] dark:border-[#332D26] shadow-2xs">
          <AlignLeft className="w-3 h-3 text-[#9E9283]" />
          <span className="text-[10px] font-mono text-[#9E9283] mr-0.5 uppercase">Length:</span>
          {lengths.map((len) => (
            <button
              key={len}
              type="button"
              onClick={() => setLength(len)}
              className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition-all ${
                length === len
                  ? 'bg-[#2A241F] text-[#FDFBF7] dark:bg-[#F3EDE6] dark:text-[#1E1B18] shadow-2xs'
                  : 'text-[#7A6F62] dark:text-[#9E9283] hover:text-[#2A241F] dark:hover:text-white'
              }`}
            >
              {len}
            </button>
          ))}
        </div>

        {/* Hashtag Option */}
        <div className="flex items-center gap-1 bg-white/70 dark:bg-[#1E1B18]/80 px-2.5 py-1 rounded-full border border-[#EBE3D5] dark:border-[#332D26] shadow-2xs">
          <Hash className="w-3 h-3 text-[#9E9283]" />
          <span className="text-[10px] font-mono text-[#9E9283] mr-0.5 uppercase">Tags:</span>
          {hashtagOptions.map((ht) => (
            <button
              key={ht}
              type="button"
              onClick={() => setHashtags(ht)}
              className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition-all ${
                hashtags === ht
                  ? 'bg-[#2A241F] text-[#FDFBF7] dark:bg-[#F3EDE6] dark:text-[#1E1B18] shadow-2xs'
                  : 'text-[#7A6F62] dark:text-[#9E9283] hover:text-[#2A241F] dark:hover:text-white'
              }`}
            >
              {ht}
            </button>
          ))}
        </div>

      </div>

      {/* 5. Primary Master Action Button */}
      <div className="w-full max-w-xs sm:max-w-md mx-auto space-y-3 pt-1">
        <button
          type="button"
          disabled={isLoading}
          onClick={onResearchAndCreate}
          className={`w-full sm:w-auto relative group inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
            isLoading && loadingMode === 'create'
              ? 'bg-[#3A332C] text-[#C4B7A6] cursor-wait'
              : 'bg-[#2A241F] hover:bg-[#1C1814] dark:bg-[#F3EDE6] dark:hover:bg-white text-[#FDFBF7] dark:text-[#1E1B18] shadow-master-btn hover:scale-[1.015] active:scale-[0.99]'
          }`}
        >
          {isLoading && loadingMode === 'create' ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#C29358]" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#D4A373] dark:text-[#A87B44]" />
          )}
          <span>{isLoading && loadingMode === 'create' ? 'Synthesizing Pipeline...' : 'RESEARCH & CREATE'}</span>
        </button>

        {/* Secondary Action Link */}
        <div>
          <button
            type="button"
            disabled={isLoading}
            onClick={onFindTodaysTopics}
            className="text-xs text-[#7B7163] dark:text-[#A89C8D] hover:text-[#221D18] dark:hover:text-white font-medium hover:underline transition-colors cursor-pointer"
          >
            Just find today&apos;s best topics
          </button>
        </div>
      </div>

      {/* 6. Footer Trust Note */}
      <div className="pt-1 flex items-center justify-center gap-2 text-[10px] sm:text-[11px] text-[#9E9283] dark:text-[#7A7063] font-medium">
        <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>Private & Single-User</span>
        <span>•</span>
        <span>Zero Data Shared</span>
      </div>

    </div>
  );
};
