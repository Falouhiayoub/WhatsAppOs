import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, organizationName } = await req.json();

    if (!name || !email || !password || !organizationName) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'All fields are required' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'CONFLICT', message: 'User with this email already exists' }, { status: 409 });
    }

    const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    // Create Organization & Subscription
    const org = await db.organization.create({
      data: {
        name: organizationName,
        slug,
      },
    });

    await db.subscription.create({
      data: {
        organizationId: org.id,
        plan: 'STARTER',
        status: 'ACTIVE',
      },
    });

    // Create Default Pipeline
    const pipeline = await db.pipeline.create({
      data: {
        organizationId: org.id,
        name: 'Default Sales Pipeline',
        isDefault: true,
      },
    });

    const stages = [
      { name: 'Nouveau Lead', stageKey: 'NEW', order: 1, color: '#3B82F6' },
      { name: 'Contacté', stageKey: 'CONTACTED', order: 2, color: '#8B5CF6' },
      { name: 'Qualifié', stageKey: 'QUALIFIED', order: 3, color: '#EC4899' },
      { name: 'Devis / Proposition', stageKey: 'PROPOSAL', order: 4, color: '#F59E0B' },
      { name: 'Négociation', stageKey: 'NEGOTIATION', order: 5, color: '#10B981' },
      { name: 'Gagné', stageKey: 'WON', order: 6, color: '#059669' },
      { name: 'Perdu', stageKey: 'LOST', order: 7, color: '#EF4444' },
    ];

    for (const s of stages) {
      await db.pipelineStage.create({
        data: {
          pipelineId: pipeline.id,
          name: s.name,
          stageKey: s.stageKey,
          order: s.order,
          color: s.color,
        },
      });
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'OWNER',
        organizationId: org.id,
      },
    });

    await db.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        role: 'OWNER',
      },
    });

    // Default WhatsApp Account Mock
    await db.whatsAppAccount.create({
      data: {
        organizationId: org.id,
        phoneNumber: '+212600000000',
        phoneNumberId: `pn_${Date.now()}`,
        accessToken: 'mock_token',
        status: 'CONNECTED',
      },
    });

    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: 'OWNER' as const,
      organizationId: org.id,
    };

    const token = generateToken(session);

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: org,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
  }
}
