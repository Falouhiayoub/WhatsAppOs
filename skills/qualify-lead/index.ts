import { z } from 'zod';
import { getAIProvider } from '@/services/ai';
import { AgentContext } from '@/agents/core/agent';

export const QualifyLeadInputSchema = z.object({
  message: z.string(),
  conversationHistory: z.array(z.any()).optional(),
});

export const QualifyLeadOutputSchema = z.object({
  need: z.string().nullable(),
  product: z.string().nullable(),
  budget: z.string().nullable(),
  timeline: z.string().nullable(),
  location: z.string().nullable(),
  buyingIntent: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

export type QualifyLeadInput = z.infer<typeof QualifyLeadInputSchema>;
export type QualifyLeadOutput = z.infer<typeof QualifyLeadOutputSchema>;

export const QualifyLeadSkill = {
  metadata: {
    key: 'qualify-lead',
    name: 'Lead Qualification Skill',
    description: 'Extracts customer purchasing intent, budget, timeline, location, and product interest.',
    version: '1.0.0',
  },

  async execute(input: QualifyLeadInput, context?: AgentContext): Promise<QualifyLeadOutput> {
    QualifyLeadInputSchema.parse(input);

    const provider = getAIProvider();
    const prompt = `Analyze this conversation to extract B2B/B2C sales qualification metrics.
Latest Message: "${input.message}"
History: ${JSON.stringify(input.conversationHistory || [])}

Extract structured lead attributes:
- Customer Need
- Product of Interest
- Budget (if specified or implied)
- Timeline (urgency of purchase/service)
- Location (city or region in Morocco)
- Buying Intent (LOW, MEDIUM, HIGH)

CRITICAL RULE: Do NOT invent missing details. Use null if not mentioned.`;

    const schemaDescription = `{
  "need": string | null,
  "product": string | null,
  "budget": string | null,
  "timeline": string | null,
  "location": string | null,
  "buyingIntent": "LOW" | "MEDIUM" | "HIGH"
}`;

    try {
      const output = await provider.generateStructuredOutput<QualifyLeadOutput>(prompt, schemaDescription);
      return QualifyLeadOutputSchema.parse(output);
    } catch {
      return {
        need: 'Renseignement produit / service',
        product: null,
        budget: null,
        timeline: null,
        location: null,
        buyingIntent: 'MEDIUM',
      };
    }
  },
};
