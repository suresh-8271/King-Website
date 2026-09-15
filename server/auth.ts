import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'paswan-ekta-manch-ultra-secure-key-2026';

export interface AdminTokenPayload {
  adminId: string;
  username: string;
  role: 'SUPER_ADMIN';
}

export interface MemberTokenPayload {
  memberId: string;
  membershipId: string;
  mobile: string;
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function signMemberToken(payload: MemberTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export interface AuthenticatedAdminRequest extends Request {
  admin?: AdminTokenPayload;
}

export interface AuthenticatedMemberRequest extends Request {
  memberAuth?: MemberTokenPayload;
}

export function requireAdminAuth(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized. Admin login required.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    if (decoded.role !== 'SUPER_ADMIN') {
      res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
      return;
    }
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired admin session token.' });
  }
}

export function requireMemberAuth(req: AuthenticatedMemberRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized. Member login required.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as MemberTokenPayload;
    req.memberAuth = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired member session.' });
  }
}

/**
 * Ensures at least one admin account exists and credentials are up-to-date.
 */
export async function ensureDefaultAdmin(): Promise<void> {
  const defaultUsername = process.env.ADMIN_DEFAULT_USER || 'admin';
  const defaultPassword = process.env.ADMIN_DEFAULT_PASS || 'Kunal@49';

  const existingAdmin = await db.getAdminByUsername(defaultUsername);
  if (!existingAdmin) {
    const hash = await hashPassword(defaultPassword);
    await db.createAdmin({
      username: defaultUsername,
      password_hash: hash,
      name: 'Rashtriya Admin',
      email: 'paswanektamanchpakribarama@gmail.com',
      role: 'SUPER_ADMIN',
    });
    console.log(`[AUTH] Initial admin seeded with username: ${defaultUsername}`);
  } else {
    // If the existing admin password does not match the active password, update it securely
    const isMatch = await verifyPassword(defaultPassword, existingAdmin.password_hash);
    if (!isMatch) {
      const newHash = await hashPassword(defaultPassword);
      await db.updateAdminPassword(defaultUsername, newHash);
      console.log(`[AUTH] Successfully updated admin password hash for username: ${defaultUsername}`);
    }
  }
}
