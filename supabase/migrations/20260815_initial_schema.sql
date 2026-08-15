-- ==============================================================================
-- SOULFLICK AI - PRODUCTION DATABASE SCHEMA (POSTGRESQL + ROW LEVEL SECURITY)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    x_handle TEXT,
    cinema_niche TEXT DEFAULT 'Global Cinema & Auteurs',
    avatar_url TEXT,
    tier TEXT DEFAULT 'creator_pro',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    default_audience TEXT DEFAULT 'Hollywood / Global Cinema',
    default_language TEXT DEFAULT 'English',
    default_tone TEXT DEFAULT 'Human / Conversational',
    default_intensity INTEGER DEFAULT 6,
    default_length TEXT DEFAULT 'Medium',
    default_media TEXT DEFAULT 'Recommend image',
    default_hashtags TEXT DEFAULT 'Auto',
    default_depth TEXT DEFAULT 'Standard',
    custom_instructions TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STYLE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.style_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    voice_archetype TEXT DEFAULT 'Knowledgeable Insider & Cinephile',
    responds_to JSONB DEFAULT '["Surprising behind-the-scenes facts", "Director commentary callbacks", "Box office context & budget insights", "Contrarian critical re-evaluations", "Subtle cinematography details"]'::jsonb,
    ignores JSONB DEFAULT '["Generic trailer praise", "Lazy clickbait without sources", "Overused hype formulas", "Vague rumor mill without corroboration", "Senseless fan wars"]'::jsonb,
    hook_patterns JSONB DEFAULT '["Curiosity Gap: The hidden reason X happened", "Contrarian Reversal: Why conventional wisdom on Y is wrong", "Specific Anecdote: What happened on day 43 of filming"]'::jsonb,
    sentence_rhythm TEXT DEFAULT 'Crisp opening hooks, short declarative sentences, varied pacing with cinematic cadence.',
    taboo_phrases JSONB DEFAULT '["Game changer", "Masterpiece alert", "What do you think?", "Let that sink in", "Break the internet"]'::jsonb,
    recent_topics_history JSONB DEFAULT '[]'::jsonb,
    compact_ai_prompt TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REFERENCE POSTS (Inspiration Vault - Structural Anatomy only)
CREATE TABLE IF NOT EXISTS public.reference_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    original_author TEXT DEFAULT '',
    raw_text TEXT NOT NULL,
    hook_type TEXT DEFAULT 'Curiosity / Contrarian',
    structure_notes TEXT DEFAULT '',
    information_density TEXT DEFAULT 'High',
    emotional_arc TEXT DEFAULT 'Intrigue -> Revelation',
    ending_pattern TEXT DEFAULT 'Sharp observation',
    tags TEXT[] DEFAULT ARRAY['cinema', 'thread-hook'],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RESEARCH RUNS (Grounding Runs & Result Payloads)
CREATE TABLE IF NOT EXISTS public.research_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    run_type TEXT NOT NULL CHECK (run_type IN ('research_and_create', 'find_topics')),
    content_type TEXT NOT NULL,
    audience TEXT NOT NULL,
    language TEXT NOT NULL,
    tone TEXT NOT NULL,
    intensity INTEGER DEFAULT 6,
    research_depth TEXT DEFAULT 'Standard',
    
    -- Grounded Output Payloads
    recommended_topic_title TEXT,
    opportunity_score INTEGER,
    why_now TEXT,
    research_summary TEXT,
    selected_angle TEXT,
    
    -- Full structured JSON response from single Gemini request
    raw_response JSONB NOT NULL,
    
    -- Cache fingerprint for cost optimization
    cache_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RESEARCH SOURCES (Extracted Grounded Sources)
