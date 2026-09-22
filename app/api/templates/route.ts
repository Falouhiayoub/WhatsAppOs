import { NextRequest, NextResponse } from 'next/server';
import { validateTenantContext } from '@/server/middleware/tenantContext';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await validateTenantContext(req, 'VIEWER');
  if (auth.errorResponse) return auth.errorResponse;

  const { organizationId } = auth.context!;

  try {
    const templates = await db.messageTemplate.findMany({
      where: { organizationId },
      orderBy: { category: 'asc' },
    });

    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await validateTenantContext(req, 'AGENT');
  if (auth.errorResponse) return auth.errorResponse;

  const { organizationId } = auth.context!;

  try {
    const { name, category, language, content, variables } = await req.json();

    if (!name || !content) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Name and content are required' }, { status: 400 });
    }

    const template = await db.messageTemplate.create({
      data: {
        organizationId,
        name,
        category: category || 'General',
        language: language || 'fr',
        content,
        variables: JSON.stringify(variables || []),
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    return NextResponse.json({ error: 'DATABASE_ERROR', message: error.message }, { status: 500 });
  }
}
