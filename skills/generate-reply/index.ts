import { z } from 'zod';
import { getAIProvider } from '@/services/ai';
import { AgentContext } from '@/agents/core/agent';

export const GenerateReplyInputSchema = z.object({
  customerMessage: z.string(),
  intent: z.string(),
  businessProfile: z.any().optional(),
  templates: z.array(z.any()).optional(),
  conversationHistory: z.array(
    z.object({
      sender: z.string(),
      content: z.string(),
    })
  ).optional(),
});

export const GenerateReplyOutputSchema = z.object({
  optionA: z.string(), // Professional
  optionB: z.string(), // Friendly
  optionC: z.string(), // Sales-oriented
  confidence: z.number(),
  reasoning: z.string(),
});

export type GenerateReplyInput = z.infer<typeof GenerateReplyInputSchema>;
export type GenerateReplyOutput = z.infer<typeof GenerateReplyOutputSchema>;

export const GenerateReplySkill = {
  metadata: {
    key: 'generate-reply',
    name: 'Generate Reply Suggestions',
    description: 'Generates 3 distinct tone response suggestions for human review.',
    version: '1.0.0',
  },

  async execute(input: GenerateReplyInput, context?: AgentContext): Promise<GenerateReplyOutput> {
    GenerateReplyInputSchema.parse(input);

    const provider = getAIProvider();
    const profile = input.businessProfile || context?.businessProfile || {};
    const templatesList = input.templates || context?.templates || [];

    const prompt = `You are an AI sales and customer service copilot for "${profile.name || 'Business'}".
Industry: ${profile.industry || 'Local Business'}
Business Description: ${profile.description || 'N/A'}
Products & Pricing: ${profile.products || 'N/A'}
Services: ${profile.services || 'N/A'}
FAQ & Policies: ${profile.faq || 'N/A'}
Forbidden Claims: ${profile.forbiddenClaims || 'Never fabricate unverified details or fake discounts.'}

Available Templates:
${templatesList.map((t: any) => `- Name: ${t.name} (Content: ${t.content})`).join('\n')}

Customer Message: "${input.customerMessage}"
Detected Intent: ${input.intent}

Generate 3 distinct reply options for a WhatsApp response:
- Option A: Professional & Direct
- Option B: Friendly & Warm (suitable for WhatsApp, using polite Moroccan French/Darija touches where appropriate)
- Option C: Sales-Oriented & Action-Driven (suggesting next step or call-to-action)

GUARDRAILS:
- Do NOT fabricate prices or order details that are not in the business profile.
- If info is missing, politely ask the customer or mention verification with the team.`;

    const schemaDescription = `{
  "optionA": "string",
  "optionB": "string",
  "optionC": "string",
  "confidence": number between 0 and 1,
  "reasoning": "brief explanation of suggested options"
}`;

    try {
      const output = await provider.generateStructuredOutput<GenerateReplyOutput>(prompt, schemaDescription);
      return GenerateReplyOutputSchema.parse(output);
    } catch (err) {
      return {
        optionA: `Bonjour! Merci pour votre message. Nous avons bien pris en compte votre demande concernant "${input.customerMessage}".`,
        optionB: `Salam 👋 Merci de nous avoir contactés! Comment pouvons-nous vous aider au mieux aujourd'hui?`,
        optionC: `Bonjour! N'hésitez pas à nous indiquer si vous souhaitez recevoir notre catalogue complet ou discuter directement avec un conseiller.`,
        confidence: 0.8,
        reasoning: 'Fallback response generated due to model output formatting.',
      };
    }
  },
};
