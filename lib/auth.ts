import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { Role } from '@/types/enums';

const JWT_SECRET = process.env.AUTH_SECRET || 'super-secret-jwt-token-change-in-production';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(session: UserSession): string {
  return jwt.sign(session, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (error) {
    return null;
  }
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}

export async function getSessionFromToken(token: string): Promise<UserSession | null> {
  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, organizationId: true },
  });

  if (!user || !user.organizationId) return null;

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    organizationId: user.organizationId,
  };
}
