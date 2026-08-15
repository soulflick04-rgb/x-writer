import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  audience: string;
  language?: string;
  recentTopicsHistory?: string[];
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
      audience = 'Hollywood / Global Cinema',
      language = 'English',
      recentTopicsHistory = [],
    } = body;

    const recentHistoryText = recentTopicsHistory && recentTopicsHistory.length > 0
      ? `Enforce topic diversification. Avoid recently covered topics: ${recentTopicsHistory.join(', ')}`
      : 'Diversify across auteurs, indie gems, A24, box office, international cinema, and actor deep-dives.';

    const systemPrompt = `You are Soulflick AI, an elite cinema trend intelligence analyst.
Your task is to scan current web developments from the last 24 hours (up to 7 days if essential) using Google Search Grounding and identify the top 5-8 ranked cinema content opportunities.

CRITICAL RULES:
1. Every topic MUST have a real reason to be discussed NOW (fresh news, trade report, trailer, interview revelation, box office milestone, controversy, viral indexed discussion).
2. Calculate an internal Opportunity Score (0-100) using: Recency (15%), Conversation (15%), Curiosity (15%), Emotion (10%), Debate (10%), Audience fit (10%), Originality (10%), Evidence (10%), Saturation penalty (5%).
3. DO NOT generate full posts in this action. Provide the ranked opportunities with best angles and grounded sources.
4. Strictly return JSON format matching the schema below.
${recentHistoryText}

OUTPUT SCHEMA:
{
  "timestamp": "${new Date().toISOString()}",
  "audience": "${audience}",
  "opportunities": [
    {
      "id": "topic-1",
      "title": "Clear compelling cinema topic headline",
      "summary": "What happened and why it matters in 2-3 sentences",
      "why_now": "The specific 24h-7d trigger",
      "opportunity_score": 92,
      "best_angle": "The standout contrarian or curiosity angle",
      "freshness": "Last 24 hours | Last 3 days | Last 7 days",
      "saturation": "low | medium | high",
      "discussion_potential": "high | very high | explosive",
      "suggested_content_type": "Smart Film Analysis | Breaking News | Behind The Scenes | Debate | Controversial",
      "sources": [
        {
          "title": "Article or trade title",
          "url": "https://...",
          "source_type": "Trade Publication | Official Studio | Interview | Indexed Discussion"
        }
      ]
    }
  ]
}`;

    const userMessage = `Scan the current cinema web for audience "${audience}" in language "${language}". Find today's top 5-8 cinema content opportunities.`;

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
        maxOutputTokens: 4096,
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
    
    let parsedResult: any;
    try {
      const cleanJson = rawCandidateText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      parsedResult = JSON.parse(cleanJson);
    } catch {
      const jsonMatch = rawCandidateText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Gemini did not return valid JSON structure.');
      }
    }

    // Save discovered topics in database if authenticated
    if (userId && supabaseClient && Array.isArray(parsedResult.opportunities)) {
      try {
        const topicsToInsert = parsedResult.opportunities.map((opp: any) => ({
          user_id: userId,
          title: opp.title,
          summary: opp.summary,
          opportunity_score: opp.opportunity_score || 80,
          why_promising: opp.best_angle || '',
          why_now: opp.why_now || '',
          saturation: opp.saturation || 'medium',
          best_angle: opp.best_angle || '',
          status: 'discovered'
        }));
        await supabaseClient.from('topics').insert(topicsToInsert);
      } catch (dbErr) {
        console.warn('DB Topics non-critical log:', dbErr);
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
