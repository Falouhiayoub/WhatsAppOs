# WhatsApp Cloud API Integration Guide

## Integration Architecture

```
WhatsApp Business API
       ↓
Webhook HTTP POST Endpoint (`/api/webhooks/whatsapp`)
       ↓
Normalized Incoming Message Abstraction
       ↓
Conversation Service (Auto Contact & Threading)
       ↓
Database Persistence (Prisma DB)
       ↓
Copilote IA & Queue System
```

## Setup & Verification

1. **Webhook GET Verification**:
   - URL: `https://your-domain.com/api/webhooks/whatsapp`
   - Verify Token: `whatsapp_os_verify_token_morocco` (configured in `.env`)
2. **Environment Variables**:
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_BUSINESS_ACCOUNT_ID`
   - `WHATSAPP_VERIFY_TOKEN`
3. **Idempotency**:
   - Webhooks store raw events in `WebhookEvent` and skip duplicate processing if `externalProviderId` already exists in `Message`.
