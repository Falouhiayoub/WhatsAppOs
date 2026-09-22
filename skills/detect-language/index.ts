import { z } from 'zod';
import { getAIProvider } from '@/services/ai';

export const DetectLanguageInputSchema = z.object({
  text: z.string(),
});

export const DetectLanguageOutputSchema = z.object({
  detectedLanguage: z.enum(['French', 'Darija', 'Arabic', 'English', 'Mixed']),
  confidence: z.number(),
});

export type DetectLanguageInput = z.infer<typeof DetectLanguageInputSchema>;
export type DetectLanguageOutput = z.infer<typeof DetectLanguageOutputSchema>;

export const DetectLanguageSkill = {
  metadata: {
    key: 'detect-language',
    name: 'Multilingual Language Detection',
    description: 'Detects French, Darija, Arabic, English, or Mixed phrasing.',
    version: '1.0.0',
  },

  async execute(input: DetectLanguageInput): Promise<DetectLanguageOutput> {
    DetectLanguageInputSchema.parse(input);

    const text = input.text.toLowerCase();
    let detectedLanguage: DetectLanguageOutput['detectedLanguage'] = 'French';

    if (text.includes('salam') || text.includes('kidayr') || text.includes('bghit') || text.includes('3afak') || text.includes('ch\'hal')) {
      detectedLanguage = 'Darija';
    } else if (/[\u0600-\u06FF]/.test(text)) {
      detectedLanguage = 'Arabic';
    } else if (text.includes('hello') || text.includes('please') || text.includes('price')) {
      detectedLanguage = 'English';
    }

    return {
      detectedLanguage,
      confidence: 0.95,
    };
  },
};
