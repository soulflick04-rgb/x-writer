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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    // Candidates for OpenRouter (resilient model list)
    const modelsToTry = [
      'meta-llama/llama-3.3-70b-instruct',
      'deepseek/deepseek-chat',
      'openrouter/auto',
      'google/gemini-2.5-flash'
    ];

    let lastError: any = null;

    for (const model of modelsToTry) {
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
                content: `${req.systemPrompt}\n\nIMPORTANT: You are operating as the OpenRouter fallback provider. Output strictly valid JSON matching the requested cinema research schema with full complete post drafts.`
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

        if (res.ok) {
          const data: any = await res.json();
          const rawText = data.choices?.[0]?.message?.content;

          if (rawText) {
            clearTimeout(timeoutId);
            return {
              rawText,
              provider: 'openrouter',
              liveWebGrounding: false,
              searchQueries: [],
              sources: [
                {
                  title: `Fallback Provider (OpenRouter ${model})`,
                  source_type: 'Model Synthesis (Offline/Fallback)',
                  confidence_level: 'High (Pre-trained Synthesis)'
                }
              ],
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

    clearTimeout(timeoutId);
    throw lastError || new Error('OpenRouter fallback failed across candidate models.');
  }
}
