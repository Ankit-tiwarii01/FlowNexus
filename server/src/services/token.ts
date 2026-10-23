import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

interface TokenPayload { sub: string }

export function createToken(userId: string): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign({}, env.JWT_SECRET, { ...options, subject: userId });
}

export function verifyToken(token: string): TokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (typeof payload === 'string' || typeof payload.sub !== 'string') {
    throw new Error('Invalid token payload');
  }
  return { sub: payload.sub };
}
