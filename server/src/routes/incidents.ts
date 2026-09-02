// ─── incidents.ts ────────────────────────────────────────────────────
// Incident management routes

import { Router, Request, Response } from 'express';
import { incidentStore } from '../store/incidentStore';

const router = Router();

// GET /api/incidents
router.get('/', (_req: Request, res: Response) => {
  const incidents = incidentStore.getAll();
  const stats = incidentStore.getStats();

  res.json({
    incidents: incidents.map((i) => ({
      incidentId: i.incidentId,
      eventId: i.eventId,
      timestamp: i.timestamp,
      sender: i.sender,
      subject: i.subject,
      riskScore: i.riskScore,
      riskLevel: i.riskLevel,
      detectedIntent: i.detectedIntent,
      intervention: i.intervention,
      hasFeedback: !!i.feedback,
    })),
    stats,
  });
});

// GET /api/incidents/:id
router.get('/:id', (req: Request, res: Response) => {
  const incident = incidentStore.getById(req.params.id);

  if (!incident) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Incident not found' });
    return;
  }

  res.json(incident);
});

// POST /api/incidents/:id/feedback
router.post('/:id/feedback', (req: Request, res: Response) => {
  const { isFalsePositive, notes } = req.body;
  const analyst = req.session?.user?.email || 'unknown';

  const success = incidentStore.addFeedback(
    req.params.id,
    analyst,
    !!isFalsePositive,
    typeof notes === 'string' ? notes : ''
  );

  if (!success) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Incident not found' });
    return;
  }

  res.json({ success: true });
});

export default router;
