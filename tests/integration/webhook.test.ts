import assert from 'assert';
import { getWhatsAppProvider } from '@/services/whatsapp';

export async function runWebhookTests() {
  console.log('🧪 Testing WhatsApp Provider & Webhook Parsing...');

  const provider = getWhatsAppProvider();

  // Test Webhook Verification Token
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'whatsapp_os_verify_token_2026_secure';
  const isValidToken = provider.validateWebhook(expectedToken);
  assert(isValidToken === true, 'Webhook verify token should be valid');

  // Test Parsing Webhook Payload
  const rawMetaBody = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '12345',
        changes: [
          {
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: { phone_number_id: '1092837465991' },
              contacts: [{ wa_id: '212612345678', profile: { name: 'Youssef Benjelloun' } }],
              messages: [
                {
                  id: 'wamid.TEST_123',
                  from: '212612345678',
                  timestamp: '1700000000',
                  type: 'text',
                  text: { body: 'Bonjour, quel est le prix?' },
                },
              ],
            },
          },
        ],
      },
    ],
  };

  const { messages } = provider.parseWebhookPayload(rawMetaBody);
  assert(messages.length === 1, 'Should extract 1 normalized message');
  assert(messages[0].fromPhone === '+212612345678', 'Phone number should be formatted with + prefix');
  assert(messages[0].fromName === 'Youssef Benjelloun', 'Contact profile name should be extracted');
  assert(messages[0].content === 'Bonjour, quel est le prix?', 'Message text body should be normalized');

  console.log('  ✔ Meta WhatsApp Webhook payload normalization verified');
  console.log('✅ Integration Webhook tests passed!\n');
}
