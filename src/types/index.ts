export type ViewMode = 
  | 'dashboard' 
  | 'opportunities' 
  | 'history' 
  | 'drafts' 
  | 'analytics' 
  | 'style_lab' 
  | 'reference_library' 
  | 'settings';

export type ContentType = 
  | 'Viral / High Reach'
  | 'Controversial'
  | 'Smart Film Analysis'
  | 'Emotional / Nostalgic'
  | 'Breaking News'
  | 'Did You Know?'
  | 'Actor Story'
  | 'Director Story'
  | 'Behind The Scenes'
  | 'Box Office / Industry'
  | 'Fan Theory'
  | 'Debate'
  | 'Recommendation'
  | 'Thread'
  | 'Surprise Me';

export type AudienceType = 
  | 'Hollywood / Global Cinema'
  | 'Indian Cinema'
  | 'Mixed'
  | 'Custom';

export type LanguageType = 
  | 'English'
  | 'Hinglish'
  | 'Hindi'
  | 'Tamil'
  | 'Telugu'
  | 'Bengali'
  | 'Custom';

export type ToneType = 
  | 'Human / Conversational'
  | 'Intelligent Critic'
  | 'Emotional'
  | 'Funny'
  | 'Brutal'
  | 'Calm'
  | 'Provocative'
  | 'Balanced';

export type LengthType = 'Short' | 'Medium' | 'Long';
export type MediaStrategy = 'Text only' | 'Recommend image' | 'Image caption concept' | 'User will upload image';
export type HashtagOption = 'Auto' | 'None' | '1' | '2' | 'Custom';
export type ResearchDepth = 'Quick' | 'Standard' | 'Deep';

export type VariantKey = 'primary' | 'smart' | 'spicy' | 'emotional';
export type DraftPersonaVariant = VariantKey;

export interface GroundedSource {
  title: string;
  url?: string;
  source_type: string; // 'Official Studio' | 'Entertainment Publication' | 'Interview' | 'Search-indexed source'
  date?: string;
  confidence_level?: string;
}

export interface VerifiedClaim {
  claim: string;
  source: string;
  source_date?: string;
  confidence: string; // 'Verified (Official)' | 'High (Trade Report)' | 'Moderate (Discussion)'
  verified: boolean;
}

export interface ConversationSignal {
  source: string;
  theme: string;
  summary: string;
}

export interface TopicOpportunity {
  id?: string;
  title: string;
  summary: string;
  score: number;
  why_promising?: string;
  why_now?: string;
  saturation: 'low' | 'medium' | 'high' | string;
  best_angle: string;
  freshness?: string;
  discussion_potential?: string;
  suggested_content_type?: string;
  sources?: GroundedSource[];
}

export interface AngleAnalysis {
  news: string;
  curiosity: string;
  controversial: string;
  emotional: string;
  industry: string;
  hidden_detail: string;
  selected: string;
}

export interface ImageRecommendation {
  recommended: string;
  search_keywords: string[];
  visual_type: string;
  reason: string;
  orientation: string;
  ai_prompt?: string;
}

export interface QualityCheck {
  hook_strength: number;
  originality: number;
  evidence: number;
  conversation_potential: number;
  follower_conversion: number;
  overall: number;
}

export interface GroundedResearchResult {
  id?: string;
  research_timestamp: string;
  recommended_topic: {
    title: string;
    summary: string;
    why_now: string;
    opportunity_score: number;
  };
  topic_opportunities: TopicOpportunity[];
  angle_analysis: AngleAnalysis;
  research_summary: string;
  conversation_signals: ConversationSignal[];
  verified_claims: VerifiedClaim[];
  drafts: {
    primary: string;
    smart: string;
    spicy: string;
    emotional: string;
  };
  recommended_hashtags: string[];
  image_recommendation: ImageRecommendation;
  quality_check: QualityCheck;
  sources: GroundedSource[];
  
  // Execution metadata
  execution_time_ms?: number;
  cached?: boolean;
}

export interface ResearchRunRecord {
  id: string;
  created_at: string;
  content_type: ContentType;
  audience: AudienceType;
  language: LanguageType;
  tone: ToneType;
  intensity: number;
  research_depth: ResearchDepth;
  recommended_topic_title: string;
  opportunity_score: number;
  why_now: string;
  data: GroundedResearchResult;
}

export interface DraftItem {
  id: string;
  run_id?: string;
  topic_title: string;
  variant_type: VariantKey | 'thread' | 'custom';
  content: string;
  character_count: number;
  is_thread?: boolean;
  thread_parts?: string[];
  hashtags: string[];
  image_keywords?: string[];
  ai_prompt?: string;
  visual_type?: string;
  status: 'draft' | 'saved' | 'ready' | 'posted';
  created_at: string;
  updated_at: string;
}

export interface SavedPostItem {
  id: string;
  topic_title: string;
  content: string;
  variant_type: string;
  hashtags: string[];
  image_notes?: string;
  starred: boolean;
  tags: string[];
  created_at: string;
}

export interface PostedPostItem {
  id: string;
  topic_title: string;
  content: string;
  variant_type: string;
  x_post_url?: string;
  media_attached?: string;
  posted_at: string;
  metrics?: PostMetrics;
}

export interface PostMetrics {
  id?: string;
  posted_post_id?: string;
  impressions: number;
  likes: number;
  replies: number;
  reposts: number;
  quotes: number;
  profile_visits: number;
  followers_gained: number;
  
  // Deterministic local calculations
  engagement_rate: number;
  follower_conversion_rate: number;
  
  // Rule-based heuristic diagnostics
  why_it_worked_tags: string[];
  why_underperformed_tags: string[];
  diagnostic_notes: string;
}

export interface StyleProfile {
  voice_archetype: string;
  responds_to: string[];
  ignores: string[];
  hook_patterns: string[];
  sentence_rhythm: string;
  taboo_phrases: string[];
  recent_topics_history: string[];
}

export interface ReferencePost {
  id: string;
  title: string;
  original_author?: string;
  raw_text: string;
  hook_type: string;
  structure_notes: string;
  information_density: string;
  emotional_arc: string;
  ending_pattern: string;
  tags: string[];
  created_at: string;
}

export interface AppSettings {
  enableClientCache: boolean;
  cacheTtlMinutes: number;
  defaultAudience: AudienceType;
  defaultLanguage: LanguageType;
  defaultTone: ToneType;
  defaultIntensity: number;
  creatorHandle: string;
  creatorName: string;
}
