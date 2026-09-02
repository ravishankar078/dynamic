// ─── incidentStore.ts ────────────────────────────────────────────────
// In-memory incident store for PhishGuard AI

import { AnalysisResult } from '../agent/securityAgent';

export interface Incident {
  incidentId: string;
  eventId: string;
  timestamp: string;
  sender: string;
  subject: string;
  body: string;
  riskScore: number;
  riskLevel: string;
  detectedIntent: string;
  intervention: string;
  result: AnalysisResult;
  feedback?: {
    analyst: string;
    isFalsePositive: boolean;
    notes: string;
    timestamp: string;
  };
}

class IncidentStore {
  private incidents: Map<string, Incident> = new Map();
  private counter: number = 0;

  private generateId(): string {
    this.counter++;
    const year = new Date().getFullYear();
    return `PG-${year}-${String(this.counter).padStart(5, '0')}`;
  }

  addIncident(
    eventId: string,
    sender: string,
    subject: string,
    body: string,
    result: AnalysisResult
  ): Incident {
    const incident: Incident = {
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

  getAll(): Incident[] {
    return Array.from(this.incidents.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getById(id: string): Incident | undefined {
    return this.incidents.get(id);
  }

  getByEventId(eventId: string): Incident | undefined {
    return Array.from(this.incidents.values()).find((i) => i.eventId === eventId);
  }

  addFeedback(id: string, analyst: string, isFalsePositive: boolean, notes: string): boolean {
    const incident = this.incidents.get(id);
    if (!incident) return false;

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

export const incidentStore = new IncidentStore();
