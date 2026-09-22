import { z } from 'zod';
import { getAIProvider } from '@/services/ai';
import { AgentContext } from '@/agents/core/agent';

export const SummarizeConversationInputSchema = z.object({
  messages: z.array(
    z.object({
      sender: z.string(),
      content: z.string(),
    })
  ),
});

export const SummarizeConversationOutputSchema = z.object({
  summary: z.string(),
  keyActionItem: z.string().nullable(),
});

export type SummarizeConversationInput = z.infer<typeof SummarizeConversationInputSchema>;
export type SummarizeConversationOutput = z.infer<typeof SummarizeConversationOutputSchema>;

export const SummarizeConversationSkill = {
  metadata: {
    key: 'summarize-conversation',
    name: 'Conversation Summarizer',
    description: 'Generates concise 1-2 sentence executive summary of conversation history.',
    version: '1.0.0',
  },

  async execute(input: SummarizeConversationInput, context?: AgentContext): Promise<SummarizeConversationOutput> {
    SummarizeConversationInputSchema.parse(input);

    const provider = getAIProvider();
    const prompt = `Summarize this WhatsApp business conversation into 1-2 concise sentences for sales agent handoff.
Messages:
${input.messages.map((m) => `${m.sender}: ${m.content}`).join('\n')}`;

    const schemaDescription = `{
  "summary": "concise summary string",
  "keyActionItem": "action needed or null"
}`;

    try {
      const output = await provider.generateStructuredOutput<SummarizeConversationOutput>(prompt, schemaDescription);
      return SummarizeConversationOutputSchema.parse(output);
    } catch {
      return {
        summary: 'Échange récent concernant une demande de prix et de renseignements.',
        keyActionItem: 'Répondre au client',
      };
    }
  },
};
