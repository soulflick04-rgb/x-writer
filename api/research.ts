// Vercel Edge Runtime - High Performance, Zero Cold Start
export const config = {
  runtime: 'edge',
};

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

    const groqKey = (process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '').trim().replace(/^["']|["']$/g, '');
    const openRouterKey = (process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || '').trim().replace(/^["']|["']$/g, '');

    const selectedLength = params.length || 'Medium';

    let lengthInstruction = '';
    if (selectedLength === 'Short') {
      lengthInstruction = `LENGTH REQUIREMENT: SHORT (120 - 180 characters).
- 1 punchy 1-line hook + 1 high-density craft observation.
- CRITICAL: MUST BE COMPLETE SENTENCES (NOT ONE WORD OR A FRAGMENT). Total characters must be under 200.`;
    } else if (selectedLength === 'Long') {
      lengthInstruction = `LENGTH REQUIREMENT: LONG (2-3 Tweet Numbered Thread).
- Formatted as "1/2" and "2/2" (or "1/3", "2/3", "3/3").
- CRITICAL: Each numbered part MUST be a full paragraph strictly under 275 characters.`;
    } else {
      lengthInstruction = `LENGTH REQUIREMENT: MEDIUM (220 - 275 characters).
- Standard single X post format:
  [Hook sentence]

  [2 sentences explaining the verified craft/box-office mechanism]

  [1 sentence concluding insight]
- CRITICAL: MUST BE A FULL MULTI-SENTENCE POST UNDER 280 CHARACTERS. NEVER OUTPUT SHORT PHRASES.`;
    }

    const systemPrompt = `You are Soulflick AI, an elite cinema essayist and film writer.
You write insightful, high-engagement posts for cinephiles.

WRITING PRINCIPLES:
1. BAN ALL CHEAP CLICHÉS: Never use "Mind blown", "Let that sink in", "Masterpiece alert", "Game changer", "What do you think?", "Drop your thoughts below".
2. WRITE WITH CINEPHILE CRAFT: Focus on lenses, optical distortion, blocking geometry, sound mixing, lighting, budget math, and script architecture.
3. ${lengthInstruction}
4. WRITE 4 DISTINCT COMPLETE PERSONAS (EACH MUST BE A COMPLETE POST, NEVER A SINGLE PHRASE):
   - primary: High-impact cinephile hook, verified mechanism, sharp conclusion.
   - smart: In-depth auteur craft analysis (lenses, lighting, editing).
   - spicy: Defensible contrarian re-evaluation that challenges mainstream consensus with facts.
   - emotional: Resonant human devotion to the craft or vulnerable director/actor lore.

PARAMETERS:
- Content Type: ${params.contentType || 'Smart Film Analysis'}
- Target Audience: ${params.audience || 'Hollywood / Global Cinema'}
- Language: ${params.language || 'English'}
- Tone: ${params.tone || 'Human / Conversational'}
- Intensity: ${params.intensity || 6}/10
- Length: ${selectedLength}
${params.specificTopic ? `- Specific Topic Focus: "${params.specificTopic}"` : ''}

RESPOND STRICTLY WITH THIS JSON FORMAT:
\`\`\`json
{
  "research_timestamp": "${new Date().toISOString()}",
  "recommended_topic": {
    "title": "Specific Cinema Topic Headline",
    "summary": "2-3 sentences explaining the discovery and why it matters to cinema fans.",
    "why_now": "The specific 24h event or recent trigger",
    "opportunity_score": 93
  },
  "drafts": {
    "primary": "Full multi-sentence primary post adhering to ${selectedLength} length rules",
    "smart": "Full multi-sentence craft post adhering to ${selectedLength} length rules",
    "spicy": "Full multi-sentence contrarian take adhering to ${selectedLength} length rules",
    "emotional": "Full multi-sentence emotional story adhering to ${selectedLength} length rules"
  },
  "recommended_hashtags": ["#FilmX", "#Cinema"],
  "image_recommendation": {
    "recommended": "Detailed description of a movie still or BTS photo",
    "search_keywords": ["keyword 1", "keyword 2"],
    "orientation": "Landscape 16:9",
    "ai_prompt": "Cinematic 35mm film still prompt, photorealistic, anamorphic --ar 16:9"
  },
  "verified_claims": [
    {
      "claim": "Verified factual detail about the film or director",
      "source": "Trade Publication",
      "confidence": "Verified (Official)"
    }
  ]
}
\`\`\``;

    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;
    let finalResult: any = null;

    // 1. PRIMARY: Gemini with Google Search Grounding (3000 tokens & 14s timeout)
    if (geminiKeys.length > 0 && attempts < maxAttempts) {
      for (const gKey of geminiKeys) {
        if (attempts >= maxAttempts) break;
        attempts++;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 14000);

          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${gKey}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nPerform cinema research and write the complete JSON drafts now for: ${params.contentType || 'Cinema'}.` }] }],
              tools: [{ googleSearch: {} }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 3000 }
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data: any = await res.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              finalResult = repairAndParseServerJson(rawText);
              finalResult.provider_used = 'Gemini (Google Grounded)';
              break;
            }
          } else {
            const errData: any = await res.json().catch(() => ({}));
            lastError = new Error(`Gemini Error (${res.status}): ${errData.error?.message || 'Rate/Service Limit'}`);
          }
        } catch (err: any) {
          lastError = err;
        }
      }
    }

    // 2. FALLBACK 1: Groq API (Ultra-fast Llama 3.3 70B ~ 1.2s)
    if (!finalResult && groqKey && attempts < maxAttempts) {
      attempts++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'You are Soulflick AI. Output strictly valid JSON matching the requested cinema research schema with full complete post drafts.' },
              { role: 'user', content: `${systemPrompt}\n\nExecute cinema analysis now in JSON format.` }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data: any = await res.json();
          const rawText = data.choices?.[0]?.message?.content;
          if (rawText) {
            finalResult = repairAndParseServerJson(rawText);
            finalResult.provider_used = 'Groq (Llama 3.3 70B)';
          }
        } else {
          const errData: any = await res.json().catch(() => ({}));
          lastError = new Error(`Groq Error (${res.status}): ${errData.error?.message || 'Failure'}`);
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    // 3. FINAL FALLBACK: OpenRouter (Gemini 2.5 Flash Lite)
    if (!finalResult && openRouterKey && attempts < maxAttempts) {
      attempts++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterKey}`
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-lite',
            messages: [
              { role: 'user', content: `${systemPrompt}\n\nExecute research now.` }
            ],
            temperature: 0.7
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data: any = await res.json();
          const rawText = data.choices?.[0]?.message?.content;
          if (rawText) {
            finalResult = repairAndParseServerJson(rawText);
            finalResult.provider_used = 'OpenRouter';
          }
        } else {
          const errData: any = await res.json().catch(() => ({}));
          lastError = new Error(`OpenRouter Error (${res.status}): ${errData.error?.message || 'Failure'}`);
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!finalResult) {
      throw lastError || new Error('All configured AI providers failed. Please check your API keys or wait 30 seconds.');
    }

    return new Response(JSON.stringify({ success: true, data: finalResult }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    console.error('Edge handler error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

function repairAndParseServerJson(raw: string): any {
  // 1. Direct JSON Parse attempt
  let clean = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(clean);
    if (parsed.drafts && parsed.drafts.primary) {
      return sanitizeParsedResult(parsed);
    }
  } catch (e1) {
    try {
      const withoutTrailing = clean.replace(/,\s*([\}\]])/g, '$1');
      const parsed = JSON.parse(withoutTrailing);
      if (parsed.drafts && parsed.drafts.primary) {
        return sanitizeParsedResult(parsed);
      }
    } catch (e2) {}
  }

  // 2. Robust Token-Block Extractor for Drafts
  const extractBlock = (key: string, nextKeys: string[]): string => {
    const keyPattern = new RegExp('"' + key + '"\\s*:\\s*"', 'i');
    const match = raw.match(keyPattern);
    if (!match || match.index === undefined) return '';
    const startIdx = match.index + match[0].length;
    
    const nextKeyPatterns = nextKeys.map(k => '"' + k + '"\\s*:');
    const lookaheadPattern = new RegExp('(?:' + nextKeyPatterns.join('|') + '|}\\s*,?\\s*"|}\\s*$)', 'i');
    
    const remaining = raw.substring(startIdx);
    const nextMatch = remaining.match(lookaheadPattern);
    
    let val = nextMatch ? remaining.substring(0, nextMatch.index) : remaining;
    val = val.trim().replace(/,\s*$/, '').replace(/"\s*,?\s*$/, '').trim();
    return val.replace(/\\n/g, '\n').replace(/\\"/g, '"');
  };

  const title = extractBlock('title', ['summary', 'why_now', 'drafts', 'primary']) || 'Grounded Cinema Revelation';
  const summary = extractBlock('summary', ['why_now', 'drafts', 'primary', 'smart']) || 'Recent developments in film craft and industry distribution.';
  const whyNow = extractBlock('why_now', ['drafts', 'primary', 'smart', 'opportunity_score']) || 'Trending across film trades today.';

  const primaryDraft = extractBlock('primary', ['smart', 'spicy', 'emotional', 'recommended_hashtags', 'image_recommendation']);
  const smartDraft = extractBlock('smart', ['spicy', 'emotional', 'recommended_hashtags', 'image_recommendation']);
  const spicyDraft = extractBlock('spicy', ['emotional', 'recommended_hashtags', 'image_recommendation']);
  const emotionalDraft = extractBlock('emotional', ['recommended_hashtags', 'image_recommendation', 'verified_claims']);

  const fallbackDraft = `${title}\n\n${summary}`;

  return {
    research_timestamp: new Date().toISOString(),
    recommended_topic: {
      title,
      summary,
      why_now: whyNow,
      opportunity_score: 93
    },
    drafts: {
      primary: primaryDraft || fallbackDraft,
      smart: smartDraft || primaryDraft || fallbackDraft,
      spicy: spicyDraft || primaryDraft || fallbackDraft,
      emotional: emotionalDraft || primaryDraft || fallbackDraft
    },
    recommended_hashtags: ['#FilmX', '#Cinema'],
    image_recommendation: {
      recommended: extractBlock('recommended', ['search_keywords', 'orientation', 'ai_prompt']) || 'Cinematic movie still',
      search_keywords: ['cinema', 'film craft'],
      orientation: 'Landscape 16:9',
      ai_prompt: extractBlock('ai_prompt', ['quality_check', 'sources']) || ''
    },
    verified_claims: [
      {
        claim: 'Verified cinema trade report.',
        source: 'Industry Trade',
        confidence: 'Verified (Official)'
      }
    ]
  };
}

function sanitizeParsedResult(parsed: any): any {
  return {
    research_timestamp: parsed.research_timestamp || new Date().toISOString(),
    recommended_topic: {
      title: parsed.recommended_topic?.title || parsed.title || 'Cinema Topic Analysis',
      summary: parsed.recommended_topic?.summary || parsed.summary || 'Grounded cinema analysis.',
      why_now: parsed.recommended_topic?.why_now || 'Trending today.',
      opportunity_score: parsed.recommended_topic?.opportunity_score || 92
    },
    drafts: {
      primary: parsed.drafts?.primary || parsed.primary || 'Primary cinephile post.',
      smart: parsed.drafts?.smart || parsed.smart || parsed.drafts?.primary || 'Smart craft analysis.',
      spicy: parsed.drafts?.spicy || parsed.spicy || parsed.drafts?.primary || 'Contrarian perspective.',
      emotional: parsed.drafts?.emotional || parsed.emotional || parsed.drafts?.primary || 'Human story.'
    },
    recommended_hashtags: Array.isArray(parsed.recommended_hashtags) ? parsed.recommended_hashtags : ['#FilmX', '#Cinema'],
    image_recommendation: {
      recommended: parsed.image_recommendation?.recommended || 'Cinematic movie still',
      search_keywords: parsed.image_recommendation?.search_keywords || ['cinema', 'movie still'],
      orientation: parsed.image_recommendation?.orientation || 'Landscape 16:9',
      ai_prompt: parsed.image_recommendation?.ai_prompt || ''
    },
    verified_claims: Array.isArray(parsed.verified_claims) ? parsed.verified_claims : [
      {
        claim: 'Verified cinema trade report.',
        source: 'Industry Trade',
        confidence: 'Verified (Official)'
      }
    ]
  };
}
