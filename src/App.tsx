import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { HeroHunter } from './components/HeroHunter';
import { LiveResearchVisualizer } from './components/Dashboard/LiveResearchVisualizer';
import { ResearchResultView } from './components/Dashboard/ResearchResultView';
import { OpportunitiesView } from './components/Opportunities/OpportunitiesView';
import { ResearchHistoryView } from './components/History/ResearchHistoryView';
import { DraftsStudioView } from './components/Drafts/DraftsStudioView';
import { PostedAnalyticsView } from './components/PostedAnalytics/PostedAnalyticsView';
import { StyleLabView } from './components/StyleLab/StyleLabView';
import { ReferenceLibraryView } from './components/ReferenceLibrary/ReferenceLibraryView';
import { SettingsModal } from './components/Settings/SettingsModal';

import { 
  ViewMode, 
  ContentType, 
  AudienceType, 
  LanguageType, 
  ToneType, 
  LengthType, 
  MediaStrategy, 
  HashtagOption, 
  ResearchDepth,
  GroundedResearchResult,
  ResearchRunRecord,
  DraftItem,
  PostedPostItem,
  PostMetrics,
  StyleProfile,
  ReferencePost,
  TopicOpportunity,
  AppSettings,
  DraftPersonaVariant
} from './types';

import { storage } from './services/storage';
import { geminiService } from './services/geminiService';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  // Navigation & Modals
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('soulflick_theme') === 'dark';
  });

  // App Settings & Style
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());
  const [styleProfile, setStyleProfile] = useState<StyleProfile>(storage.getStyleProfile());

  // Pipeline Parameters State (Clean 4 Core Options on Hero)
  const [contentType, setContentType] = useState<ContentType>('Controversial');
  const [audience, setAudience] = useState<AudienceType>(settings.defaultAudience || 'Hollywood / Global Cinema');
  const [language, setLanguage] = useState<LanguageType>(settings.defaultLanguage || 'English');
  const [tone, setTone] = useState<ToneType>(settings.defaultTone || 'Provocative');

  // Secondary fine-tuning defaults
  const [intensity, setIntensity] = useState<number>(settings.defaultIntensity || 7);
  const [length, setLength] = useState<LengthType>('Medium');
  const [media, setMedia] = useState<MediaStrategy>('Recommend image');
  const [hashtags, setHashtags] = useState<HashtagOption>('Auto');
  const [researchDepth, setResearchDepth] = useState<ResearchDepth>('Standard');
  const [specificTopic, setSpecificTopic] = useState('');

  // Active Research State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState<'create' | 'topics' | null>(null);
  const [progressStage, setProgressStage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeResult, setActiveResult] = useState<GroundedResearchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Collections State
  const [history, setHistory] = useState<ResearchRunRecord[]>(storage.getResearchHistory());
  const [drafts, setDrafts] = useState<DraftItem[]>(storage.getDrafts());
  const [postedPosts, setPostedPosts] = useState<PostedPostItem[]>(storage.getPostedPosts());
  const [references, setReferences] = useState<ReferencePost[]>(storage.getReferencePosts());
  const [opportunities, setOpportunities] = useState<TopicOpportunity[]>(storage.getOpportunities());

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync Dark Theme class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('soulflick_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('soulflick_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // MASTER ACTION: RESEARCH & CREATE (Strictly 1 AI Request)
  const handleResearchAndCreate = async () => {
    setIsLoading(true);
    setLoadingMode('create');
    setErrorMessage(null);
    setProgressPercent(15);
    setProgressStage('Scanning current cinema trades & Reddit discussions...');

    try {
      const result = await geminiService.researchAndCreate(
        {
          contentType,
          audience,
          language,
          tone,
          intensity,
          length,
          media,
          hashtags,
          researchDepth,
          specificTopic: specificTopic.trim() || undefined,
        },
        (stage, progress) => {
          setProgressStage(stage);
          setProgressPercent(progress);
        }
      );

      setActiveResult(result);

      // Save to Research Vault (0 additional AI cost)
      const newRecord: ResearchRunRecord = {
        id: `run-${Date.now()}`,
        created_at: new Date().toISOString(),
        content_type: contentType,
        audience,
        language,
        tone,
        intensity,
        research_depth: researchDepth,
        recommended_topic_title: result.recommended_topic.title,
        opportunity_score: result.recommended_topic.opportunity_score,
        why_now: result.recommended_topic.why_now,
        data: result,
      };
      storage.saveResearchRun(newRecord);
      setHistory(storage.getResearchHistory());

      // Auto-populate drafts collection
      const newDraft: DraftItem = {
        id: `draft-${Date.now()}`,
        run_id: newRecord.id,
        topic_title: result.recommended_topic.title,
        variant_type: 'primary',
        content: result.drafts.primary,
        character_count: result.drafts.primary.length,
        hashtags: result.recommended_hashtags,
        image_keywords: result.image_recommendation?.search_keywords,
        ai_prompt: result.image_recommendation?.ai_prompt,
        visual_type: result.image_recommendation?.visual_type,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      storage.saveDraft(newDraft);
      setDrafts(storage.getDrafts());

      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C29358', '#2B2520', '#EAE1D3']
      });
      showToast('Grounded Research & 4 Persona Drafts Synthesized!');
    } catch (err: any) {
      console.error('Research and create error:', err);
      setErrorMessage(err.message || 'Grounded research failed. Check API key in settings.');
    } finally {
      setIsLoading(false);
      setLoadingMode(null);
    }
  };

  // MASTER ACTION: JUST FIND TODAY'S BEST TOPICS (Strictly 1 AI Request)
  const handleFindTodaysTopics = async () => {
    setIsLoading(true);
    setLoadingMode('topics');
    setErrorMessage(null);
    setProgressPercent(25);
    setProgressStage('Scanning cinema trades & public signals...');

    try {
      const opps = await geminiService.findTodaysBestTopics(
        audience,
        language,
        (stage, progress) => {
          setProgressStage(stage);
          setProgressPercent(progress);
        }
      );
      setOpportunities(opps);
      setCurrentView('opportunities');
      showToast('Discovered Today’s Top Cinema Opportunities!');
    } catch (err: any) {
      console.error('Find topics error:', err);
      setErrorMessage(err.message || 'Failed to scan cinema opportunities.');
    } finally {
      setIsLoading(false);
      setLoadingMode(null);
    }
  };

  const handleSelectTopicForPost = (topicTitle: string) => {
    setSpecificTopic(topicTitle);
    setCurrentView('dashboard');
    showToast(`Focused research target: "${topicTitle}"`);
  };

  const handleSaveToDrafts = (draft: DraftItem) => {
    storage.saveDraft(draft);
    setDrafts(storage.getDrafts());
    showToast('Saved to Vault!');
  };

  const handlePostNow = (content: string, topicTitle: string, variant: string) => {
    const newPosted: PostedPostItem = {
      id: `posted-${Date.now()}`,
      topic_title: topicTitle,
      content,
      variant_type: variant,
      posted_at: new Date().toISOString(),
      metrics: {
        impressions: 1200,
        likes: 54,
        replies: 16,
        reposts: 8,
        quotes: 3,
        profile_visits: 42,
        followers_gained: 4,
        engagement_rate: 6.75,
        follower_conversion_rate: 9.52,
        why_it_worked_tags: ['High Engagement Rate (>4%)', 'Debate Catalyst', 'Hook Strength'],
        why_underperformed_tags: [],
        diagnostic_notes: 'Strong initial velocity with active replies.'
      }
    };
    storage.savePostedPost(newPosted);
    setPostedPosts(storage.getPostedPosts());
    setCurrentView('analytics');
    showToast('Moved to Analytics Tracker!');
  };

  const handleOpenHistoricalRun = (runResult: GroundedResearchResult) => {
    setActiveResult(runResult);
    setCurrentView('dashboard');
    showToast('Loaded Grounded Run from Vault');
  };

  const handleSaveStyleProfile = (newProfile: StyleProfile) => {
    storage.saveStyleProfile(newProfile);
    setStyleProfile(newProfile);
    showToast('Style Lab updated!');
  };

  const handleAddReference = (ref: ReferencePost) => {
    storage.saveReferencePost(ref);
    setReferences(storage.getReferencePosts());
    showToast('Reference Post Anatomy Saved!');
  };

  const handleDeleteReference = (id: string) => {
    storage.deleteReferencePost(id);
    setReferences(storage.getReferencePosts());
  };

  const handleSaveMetrics = (postId: string, metrics: PostMetrics) => {
    storage.updatePostMetrics(postId, metrics);
    setPostedPosts(storage.getPostedPosts());
    showToast('Metrics updated!');
  };

  const handleAddNewPosted = (item: PostedPostItem) => {
    storage.savePostedPost(item);
    setPostedPosts(storage.getPostedPosts());
    showToast('Published post recorded!');
  };

  const handleClearCache = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('soulflick_research_cache'));
    keys.forEach(k => localStorage.removeItem(k));
    showToast('Cache cleared!');
  };

  return (
    <div className="min-h-screen cinema-mist-bg text-[#2D2823] dark:text-[#F3EDE6] flex font-sans selection:bg-[#C29358] selection:text-white transition-colors duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2A241F] dark:bg-[#F3EDE6] text-[#FDFBF7] dark:text-[#1E1B18] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#C29358] flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Fixed Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        settings={settings}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      {/* 2. Top Header Controls (Theme toggle & Avatar) */}
      <TopHeader
        settings={settings}
        onOpenSettings={() => setSettingsModalOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isLiveConfigured={geminiService.isLiveConfigured()}
      />

      {/* 3. Main Center Content Canvas */}
      <main className="flex-1 min-h-screen pl-64 flex flex-col justify-start items-center relative z-10 px-4 sm:px-8 py-8">
        
        {/* Error Notice */}
        {errorMessage && (
          <div className="w-full max-w-4xl mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-xs font-bold underline hover:opacity-75"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* VIEW 1: HOME / HERO HUNTER CONSOLE */}
        {currentView === 'dashboard' && (
          <div className="w-full flex flex-col items-center justify-center min-h-[80vh]">
            
            {/* The Pristine Editorial Hero */}
            <HeroHunter
              userName={settings.creatorName || 'Arjun'}
              contentType={contentType}
              setContentType={setContentType}
              audience={audience}
              setAudience={setAudience}
              language={language}
              setLanguage={setLanguage}
              tone={tone}
              setTone={setTone}
              length={length}
              setLength={setLength}
              hashtags={hashtags}
              setHashtags={setHashtags}
              specificTopic={specificTopic}
              setSpecificTopic={setSpecificTopic}
              onResearchAndCreate={handleResearchAndCreate}
              onFindTodaysTopics={handleFindTodaysTopics}
              isLoading={isLoading}
              loadingMode={loadingMode}
            />

            {/* Live Progress Visualizer (When executing research) */}
            {isLoading && loadingMode === 'create' && (
              <div className="w-full max-w-4xl mt-6">
                <LiveResearchVisualizer
                  stageMessage={progressStage}
                  progressPercent={progressPercent}
                />
              </div>
            )}

            {/* Active Grounded Result Display */}
            {activeResult && !isLoading && (
              <div className="w-full max-w-5xl mt-6">
                <ResearchResultView
                  result={activeResult}
                  onSavePost={(content, persona) => {
                    handleSaveToDrafts({
                      id: `draft-${Date.now()}`,
                      topic_title: activeResult.recommended_topic.title,
                      variant_type: persona,
                      content,
                      character_count: content.length,
                      hashtags: activeResult.recommended_hashtags,
                      image_keywords: activeResult.image_recommendation?.search_keywords,
                      ai_prompt: activeResult.image_recommendation?.ai_prompt,
                      visual_type: activeResult.image_recommendation?.visual_type,
                      status: 'draft',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    });
                  }}
                  onPostDirectlyToX={(content) => {
                    handlePostNow(content, activeResult.recommended_topic.title, 'primary');
                  }}
                />
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: OPPORTUNITIES */}
        {currentView === 'opportunities' && (
          <div className="w-full max-w-5xl py-8">
            <OpportunitiesView
              opportunities={opportunities}
              onSelectTopicForPost={handleSelectTopicForPost}
              onRefreshOpportunities={handleFindTodaysTopics}
              isLoading={isLoading && loadingMode === 'topics'}
              selectedAudience={audience}
            />
          </div>
        )}

        {/* VIEW 3: RESEARCH HISTORY */}
        {currentView === 'history' && (
          <div className="w-full max-w-5xl py-8">
            <ResearchHistoryView
              history={history}
              onOpenRun={handleOpenHistoricalRun}
            />
          </div>
        )}

        {/* VIEW 4: DRAFTS STUDIO (SAVED) */}
        {currentView === 'drafts' && (
          <div className="w-full max-w-5xl py-8">
            <DraftsStudioView
              drafts={drafts}
              onUpdateDraft={(draft) => {
                storage.saveDraft(draft);
                setDrafts(storage.getDrafts());
              }}
              onDeleteDraft={(id) => {
                storage.deleteDraft(id);
                setDrafts(storage.getDrafts());
              }}
              onPostNow={handlePostNow}
            />
          </div>
        )}

        {/* VIEW 5: ANALYTICS */}
        {currentView === 'analytics' && (
          <div className="w-full max-w-5xl py-8">
            <PostedAnalyticsView
              postedPosts={postedPosts}
              onSaveMetrics={handleSaveMetrics}
              onAddNewPosted={handleAddNewPosted}
            />
          </div>
        )}

        {/* VIEW 6: STYLE LAB */}
        {currentView === 'style_lab' && (
          <div className="w-full max-w-5xl py-8">
            <StyleLabView
              styleProfile={styleProfile}
              onSaveProfile={handleSaveStyleProfile}
            />
          </div>
        )}

        {/* VIEW 7: REFERENCE LIBRARY */}
        {currentView === 'reference_library' && (
          <div className="w-full max-w-5xl py-8">
            <ReferenceLibraryView
              references={references}
              onAddReference={handleAddReference}
              onDeleteReference={handleDeleteReference}
            />
          </div>
        )}

      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          storage.saveSettings(newSettings);
          setSettings(newSettings);
        }}
        onClearCache={handleClearCache}
      />

    </div>
  );
}

export default App;
