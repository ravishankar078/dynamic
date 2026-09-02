// ─── events.ts ───────────────────────────────────────────────────────
// SSE event stream and event lookup routes

import { Router, Request, Response } from 'express';
import { incidentStore } from '../store/incidentStore';

const router = Router();

// Active SSE connections
export const sseClients: Set<Response> = new Set();

// GET /api/events/stream — SSE endpoint
router.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Broadcast SSE event to all connected clients
export function broadcastSSE(event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// GET /api/events/:eventId
router.get('/:eventId', (req: Request, res: Response) => {
  const incident = incidentStore.getByEventId(req.params.eventId);

  if (!incident) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Event not found' });
    return;
  }

  res.json(incident);
});

export default router;
