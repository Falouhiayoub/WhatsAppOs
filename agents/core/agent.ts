import { db } from '@/lib/db';
import { toolsRegistry } from './tools';

export interface AgentContext {
  organizationId: string;
  conversationId: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  businessProfile: any;
  recentMessages: Array<{ sender: string; content: string; timestamp: Date }>;
  templates: any[];
}

export async function buildAgentContext(
  conversationId: string,
  organizationId: string
): Promise<AgentContext | null> {
  const conv = await db.conversation.findFirst({
    where: { id: conversationId, organizationId },
    include: { contact: true },
  });

  if (!conv) return null;

  const [businessProfile, recentMessages, templates] = await Promise.all([
    toolsRegistry.getBusinessProfile.execute({}, organizationId),
    toolsRegistry.getRecentMessages.execute({ conversationId, limit: 8 }, organizationId),
    toolsRegistry.searchTemplates.execute({}, organizationId),
  ]);

  return {
    organizationId,
    conversationId,
    contactId: conv.contact.id,
    contactName: conv.contact.name,
    contactPhone: conv.contact.phone,
    businessProfile: businessProfile || {},
    recentMessages: recentMessages || [],
    templates: templates || [],
  };
}

export async function logAIExecution(data: {
  organizationId: string;
  userId?: string;
  conversationId?: string;
  skillKey: string;
  inputMetadata: any;
  output: any;
  latencyMs: number;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
}) {
  try {
    await db.aIExecution.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        conversationId: data.conversationId,
        skillKey: data.skillKey,
        inputMetadata: JSON.stringify(data.inputMetadata),
        output: JSON.stringify(data.output),
        latencyMs: data.latencyMs,
        status: data.status,
        error: data.error,
      },
    });
  } catch (err) {
    console.error('[logAIExecution Error]', err);
  }
}
