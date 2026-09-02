"use strict";
// ─── messages.ts ─────────────────────────────────────────────────────
// POST /api/messages/incoming — Real-time message ingestion with SSE streaming
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const securityAgent_1 = require("../agent/securityAgent");
const incidentStore_1 = require("../store/incidentStore");
const events_1 = require("./events");
const router = (0, express_1.Router)();
// POST /api/messages/incoming — SSE streaming analysis
router.post('/incoming', async (req, res) => {
    try {
        const { sender, subject, body, links, employeeContext } = req.body;
        if (!body && !subject) {
            res.status(400).json({
                error: 'INVALID_INPUT',
                message: 'At least one of "subject" or "body" must be provided.',
            });
            return;
        }
        // Set up SSE response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
        // Validate and sanitize input
        const input = {
            sender: typeof sender === 'string' ? sender.substring(0, 500) : 'unknown@unknown.test',
            subject: typeof subject === 'string' ? subject.substring(0, 1000) : '',
            body: typeof body === 'string' ? body.substring(0, 10000) : '',
            links: Array.isArray(links)
                ? links.filter((l) => typeof l === 'string').slice(0, 20).map((l) => l.substring(0, 2000))
                : [],
            employeeContext: employeeContext && typeof employeeContext === 'object'
                ? {
                    role: typeof employeeContext.role === 'string' ? employeeContext.role : '',
                    department: typeof employeeContext.department === 'string' ? employeeContext.department : '',
                    normalCorrespondents: Array.isArray(employeeContext.normalCorrespondents)
                        ? employeeContext.normalCorrespondents.filter((c) => typeof c === 'string')
                        : [],
                    routineActions: Array.isArray(employeeContext.routineActions)
                        ? employeeContext.routineActions.filter((a) => typeof a === 'string')
                        : [],
                }
                : undefined,
        };
        // Send initial event
        const sendEvent = (eventType, data) => {
            try {
                res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
            }
            catch { /* client disconnected */ }
        };
        sendEvent('step', {
            step: 0,
            name: 'Message Received',
            description: `Incoming message from ${input.sender}`,
            status: 'completed',
            timestamp: new Date().toISOString(),
            duration: 0,
        });
        // Run analysis with step callbacks
        const result = await (0, securityAgent_1.runSecurityAgent)(input, (step) => {
            sendEvent('step', step);
            // Also broadcast to global SSE stream
            (0, events_1.broadcastSSE)('agent_step', { ...step, sender: input.sender, subject: input.subject });
        });
        // Store as incident
        const incident = incidentStore_1.incidentStore.addIncident(result.eventId, input.sender, input.subject, input.body, result);
        // Broadcast alert for HIGH/CRITICAL
        if (result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL') {
            (0, events_1.broadcastSSE)('alert', {
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
        // Send final result
        sendEvent('result', {
            ...result,
            incidentId: incident.incidentId,
        });
        sendEvent('done', { incidentId: incident.incidentId });
        res.end();
    }
    catch (error) {
        console.error('Message analysis error:', error);
        try {
            res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
            res.end();
        }
        catch {
            res.status(500).json({ error: 'ANALYSIS_FAILED', message: error.message });
        }
    }
});
exports.default = router;
//# sourceMappingURL=messages.js.map