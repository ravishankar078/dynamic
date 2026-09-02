"use strict";
// ─── incidents.ts ────────────────────────────────────────────────────
// Incident management routes
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const incidentStore_1 = require("../store/incidentStore");
const router = (0, express_1.Router)();
// GET /api/incidents
router.get('/', (_req, res) => {
    const incidents = incidentStore_1.incidentStore.getAll();
    const stats = incidentStore_1.incidentStore.getStats();
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
router.get('/:id', (req, res) => {
    const incident = incidentStore_1.incidentStore.getById(req.params.id);
    if (!incident) {
        res.status(404).json({ error: 'NOT_FOUND', message: 'Incident not found' });
        return;
    }
    res.json(incident);
});
// POST /api/incidents/:id/feedback
router.post('/:id/feedback', (req, res) => {
    const { isFalsePositive, notes } = req.body;
    const analyst = req.session?.user?.email || 'unknown';
    const success = incidentStore_1.incidentStore.addFeedback(req.params.id, analyst, !!isFalsePositive, typeof notes === 'string' ? notes : '');
    if (!success) {
        res.status(404).json({ error: 'NOT_FOUND', message: 'Incident not found' });
        return;
    }
    res.json({ success: true });
});
exports.default = router;
//# sourceMappingURL=incidents.js.map