export interface AICompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  responseFormat?: 'json_object' | 'text';
}

export interface AIProvider {
  generateCompletion(prompt: string, options?: AICompletionOptions): Promise<string>;
  generateStructuredOutput<T>(
    prompt: string,
    schemaDescription: string,
    options?: AICompletionOptions
  ): Promise<T>;
}
