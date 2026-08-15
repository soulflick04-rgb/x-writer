import React from 'react';
import { 
  Flame, 
  Sparkles, 
  Film, 
  Globe, 
  Languages, 
  Radio, 
  Hash, 
  Image as ImageIcon, 
  Layers, 
  AlertTriangle,
  Sliders,
  Compass,
  Zap,
  Clock
} from 'lucide-react';
import { 
  ContentType, 
  AudienceType, 
  LanguageType, 
  ToneType, 
  LengthType, 
  MediaStrategy, 
  HashtagOption, 
  ResearchDepth 
} from '../../types';
import { styleEngine } from '../../services/styleEngine';
import { storage } from '../../services/storage';

interface ContentParamsPickerProps {
  contentType: ContentType;
  setContentType: (val: ContentType) => void;
  audience: AudienceType;
  setAudience: (val: AudienceType) => void;
  customAudience: string;
  setCustomAudience: (val: string) => void;
  language: LanguageType;
  setLanguage: (val: LanguageType) => void;
  customLanguage: string;
  setCustomLanguage: (val: string) => void;
  tone: ToneType;
  setTone: (val: ToneType) => void;
  intensity: number;
  setIntensity: (val: number) => void;
  length: LengthType;
  setLength: (val: LengthType) => void;
  media: MediaStrategy;
  setMedia: (val: MediaStrategy) => void;
  hashtags: HashtagOption;
  setHashtags: (val: HashtagOption) => void;
  researchDepth: ResearchDepth;
  setResearchDepth: (val: ResearchDepth) => void;
  specificTopic: string;
  setSpecificTopic: (val: string) => void;
}

