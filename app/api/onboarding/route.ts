import { NextRequest, NextResponse } from 'next/server';
import { validateTenantContext } from '@/server/middleware/tenantContext';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await validateTenantContext(req, 'VIEWER');
  if (auth.errorResponse) return auth.errorResponse;

  const { organizationId, session } = auth.context!;

  try {
    const org = await db.organization.findUnique({
      where: { id: organizationId },
    });

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, organization: org, user });
  } catch (error: any) {
    return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await validateTenantContext(req, 'ADMIN');
  if (auth.errorResponse) return auth.errorResponse;

  const { organizationId } = auth.context!;

  try {
    const {
      name,
      industry,
      businessDescription,
      products,
      services,
      faq,
      tone,
      defaultLanguage,
      businessHours,
      policies,
      forbiddenClaims,
      handoffRules,
      phoneNumber,
      phoneNumberId,
      accessToken,
    } = await req.json();

    const updatedOrg = await db.organization.update({
      where: { id: organizationId },
      data: {
        ...(name ? { name } : {}),
        ...(industry ? { industry } : {}),
        businessDescription,
        products,
        services,
        faq,
        tone: tone || 'PROFESSIONAL',
        defaultLanguage: defaultLanguage || 'fr',
        businessHours,
        policies,
        forbiddenClaims,
        handoffRules,
      },
    });

    if (phoneNumber && phoneNumberId) {
      await db.whatsAppAccount.upsert({
        where: { phoneNumberId },
        update: {
          phoneNumber,
          accessToken: accessToken || 'mock_token',
          status: 'CONNECTED',
        },
        create: {
          organizationId,
          phoneNumber,
          phoneNumberId,
          accessToken: accessToken || 'mock_token',
          status: 'CONNECTED',
        },
      });
    }

    return NextResponse.json({ success: true, organization: updatedOrg });
  } catch (error: any) {
    return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 });
  }
}
