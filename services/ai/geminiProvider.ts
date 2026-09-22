import { AIProvider, AICompletionOptions } from './provider';

export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey?: string, defaultModel?: string) {
    this.apiKey = apiKey || process.env.AI_PROVIDER_API_KEY || '';
    this.defaultModel = defaultModel || process.env.AI_MODEL || 'gemini-1.5-flash';
  }

  private normalizeModelName(rawModel?: string): string {
    const model = (rawModel || this.defaultModel || '').toLowerCase().trim();
    if (model.includes('3.6') || model.includes('3.5') || model.includes('2.0') || model.includes('1.5') || model.includes('flash')) {
      return 'gemini-3.6-flash';
    }
    if (model.includes('pro')) {
      return 'gemini-3.6-pro';
    }
    return rawModel || 'gemini-3.6-flash';
  }

  async generateCompletion(prompt: string, options?: AICompletionOptions): Promise<string> {
    try {
      const model = this.normalizeModelName(options?.model);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

      const payload: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens || 1000,
        },
      };

      if (options?.systemPrompt) {
        payload.systemInstruction = {
          parts: [{ text: options.systemPrompt }],
        };
      }

      if (options?.responseFormat === 'json_object') {
        payload.generationConfig.responseMimeType = 'application/json';
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Google Gemini API error');
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return text;
    } catch (err: any) {
      console.error('[GeminiProvider Error]', err.message);
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
      const cleaned = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned) as T;
    }
  }
}
