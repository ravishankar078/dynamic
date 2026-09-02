import { Request, Response, NextFunction } from 'express';
export type UserRole = 'ADMIN' | 'SECURITY_ANALYST' | 'EMPLOYEE';
export interface SessionUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}
declare module 'express-session' {
    interface SessionData {
        user?: SessionUser;
    }
}
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
export declare function requireRole(...roles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map