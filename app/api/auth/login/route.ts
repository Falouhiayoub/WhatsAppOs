import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Email and password are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: 'AUTHENTICATION_ERROR', message: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: 'AUTHENTICATION_ERROR', message: 'User does not belong to an organization' }, { status: 403 });
    }

    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      organizationId: user.organizationId,
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
        organization: user.organization,
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
