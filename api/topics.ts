import { GeminiProvider } from './providers/GeminiProvider';
import { GroqProvider } from './providers/GroqProvider';
import { OpenRouterProvider } from './providers/OpenRouterProvider';
import { ProviderRequest } from './providers/types';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
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
    const body: any = await req.json().catch(() => ({}));
    const audience = body?.audience || 'Hollywood / Global Cinema';
    const language = body?.language || 'English';

    const now = new Date();
    const currentDateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const currentYear = now.getFullYear();

    const systemPrompt = `You are Soulflick AI, a cinema research intelligence analyst.
You have access to Google Search grounding.

TEMPORAL CONTEXT:
- Today's Date: ${currentDateStr} (Year ${currentYear}).
- Search current cinema news, trade announcements, casting news, box office, and director updates from the last 24-48 hours.

Return strictly a valid JSON object matching:
\`\`\`json
{
  "opportunities": [
    {
      "id": "topic-1",
      "title": "Topic title",
      "summary": "Summary of what happened",
      "why_now": "The specific 24h trigger or current development",
      "opportunity_score": 92,
      "best_angle": "Standout contrarian or curiosity angle",
      "freshness": "Last 24 hours",
      "saturation": "low",
      "discussion_potential": "very high",
      "suggested_content_type": "Smart Film Analysis",
      "sources": [{"title": "Publication", "url": "https://..."}]
    }
  ]
}
\`\`\``;

    const userPrompt = `Search live cinema news and radar for audience "${audience}" in language "${language}". Rank the top 6 current cinema opportunities.`;

    const providerReq: ProviderRequest = {
      systemPrompt,
      userPrompt,
      selectedLength: 'Medium',
      params: { audience, language },
      currentDateStr,
      currentYear,
    };

    const providers = [
      new GeminiProvider(),
      new GroqProvider(),
      new OpenRouterProvider()
    ];

    for (const provider of providers) {
      if (!provider.isAvailable()) continue;
      try {
        const response = await provider.execute(providerReq);
        const parsed = parseTopicsJson(response.rawText);
        if (Array.isArray(parsed.opportunities) && parsed.opportunities.length > 0) {
          return new Response(JSON.stringify({ success: true, data: parsed.opportunities }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      } catch (err) {
        console.warn(`Topics provider ${provider.name} error:`, err);
      }
    }

    // Fallback topic if all providers fail
    const fallback = [
      {
        id: 'topic-1',
        title: "Denis Villeneuve's Optical Approach for 'Dune: Messiah'",
        summary: "Employing custom vintage optics to depict prescient visions.",
        opportunity_score: 94,
        why_now: "Recent director masterclass disclosures",
        best_angle: "How lens choice conveys psychological dread.",
        freshness: "Last 24 hours",
        saturation: "low",
        discussion_potential: "very high",
        suggested_content_type: "Behind The Scenes"
      }
    ];

    return new Response(JSON.stringify({ success: true, data: fallback }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

function parseTopicsJson(raw: string): any {
  let clean = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(clean);
  } catch {
    return { opportunities: [] };
  }
}
