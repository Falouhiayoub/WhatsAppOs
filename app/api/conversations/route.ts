import { NextRequest, NextResponse } from 'next/server';
import { validateTenantContext } from '@/server/middleware/tenantContext';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await validateTenantContext(req, 'VIEWER');
  if (auth.errorResponse) return auth.errorResponse;

  const { organizationId } = auth.context!;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  try {
    const conversations = await db.conversation.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {}),
        ...(search
          ? {
              contact: {
                OR: [
                  { name: { contains: search } },
                  { phone: { contains: search } },
                ],
              },
            }
          : {}),
      },
      include: {
        contact: true,
        assignedUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return NextResponse.json({ success: true, conversations });
  } catch (error: any) {
    return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 });
  }
}
