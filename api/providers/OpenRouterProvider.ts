import { AIProvider, ProviderRequest, ProviderResponse } from './types';
import { getEnvVar } from './envHelper';

export class OpenRouterProvider implements AIProvider {
  readonly name = 'openrouter' as const;

  private getKey(): string {
    return getEnvVar('OPENROUTER_API_KEY') || getEnvVar('VITE_OPENROUTER_API_KEY');
  }

  isAvailable(): boolean {
    return Boolean(this.getKey());
  }

  async execute(req: ProviderRequest): Promise<ProviderResponse> {
    const key = this.getKey();
    if (!key) {
      throw new Error('OpenRouter API key is not configured in environment.');
    }

    const startTime = Date.now();

    // Fast candidates for OpenRouter
    const candidates = [
      {
        model: 'google/gemini-2.5-flash',
        plugins: [{ id: 'web', max_results: 3 }],
        isOnline: true
      },
      {
        model: 'openrouter/auto',
        plugins: undefined,
        isOnline: false
      }
    ];

    let lastError: any = null;

    for (const candidate of candidates) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      try {
        const bodyPayload: any = {
          model: candidate.model,
          messages: [
            {
              role: 'system',
              content: `${req.systemPrompt}\n\nIMPORTANT: You are operating as the OpenRouter fallback provider. Output strictly valid JSON matching the requested cinema research schema with full complete post drafts.`
            },
            {
              role: 'user',
              content: `TASK:\n${req.userPrompt}\n\nExecute cinema analysis now in JSON format.`
            }
          ],
          temperature: 0.7,
          max_tokens: 3000
        };

        if (candidate.plugins) {
          bodyPayload.plugins = candidate.plugins;
        }

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
            'HTTP-Referer': 'https://soulflick.ai',
            'X-Title': 'Soulflick AI'
          },
          body: JSON.stringify(bodyPayload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (res.status === 402 || res.status === 401) {
          // Out of credits or invalid key - do not waste time retrying other candidates
          throw new Error(`OpenRouter account error (${res.status}): Credits exhausted or unauthorized.`);
        }

        if (res.ok) {
          const data: any = await res.json();
          const rawText = data.choices?.[0]?.message?.content;

          if (rawText) {
            const isOnline = candidate.isOnline;
            const sources = isOnline
              ? [
                  {
                    title: `Live Web Grounded via OpenRouter (${candidate.model})`,
                    source_type: 'Live Web Grounding',
                    confidence_level: 'Live Web Source'
                  }
                ]
              : [
                  {
                    title: `Fallback Provider (OpenRouter ${candidate.model})`,
                    source_type: 'Model Synthesis (Offline/Fallback)',
                    confidence_level: 'Pre-trained Synthesis'
                  }
                ];

            return {
              rawText,
              provider: 'openrouter',
              modelUsed: candidate.model + (candidate.isOnline ? ' (Live Web)' : ''),
              liveWebGrounding: isOnline,
              searchQueries: isOnline ? [req.userPrompt.substring(0, 80)] : [],
              sources,
              executionTimeMs: Date.now() - startTime
            };
          }
        } else {
          const errData: any = await res.json().catch(() => ({}));
          lastError = new Error(`OpenRouter (${candidate.model}) error ${res.status}: ${errData.error?.message || 'Failed'}`);
        }
      } catch (err: any) {
        lastError = err;
        if (err?.message?.includes('402') || err?.message?.includes('Credits exhausted')) {
          break; // Stop immediately
        }
      }
    }

    throw lastError || new Error('OpenRouter fallback failed.');
  }
}
