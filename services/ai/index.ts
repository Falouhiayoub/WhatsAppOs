import { AIProvider } from './provider';
import { OpenAIProvider } from './openaiProvider';
import { GeminiProvider } from './geminiProvider';
import { MockAIProvider } from './mockProvider';

export function getAIProvider(): AIProvider {
  const providerType = (process.env.AI_PROVIDER || 'mock').toLowerCase().trim();
  const apiKey = process.env.AI_PROVIDER_API_KEY;

  if (providerType === 'openai' && apiKey && !apiKey.includes('mock')) {
    return new OpenAIProvider(apiKey);
  }

  if ((providerType === 'gemini' || providerType === 'google') && apiKey && !apiKey.includes('mock')) {
    return new GeminiProvider(apiKey);
  }

  return new MockAIProvider();
}

export * from './provider';
export * from './openaiProvider';
export * from './geminiProvider';
export * from './mockProvider';

