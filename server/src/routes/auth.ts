// ─── auth.ts ─────────────────────────────────────────────────────────
// Authentication routes: login, logout, me

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { SessionUser, UserRole } from '../auth/authMiddleware';

const router = Router();

// In-memory user store (demo + env-configured accounts)
interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
}

function getDemoUsers(): UserRecord[] {
  const users: UserRecord[] = [];

  // Built-in demo accounts
  const demoAccounts = [
    {
      id: 'user-admin-001',
      email: process.env.DEMO_ANALYST_EMAIL || 'analyst@phishguard.test',
      name: 'Security Analyst',
      role: 'SECURITY_ANALYST' as UserRole,
      password: process.env.DEMO_ANALYST_PASSWORD || 'PhishGuard2026!',
    },
    {
      id: 'user-admin-002',
      email: 'admin@phishguard.test',
      name: 'SOC Administrator',
      role: 'ADMIN' as UserRole,
      password: 'PhishGuard2026!',
    },
  ];

  for (const account of demoAccounts) {
    users.push({
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
      passwordHash: bcrypt.hashSync(account.password, 10),
    });
  }

  return users;
}

let usersCache: UserRecord[] | null = null;
function getUsers(): UserRecord[] {
  if (!usersCache) {
    usersCache = getDemoUsers();
  }
  return usersCache;
}

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'INVALID_INPUT', message: 'Email and password are required' });
      return;
    }

    const users = getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
      return;
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    req.session.user = sessionUser;

    res.json({
      success: true,
      user: sessionUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'LOGIN_FAILED', message: 'An error occurred during login' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'LOGOUT_FAILED', message: 'Could not log out' });
      return;
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  if (!req.session?.user) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Not authenticated' });
    return;
  }
  res.json({ user: req.session.user });
});

export default router;
