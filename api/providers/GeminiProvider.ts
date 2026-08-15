import { AIProvider, ProviderRequest, ProviderResponse, GroundedSourceItem } from './types';
import { getEnvVar } from './envHelper';

export interface GeminiQuotaTelemetry {
  isAvailable: boolean;
  cooldownSecondsRemaining: number;
  cooldownUntilTimestamp: number;
  usagePercentage: number;
  activeModel: string;
  statusMessage: string;
}

// In-memory global state for Gemini rate-limit & cooldown tracking
let geminiCooldownUntil = 0;

export function getGeminiQuotaTelemetry(): GeminiQuotaTelemetry {
  const now = Date.now();
  if (geminiCooldownUntil > now) {
    const remaining = Math.max(0, Math.ceil((geminiCooldownUntil - now) / 1000));
    return {
      isAvailable: false,
      cooldownSecondsRemaining: remaining,
      cooldownUntilTimestamp: geminiCooldownUntil,
      usagePercentage: Math.min(100, Math.max(20, Math.round((remaining / 60) * 100))),
      activeModel: 'gemini-2.5-flash',
      statusMessage: `Refilling in ${remaining}s (Using Live Online Fallback)`
    };
  }

  return {
    isAvailable: true,
    cooldownSecondsRemaining: 0,
    cooldownUntilTimestamp: 0,
    usagePercentage: 0,
    activeModel: 'gemini-2.5-flash',
    statusMessage: 'Ready (Primary Grounded Engine)'
  };
}

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
    const keys = this.getKeys();
    if (keys.length === 0) return false;
    
    // If cooldown is in effect, check if it has expired
    const now = Date.now();
    if (geminiCooldownUntil > now) {
      return false; // Currently in cooldown, let Router use fallback immediately
    }

    return true;
  }

  async execute(req: ProviderRequest): Promise<ProviderResponse> {
    const keys = this.getKeys();
    if (keys.length === 0) {
      throw new Error('Gemini API key is not configured in environment.');
    }

    let lastError: any = null;
    const startTime = Date.now();

    // Primary high-speed Google Search Grounded model
    const modelsToTry = ['gemini-2.5-flash'];

    for (const key of keys) {
      let keyQuotaExceeded = false;
      for (const model of modelsToTry) {
        if (keyQuotaExceeded) break;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

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

            // Quota successful -> reset cooldown state
            geminiCooldownUntil = 0;

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

            // Detect 429 quota exhaustion and calculate exact cooldown duration
            if (res.status === 429 || errMsg.includes('quota') || errMsg.includes('Quota')) {
              keyQuotaExceeded = true;
              
              // Extract "Please retry in Xs" if provided by Google API
              const retryMatch = errMsg.match(/retry in ([\d\.]+)s/i);
              const retrySecs = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) + 2 : 45;
              geminiCooldownUntil = Date.now() + (retrySecs * 1000);
              break; // Skip other models for this exhausted key immediately
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
