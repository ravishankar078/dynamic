"use strict";
// ─── events.ts ───────────────────────────────────────────────────────
// SSE event stream and event lookup routes
Object.defineProperty(exports, "__esModule", { value: true });
exports.sseClients = void 0;
exports.broadcastSSE = broadcastSSE;
const express_1 = require("express");
const incidentStore_1 = require("../store/incidentStore");
const router = (0, express_1.Router)();
// Active SSE connections
exports.sseClients = new Set();
// GET /api/events/stream — SSE endpoint
router.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
    exports.sseClients.add(res);
    req.on('close', () => {
        exports.sseClients.delete(res);
    });
});
// Broadcast SSE event to all connected clients
function broadcastSSE(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of exports.sseClients) {
        try {
            client.write(payload);
        }
        catch {
            exports.sseClients.delete(client);
        }
    }
}
// GET /api/events/:eventId
router.get('/:eventId', (req, res) => {
    const incident = incidentStore_1.incidentStore.getByEventId(req.params.eventId);
    if (!incident) {
        res.status(404).json({ error: 'NOT_FOUND', message: 'Event not found' });
        return;
    }
    res.json(incident);
});
exports.default = router;
//# sourceMappingURL=events.js.map