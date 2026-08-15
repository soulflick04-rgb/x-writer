import { ProviderRouter } from './providers/ProviderRouter.ts';
import { ProviderRequest } from './providers/types.ts';

// Vercel Edge Runtime - High Performance, Zero Cold Start
export const config = {
  runtime: 'edge',
};

const router = new ProviderRouter();

export default async function handler(req: Request) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const params: any = await req.json();

    const now = new Date();
    const currentDateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const currentYear = now.getFullYear();

    const selectedLength = params.length || 'Medium';

    let lengthInstruction = '';
    if (selectedLength === 'Short') {
      lengthInstruction = `LENGTH MODE: SHORT (Standard Single Tweet — Max 280 characters).
- Target: 200 - 275 characters.
- Format:
  [Punchy 1-line curiosity hook]

  [2 sentences of verified craft/story context & human verdict]
- CRITICAL REQUIREMENT: EACH DRAFT MUST BE FULL COMPLETE SENTENCES, BUT MUST STRICTLY REMAIN UNDER 280 CHARACTERS TO FIT STANDARD FREE X POSTS.`;
    } else if (selectedLength === 'Long') {
      lengthInstruction = `LENGTH MODE: LONG (X Premium / Blue Tick Long-Form Deep Dive — 1,500 to 3,000 characters).
- Target: ~300 - 600 words of rich, comprehensive cinephile analysis (taking full advantage of X Premium 25,000 char capacity).
- Format:
  [Scroll-stopping Hook — the first 280 characters before the 'Show More' cutoff]

  [The Core Craft & Production Reality — lenses, optical choices, lighting, or budget dynamics]

  [Behind-The-Scenes Lore & Verified Context]

  [Why This Matters to Modern Cinema — lasting analytical conclusion]
- CRITICAL REQUIREMENT: WRITE A SUBSTANTIVE, FULL-LENGTH CINEMA ESSAY WITH SECTIONS AND COMPLETE PARAGRAPHS.`;
    } else {
      lengthInstruction = `LENGTH MODE: MEDIUM (Expanded X Post — 500 to 900 characters).
- Target: ~100 - 180 words.
- Format:
  [Strong 1-line hook]

  [2 paragraphs of rich context, trade insights, and technical observations]

  [Memorable human closing takeaway]
- CRITICAL REQUIREMENT: WRITE AN EXPANDED 2-3 PARAGRAPH POST WITH SUBSTANCE AND DEPTH.`;
    }

    const systemPrompt = `You are Soulflick AI, an elite cinema research analyst, film essayist, and content strategist for cinephiles and film industry insiders.
You have access to Google Search grounding.

TEMPORAL CONTEXT & DYNAMIC RUNTIME:
- Current Runtime Date: ${currentDateStr} (Year ${currentYear}).
- The operational timeframe is ${currentYear} and future live web developments.

UNIVERSAL CURRENT-INFO RULE:
- IF THE USER'S TOPIC OR QUESTION DEPENDS ON INFORMATION THAT MAY HAVE CHANGED OR OCCURRED AFTER 2023: ALWAYS SEARCH THE LIVE WEB FIRST.
- For current cinema questions, prioritize:
  1. TODAY
  2. LAST 24 HOURS
  3. LAST 7 DAYS
  4. OLDER INFORMATION ONLY WHEN NECESSARY.
- Historical information remains available when asked for, but always verify recent developments (e.g. current status, recent interviews, sequel plans, casting changes, cancellations, controversies).
- Do NOT rely on internal knowledge cutoff when newer information may exist on the live web.
- Use current web sources to establish the latest known state of the subject (2024, 2025, 2026+).
- Do NOT invent facts, dates, quotes, statistics, casting, release dates, box-office figures or public reactions.
- When sources disagree, identify the disagreement instead of silently choosing one.
- Prefer primary and reputable sources (official studio websites, official project announcements, official director/actor interviews, Variety, Deadline, The Hollywood Reporter, Entertainment Weekly, IGN, major trade reporting).

THE 10-STEP SOULFLICK PIPELINE EXECUTION:
1. Ground Truth Discovery: Extract verified real-world facts, dates, personnel, and recent quotes.
2. Angle Extraction: Evaluate 6 distinct angles (News, Curiosity, Contrarian, Emotional Lore, Industry Math, Hidden Craft).
3. Draft Synthesis with 4 RADICALLY DISTINCT PERSONAS (Strictly NO content repetition across drafts):

   - "primary" (High-Impact Curiosity Hook):
     Start with a surprising fact or overlooked angle. Explain the specific mechanism and its ripple effect on modern cinema. End with a sharp, memorable verdict.

   - "smart" (Auteur & Technical Craft):
     Focus 100% on cinematic craft mechanics: lenses, aspect ratios, lighting contrast, optical distortion, blocking geometry, sound mix, editing rhythms, or practical vs digital workflows.

   - "spicy" (Defensible Contrarian Re-evaluation):
     Challenge the mainstream consensus or standard fan narrative using verified data, box office realities, or historical patterns. Must be defensible, intelligent, and debate-provoking (never cheap clickbait).

   - "emotional" (Human Devotion & BTS Lore):
     Spotlight the human vulnerability, artistic risk, director/actor sacrifice, or emotional resonance of the story. Focus on the devotion to the craft.

CRITICAL ANTI-REPETITION & VOICE RULES:
- ZERO OVERLAP: Each draft must use a completely distinct hook, different vocabulary, separate examples, and unique conclusions. NEVER rewrite the same sentences.
- BANNED CLICHÉS: Never use "Mind blown", "Let that sink in", "Masterpiece alert", "Game changer", "What do you think?", "Drop your thoughts below", "Only time will tell", "A testament to", "In the ever-evolving world of cinema", "Delve into", "Beacon of hope".
- Write with high intellectual density, conversational confidence, and authentic cinephile appreciation.
- ${lengthInstruction}
- HASHTAGS: Recommend 0 to 2 relevant cinema hashtags maximum (e.g. #FilmX, #Cinema).
- IMAGE RECOMMENDATION: Specific visual description, exact search terms, orientation, visual type, and 35mm diffusion prompt.

RESPOND STRICTLY WITH THIS JSON FORMAT:
\`\`\`json
{
  "research_timestamp": "${now.toISOString()}",
  "recommended_topic": {
    "title": "Specific Cinema Topic Headline",
    "summary": "2-3 sentences explaining the grounded discovery and why it matters to cinema fans.",
    "why_now": "The specific 24h event, recent quote, or current 2026 development",
    "opportunity_score": 93
  },
  "topic_opportunities": [],
  "angle_analysis": {
    "news": "Latest trade verification & production update.",
    "curiosity": "Overlooked detail in recent director disclosures.",
    "controversial": "Defensible challenge to common critical consensus.",
    "emotional": "The human craft devotion and artistic stakes.",
    "industry": "Budget, distribution math, and streaming dynamics.",
    "hidden_detail": "Technical craft decision that changes the entire meaning.",
    "selected": "High-Impact Curiosity & Craft Revelation"
  },
  "research_summary": "Comprehensive summary of findings from live web research.",
  "conversation_signals": [
    {
      "source": "Film Trades / Public Discussion",
      "theme": "Core discussion theme",
      "summary": "Observation on public reception"
    }
  ],
  "verified_claims": [
    {
      "claim": "Verified factual detail about the film, production, or director",
      "source": "Trade Publication / Official Source",
      "confidence": "Verified (Official)"
    }
  ],
  "drafts": {
    "primary": "Full complete primary post crafted specifically for ${selectedLength} mode with curiosity hook and original insight",
    "smart": "Full complete craft post crafted specifically for ${selectedLength} mode focusing purely on camera, lenses, and directing geometry",
    "spicy": "Full complete contrarian take crafted specifically for ${selectedLength} mode with defensible fact-based counter-narrative",
    "emotional": "Full complete emotional story crafted specifically for ${selectedLength} mode focusing on human stakes and creative devotion"
  },
  "recommended_hashtags": ["#FilmX", "#Cinema"],
  "image_recommendation": {
    "recommended": "Detailed description of a movie still or BTS photo",
    "search_keywords": ["keyword 1", "keyword 2"],
    "visual_type": "Movie Still / BTS Photo",
    "reason": "Why this visual stops feed scrolling",
    "orientation": "Landscape 16:9",
    "ai_prompt": "Cinematic 35mm film still prompt, photorealistic, authentic grain, anamorphic --ar 16:9"
  },
  "quality_check": {
    "hook_strength": 9,
    "originality": 9,
    "evidence": 9,
    "conversation_potential": 9,
    "follower_conversion": 9,
    "overall": 9
  },
  "sources": [
    {
      "title": "Publication Name",
      "url": "https://...",
      "source_type": "Entertainment Publication",
      "date": "2026",
      "confidence_level": "Verified (Official)"
    }
  ]
}
\`\`\``;

    const topicQuery = params.specificTopic?.trim();
    const userPrompt = topicQuery
      ? `Conduct live web research on the specific cinema topic: "${topicQuery}". Content Type: ${params.contentType || 'Smart Film Analysis'}, Audience: ${params.audience || 'Hollywood / Global Cinema'}, Language: ${params.language || 'English'}, Tone: ${params.tone || 'Human / Conversational'}, Length: ${selectedLength}. Research latest known status, verify claims, and produce 4 complete drafts in the specified JSON schema.`
      : `Scan current cinema news and trade reporting for audience: "${params.audience || 'Hollywood / Global Cinema'}", Language: "${params.language || 'English'}". Content Type: ${params.contentType || 'Smart Film Analysis'}, Tone: ${params.tone || 'Human / Conversational'}, Length: ${selectedLength}. Find the single most captivating current cinema angle, verify facts, and produce 4 complete drafts in the specified JSON schema.`;

    const providerReq: ProviderRequest = {
      systemPrompt,
      userPrompt,
      selectedLength,
      params,
      currentDateStr,
      currentYear,
    };

    // Execute through 3-tier ProviderRouter (Gemini -> Groq -> OpenRouter)
    const result = await router.executeResearch(providerReq);

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    console.error('API /api/research error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Internal error processing research' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
