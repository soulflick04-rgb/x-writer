import { 
  ContentType, 
  AudienceType, 
  LanguageType, 
  ToneType, 
  LengthType, 
  MediaStrategy, 
  HashtagOption, 
  ResearchDepth,
  GroundedResearchResult, 
  TopicOpportunity 
} from '../types';
import { storage } from './storage';
import { styleEngine } from './styleEngine';

export interface ResearchRequestParams {
  contentType: ContentType;
  audience: AudienceType;
  language: LanguageType;
  tone: ToneType;
  intensity: number;
  length: LengthType;
  media: MediaStrategy;
  hashtags: HashtagOption;
  researchDepth: ResearchDepth;
  specificTopic?: string;
}

export const geminiService = {
  /**
   * Generates a deterministic cache key for research parameters
   */
  generateCacheKey(params: ResearchRequestParams): string {
    const today = new Date().toISOString().split('T')[0];
    const raw = `${today}_${params.contentType}_${params.audience}_${params.language}_${params.tone}_${params.intensity}_${params.length}_${params.specificTopic || 'none'}`;
    return btoa(raw).replace(/[/+=]/g, '_');
  },

  /**
   * Always true because backend route manages the API secrets
   */
  isLiveConfigured(): boolean {
    return true;
  },

  /**
   * Main "RESEARCH & CREATE" pipeline
   * Calls Server-side API endpoint with Gemini -> Groq -> OpenRouter fallback
   */
  async researchAndCreate(
    params: ResearchRequestParams,
    onProgressUpdate?: (stage: string, progress: number) => void
  ): Promise<GroundedResearchResult> {
    const settings = storage.getSettings();
    const cacheKey = this.generateCacheKey(params);

    // 1. Check local cache to avoid duplicate API spend
    if (settings.enableClientCache) {
      const cached = storage.getCachedResearch(cacheKey, settings.cacheTtlMinutes);
      if (cached) {
        onProgressUpdate?.('Retrieved from Grounded Cache (0 API Cost)', 100);
        return { ...cached, cached: true };
      }
    }

    const styleProfile = storage.getStyleProfile();
    const compactStyleSummary = styleEngine.formatCompactStylePrompt(styleProfile);
    const referencePosts = storage.getReferencePosts();
    const refAnatomies = referencePosts.slice(0, 3).map(r => `[${r.title}] Hook: ${r.hook_type} | Notes: ${r.structure_notes}`);

    onProgressUpdate?.('Executing Grounded AI Research (Gemini -> Groq -> OpenRouter)...', 35);

    const startTime = Date.now();
    const payload = {
      ...params,
      userStyleSummary: compactStyleSummary,
      recentTopicsHistory: styleProfile.recent_topics_history,
      referenceAnatomy: refAnatomies,
    };

    const res = await fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server error (${res.status}) processing research`);
    }

    const responseData = await res.json();
    if (!responseData.success || !responseData.data) {
      throw new Error(responseData.error || 'Invalid response received from server.');
    }

    const result: GroundedResearchResult = responseData.data;
    result.execution_time_ms = Date.now() - startTime;
    result.cached = false;

    // Cache locally
    storage.setCachedResearch(cacheKey, result);
    onProgressUpdate?.('Research Complete!', 100);

    return result;
  },

  /**
   * "JUST FIND TODAY'S BEST TOPICS" pipeline
   */
  async findTodaysBestTopics(
    audience: AudienceType,
    language: LanguageType = 'English',
    onProgressUpdate?: (stage: string, progress: number) => void
  ): Promise<TopicOpportunity[]> {
    onProgressUpdate?.('Scanning breaking cinema news and trade journals...', 35);

    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience, language })
      });

      if (!res.ok) {
        return storage.getOpportunities();
      }

      const responseData = await res.json();
      if (responseData.success && Array.isArray(responseData.data)) {
        storage.saveOpportunities(responseData.data);
        return responseData.data;
      }
      return storage.getOpportunities();
    } catch (err) {
      console.warn('Find topics server call fallback to local catalog:', err);
      return storage.getOpportunities();
    }
  }
};
