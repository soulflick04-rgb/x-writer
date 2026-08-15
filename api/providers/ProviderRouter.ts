import { AIProvider, ProviderRequest, NormalizedResearchResult } from './types';
import { GeminiProvider } from './GeminiProvider';
import { GroqProvider } from './GroqProvider';
import { OpenRouterProvider } from './OpenRouterProvider';
import { normalizeProviderOutput } from './normalizer';

export class ProviderRouter {
  private providers: AIProvider[];

  constructor() {
    this.providers = [
      new GeminiProvider(),
      new OpenRouterProvider(),
      new GroqProvider()
    ];
  }

  async executeResearch(req: ProviderRequest): Promise<NormalizedResearchResult> {
    const providerChain: string[] = [];
    let lastError: Error | null = null;
    let attempts = 0;
    const maxAttempts = 3;

    for (const provider of this.providers) {
      if (attempts >= maxAttempts) {
        break;
      }

      if (!provider.isAvailable()) {
        continue;
      }

      attempts++;
      providerChain.push(provider.name);

      try {
        const response = await provider.execute(req);
        // Normalize the provider's response to the unified schema
        return normalizeProviderOutput(
          response,
          providerChain,
          req.selectedLength,
          req.currentDateStr
        );
      } catch (err: any) {
        console.warn(`Provider ${provider.name} failed:`, err?.message || err);
        lastError = err instanceof Error ? err : new Error(String(err));
        // Continue to the next fallback provider
      }
    }

    throw lastError || new Error('All configured AI providers failed. Please check API keys in settings or try again in a few moments.');
  }
}
