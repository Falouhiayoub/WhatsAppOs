import { db } from '@/lib/db';
import { NormalizedIncomingMessage, MessageStatusUpdate } from './provider';

export async function processIncomingWhatsAppMessages(
  messages: NormalizedIncomingMessage[],
  targetOrganizationId?: string
) {
  const results = [];

  for (const msg of messages) {
    try {
      // 1. Idempotency Check
      const existingMessage = await db.message.findUnique({
        where: { externalProviderId: msg.externalId },
      });

      if (existingMessage) {
        results.push({ externalId: msg.externalId, status: 'SKIPPED_DUPLICATE' });
        continue;
      }

      // 2. Identify Organization
      let organizationId = targetOrganizationId;

      if (!organizationId) {
        const waAccount = await db.whatsAppAccount.findFirst({
          where: { phoneNumberId: msg.toPhoneNumberId },
        });

        if (waAccount) {
          organizationId = waAccount.organizationId;
        } else {
          // Fallback to primary default organization if in demo mode
          const firstOrg = await db.organization.findFirst();
          if (firstOrg) {
            organizationId = firstOrg.id;
          }
        }
      }

      if (!organizationId) {
        console.error(`[WhatsApp Processor] Could not find organization for incoming message from ${msg.fromPhone}`);
        continue;
      }

      // 3. Find or Create Contact
      let contact = await db.contact.findFirst({
        where: {
          organizationId,
          phone: msg.fromPhone,
        },
      });

      if (!contact) {
        contact = await db.contact.create({
          data: {
            organizationId,
            phone: msg.fromPhone,
            name: msg.fromName || msg.fromPhone,
            source: 'WHATSAPP',
            leadStatus: 'NEW',
          },
        });
      }

      // 4. Find or Create Active Conversation
      let conversation = await db.conversation.findFirst({
        where: {
          organizationId,
          contactId: contact.id,
        },
        orderBy: { updatedAt: 'desc' },
      });

      if (!conversation) {
        conversation = await db.conversation.create({
          data: {
            organizationId,
            contactId: contact.id,
            status: 'OPEN',
            leadStatus: 'NEW',
            unreadCount: 1,
            lastMessageText: msg.content,
            lastMessageAt: msg.timestamp,
          },
        });
      } else {
        await db.conversation.update({
          where: { id: conversation.id },
          data: {
            status: conversation.status === 'CLOSED' ? 'OPEN' : conversation.status,
            unreadCount: { increment: 1 },
            lastMessageText: msg.content,
            lastMessageAt: msg.timestamp,
          },
        });
      }

      // 5. Store Message
      const dbMessage = await db.message.create({
        data: {
          externalProviderId: msg.externalId,
          organizationId,
          conversationId: conversation.id,
          sender: 'CUSTOMER',
          recipient: msg.toPhoneNumberId || 'BUSINESS',
          direction: 'INBOUND',
          type: msg.type,
          content: msg.content,
          status: 'DELIVERED',
          timestamp: msg.timestamp,
          metadata: JSON.stringify(msg.rawPayload || {}),
        },
      });

      // Update Contact last interaction
      await db.contact.update({
        where: { id: contact.id },
        data: { lastInteractionAt: msg.timestamp },
      });

      results.push({
        externalId: msg.externalId,
        messageId: dbMessage.id,
        conversationId: conversation.id,
        status: 'PROCESSED',
      });
    } catch (error: any) {
      console.error(`[WhatsApp Processor Error]`, error);
      results.push({ externalId: msg.externalId, status: 'ERROR', error: error.message });
    }
  }

  return results;
}

export async function processWhatsAppStatusUpdates(updates: MessageStatusUpdate[]) {
  for (const st of updates) {
    try {
      if (!st.externalId) continue;
      await db.message.updateMany({
        where: { externalProviderId: st.externalId },
        data: { status: st.status },
      });
    } catch (err) {
      console.error(`[WhatsApp Status Update Error]`, err);
    }
  }
}
