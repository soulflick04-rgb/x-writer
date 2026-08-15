import { AIProvider, ProviderRequest, ProviderResponse } from './types';
import { getEnvVar } from './envHelper';

export class GroqProvider implements AIProvider {
  readonly name = 'groq' as const;

  private getKey(): string {
    return getEnvVar('GROQ_API_KEY') || getEnvVar('VITE_GROQ_API_KEY');
  }

  isAvailable(): boolean {
    return Boolean(this.getKey());
  }

  async execute(req: ProviderRequest): Promise<ProviderResponse> {
    const key = this.getKey();
    if (!key) {
      throw new Error('Groq API key is not configured in environment.');
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const systemInstruction = `${req.systemPrompt}\n\nIMPORTANT PROVIDER CONSTRAINT: You are operating as the Groq fallback provider without native live web search. Do not fabricate unverifiable real-time events, but use your comprehensive film craft and historical/recent knowledge to fulfill the structured JSON cinema analysis. Output strictly valid JSON.`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: systemInstruction
            },
            {
              role: 'user',
              content: `TASK:\n${req.userPrompt}\n\nExecute cinema analysis now in strictly valid JSON format.`
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData: any = await res.json().catch(() => ({}));
        throw new Error(`Groq Error (${res.status}): ${errData.error?.message || 'Failure'}`);
      }

      const data: any = await res.json();
      const rawText = data.choices?.[0]?.message?.content;

      if (!rawText) {
        throw new Error('Groq returned an empty response.');
      }

      return {
        rawText,
        provider: 'groq',
        modelUsed: 'llama-3.3-70b-versatile',
        liveWebGrounding: false,
        searchQueries: [],
        sources: [
          {
            title: 'Fallback Provider (Groq Llama 3.3 70B)',
            source_type: 'Model Synthesis (Offline/Fallback)',
            confidence_level: 'High (Pre-trained Synthesis)'
          }
        ],
        executionTimeMs: Date.now() - startTime
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}
