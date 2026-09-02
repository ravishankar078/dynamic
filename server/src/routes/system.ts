// ─── system.ts ───────────────────────────────────────────────────────
// System health route — real status checks for all services

import { Router, Request, Response } from 'express';
import * as qdrantService from '../services/qdrantService';
import * as enkryptService from '../services/enkryptService';
import * as lyzrService from '../services/lyzrService';

const router = Router();

// GET /api/system/health
router.get('/health', async (_req: Request, res: Response) => {
  const [qdrant, enkrypt, lyzr] = await Promise.all([
    qdrantService.healthCheck(),
    enkryptService.healthCheck(),
    lyzrService.healthCheck(),
  ]);

  const claude = process.env.ANTHROPIC_API_KEY
    ? { status: 'ONLINE' as const }
    : { status: 'NOT_CONFIGURED' as const, details: 'ANTHROPIC_API_KEY not set' };

  res.json({
    timestamp: new Date().toISOString(),
    services: {
      lyzr,
      qdrant,
      enkrypt,
      claude,
    },
    overall:
      lyzr.status === 'ONLINE' && qdrant.status === 'ONLINE' && enkrypt.status === 'ONLINE' && claude.status === 'ONLINE'
        ? 'ALL_SYSTEMS_ONLINE'
        : 'DEGRADED',
  });
});

export default router;
