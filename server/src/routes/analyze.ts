// ─── analyze.ts ──────────────────────────────────────────────────────
// POST /api/analyze — main analysis endpoint (preserved for backward compat)

import { Router, Request, Response } from 'express';
import { runSecurityAgent, AnalysisInput } from '../agent/securityAgent';
import { incidentStore } from '../store/incidentStore';
import { broadcastSSE } from './events';

const router = Router();

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { sender, subject, body, links, employeeContext } = req.body;

    // ── Input validation ──
    if (!body && !subject) {
      res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'At least one of "subject" or "body" must be provided.',
      });
      return;
    }

    // Validate and sanitize input
    const input: AnalysisInput = {
      sender: typeof sender === 'string' ? sender.substring(0, 500) : 'unknown@unknown.test',
      subject: typeof subject === 'string' ? subject.substring(0, 1000) : '',
      body: typeof body === 'string' ? body.substring(0, 10000) : '',
      links: Array.isArray(links)
        ? links.filter((l: unknown) => typeof l === 'string').slice(0, 20).map((l: string) => l.substring(0, 2000))
        : [],
      employeeContext: employeeContext && typeof employeeContext === 'object'
        ? {
            role: typeof employeeContext.role === 'string' ? employeeContext.role : '',
            department: typeof employeeContext.department === 'string' ? employeeContext.department : '',
            normalCorrespondents: Array.isArray(employeeContext.normalCorrespondents)
              ? employeeContext.normalCorrespondents.filter((c: unknown) => typeof c === 'string')
              : [],
            routineActions: Array.isArray(employeeContext.routineActions)
              ? employeeContext.routineActions.filter((a: unknown) => typeof a === 'string')
              : [],
          }
        : undefined,
    };

    // ── Run security agent ──
    const result = await runSecurityAgent(input);

    // Store as incident
    const incident = incidentStore.addIncident(
      result.eventId,
      input.sender,
      input.subject,
      input.body,
      result
    );

    // Broadcast alert for HIGH/CRITICAL
    if (result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL') {
      broadcastSSE('alert', {
        incidentId: incident.incidentId,
        eventId: result.eventId,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        detectedIntent: result.detectedIntent,
        intervention: result.intervention.action,
        sender: input.sender,
        subject: input.subject,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({ ...result, incidentId: incident.incidentId });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'ANALYSIS_FAILED',
      message: 'An error occurred during security analysis. Please try again.',
      details: (error as Error).message,
    });
  }
});

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'PhishGuard AI Security Agent',
    mode: process.env.ANTHROPIC_API_KEY ? 'ai' : 'demo',
    timestamp: new Date().toISOString(),
  });
});

export default router;
