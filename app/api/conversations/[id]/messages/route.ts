import { NextRequest, NextResponse } from 'next/server';
import { validateTenantContext } from '@/server/middleware/tenantContext';
import { db } from '@/lib/db';
import { getWhatsAppProvider } from '@/services/whatsapp';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await validateTenantContext(req, 'VIEWER');
  if (auth.errorResponse) return auth.errorResponse;

  const { organizationId } = auth.context!;
  const conversationId = params.id;

  try {
    const conversation = await db.conversation.findFirst({
      where: { id: conversationId, organizationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Conversation not found' }, { status: 404 });
    }

    const messages = await db.message.findMany({
      where: { conversationId, organizationId },
      orderBy: { timestamp: 'asc' },
    });

    // Mark conversation unreadCount as 0
    if (conversation.unreadCount > 0) {
      await db.conversation.update({
        where: { id: conversationId },
        data: { unreadCount: 0 },
      });
    }

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await validateTenantContext(req, 'AGENT');
  if (auth.errorResponse) return auth.errorResponse;

  const { organizationId, session } = auth.context!;
  const conversationId = params.id;

  try {
    const { text, type = 'TEXT' } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Message content cannot be empty' }, { status: 400 });
    }

    const conversation = await db.conversation.findFirst({
      where: { id: conversationId, organizationId },
      include: { contact: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Conversation not found' }, { status: 404 });
    }

    // Send via WhatsApp Provider
    const provider = getWhatsAppProvider();
    const sendResult = await provider.sendTextMessage({
      to: conversation.contact.phone,
      text,
    });

    // Save message to database
    const message = await db.message.create({
      data: {
        externalProviderId: sendResult.messageId || `out_${Date.now()}`,
        organizationId,
        conversationId,
        sender: 'AGENT',
        recipient: conversation.contact.phone,
        direction: 'OUTBOUND',
        type,
        content: text,
        status: sendResult.success ? 'SENT' : 'FAILED',
        timestamp: new Date(),
      },
    });

    // Update Conversation metadata
    await db.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageText: text,
        lastMessageAt: new Date(),
        unreadCount: 0,
        status: conversation.status === 'NEEDS_HUMAN' ? 'OPEN' : conversation.status,
      },
    });

    return NextResponse.json({ success: true, message, sendResult });
  } catch (error: any) {
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
  }
}
