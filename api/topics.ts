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

    const allGeminiRaw = [
      process.env.GEMINI_API_KEY,
      process.env.VITE_GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.VITE_GEMINI_API_KEY_2,
    ].filter(Boolean).join(',');

    const geminiKeys = allGeminiRaw
      .split(',')
      .map((k) => k.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);

    const systemPrompt = `You are Soulflick AI. Search current cinema news from the last 24h for audience "${audience}" in language "${language}".
Return strictly a valid JSON object matching:
{
  "opportunities": [
    {
      "id": "topic-1",
      "title": "Topic title",
      "summary": "Summary of what happened",
      "why_now": "The specific 24h trigger",
      "opportunity_score": 92,
      "best_angle": "Standout contrarian or curiosity angle",
      "freshness": "Last 24 hours",
      "saturation": "low | medium | high",
      "discussion_potential": "very high",
      "suggested_content_type": "Smart Film Analysis",
      "sources": [{"title": "Publication", "url": "https://..."}]
    }
  ]
}`;

    if (geminiKeys.length > 0) {
      for (const key of geminiKeys) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
              tools: [{ googleSearch: {} }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
            })
          });

          if (res.ok) {
            const data: any = await res.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const parsed = repairAndParseServerJson(rawText);
            if (Array.isArray(parsed.opportunities)) {
              return new Response(JSON.stringify({ success: true, data: parsed.opportunities }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
              });
            }
          }
        } catch (err) {
          console.warn('Gemini topics error:', err);
        }
      }
    }

    // Default fallback catalog
    const fallback = [
      {
        id: 'topic-1',
        title: "Denis Villeneuve's Optical Approach for 'Dune: Messiah'",
        summary: "Employing custom vintage optics to depict prescient visions.",
        opportunity_score: 94,
        why_now: "Recent director masterclass quotes",
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

function repairAndParseServerJson(raw: string): any {
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
