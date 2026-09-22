import { AIProvider, AICompletionOptions } from './provider';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey?: string, defaultModel?: string) {
    this.apiKey = apiKey || process.env.AI_PROVIDER_API_KEY || '';
    this.defaultModel = defaultModel || process.env.AI_MODEL || 'gpt-4o-mini';
  }

  async generateCompletion(prompt: string, options?: AICompletionOptions): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options?.model || this.defaultModel,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens || 1000,
          messages: [
            ...(options?.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
          response_format: options?.responseFormat ? { type: options.responseFormat } : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'OpenAI API error');
      }

      return data?.choices?.[0]?.message?.content || '';
    } catch (err: any) {
      console.error('[OpenAIProvider Error]', err.message);
      throw err;
    }
  }

  async generateStructuredOutput<T>(
    prompt: string,
    schemaDescription: string,
    options?: AICompletionOptions
  ): Promise<T> {
    const fullPrompt = `${prompt}\n\nRespond ONLY with a valid JSON object strictly matching this schema:\n${schemaDescription}`;
    const rawContent = await this.generateCompletion(fullPrompt, {
      ...options,
      responseFormat: 'json_object',
    });

    try {
      return JSON.parse(rawContent) as T;
    } catch {
      // Clean JSON formatting markdown wrappers if present
      const cleaned = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned) as T;
    }
  }
}
