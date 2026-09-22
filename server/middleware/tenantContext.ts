import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, getSessionFromToken, UserSession } from '@/lib/auth';
import { Role } from '@/types/enums';

export interface TenantContext {
  session: UserSession;
  organizationId: string;
}

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    OWNER: 4,
    ADMIN: 3,
    AGENT: 2,
    VIEWER: 1,
  };

  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
}

export async function validateTenantContext(
  req: NextRequest,
  minRole: Role = 'VIEWER'
): Promise<{ context?: TenantContext; errorResponse?: NextResponse }> {
  const authHeader = req.headers.get('authorization');
  let token = extractBearerToken(authHeader);

  if (!token) {
    const cookieToken = req.cookies.get('auth_token')?.value;
    if (cookieToken) token = cookieToken;
  }

  if (!token) {
    return {
      errorResponse: NextResponse.json(
        { error: 'AUTHENTICATION_ERROR', message: 'Authentication token is required' },
        { status: 401 }
      ),
    };
  }

  const session = await getSessionFromToken(token);
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { error: 'AUTHENTICATION_ERROR', message: 'Invalid or expired session token' },
        { status: 401 }
      ),
    };
  }

  if (!hasPermission(session.role, minRole)) {
    return {
      errorResponse: NextResponse.json(
        { error: 'AUTHORIZATION_ERROR', message: 'Insufficient permissions for this operation' },
        { status: 403 }
      ),
    };
  }

  return {
    context: {
      session,
      organizationId: session.organizationId,
    },
  };
}
