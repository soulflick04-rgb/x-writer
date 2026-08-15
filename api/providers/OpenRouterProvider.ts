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

    // Fast candidate models for OpenRouter with live web search grounding
    const modelsToTry = [
      'google/gemini-2.5-flash:online',
      'meta-llama/llama-3.3-70b-instruct:online',
      'google/gemini-2.5-flash',
      'meta-llama/llama-3.3-70b-instruct',
      'openrouter/auto'
    ];

    let lastError: any = null;

    for (const model of modelsToTry) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
            'HTTP-Referer': 'https://soulflick.ai',
            'X-Title': 'Soulflick AI'
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: `${req.systemPrompt}\n\nIMPORTANT: You are operating as the OpenRouter fallback provider with live web search. Output strictly valid JSON matching the requested cinema research schema with full complete post drafts.`
              },
              {
                role: 'user',
                content: `TASK:\n${req.userPrompt}\n\nExecute cinema analysis now in JSON format.`
              }
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
            clearTimeout(timeoutId);
            const isOnline = model.includes(':online') || model.includes('sonar');
            const sources = isOnline
              ? [
                  {
                    title: `Live Web Grounded via OpenRouter (${model})`,
                    source_type: 'Live Web Grounding',
                    confidence_level: 'Live Web Source'
                  }
                ]
              : [
                  {
                    title: `Fallback Provider (OpenRouter ${model})`,
                    source_type: 'Model Synthesis (Offline/Fallback)',
                    confidence_level: 'Pre-trained Synthesis'
                  }
                ];

            return {
              rawText,
              provider: 'openrouter',
              modelUsed: model,
              liveWebGrounding: isOnline,
              searchQueries: isOnline ? [req.userPrompt.substring(0, 80)] : [],
              sources,
              executionTimeMs: Date.now() - startTime
            };
          }
        } else {
          const errData: any = await res.json().catch(() => ({}));
          lastError = new Error(`OpenRouter (${model}) error ${res.status}: ${errData.error?.message || 'Failed'}`);
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error('OpenRouter fallback failed across candidate models.');
  }
}
