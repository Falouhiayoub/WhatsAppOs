import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppProvider, processIncomingWhatsAppMessages, processWhatsAppStatusUpdates } from '@/services/whatsapp';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token) {
    const provider = getWhatsAppProvider();
    if (provider.validateWebhook(token)) {
      return new NextResponse(challenge || 'OK', { status: 200 });
    }
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const provider = getWhatsAppProvider();

    // 1. Store Raw Webhook Event for Audit / Replayability
    const event = await db.webhookEvent.create({
      data: {
        provider: 'WHATSAPP',
        eventType: body?.entry?.[0]?.changes?.[0]?.field || 'message_received',
        payload: JSON.stringify(body),
        isProcessed: false,
      },
    });

    // 2. Parse Payload using Provider Abstraction
    const { messages, statusUpdates } = provider.parseWebhookPayload(body);

    // 3. Process Messages
    if (messages.length > 0) {
      await processIncomingWhatsAppMessages(messages);
    }

    // 4. Process Delivery Statuses
    if (statusUpdates.length > 0) {
      await processWhatsAppStatusUpdates(statusUpdates);
    }

    // 5. Mark Event Processed
    await db.webhookEvent.update({
      where: { id: event.id },
      data: { isProcessed: true, processedAt: new Date() },
    });

    return NextResponse.json({ status: 'SUCCESS' }, { status: 200 });
  } catch (error: any) {
    console.error('[WhatsApp Webhook POST Error]', error);
    // Return 200 OK to prevent WhatsApp retrying indefinitely on bad payload format
    return NextResponse.json({ status: 'ERROR', error: error.message }, { status: 200 });
  }
}
