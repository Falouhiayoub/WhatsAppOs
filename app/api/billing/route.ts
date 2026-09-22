import { NextRequest, NextResponse } from 'next/server';
import { validateTenantContext } from '@/server/middleware/tenantContext';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await validateTenantContext(req, 'VIEWER');
  if (auth.errorResponse) return auth.errorResponse;

  const { organizationId } = auth.context!;

  try {
    let subscription = await db.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      subscription = await db.subscription.create({
        data: {
          organizationId,
          plan: 'STARTER',
          status: 'ACTIVE',
        },
      });
    }

    const [messagesCount, aiExecutionsCount, usersCount] = await Promise.all([
      db.message.count({ where: { organizationId } }),
      db.aIExecution.count({ where: { organizationId } }),
      db.user.count({ where: { organizationId } }),
    ]);

    return NextResponse.json({
      success: true,
      subscription,
      usage: {
        messagesUsed: messagesCount,
        messageLimit: subscription.messageLimit,
        aiUsed: aiExecutionsCount,
        aiLimit: subscription.aiLimit,
        usersCount,
        userLimit: subscription.userLimit,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 });
  }
}
