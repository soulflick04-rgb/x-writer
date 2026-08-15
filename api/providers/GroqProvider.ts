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
      const systemInstruction = `${req.systemPrompt}\n\nCRITICAL OUTPUT REQUIREMENT: You MUST return strictly valid JSON matching the schema with a "drafts" object containing 4 full, rich post drafts:\n- "primary": Full complete viral cinephile post text\n- "smart": Full complete technical craft & directing mechanics post text\n- "spicy": Full complete defensible contrarian take\n- "emotional": Full complete creative devotion & human lore story\n\nEach draft must be a rich, fully written post (never summary bullets or placeholders).`;

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
              content: `TASK:\n${req.userPrompt}\n\nGenerate all 4 complete draft personas in the JSON schema now.`
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
