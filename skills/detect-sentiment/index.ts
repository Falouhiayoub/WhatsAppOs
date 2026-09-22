import { z } from 'zod';
import { getAIProvider } from '@/services/ai';

export const DetectSentimentInputSchema = z.object({
  message: z.string(),
});

export const DetectSentimentOutputSchema = z.object({
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'URGENT']),
  needsHuman: z.boolean(),
  flagReason: z.string().nullable(),
});

export type DetectSentimentInput = z.infer<typeof DetectSentimentInputSchema>;
export type DetectSentimentOutput = z.infer<typeof DetectSentimentOutputSchema>;

export const DetectSentimentSkill = {
  metadata: {
    key: 'detect-sentiment',
    name: 'Sentiment & Handoff Detection',
    description: 'Classifies message sentiment and flags human escalation when negative or urgent.',
    version: '1.0.0',
  },

  async execute(input: DetectSentimentInput): Promise<DetectSentimentOutput> {
    DetectSentimentInputSchema.parse(input);

    const provider = getAIProvider();
    const prompt = `Analyze customer sentiment and check if human handoff is required.
Message: "${input.message}"

Triggers for Human Handoff (needsHuman = true):
- Customer expresses anger, complaint, refund request, legal issue, payment discrepancy, or urgent medical/high-priority issue.`;

    const schemaDescription = `{
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "URGENT",
  "needsHuman": boolean,
  "flagReason": string | null
}`;

    try {
      const output = await provider.generateStructuredOutput<DetectSentimentOutput>(prompt, schemaDescription);
      return DetectSentimentOutputSchema.parse(output);
    } catch {
      return {
        sentiment: 'NEUTRAL',
        needsHuman: false,
        flagReason: null,
      };
    }
  },
};
