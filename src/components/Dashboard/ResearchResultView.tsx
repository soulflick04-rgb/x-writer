import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Layers, 
  Eye, 
  ArrowRight, 
  Download, 
  Share2, 
  MessageSquare, 
  Compass, 
  Camera, 
  HelpCircle,
  FileText,
  Hash,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Feather
} from 'lucide-react';
import { GroundedResearchResult, DraftPersonaVariant } from '../../types';
import { storage } from '../../services/storage';

interface ResearchResultViewProps {
  result: GroundedResearchResult;
  onSelectPersona?: (persona: DraftPersonaVariant) => void;
  onSavePost?: (content: string, persona: DraftPersonaVariant) => void;
  onPostDirectlyToX?: (content: string) => void;
}

export const ResearchResultView: React.FC<ResearchResultViewProps> = ({
  result,
  onSavePost,
  onPostDirectlyToX,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<DraftPersonaVariant>('primary');
  const [draftTexts, setDraftTexts] = useState<Record<DraftPersonaVariant, string>>({
    primary: result.drafts?.primary || '',
    smart: result.drafts?.smart || '',
    spicy: result.drafts?.spicy || '',
    emotional: result.drafts?.emotional || ''
  });

  useEffect(() => {
    setDraftTexts({
      primary: result.drafts?.primary || '',
      smart: result.drafts?.smart || '',
      spicy: result.drafts?.spicy || '',
      emotional: result.drafts?.emotional || ''
    });
  }, [result]);

  const [copied, setCopied] = useState(false);
  const [copiedWithHashtags, setCopiedWithHashtags] = useState(false);
  const [copiedAllHashtags, setCopiedAllHashtags] = useState(false);
  const [copiedSingleHashtag, setCopiedSingleHashtag] = useState<string | null>(null);
  
  const [copiedVisual, setCopiedVisual] = useState(false);
  const [copiedKeywords, setCopiedKeywords] = useState(false);
  const [copiedSpecificKeyword, setCopiedSpecificKeyword] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showFactDrawer, setShowFactDrawer] = useState(false);

  const activePostContent = draftTexts[selectedPersona] || draftTexts.primary || '';
  const charCount = activePostContent.length;
  const wordCount = Math.round(charCount / 5);
  const selectedLength = result.selected_length || 'Medium';

  const isShortMode = selectedLength === 'Short';
  const isOverShortLimit = isShortMode && charCount > 280;

  const hashtags = result.recommended_hashtags && result.recommended_hashtags.length > 0 
    ? result.recommended_hashtags 
    : ['#FilmX', '#Cinema'];

  const formattedHashtagString = hashtags.join(' ');
  const postWithHashtags = `${activePostContent}\n\n${formattedHashtagString}`;

  const handleTextChange = (text: string) => {
    setDraftTexts(prev => ({ ...prev, [selectedPersona]: text }));
  };

  const handleAutoTrimTo280 = () => {
    if (activePostContent.length <= 280) return;
    const trimmed = activePostContent.substring(0, 277);
    const lastPeriod = Math.max(trimmed.lastIndexOf('. '), trimmed.lastIndexOf('!\n'), trimmed.lastIndexOf('?\n'), trimmed.lastIndexOf('\n\n'));
    if (lastPeriod > 180) {
      handleTextChange(trimmed.substring(0, lastPeriod + 1).trim());
    } else {
      const lastSpace = trimmed.lastIndexOf(' ');
      handleTextChange((trimmed.substring(0, lastSpace) + '...').trim());
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activePostContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyWithHashtags = () => {
    navigator.clipboard.writeText(postWithHashtags);
    setCopiedWithHashtags(true);
    setTimeout(() => setCopiedWithHashtags(false), 2000);
  };

  const handleCopyAllHashtags = () => {
    navigator.clipboard.writeText(formattedHashtagString);
    setCopiedAllHashtags(true);
    setTimeout(() => setCopiedAllHashtags(false), 2000);
  };

  const handleCopySingleHashtag = (ht: string) => {
    navigator.clipboard.writeText(ht);
    setCopiedSingleHashtag(ht);
    setTimeout(() => setCopiedSingleHashtag(null), 1500);
  };

  const handleCopyVisualPrompt = () => {
    const prompt = result.image_recommendation?.ai_prompt || 
      `Cinematic 35mm film still: ${result.image_recommendation?.recommended || result.recommended_topic.title}, 8k, authentic grain, anamorphic widescreen --ar 16:9`;
    navigator.clipboard.writeText(prompt);
    setCopiedVisual(true);
    setTimeout(() => setCopiedVisual(false), 2000);
  };

  const handleCopyKeywords = () => {
    const kws = (result.image_recommendation?.search_keywords || []).join(', ');
    navigator.clipboard.writeText(kws || result.image_recommendation?.recommended || '');
    setCopiedKeywords(true);
    setTimeout(() => setCopiedKeywords(false), 2000);
  };

  const handleCopySingleKeyword = (kw: string) => {
    navigator.clipboard.writeText(kw);
    setCopiedSpecificKeyword(kw);
    setTimeout(() => setCopiedSpecificKeyword(null), 1500);
  };

  const handleSave = () => {
    storage.saveDraft({
      id: `draft-${Date.now()}`,
      topic_title: result.recommended_topic.title,
      variant_type: selectedPersona,
      content: activePostContent,
      character_count: activePostContent.length,
      hashtags,
      image_keywords: result.image_recommendation?.search_keywords,
      ai_prompt: result.image_recommendation?.ai_prompt,
      visual_type: result.image_recommendation?.visual_type,
      status: 'saved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleShareX = () => {
    const text = encodeURIComponent(postWithHashtags);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const personas: { id: DraftPersonaVariant; label: string; desc: string }[] = [
    { id: 'primary', label: 'Primary Take', desc: 'High-Density Curiosity Hook' },
    { id: 'smart', label: 'Auteur Craft', desc: 'Lenses, Blocking & Subtext' },
    { id: 'spicy', label: 'Contrarian', desc: 'Sharp Defensible Re-evaluation' },
    { id: 'emotional', label: 'Human Story', desc: 'Devotion to Craft & Lore' },
  ];

  const visualPromptText = result.image_recommendation?.ai_prompt || 
    `Cinematic 35mm film still: ${result.image_recommendation?.recommended || result.recommended_topic.title}, 8k, photorealistic, authentic film grain, anamorphic widescreen --ar 16:9`;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pt-2 pb-16">
      
      {/* 1. Grounded Topic Intelligence Card */}
      <div className="bg-white/90 dark:bg-[#1C1916]/90 backdrop-blur-md border border-[#E5DACB] dark:border-[#332D26] rounded-3xl p-6 sm:p-8 shadow-editorial-card space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#EFE7DA] dark:border-[#2C2620] pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F4EFE6] dark:bg-[#2B241E] text-[#8C7A65] dark:text-[#C29358] border border-[#E8DEC\-B] dark:border-[#3D3328] font-bold">
                Opportunity Score: {result.recommended_topic.opportunity_score || 92}/100
              </span>
              {result.provider_used && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EAE1D3] dark:bg-[#2A241F] text-[#6B5E4E] dark:text-[#D4A373]">
                  {result.provider_used}
                </span>
              )}
              {result.cached && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EAE1D3] text-[#6B5E4E]">
                  Grounded Cache (0 API Cost)
                </span>
              )}
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#221D18] dark:text-[#FAF6F0] font-normal leading-snug">
              {result.recommended_topic.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#7B7163] dark:text-[#A89C8D] leading-relaxed">
              {result.recommended_topic.summary}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowFactDrawer(!showFactDrawer)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF7F2] dark:bg-[#25201A] border border-[#E5DACB] dark:border-[#3A3228] text-[#5C5042] dark:text-[#D4A373] hover:border-[#C29358] transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{showFactDrawer ? 'Hide Evidence' : 'Fact Check & Sources'}</span>
            </button>
          </div>
        </div>

        {/* Fact verification drawer if expanded */}
        {showFactDrawer && (
          <div className="bg-[#FAF7F2] dark:bg-[#171513] border border-[#E5DACB] dark:border-[#2D2720] rounded-2xl p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#5C5042] dark:text-[#C29358] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Claims & Web Citations
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.verified_claims?.map((claim, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-[#201D1A] rounded-xl border border-[#EAE0D2] dark:border-[#332C24] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#2A241F] dark:text-white">Claim #{idx + 1}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono">
                      {claim.confidence || 'Verified'}
                    </span>
                  </div>
                  <p className="text-[#665B4E] dark:text-[#A89C8D]">{claim.claim}</p>
                  <p className="text-[10px] text-[#9E9283] font-mono">Source: {claim.source}</p>
                </div>
              ))}
            </div>

            {result.sources && result.sources.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] font-mono text-[#8C8072] mb-1.5">Grounded Web Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {result.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#201D1A] rounded-lg border border-[#E5DACB] dark:border-[#332C24] text-[11px] text-[#5C5042] dark:text-[#C29358] hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{src.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Persona Drafts Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFE7DA] dark:border-[#2C2620] pb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8C8072] font-semibold">
              Select Writing Persona
            </span>
            
            {/* Adaptive Character Count Status Badge */}
            <div className="flex items-center gap-2">
              {isShortMode ? (
                <span className={`text-xs font-mono px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold ${
                  isOverShortLimit 
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                }`}>
                  {isOverShortLimit ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  <span>{charCount} / 280 chars</span>
                  {isOverShortLimit && <span>({charCount - 280} over limit)</span>}
                </span>
              ) : selectedLength === 'Long' ? (
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
                  <Feather className="w-3 h-3 text-[#C29358]" />
                  <span>{charCount} chars (~{wordCount} words) • X Premium Long-Form</span>
                </span>
              ) : (
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{charCount} chars (~{wordCount} words) • Expanded Post</span>
                </span>
              )}

              {isOverShortLimit && (
                <button
                  type="button"
                  onClick={handleAutoTrimTo280}
                  className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#2A241F] text-[#FDFBF7] dark:bg-[#F3EDE6] dark:text-[#1E1B18] hover:opacity-90 shadow-2xs cursor-pointer"
                  title="Auto-trim to fit single X post character limit"
                >
                  <Scissors className="w-3 h-3" />
                  <span>Trim to 280</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {personas.map((p) => {
              const isSel = selectedPersona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSel
                      ? 'bg-[#2A241F] text-[#FDFBF7] dark:bg-[#F3EDE6] dark:text-[#1E1B18] border-[#2A241F] dark:border-[#F3EDE6] shadow-sm'
                      : 'bg-[#FAF7F2] dark:bg-[#201D1A] border-[#E8DEC\-B] dark:border-[#332D26] text-[#665B4E] dark:text-[#A89C8D] hover:border-[#C29358]'
                  }`}
                >
                  <span className="block text-xs font-bold">{p.label}</span>
                  <span className="block text-[10px] opacity-75 truncate mt-0.5">{p.desc}</span>
                </button>
              );
            })}
          </div>

          {/* 3. Editable Post Content Box */}
          <div className="relative mt-4">
            <textarea
              rows={selectedLength === 'Long' ? 12 : selectedLength === 'Medium' ? 7 : 4}
              value={activePostContent}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#171513] border border-[#E8DEC\-B] dark:border-[#2E2822] text-[#221D18] dark:text-[#FAF6F0] font-sans text-sm sm:text-base leading-relaxed whitespace-pre-wrap selection:bg-[#D4A373] focus:outline-none focus:border-[#C29358] focus:ring-1 focus:ring-[#C29358] resize-y"
              placeholder="Post content..."
            />

            {/* Relevant Cinema Hashtags Bar */}
            <div className="mt-3 p-3.5 rounded-2xl bg-white/70 dark:bg-[#1E1B18]/80 border border-[#E8DEC\-B] dark:border-[#302A22] flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-xs font-bold text-[#5C5042] dark:text-[#D4A373] mr-1">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Hashtags:</span>
                </div>
                {hashtags.map((ht, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleCopySingleHashtag(ht)}
                    title="Click to copy hashtag"
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#25201A] text-[#6B5E4E] dark:text-[#D4A373] border border-[#E8DEC\-B] dark:border-[#383026] hover:border-[#C29358] transition-all cursor-pointer"
                  >
                    <span>{copiedSingleHashtag === ht ? '✓' : ''}</span>
                    <span>{ht}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAllHashtags}
                  className="text-[11px] font-mono text-[#8C8072] hover:text-[#2A241F] dark:hover:text-white underline cursor-pointer"
                >
                  {copiedAllHashtags ? '✓ Copied Tags' : 'Copy All Tags'}
                </button>
              </div>
            </div>

            {/* Action buttons on post */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#25201A] border border-[#E5DACB] dark:border-[#3A3228] text-[#2A241F] dark:text-[#F3EDE6] hover:border-[#C29358] shadow-sm transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Post'}</span>
                </button>

                <button
                  onClick={handleCopyWithHashtags}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#25201A] border border-[#E5DACB] dark:border-[#3A3228] text-[#2A241F] dark:text-[#F3EDE6] hover:border-[#C29358] shadow-sm transition-all"
                >
                  {copiedWithHashtags ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Hash className="w-3.5 h-3.5 text-[#C29358]" />}
                  <span>{copiedWithHashtags ? 'Copied with Tags!' : 'Copy Post + Hashtags'}</span>
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#25201A] border border-[#E5DACB] dark:border-[#3A3228] text-[#2A241F] dark:text-[#F3EDE6] hover:border-[#C29358] shadow-sm transition-all"
                >
                  {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{savedSuccess ? 'Saved to Vault' : 'Save Draft'}</span>
                </button>
              </div>

              <button
                onClick={handleShareX}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-[#2A241F] hover:bg-[#1A1613] dark:bg-[#F3EDE6] dark:hover:bg-white text-[#FDFBF7] dark:text-[#1E1B18] shadow-sm transition-all"
              >
                <span>Post directly to X</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* 4. Visual Media Recommendation & Prompt Studio */}
        {result.image_recommendation && (
          <div className="pt-5 border-t border-[#EFE7DA] dark:border-[#2C2620] space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#5C5042] dark:text-[#D4A373]">
                <Camera className="w-4 h-4" />
                <span>Recommended Scroll-Stopping Visual</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyVisualPrompt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#241F1A] border border-[#E5DACB] dark:border-[#3A3228] text-[#2A241F] dark:text-[#F3EDE6] hover:border-[#C29358] shadow-sm transition-all"
                >
                  {copiedVisual ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#C29358]" />}
                  <span>{copiedVisual ? 'Prompt Copied!' : 'Copy Visual Prompt'}</span>
                </button>

                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#201D1A] text-[#8C8072] border border-[#E5DACB] dark:border-[#332C24]">
                  {result.image_recommendation.orientation || 'Landscape 16:9'}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#7B7163] dark:text-[#A89C8D] leading-relaxed">
              {result.image_recommendation.recommended}
            </p>

            {/* Keyword tags with 1-click individual and bulk copy */}
            {result.image_recommendation.search_keywords && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-mono text-[#9E9283] uppercase tracking-wider mr-1">
                  Search terms:
                </span>
                {result.image_recommendation.search_keywords.map((kw, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleCopySingleKeyword(kw)}
                    title="Click to copy search term"
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#241F1A] text-[#6B5E4E] dark:text-[#D4A373] border border-[#E8DEC\-B] dark:border-[#383026] hover:border-[#C29358] transition-all cursor-pointer shadow-2xs"
                  >
                    <span>{copiedSpecificKeyword === kw ? '✓' : '🔍'}</span>
                    <span>{kw}</span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleCopyKeywords}
                  className="text-[10px] font-mono text-[#8C8072] hover:text-[#2A241F] dark:hover:text-white underline ml-1 cursor-pointer"
                >
                  {copiedKeywords ? '✓ Copied All Terms' : 'Copy All Terms'}
                </button>
              </div>
            )}

            {/* AI Image Generation Prompt Preview */}
            <div className="mt-2 p-3 rounded-xl bg-[#FAF7F2]/80 dark:bg-[#181614] border border-[#EAE1D3] dark:border-[#2C2620] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="w-3.5 h-3.5 text-[#C29358] flex-shrink-0" />
                <span className="font-mono text-[11px] text-[#786D5F] dark:text-[#A89C8D] truncate">
                  {visualPromptText}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyVisualPrompt}
                className="flex-shrink-0 text-xs font-bold text-[#C29358] hover:underline flex items-center gap-1"
              >
                {copiedVisual ? 'Copied' : 'Copy'}
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
