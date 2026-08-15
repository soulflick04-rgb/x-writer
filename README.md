# Soulflick AI — Cinema Intelligence & X Strategy Workstation

**Soulflick AI** is a production-grade personal AI cinema research, trend intelligence, strategy, and writing assistant built specifically for X/Twitter cinema creators and film commentators.

---

## Key Product Philosophy & Single-Request Architecture

1. **Strict 1-Gemini Request Pipeline**:
   - Every **"RESEARCH & CREATE"** or **"JUST FIND TODAY'S BEST TOPICS"** action strictly consumes **1 Gemini API request** equipped with **Google Search Grounding**.
   - The entire 12-phase pipeline (Web Search $\to$ Trend Discovery $\to$ Topic Scoring $\to$ Angle Synthesis $\to$ Public Conversation $\to$ Fact Verification $\to$ Writing 4 Persona Drafts $\to$ Hashtags $\to$ Visual Asset Strategy $\to$ Quality Audit) executes in that single call.
   - **Zero AI calls for follow-ups**: Switching between Primary, Smart, Spicy, and Emotional variants, thread splitting, character counting, fact inspection, copying, saving, and performance diagnostics execute 100% locally with zero extra API spend.

2. **No Direct X / Reddit APIs**:
   - Discovers indexed discussions from public Reddit threads (e.g., `r/movies`, `r/cinematography`), X discussions, and trade publications (Variety, Deadline, ASC, IndieWire) via Google Search grounding.
   - Distinguishes clearly between direct sources, search-indexed sources, and Gemini inferences without fabricating fake follower or engagement numbers.

3. **Deterministic Local Analytics Engine**:
   - Computes Engagement Rate, Follower Conversion Rate, and Hook Efficiency deterministically.
   - Provides rule-based heuristic "Why this worked" and "Why this underperformed" diagnostics at zero AI cost.

---

## Technology Stack

- **Frontend**: React 18/19, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti, Vite
- **AI Grounding**: Gemini 2.0 Flash / Gemini 1.5 Flash with `tools: [{ googleSearch: {} }]`
- **Backend & Database**: Supabase PostgreSQL with Row Level Security (RLS), Supabase Auth, Supabase Edge Functions (Deno / TypeScript)
- **Design System**: Obsidian & Charcoal Cinematic Workstation with Amber/Gold film accents, clean typography, and zero cliché fluff.

---

## Database Schema (`supabase/migrations/20260815_initial_schema.sql`)

- `profiles`: User account, X handle, cinema niche, avatar
- `user_preferences`: Default audience, languages, tones, intensity, hashtags, research depth
- `style_profiles`: "Things My Audience Responds To", "Things My Audience Ignores", rhythm rules, taboo buzzwords, and franchise fatigue tracker
- `reference_posts`: Structural inspiration vault (hook mechanics, pacing, information density)
- `research_runs`: Grounded research runs with complete JSON payload, opportunity scores, and cache keys
- `research_sources`: Grounded sources and trade publications
- `topics`: Discovered opportunities with saturation ratings and freshness triggers
- `drafts`: Generated post variants (Primary, Smart, Spicy, Emotional, Thread)
- `saved_posts`: Curated library
- `posted_posts`: Published tweets tracker
- `post_metrics`: Impressions, likes, replies, reposts, quotes, profile visits, followers gained, and diagnostic tags

---

## Supabase Edge Functions Setup

1. **`supabase/functions/research-and-create/index.ts`**: The core 1-request grounded pipeline.
2. **`supabase/functions/find-topics/index.ts`**: Fast 5-topic opportunity scanner.

### Deploying to Supabase:
```bash
# Set your Gemini API key in Supabase secrets
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here

# Deploy edge functions
supabase functions deploy research-and-create
supabase functions deploy find-topics

# Run migrations
supabase db push
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```

Configure your credentials inside the in-app **Workstation Settings** modal or create a `.env.local` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```