export const ContentParamsPicker: React.FC<ContentParamsPickerProps> = ({
  contentType,
  setContentType,
  audience,
  setAudience,
  customAudience,
  setCustomAudience,
  language,
  setLanguage,
  customLanguage,
  setCustomLanguage,
  tone,
  setTone,
  intensity,
  setIntensity,
  length,
  setLength,
  media,
  setMedia,
  hashtags,
  setHashtags,
  researchDepth,
  setResearchDepth,
  specificTopic,
  setSpecificTopic,
}) => {
  const contentTypes: { id: ContentType; label: string; icon: string }[] = [
    { id: 'Viral / High Reach', label: 'Viral / High Reach', icon: '🚀' },
    { id: 'Controversial', label: 'Controversial', icon: '🔥' },
    { id: 'Smart Film Analysis', label: 'Smart Film Analysis', icon: '🧠' },
    { id: 'Emotional / Nostalgic', label: 'Emotional / Nostalgic', icon: '🥺' },
    { id: 'Breaking News', label: 'Breaking News', icon: '⚡' },
    { id: 'Did You Know?', label: 'Did You Know?', icon: '💡' },
    { id: 'Actor Story', label: 'Actor Story', icon: '🎭' },
    { id: 'Director Story', label: 'Director Story', icon: '🎬' },
    { id: 'Behind The Scenes', label: 'Behind The Scenes', icon: '📽️' },
    { id: 'Box Office / Industry', label: 'Box Office / Industry', icon: '📊' },
    { id: 'Fan Theory', label: 'Fan Theory', icon: '🔮' },
    { id: 'Debate', label: 'Debate', icon: '⚔️' },
    { id: 'Recommendation', label: 'Recommendation', icon: '🍿' },
    { id: 'Thread', label: 'Thread', icon: '🧵' },
    { id: 'Surprise Me', label: 'Surprise Me', icon: '🎲' },
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
    'Custom'
  ];

  const tones: { id: ToneType; label: string; desc: string }[] = [
    { id: 'Human / Conversational', label: 'Human / Conversational', desc: 'Natural, warm, authentic voice' },
    { id: 'Intelligent Critic', label: 'Intelligent Critic', desc: 'Insightful, craft-focused auteur perspective' },
    { id: 'Emotional', label: 'Emotional', desc: 'Resonant, nostalgic, deeply felt' },
    { id: 'Funny', label: 'Funny', desc: 'Dry cinephile wit and playful humor' },
    { id: 'Brutal', label: 'Brutal', desc: 'Unflinchingly honest, zero PR spin' },
    { id: 'Calm', label: 'Calm', desc: 'Measured, architectural analysis' },
    { id: 'Provocative', label: 'Provocative', desc: 'Challenges consensus assumptions' },
    { id: 'Balanced', label: 'Balanced', desc: 'Nuanced trade & artistic synthesis' },
  ];

  // Check recent topics for franchise saturation
  const styleProfile = storage.getStyleProfile();
  const fatigueStatus = styleEngine.checkFranchiseFatigue(styleProfile.recent_topics_history);

  // Intensity color description
  const getIntensityLabel = (val: number) => {
    if (val <= 2) return { text: 'Safe & Consensus', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (val <= 5) return { text: 'Thoughtful Debate', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (val <= 7) return { text: 'Sharp Contrarian', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { text: 'Extremely Spicy Take', color: 'text-spicy-400', bg: 'bg-spicy-500/20' };
  };

  const intensityInfo = getIntensityLabel(intensity);

  return (
    <div className="space-y-6">
      
      {/* Franchise Fatigue Warning Alert */}
      {fatigueStatus.isFatigued && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-300">Topic Diversification Advisory:</span>
            <p className="text-amber-200/90 leading-relaxed">{fatigueStatus.recommendation}</p>
          </div>
        </div>
      )}

      {/* 1. Content Type Grid */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-cinema-400 mb-2.5">
          1. What are we hunting today? (Content Goal)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {contentTypes.map((t) => {
            const isSelected = contentType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setContentType(t.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-left text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-gold-500/20 to-amber-600/20 border border-gold-400 text-white shadow-cinema-glow scale-[1.01]'
                    : 'bg-cinema-900/80 border border-cinema-800/80 text-cinema-300 hover:text-white hover:bg-cinema-850 hover:border-cinema-700'
                }`}
              >
                <span className="text-sm">{t.icon}</span>
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Topic Override (Optional) */}
      <div className="bg-cinema-900/60 border border-cinema-800/80 rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-cinema-400 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-gold-400" />
            Specific Topic Focus (Optional)
          </label>
          {specificTopic && (
            <button
              onClick={() => setSpecificTopic('')}
              className="text-[11px] text-cinema-400 hover:text-gold-400 underline font-mono"
            >
              Clear Override (Auto-Discover)
            </button>
          )}
        </div>
        <input
          type="text"
          value={specificTopic}
          onChange={(e) => setSpecificTopic(e.target.value)}
          placeholder="Leave blank to auto-discover today's top story, or enter topic (e.g., 'Christopher Nolan Universal project', 'A24 Civil War budget')"
          className="w-full bg-cinema-950 border border-cinema-750 rounded-lg px-3.5 py-2 text-xs text-white placeholder-cinema-500 focus:outline-none focus:border-gold-500 transition-colors"
        />
      </div>

      {/* 3. Multi-Parameter Row (Audience, Language, Tone) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Audience */}
        <div className="bg-cinema-900/60 border border-cinema-800/80 rounded-xl p-3.5 space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-cinema-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-gold-400" />
            Audience Target
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {audiences.map((aud) => (
              <button
                key={aud}
                type="button"
                onClick={() => setAudience(aud)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-center transition-all ${
                  audience === aud
                    ? 'bg-gold-500/20 border border-gold-400 text-gold-300 font-semibold'
                    : 'bg-cinema-950 border border-cinema-800 text-cinema-300 hover:text-white'
                }`}
              >
                {aud}
              </button>
            ))}
          </div>
          {audience === 'Custom' && (
            <input
              type="text"
              value={customAudience}
              onChange={(e) => setCustomAudience(e.target.value)}
              placeholder="e.g., Korean Thrillers & Auteur Anime"
              className="w-full bg-cinema-950 border border-cinema-750 rounded-lg px-3 py-1.5 text-xs text-white focus:border-gold-500 focus:outline-none mt-2"
            />
          )}
        </div>

        {/* Language */}
        <div className="bg-cinema-900/60 border border-cinema-800/80 rounded-xl p-3.5 space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-cinema-400 flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-gold-400" />
            Language / Script
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {languages.filter(l => l !== 'Custom').map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-all ${
                  language === lang
                    ? 'bg-gold-500/20 border border-gold-400 text-gold-300 font-semibold'
                    : 'bg-cinema-950 border border-cinema-800 text-cinema-300 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="bg-cinema-900/60 border border-cinema-800/80 rounded-xl p-3.5 space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-cinema-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-gold-400" />
            Creator Tone
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as ToneType)}
            className="w-full bg-cinema-950 border border-cinema-750 rounded-lg px-3 py-2 text-xs text-white focus:border-gold-500 focus:outline-none cursor-pointer"
          >
            {tones.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} — {t.desc}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-cinema-400 italic">
            {tones.find(t => t.id === tone)?.desc}
          </p>
        </div>

      </div>

      {/* 4. Fine-Tuning Row (Intensity Slider, Length, Media, Hashtags, Depth) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 bg-cinema-900/40 border border-cinema-800/80 rounded-xl p-4">
        
        {/* Intensity Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-cinema-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-spicy-400" />
              Intensity: <span className="text-white font-bold">{intensity}/10</span>
            </label>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${intensityInfo.bg} ${intensityInfo.color}`}>
              {intensityInfo.text}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full accent-gold-500 cursor-pointer h-1.5 bg-cinema-800 rounded-lg"
          />
        </div>

        {/* Length */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-cinema-400 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-gold-400" /> Length
          </label>
          <div className="flex rounded-lg bg-cinema-950 p-0.5 border border-cinema-800">
            {(['Short', 'Medium', 'Long'] as LengthType[]).map((len) => (
              <button
                key={len}
                type="button"
                onClick={() => setLength(len)}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                  length === len ? 'bg-gold-500/20 text-gold-300 font-semibold' : 'text-cinema-400 hover:text-white'
                }`}
              >
                {len}
              </button>
            ))}
          </div>
        </div>

        {/* Media Strategy */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-cinema-400 flex items-center gap-1">
            <ImageIcon className="w-3 h-3 text-gold-400" /> Media Strategy
          </label>
          <select
            value={media}
            onChange={(e) => setMedia(e.target.value as MediaStrategy)}
            className="w-full bg-cinema-950 border border-cinema-800 rounded-lg px-2.5 py-1 text-xs text-cinema-200 focus:outline-none focus:border-gold-500"
          >
            <option value="Recommend image">Recommend visual + keywords</option>
            <option value="Text only">Text only</option>
            <option value="Image caption concept">Caption concept</option>
            <option value="User will upload image">User will upload</option>
          </select>
        </div>

        {/* Hashtags */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-cinema-400 flex items-center gap-1">
            <Hash className="w-3 h-3 text-gold-400" /> Hashtags
          </label>
          <div className="flex rounded-lg bg-cinema-950 p-0.5 border border-cinema-800">
            {(['Auto', 'None', '1', '2'] as HashtagOption[]).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHashtags(h)}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                  hashtags === h ? 'bg-gold-500/20 text-gold-300 font-semibold' : 'text-cinema-400 hover:text-white'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Research Depth */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-cinema-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-gold-400" /> Research Depth
          </label>
          <div className="flex rounded-lg bg-cinema-950 p-0.5 border border-cinema-800">
            {(['Quick', 'Standard', 'Deep'] as ResearchDepth[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setResearchDepth(d)}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                  researchDepth === d ? 'bg-gold-500/20 text-gold-300 font-semibold' : 'text-cinema-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
