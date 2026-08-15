import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  contentType: string;
  audience: string;
  language: string;
  tone: string;
  intensity: number;
  length: string;
  media: string;
  hashtags: string;
  researchDepth: string;
  specificTopic?: string;
  userStyleSummary?: string;
  recentTopicsHistory?: string[];
  referenceAnatomy?: string[];
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY is not configured in Supabase Edge Secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Optional Supabase user authentication context
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    let supabaseClient: any = null;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseServiceKey && authHeader) {
      supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    const body: RequestBody = await req.json();
    const {
      contentType = 'Viral / High Reach',
      audience = 'Hollywood / Global Cinema',
      language = 'English',
      tone = 'Human / Conversational',
      intensity = 6,
      length = 'Medium',
      media = 'Recommend image',
      hashtags = 'Auto',
      researchDepth = 'Standard',
      specificTopic = '',
      userStyleSummary = '',
      recentTopicsHistory = [],
      referenceAnatomy = [],
    } = body;

    // Build Diversification instructions to prevent Marvel / franchise fatigue
    const recentHistoryText = recentTopicsHistory && recentTopicsHistory.length > 0
      ? `RECENTLY COVERED TOPICS TO AVOID DUPLICATING (Enforce topic diversification unless breaking critical news): ${recentTopicsHistory.join(', ')}`
      : 'Topic diversification: Avoid over-relying on standard superhero fatigue unless there is genuinely fresh news. Prefer finding actors, directors, original cinema, A24, international cinema, box office realities, or forgotten gems.';

    const systemPrompt = `You are Soulflick AI, an elite cinema research analyst, trend scout, content strategist and X writer.
Your job is to research the current internet and identify the strongest cinema content opportunity for the user's selected audience and content goal.

CRITICAL PRINCIPLES:
1. Do not simply find the biggest news story. Find the strongest STORY ANGLE.
2. Rely strictly on current web grounded evidence from the last 24 hours (expand to 7 days only if necessary).
3. Do NOT manufacture a trend just because a topic is famous. A topic must have a real reason to be discussed NOW.
4. Distinguish clearly between: Direct source, Search-indexed source, and Gemini inference.
5. NEVER invent like/repost/comment metrics. If exact metrics are unavailable, state they are unavailable.
6. NEVER invent quotes, dates, box office numbers, ratings, or casting facts. Every claim must be verified or removed.
7. Write like a real, passionate, intelligent human who lives and breathes cinema. No generic AI clichés ("Let that sink in", "Game changer", "Masterpiece alert", "What do you think?").
8. Handle the ENTIRE pipeline internally in this SINGLE request: Research -> Topic Scoring -> Real Angle -> Conversation Signals -> Fact Verification -> 4 Persona Drafts (Primary, Smart, Spicy, Emotional) -> Hashtags -> Visual Assets -> Quality Audit.

USER PARAMETERS:
- Content Type Target: ${contentType}
- Target Audience: ${audience}
- Language: ${language} (Write post drafts in ${language})
- Tone: ${tone}
- Intensity: ${intensity}/10 (1=Safe, 10=Extremely Spicy / High Disagreement)
- Preferred Length: ${length}
- Media Strategy: ${media}
- Hashtag Rule: ${hashtags}
- Research Depth: ${researchDepth}
${specificTopic ? `- User specifically wants research focused on: "${specificTopic}"` : ''}

${userStyleSummary ? `USER AUDIENCE PROFILE & STYLE MEMORY:\n${userStyleSummary}` : ''}
${recentHistoryText}
${referenceAnatomy && referenceAnatomy.length > 0 ? `STRUCTURAL REFERENCE POST ANATOMIES (Learn structure/rhythm only, NEVER copy words):\n${referenceAnatomy.join('\n---\n')}` : ''}

OPPORTUNITY SCORE FORMULA (0-100):
- Recency: 15%
- Conversation potential: 15%
- Curiosity: 15%
- Emotional potential: 10%
- Debate potential: 10%
- Audience fit: 10%
- Originality: 10%
- Evidence quality: 10%
- Saturation penalty: 5%

DRAFTS SPECIFICATION:
Generate 4 distinct drafts:
A. primary: The absolute strongest overall post balancing hook, evidence, and human voice.
B. smart: Intelligent, cinephile, critic-like observation with deep craft/industry context.
C. spicy: Sharpest defensible contrarian take with high debate potential (calibrated to intensity ${intensity}/10).
D. emotional: Deepest human or nostalgic resonance focusing on the actor, director, or cinematic history.

OUTPUT FORMAT:
You MUST respond with a single, valid JSON object strictly matching this schema with NO markdown code fences outside the JSON:

{
  "research_timestamp": "${new Date().toISOString()}",
  "recommended_topic": {
    "title": "Clear compelling topic title",
    "summary": "Concise summary of what occurred in cinema recently",
    "why_now": "The specific trigger from the last 24h-7d making this urgent",
    "opportunity_score": 88
  },
  "topic_opportunities": [
    {
      "title": "Topic title",
      "summary": "Summary of news or discovery",
      "score": 85,
      "why_promising": "Why this has high discussion potential",
      "saturation": "low | medium | high",
      "best_angle": "The standout angle"
    }
  ],
  "angle_analysis": {
    "news": "Breaking news angle",
    "curiosity": "Curiosity gap angle",
    "controversial": "Debatable/contrarian angle",
    "emotional": "Human/emotional angle",
    "industry": "Box office/trade/business angle",
    "hidden_detail": "Behind the scenes/production angle",
    "selected": "Name of the winning selected angle and reason"
  },
  "research_summary": "Synthesized 2-3 paragraph breakdown of the current landscape, trade reporting, and conversation backdrop.",
  "conversation_signals": [
    {
      "source": "Reddit r/movies / X Public Search / Variety / Deadline",
      "theme": "Core talking point",
      "summary": "What cinema fans and trades are actively discussing"
    }
  ],
  "verified_claims": [
    {
      "claim": "Specific factual claim used in post",
      "source": "Publication or official source name",
      "source_date": "Date or timeframe",
      "confidence": "Verified (Official) | High (Trade Report) | Moderate (Public Discussion)",
      "verified": true
    }
  ],
  "drafts": {
    "primary": "Complete ready-to-post X tweet text with natural linebreaks",
    "smart": "Complete smart/critic X tweet text",
    "spicy": "Complete spicy/contrarian X tweet text",
    "emotional": "Complete emotional/nostalgic X tweet text"
  },
  "recommended_hashtags": ["#FilmX"],
  "image_recommendation": {
    "recommended": "Description of ideal visual",
    "search_keywords": ["keyword 1", "keyword 2", "keyword 3"],
    "visual_type": "Movie Still | BTS Photo | Archival Interview | Box Office Chart | Director Shot",
    "reason": "Why this visual stops the scroll",
    "orientation": "Landscape 16:9 | Portrait 4:5 | Square 1:1",
    "ai_prompt": "Cinematic visual generation prompt if user wants to generate AI art"
  },
  "quality_check": {
    "hook_strength": 92,
    "originality": 88,
    "evidence": 95,
    "conversation_potential": 90,
    "follower_conversion": 86,
    "overall": 90
  },
  "sources": [
    {
      "title": "Article or announcement headline",
      "url": "https://...",
      "source_type": "Official Studio | Entertainment Publication | Interview | Indexed Discussion",
      "date": "2026-08-15"
    }
  ]
}`;

    const userMessage = `Perform grounded cinema intelligence research and draft production-grade X posts for:
Content Type: ${contentType}
Target Audience: ${audience}
Language: ${language}
Tone: ${tone} (Intensity: ${intensity}/10)
Length: ${length}
Media: ${media}
Hashtags: ${hashtags}
Depth: ${researchDepth}
${specificTopic ? `Focus strictly on this topic: ${specificTopic}` : 'Discover the single best current cinema story from the last 24h-7d.'}`;

    // Single Gemini API Request with Google Search Grounding
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const geminiPayload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userMessage}` }]
        }
      ],
      tools: [
        {
          googleSearch: {}
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      }
    };

    const geminiRes = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error('Gemini API Error:', errorText);
      return new Response(
        JSON.stringify({ error: `Gemini API returned status ${geminiRes.status}: ${errorText}` }),
        { status: geminiRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = await geminiRes.json();
    const rawCandidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract search grounding metadata if present in response
    const groundingMetadata = geminiData.candidates?.[0]?.groundingMetadata || null;

    // Parse and repair JSON locally if needed
    let parsedResult: any;
    try {
      // Clean possible markdown fences if returned
      const cleanJson = rawCandidateText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      parsedResult = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('Direct JSON parse failed, attempting regex extraction...', parseErr);
      const jsonMatch = rawCandidateText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Gemini did not return valid JSON structure.');
      }
    }

    // Grounding source enrichment from Google Search tool metadata
    if (groundingMetadata?.groundingChunks && Array.isArray(groundingMetadata.groundingChunks)) {
      const toolSources = groundingMetadata.groundingChunks
        .filter((chunk: any) => chunk.web?.uri)
        .map((chunk: any) => ({
          title: chunk.web.title || 'Google Search Grounded Source',
          url: chunk.web.uri,
          source_type: 'Search-indexed source',
          date: new Date().toISOString().split('T')[0]
        }));

      if (!parsedResult.sources || parsedResult.sources.length === 0) {
        parsedResult.sources = toolSources;
      } else {
        // Merge without duplicates
        const existingUrls = new Set(parsedResult.sources.map((s: any) => s.url));
        for (const ts of toolSources) {
          if (!existingUrls.has(ts.url)) {
            parsedResult.sources.push(ts);
            existingUrls.add(ts.url);
          }
        }
      }
    }

    // Save to Supabase DB if user is authenticated
    if (userId && supabaseClient) {
      try {
        const { data: runData, error: runError } = await supabaseClient
          .from('research_runs')
          .insert({
            user_id: userId,
            run_type: 'research_and_create',
            content_type: contentType,
            audience,
            language,
            tone,
            intensity,
            research_depth: researchDepth,
            recommended_topic_title: parsedResult.recommended_topic?.title || 'Cinema Topic',
            opportunity_score: parsedResult.recommended_topic?.opportunity_score || 80,
            why_now: parsedResult.recommended_topic?.why_now || '',
            research_summary: parsedResult.research_summary || '',
            selected_angle: parsedResult.angle_analysis?.selected || '',
            raw_response: parsedResult,
          })
          .select('id')
          .single();

        if (runData?.id) {
          // Insert drafts
          const runId = runData.id;
          const draftsToInsert = [
            {
              research_run_id: runId,
              user_id: userId,
              topic_title: parsedResult.recommended_topic?.title || 'Cinema Topic',
              variant_type: 'primary',
              content: parsedResult.drafts?.primary || '',
              character_count: (parsedResult.drafts?.primary || '').length,
              image_search_keywords: parsedResult.image_recommendation?.search_keywords || [],
              ai_image_prompt: parsedResult.image_recommendation?.ai_prompt || '',
              visual_type: parsedResult.image_recommendation?.visual_type || '',
              hashtags: parsedResult.recommended_hashtags || [],
            },
            {
              research_run_id: runId,
              user_id: userId,
              topic_title: parsedResult.recommended_topic?.title || 'Cinema Topic',
              variant_type: 'smart',
              content: parsedResult.drafts?.smart || '',
              character_count: (parsedResult.drafts?.smart || '').length,
              hashtags: parsedResult.recommended_hashtags || [],
            },
            {
              research_run_id: runId,
              user_id: userId,
              topic_title: parsedResult.recommended_topic?.title || 'Cinema Topic',
              variant_type: 'spicy',
              content: parsedResult.drafts?.spicy || '',
              character_count: (parsedResult.drafts?.spicy || '').length,
              hashtags: parsedResult.recommended_hashtags || [],
            },
            {
              research_run_id: runId,
              user_id: userId,
              topic_title: parsedResult.recommended_topic?.title || 'Cinema Topic',
              variant_type: 'emotional',
              content: parsedResult.drafts?.emotional || '',
              character_count: (parsedResult.drafts?.emotional || '').length,
              hashtags: parsedResult.recommended_hashtags || [],
            }
          ];

          await supabaseClient.from('drafts').insert(draftsToInsert);
        }
      } catch (dbErr) {
        console.warn('Database save non-critical warning:', dbErr);
      }
    }

    return new Response(JSON.stringify({ success: true, data: parsedResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    console.error('Edge Function Error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