CREATE TABLE IF NOT EXISTS public.research_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_run_id UUID NOT NULL REFERENCES public.research_runs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT,
    source_type TEXT DEFAULT 'news_article', -- official_studio, entertainment_trade, interview, reddit_indexed, x_indexed, publication
    date_referenced TEXT,
    confidence_level TEXT DEFAULT 'high',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TOPICS (Discovered Opportunities)
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_run_id UUID REFERENCES public.research_runs(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    opportunity_score INTEGER DEFAULT 80,
    why_promising TEXT,
    why_now TEXT,
    saturation TEXT DEFAULT 'low',
    best_angle TEXT,
    status TEXT DEFAULT 'discovered', -- discovered, drafted, posted, archived
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DRAFTS (Generated Post Variants)
CREATE TABLE IF NOT EXISTS public.drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_run_id UUID REFERENCES public.research_runs(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_title TEXT NOT NULL,
    variant_type TEXT NOT NULL CHECK (variant_type IN ('primary', 'smart', 'spicy', 'emotional', 'thread', 'custom')),
    content TEXT NOT NULL,
    character_count INTEGER NOT NULL,
    is_thread BOOLEAN DEFAULT FALSE,
    thread_parts JSONB DEFAULT '[]'::jsonb,
    image_search_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    ai_image_prompt TEXT DEFAULT '',
    visual_type TEXT DEFAULT '',
    hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT DEFAULT 'draft', -- draft, saved, ready, posted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SAVED POSTS (Curated Library)
CREATE TABLE IF NOT EXISTS public.saved_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draft_id UUID REFERENCES public.drafts(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_title TEXT NOT NULL,
    content TEXT NOT NULL,
    variant_type TEXT DEFAULT 'primary',
    hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
    image_notes TEXT DEFAULT '',
    starred BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. POSTED POSTS (Published to X)
CREATE TABLE IF NOT EXISTS public.posted_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draft_id UUID REFERENCES public.drafts(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_title TEXT NOT NULL,
    content TEXT NOT NULL,
    variant_type TEXT DEFAULT 'primary',
    x_post_url TEXT DEFAULT '',
    x_post_id TEXT DEFAULT '',
    media_attached TEXT DEFAULT '',
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. POST METRICS (Deterministic Local Analytics)
CREATE TABLE IF NOT EXISTS public.post_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posted_post_id UUID NOT NULL REFERENCES public.posted_posts(id) ON DELETE CASCADE UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    impressions INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    quotes INTEGER DEFAULT 0,
    profile_visits INTEGER DEFAULT 0,
    followers_gained INTEGER DEFAULT 0,
    
    -- Calculated deterministically
    engagement_rate NUMERIC(5,2) DEFAULT 0.0,
    follower_conversion_rate NUMERIC(5,2) DEFAULT 0.0,
    
    -- Rule-based heuristic diagnostics
    why_it_worked_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    why_underperformed_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    diagnostic_notes TEXT DEFAULT '',
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_research_runs_user_created ON public.research_runs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_runs_cache_key ON public.research_runs(cache_key);
CREATE INDEX IF NOT EXISTS idx_drafts_user_status ON public.drafts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_topics_user_status ON public.topics(user_id, status);
CREATE INDEX IF NOT EXISTS idx_posted_posts_user_posted ON public.posted_posts(user_id, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_posts_user ON public.saved_posts(user_id, created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posted_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_metrics ENABLE ROW LEVEL SECURITY;

-- Helper macro for standard user isolation
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own style profiles" ON public.style_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own reference posts" ON public.reference_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own research runs" ON public.research_runs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own research sources" ON public.research_sources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own topics" ON public.topics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own drafts" ON public.drafts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saved posts" ON public.saved_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own posted posts" ON public.posted_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own post metrics" ON public.post_metrics FOR ALL USING (auth.uid() = user_id);

-- Auto profile creation trigger on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, x_handle)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'Cinema Creator'), COALESCE(new.raw_user_meta_data->>'x_handle', 'cinephile'));

    INSERT INTO public.user_preferences (user_id)
    VALUES (new.id);

    INSERT INTO public.style_profiles (user_id)
    VALUES (new.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
