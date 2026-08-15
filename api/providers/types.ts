export interface ProviderRequest {
  systemPrompt: string;
  userPrompt: string;
  selectedLength: string;
  params: any;
  currentDateStr: string;
  currentYear: number;
}

export interface GroundedSourceItem {
  title: string;
  url?: string;
  source_type: string;
  date?: string;
  confidence_level?: string;
}

export interface ProviderResponse {
  rawText: string;
  provider: 'gemini' | 'groq' | 'openrouter';
  liveWebGrounding: boolean;
  searchQueries: string[];
  sources: GroundedSourceItem[];
  groundingMetadata?: any;
  executionTimeMs: number;
}

export interface AIProvider {
  readonly name: 'gemini' | 'groq' | 'openrouter';
  isAvailable(): boolean;
  execute(req: ProviderRequest): Promise<ProviderResponse>;
}

export interface ProviderMetadata {
  provider: 'gemini' | 'groq' | 'openrouter';
  fallback_used: boolean;
  provider_chain: string[];
  live_web_grounding: boolean;
  search_queries: string[];
  sources_count: number;
  newest_source_date?: string;
  execution_time_ms: number;
  current_date: string;
}

export interface NormalizedResearchResult {
  research_timestamp: string;
  recommended_topic: {
    title: string;
    summary: string;
    why_now: string;
    opportunity_score: number;
  };
  topic_opportunities: any[];
  angle_analysis: {
    news: string;
    curiosity: string;
    controversial: string;
    emotional: string;
    industry: string;
    hidden_detail: string;
    selected: string;
  };
  research_summary: string;
  conversation_signals: Array<{
    source: string;
    theme: string;
    summary: string;
  }>;
  verified_claims: Array<{
    claim: string;
    source: string;
    source_date?: string;
    confidence: string;
    verified: boolean;
  }>;
  drafts: {
    primary: string;
    smart: string;
    spicy: string;
    emotional: string;
  };
  recommended_hashtags: string[];
  image_recommendation: {
    recommended: string;
    search_keywords: string[];
    visual_type: string;
    reason: string;
    orientation: string;
    ai_prompt?: string;
  };
  quality_check: {
    hook_strength: number;
    originality: number;
    evidence: number;
    conversation_potential: number;
    follower_conversion: number;
    overall: number;
  };
  sources: GroundedSourceItem[];
  provider_metadata: ProviderMetadata;
  selected_length?: string;
}
