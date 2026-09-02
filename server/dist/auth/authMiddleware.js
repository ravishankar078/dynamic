"use strict";
// ─── authMiddleware.ts ───────────────────────────────────────────────
// Session-based authentication middleware for PhishGuard AI
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
function requireAuth(req, res, next) {
    if (!req.session?.user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        return;
    }
    next();
}
function requireRole(...roles) {
    return (req, res, next) => {
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
//# sourceMappingURL=authMiddleware.js.map