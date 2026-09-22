import {
  WhatsAppProvider,
  OutgoingTextMessage,
  OutgoingTemplateMessage,
  WhatsAppSendResult,
  NormalizedIncomingMessage,
  MessageStatusUpdate,
} from './provider';
import { MetaWhatsAppProvider } from './metaProvider';

export class MockWhatsAppProvider implements WhatsAppProvider {
  public sentMessages: OutgoingTextMessage[] = [];
  private metaHelper = new MetaWhatsAppProvider();

  validateWebhook(verifyToken: string): boolean {
    return verifyToken === (process.env.WHATSAPP_VERIFY_TOKEN || 'whatsapp_os_verify_token_morocco');
  }

  async sendTextMessage(msg: OutgoingTextMessage): Promise<WhatsAppSendResult> {
    this.sentMessages.push(msg);
    const mockMessageId = `wamid.MOCK_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      messageId: mockMessageId,
    };
  }

  async sendTemplateMessage(msg: OutgoingTemplateMessage): Promise<WhatsAppSendResult> {
    const mockMessageId = `wamid.MOCK_TPL_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      messageId: mockMessageId,
    };
  }

  async markAsRead(messageId: string): Promise<boolean> {
    return true;
  }

  parseWebhookPayload(body: any): {
    messages: NormalizedIncomingMessage[];
    statusUpdates: MessageStatusUpdate[];
  } {
    if (body?.object === 'whatsapp_business_account') {
      return this.metaHelper.parseWebhookPayload(body);
    }

    if (body?.fromPhone && body?.content) {
      return {
        messages: [
          {
            externalId: body.externalId || `wamid.MOCK_IN_${Date.now()}`,
            fromPhone: body.fromPhone,
            fromName: body.fromName || body.fromPhone,
            toPhoneNumberId: body.toPhoneNumberId || 'mock_phone_id',
            type: body.type || 'TEXT',
            content: body.content,
            timestamp: new Date(),
            rawPayload: body,
          },
        ],
        statusUpdates: [],
      };
    }

    return { messages: [], statusUpdates: [] };
  }
}
