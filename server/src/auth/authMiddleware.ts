// ─── authMiddleware.ts ───────────────────────────────────────────────
// Session-based authentication middleware for PhishGuard AI

import { Request, Response, NextFunction } from 'express';

export type UserRole = 'ADMIN' | 'SECURITY_ANALYST' | 'EMPLOYEE';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Extend express-session types
declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.user) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
    return;
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session?.user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.session.user.role)) {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
