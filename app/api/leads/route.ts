import { NextRequest, NextResponse } from 'next/server';
import { validateTenantContext } from '@/server/middleware/tenantContext';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await validateTenantContext(req, 'VIEWER');
  if (auth.errorResponse) return auth.errorResponse;

  const { organizationId } = auth.context!;

  try {
    const pipeline = await db.pipeline.findFirst({
      where: { organizationId, isDefault: true },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            leads: {
              where: { organizationId },
              include: {
                contact: true,
                assignedUser: { select: { id: true, name: true, email: true } },
              },
              orderBy: { updatedAt: 'desc' },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, pipeline });
  } catch (error: any) {
    return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await validateTenantContext(req, 'AGENT');
  if (auth.errorResponse) return auth.errorResponse;

  const { organizationId } = auth.context!;

  try {
    const { leadId, stageId, stageKey, value, title, notes } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'leadId is required' }, { status: 400 });
    }

    const existingLead = await db.lead.findFirst({
      where: { id: leadId, organizationId },
    });

    if (!existingLead) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Lead not found' }, { status: 404 });
    }

    const updatedLead = await db.lead.update({
      where: { id: leadId },
      data: {
        ...(stageId ? { stageId } : {}),
        ...(value !== undefined ? { value: parseFloat(value) } : {}),
        ...(title ? { title } : {}),
        ...(notes ? { notes } : {}),
      },
      include: { contact: true, stage: true },
    });

    // Sync contact leadStatus if stageKey provided
    if (stageKey) {
      await db.contact.update({
        where: { id: updatedLead.contactId },
        data: { leadStatus: stageKey },
      });
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await validateTenantContext(req, 'AGENT');
  if (auth.errorResponse) return auth.errorResponse;

  const { organizationId } = auth.context!;

  try {
    const { title, contactId, conversationId, value, currency, buyingIntent, budget, timeline, location } = await req.json();

    if (!title || !contactId) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'title and contactId are required' }, { status: 400 });
    }

    const pipeline = await db.pipeline.findFirst({
      where: { organizationId, isDefault: true },
      include: { stages: { orderBy: { order: 'asc' }, take: 1 } },
    });

    if (!pipeline || pipeline.stages.length === 0) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'No pipeline stages found' }, { status: 404 });
    }

    const initialStage = pipeline.stages[0];

    const lead = await db.lead.create({
      data: {
        organizationId,
        contactId,
        conversationId,
        pipelineId: pipeline.id,
        stageId: initialStage.id,
        title,
        value: parseFloat(value || 0),
        currency: currency || 'MAD',
        buyingIntent: buyingIntent || 'MEDIUM',
        budget,
        timeline,
        location,
      },
      include: { contact: true, stage: true },
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 });
  }
}
