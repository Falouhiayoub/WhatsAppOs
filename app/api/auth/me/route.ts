import { NextRequest, NextResponse } from 'next/server';
import { validateTenantContext } from '@/server/middleware/tenantContext';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await validateTenantContext(req, 'VIEWER');
  if (auth.errorResponse) return auth.errorResponse;

  const { session, organizationId } = auth.context!;

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    const organization = await db.organization.findUnique({
      where: { id: organizationId },
    });

    return NextResponse.json({
      success: true,
      user,
      organization,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 });
  }
}
