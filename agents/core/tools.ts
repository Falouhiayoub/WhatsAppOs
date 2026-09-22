import { db } from '@/lib/db';

export interface ToolDefinition<TInput = any, TOutput = any> {
  name: string;
  description: string;
  execute: (input: TInput, organizationId: string) => Promise<TOutput>;
}

export const toolsRegistry: Record<string, ToolDefinition> = {
  getContact: {
    name: 'getContact',
    description: 'Fetch customer contact details by ID',
    execute: async ({ contactId }: { contactId: string }, organizationId: string) => {
      const contact = await db.contact.findFirst({
        where: { id: contactId, organizationId },
      });
      if (!contact) return null;
      return {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        company: contact.company,
        leadStatus: contact.leadStatus,
        notes: contact.notes,
        tags: JSON.parse(contact.tags || '[]'),
      };
    },
  },

  getConversation: {
    name: 'getConversation',
    description: 'Fetch conversation details by ID',
    execute: async ({ conversationId }: { conversationId: string }, organizationId: string) => {
      const conv = await db.conversation.findFirst({
        where: { id: conversationId, organizationId },
        include: { contact: true },
      });
      if (!conv) return null;
      return {
        id: conv.id,
        contactName: conv.contact.name,
        contactPhone: conv.contact.phone,
        status: conv.status,
        leadStatus: conv.leadStatus,
        summary: conv.summary,
      };
    },
  },

  getRecentMessages: {
    name: 'getRecentMessages',
    description: 'Fetch recent message history for context building',
    execute: async ({ conversationId, limit = 10 }: { conversationId: string; limit?: number }, organizationId: string) => {
      const messages = await db.message.findMany({
        where: { conversationId, organizationId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return messages.reverse().map((m) => ({
        id: m.id,
        sender: m.sender,
        direction: m.direction,
        content: m.content,
        timestamp: m.timestamp,
      }));
    },
  },

  getBusinessProfile: {
    name: 'getBusinessProfile',
    description: 'Fetch organization business description, products, FAQ, tone and handoff rules',
    execute: async (_: any, organizationId: string) => {
      const org = await db.organization.findUnique({
        where: { id: organizationId },
      });
      if (!org) return null;
      return {
        name: org.name,
        industry: org.industry,
        description: org.businessDescription,
        products: org.products,
        services: org.services,
        faq: org.faq,
        tone: org.tone,
        businessHours: org.businessHours,
        policies: org.policies,
        forbiddenClaims: org.forbiddenClaims,
        handoffRules: org.handoffRules,
      };
    },
  },

  searchTemplates: {
    name: 'searchTemplates',
    description: 'Find reusable message templates for the organization',
    execute: async ({ category }: { category?: string }, organizationId: string) => {
      const templates = await db.messageTemplate.findMany({
        where: {
          organizationId,
          ...(category ? { category } : {}),
        },
      });

      return templates.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        content: t.content,
        variables: JSON.parse(t.variables || '[]'),
      }));
    },
  },
};
