"use strict";
// ─── incidentStore.ts ────────────────────────────────────────────────
// In-memory incident store for PhishGuard AI
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentStore = void 0;
class IncidentStore {
    incidents = new Map();
    counter = 0;
    generateId() {
        this.counter++;
        const year = new Date().getFullYear();
        return `PG-${year}-${String(this.counter).padStart(5, '0')}`;
    }
    addIncident(eventId, sender, subject, body, result) {
        const incident = {
            incidentId: this.generateId(),
            eventId,
            timestamp: new Date().toISOString(),
            sender,
            subject,
            body,
            riskScore: result.riskScore,
            riskLevel: result.riskLevel,
            detectedIntent: result.detectedIntent,
            intervention: result.intervention.action,
            result,
        };
        this.incidents.set(incident.incidentId, incident);
        return incident;
    }
    getAll() {
        return Array.from(this.incidents.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    getById(id) {
        return this.incidents.get(id);
    }
    getByEventId(eventId) {
        return Array.from(this.incidents.values()).find((i) => i.eventId === eventId);
    }
    addFeedback(id, analyst, isFalsePositive, notes) {
        const incident = this.incidents.get(id);
        if (!incident)
            return false;
        incident.feedback = {
            analyst,
            isFalsePositive,
            notes,
            timestamp: new Date().toISOString(),
        };
        return true;
    }
    getStats() {
        const all = this.getAll();
        return {
            total: all.length,
            critical: all.filter((i) => i.riskLevel === 'CRITICAL').length,
            high: all.filter((i) => i.riskLevel === 'HIGH').length,
            medium: all.filter((i) => i.riskLevel === 'MEDIUM').length,
            low: all.filter((i) => i.riskLevel === 'LOW').length,
            blocked: all.filter((i) => i.intervention === 'BLOCK').length,
            warned: all.filter((i) => i.intervention === 'WARN').length,
            allowed: all.filter((i) => i.intervention === 'ALLOW').length,
            quarantined: all.filter((i) => i.intervention === 'QUARANTINE').length,
            falsePositives: all.filter((i) => i.feedback?.isFalsePositive).length,
        };
    }
}
exports.incidentStore = new IncidentStore();
//# sourceMappingURL=incidentStore.js.map