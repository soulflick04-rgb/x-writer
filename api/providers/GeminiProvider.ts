import { AIProvider, ProviderRequest, ProviderResponse, GroundedSourceItem } from './types';
import { getEnvVar } from './envHelper';

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini' as const;

  private getKeys(): string[] {
    const raw = [
      getEnvVar('GEMINI_API_KEY'),
      getEnvVar('VITE_GEMINI_API_KEY'),
      getEnvVar('GEMINI_API_KEY_2'),
      getEnvVar('VITE_GEMINI_API_KEY_2'),
    ].filter(Boolean).join(',');

    return raw
      .split(',')
      .map((k) => k.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }

  isAvailable(): boolean {
    return this.getKeys().length > 0;
  }

  async execute(req: ProviderRequest): Promise<ProviderResponse> {
    const keys = this.getKeys();
    if (keys.length === 0) {
      throw new Error('Gemini API key is not configured in environment.');
    }

    let lastError: any = null;
    const startTime = Date.now();

    // Models to try with Google Search grounding
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-3.7-flash',
      'gemini-flash-latest'
    ];

    for (const key of keys) {
      let keyQuotaExceeded = false;
      for (const model of modelsToTry) {
        if (keyQuotaExceeded) break;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
          
          const fullPrompt = `${req.systemPrompt}\n\nUSER RESEARCH TASK:\n${req.userPrompt}`;

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: fullPrompt }]
                }
              ],
              tools: [
                {
                  googleSearch: {}
                }
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4096
              }
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (res.ok) {
            const data: any = await res.json();
            const candidate = data.candidates?.[0];
            const rawText = candidate?.content?.parts?.[0]?.text;

            if (!rawText) {
              throw new Error('Gemini returned an empty response.');
            }

            // Extract Google Search Grounding Metadata
            const groundingMetadata = candidate?.groundingMetadata || {};
            const searchQueries: string[] = Array.isArray(groundingMetadata.webSearchQueries) 
              ? groundingMetadata.webSearchQueries 
              : [];

            const sources: GroundedSourceItem[] = [];
            if (Array.isArray(groundingMetadata.groundingChunks)) {
              for (const chunk of groundingMetadata.groundingChunks) {
                if (chunk?.web?.uri) {
                  sources.push({
                    title: chunk.web.title || 'Web Source',
                    url: chunk.web.uri,
                    source_type: 'Live Google Search Grounding',
                    confidence_level: 'Official Grounded Source'
                  });
                }
              }
            }

            const liveWebGrounding = searchQueries.length > 0 || sources.length > 0 || !!candidate?.groundingMetadata;

            return {
              rawText,
              provider: 'gemini',
              modelUsed: model,
              liveWebGrounding,
              searchQueries,
              sources,
              groundingMetadata,
              executionTimeMs: Date.now() - startTime
            };
          } else {
            const errData: any = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || 'Failure';
            lastError = new Error(`Gemini (${model}) failed: ${errMsg}`);
            if (res.status === 429 || errMsg.includes('quota') || errMsg.includes('Quota')) {
              keyQuotaExceeded = true;
              break; // Skip rest of models for this exhausted key immediately
            }
          }
        } catch (err: any) {
          lastError = err;
        }
      }
    }

    throw lastError || new Error('All Gemini API attempts failed.');
  }
}
