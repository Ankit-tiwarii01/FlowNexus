import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { loginSchema, registerSchema } from '@flownexus/shared';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { createToken } from '../services/token.js';
import { sendWelcomeEmail } from '../services/email.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

function toUserDto(user: { id: string; name: string; email: string; createdAt: Date }) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt.toISOString() };
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
    if (existing) throw new AppError(409, 'An account with that email already exists', 'EMAIL_IN_USE');

    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash: await bcrypt.hash(input.password, 12) },
    });
    void sendWelcomeEmail(user.email, user.name).catch((error) => console.error('Welcome email failed', error));
    res.status(201).json({ token: createToken(user.id), user: toUserDto(user) });
  } catch (error) { next(error); }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new AppError(401, 'Email or password is incorrect', 'INVALID_CREDENTIALS');
    }
    res.json({ token: createToken(user.id), user: toUserDto(user) });
  } catch (error) { next(error); }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { id: true, name: true, email: true, createdAt: true } });
    if (!user) throw new AppError(401, 'Account no longer exists', 'UNAUTHORIZED');
    res.json({ user: toUserDto(user) });
  } catch (error) { next(error); }
});
