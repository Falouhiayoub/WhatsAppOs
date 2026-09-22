import { NextRequest, NextResponse } from 'next/server';
import { validateTenantContext } from '@/server/middleware/tenantContext';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await validateTenantContext(req, 'VIEWER');
  if (auth.errorResponse) return auth.errorResponse;

  const { organizationId } = auth.context!;
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const leadStatus = searchParams.get('leadStatus');

  try {
    const contacts = await db.contact.findMany({
      where: {
        organizationId,
        ...(leadStatus ? { leadStatus } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { phone: { contains: search } },
                { email: { contains: search } },
                { company: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        conversations: {
          take: 1,
          orderBy: { lastMessageAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, contacts });
  } catch (error: any) {
    return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await validateTenantContext(req, 'AGENT');
  if (auth.errorResponse) return auth.errorResponse;

  const { organizationId } = auth.context!;

  try {
    const { name, phone, email, company, notes, tags } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Name and phone are required' }, { status: 400 });
    }

    const contact = await db.contact.create({
      data: {
        organizationId,
        name,
        phone,
        email,
        company,
        notes,
        tags: JSON.stringify(tags || []),
        source: 'MANUAL',
      },
    });

    const conversation = await db.conversation.create({
      data: {
        organizationId,
        contactId: contact.id,
        status: 'OPEN',
        lastMessageText: 'Conversation démarrée',
        lastMessageAt: new Date(),
      },
      include: {
        contact: true,
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, contact, conversation });
  } catch (error: any) {
    return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 });
  }
}
