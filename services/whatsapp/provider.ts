export interface OutgoingTextMessage {
  to: string;
  text: string;
}

export interface OutgoingTemplateMessage {
  to: string;
  templateName: string;
  languageCode: string;
  components?: any[];
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface NormalizedIncomingMessage {
  externalId: string;
  fromPhone: string;
  fromName: string;
  toPhoneNumberId: string;
  type: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'INTERACTIVE' | 'LOCATION';
  content: string;
  timestamp: Date;
  rawPayload: any;
}

export interface MessageStatusUpdate {
  externalId: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  timestamp: Date;
  recipientPhone: string;
}

export interface WhatsAppProvider {
  sendTextMessage(msg: OutgoingTextMessage): Promise<WhatsAppSendResult>;
  sendTemplateMessage(msg: OutgoingTemplateMessage): Promise<WhatsAppSendResult>;
  markAsRead(messageId: string): Promise<boolean>;
  validateWebhook(verifyToken: string): boolean;
  parseWebhookPayload(body: any): {
    messages: NormalizedIncomingMessage[];
    statusUpdates: MessageStatusUpdate[];
  };
}
