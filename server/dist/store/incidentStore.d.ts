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
declare class IncidentStore {
    private incidents;
    private counter;
    private generateId;
    addIncident(eventId: string, sender: string, subject: string, body: string, result: AnalysisResult): Incident;
    getAll(): Incident[];
    getById(id: string): Incident | undefined;
    getByEventId(eventId: string): Incident | undefined;
    addFeedback(id: string, analyst: string, isFalsePositive: boolean, notes: string): boolean;
    getStats(): {
        total: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
        blocked: number;
        warned: number;
        allowed: number;
        quarantined: number;
        falsePositives: number;
    };
}
export declare const incidentStore: IncidentStore;
export {};
//# sourceMappingURL=incidentStore.d.ts.map