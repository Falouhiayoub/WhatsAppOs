import { z } from 'zod';
import { getAIProvider } from '@/services/ai';
import { AgentContext } from '@/agents/core/agent';

export const UnderstandMessageInputSchema = z.object({
  message: z.string(),
  conversationHistory: z.array(
    z.object({
      sender: z.string(),
      content: z.string(),
    })
  ),
});

export const UnderstandMessageOutputSchema = z.object({
  intent: z.enum([
    'PRICE_INQUIRY',
    'PRODUCT_INQUIRY',
    'AVAILABILITY',
    'APPOINTMENT',
    'COMPLAINT',
    'SUPPORT',
    'ORDER',
    'DELIVERY',
    'GENERAL',
    'UNKNOWN',
  ]),
  language: z.string(),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'URGENT']),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  confidence: z.number().min(0).max(1),
});

export type UnderstandMessageInput = z.infer<typeof UnderstandMessageInputSchema>;
export type UnderstandMessageOutput = z.infer<typeof UnderstandMessageOutputSchema>;

export const UnderstandMessageSkill = {
  metadata: {
    key: 'understand-message',
    name: 'Understand Customer Message',
    description: 'Classifies customer intent, language, sentiment, and urgency.',
    version: '1.0.0',
  },

  async execute(input: UnderstandMessageInput, context?: AgentContext): Promise<UnderstandMessageOutput> {
    UnderstandMessageInputSchema.parse(input);

    const provider = getAIProvider();
    const prompt = `Analyze the following customer message within the conversation context.
Customer Message: "${input.message}"
Recent History:
${input.conversationHistory.map((m) => `${m.sender}: ${m.content}`).join('\n')}

Business context: ${context?.businessProfile?.name || 'Local Business'} (${context?.businessProfile?.industry || 'General'})`;

    const schemaDescription = `{
  "intent": "PRICE_INQUIRY" | "PRODUCT_INQUIRY" | "AVAILABILITY" | "APPOINTMENT" | "COMPLAINT" | "SUPPORT" | "ORDER" | "DELIVERY" | "GENERAL" | "UNKNOWN",
  "language": "French" | "Darija" | "Arabic" | "English",
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "URGENT",
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "confidence": number between 0 and 1
}`;

    try {
      const output = await provider.generateStructuredOutput<UnderstandMessageOutput>(prompt, schemaDescription);
      return UnderstandMessageOutputSchema.parse(output);
    } catch (err) {
      // Safe Fallback with simple heuristic matching if AI API is unreachable/unconfigured
      const lower = input.message.toLowerCase();
      let intent: UnderstandMessageOutput['intent'] = 'GENERAL';
      if (
        lower.includes('thaman') ||
        lower.includes('prix') ||
        lower.includes('combien') ||
        lower.includes('bchhal') ||
        lower.includes("ch'hal")
      ) {
        intent = 'PRICE_INQUIRY';
      } else if (lower.includes('livraison') || lower.includes('rabat') || lower.includes('casa') || lower.includes('expedier')) {
        intent = 'DELIVERY';
      }

      return {
        intent,
        language: lower.includes('salam') || lower.includes("ch'hal") ? 'Darija' : 'French',
        sentiment: 'NEUTRAL',
        urgency: 'MEDIUM',
        confidence: 0.7,
      };
    }
  },
};
