import {
  WhatsAppProvider,
  OutgoingTextMessage,
  OutgoingTemplateMessage,
  WhatsAppSendResult,
  NormalizedIncomingMessage,
  MessageStatusUpdate,
} from './provider';

export class MetaWhatsAppProvider implements WhatsAppProvider {
  private accessToken: string;
  private phoneNumberId: string;
  private verifyToken: string;

  constructor(accessToken?: string, phoneNumberId?: string, verifyToken?: string) {
    this.accessToken = accessToken || process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.verifyToken = verifyToken || process.env.WHATSAPP_VERIFY_TOKEN || '';
  }

  validateWebhook(token: string): boolean {
    return token === this.verifyToken;
  }

  async sendTextMessage(msg: OutgoingTextMessage): Promise<WhatsAppSendResult> {
    try {
      const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: msg.to.replace(/\+/g, ''),
          type: 'text',
          text: { body: msg.text },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data?.error?.message || 'Meta Cloud API request failed',
        };
      }

      const messageId = data?.messages?.[0]?.id;
      return {
        success: true,
        messageId,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error sending WhatsApp message',
      };
    }
  }

  async sendTemplateMessage(msg: OutgoingTemplateMessage): Promise<WhatsAppSendResult> {
    try {
      const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: msg.to.replace(/\+/g, ''),
          type: 'template',
          template: {
            name: msg.templateName,
            language: { code: msg.languageCode },
            components: msg.components || [],
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data?.error?.message || 'Meta Template API request failed',
        };
      }

      return {
        success: true,
        messageId: data?.messages?.[0]?.id,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Error sending template',
      };
    }
  }

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  parseWebhookPayload(body: any): {
    messages: NormalizedIncomingMessage[];
    statusUpdates: MessageStatusUpdate[];
  } {
    const messages: NormalizedIncomingMessage[] = [];
    const statusUpdates: MessageStatusUpdate[] = [];

    if (!body || body.object !== 'whatsapp_business_account') {
      return { messages, statusUpdates };
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== 'messages') continue;
        const value = change.value;
        if (!value) continue;

        const metadata = value.metadata || {};
        const phoneNumberId = metadata.phone_number_id || '';

        // Extract contacts map for names
        const contactsMap: Record<string, string> = {};
        if (value.contacts && Array.isArray(value.contacts)) {
          for (const c of value.contacts) {
            contactsMap[c.wa_id] = c.profile?.name || c.wa_id;
          }
        }

        // Process incoming messages
        if (value.messages && Array.isArray(value.messages)) {
          for (const msg of value.messages) {
            const externalId = msg.id;
            const fromPhone = msg.from;
            const fromName = contactsMap[fromPhone] || fromPhone;
            let type: NormalizedIncomingMessage['type'] = 'TEXT';
            let content = '';

            if (msg.type === 'text') {
              type = 'TEXT';
              content = msg.text?.body || '';
            } else if (msg.type === 'image') {
              type = 'IMAGE';
              content = msg.image?.caption || '[Image]';
            } else if (msg.type === 'document') {
              type = 'DOCUMENT';
              content = msg.document?.caption || '[Document]';
            } else if (msg.type === 'audio') {
              type = 'AUDIO';
              content = '[Voice Message]';
            } else if (msg.type === 'interactive') {
              type = 'INTERACTIVE';
              content = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '[Interactive]';
            } else {
              content = `[${msg.type}]`;
            }

            messages.push({
              externalId,
              fromPhone: `+${fromPhone}`,
              fromName,
              toPhoneNumberId: phoneNumberId,
              type,
              content,
              timestamp: msg.timestamp ? new Date(parseInt(msg.timestamp) * 1000) : new Date(),
              rawPayload: msg,
            });
          }
        }

        // Process delivery status updates
        if (value.statuses && Array.isArray(value.statuses)) {
          for (const st of value.statuses) {
            let status: MessageStatusUpdate['status'] = 'SENT';
            if (st.status === 'delivered') status = 'DELIVERED';
            else if (st.status === 'read') status = 'READ';
            else if (st.status === 'failed') status = 'FAILED';

            statusUpdates.push({
              externalId: st.id,
              status,
              recipientPhone: `+${st.recipient_id}`,
              timestamp: st.timestamp ? new Date(parseInt(st.timestamp) * 1000) : new Date(),
            });
          }
        }
      }
    }

    return { messages, statusUpdates };
  }
}
