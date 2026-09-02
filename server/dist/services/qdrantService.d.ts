export declare function initQdrant(): boolean;
export declare function ensureCollection(): Promise<boolean>;
export interface QdrantThreatMatch {
    id: string;
    score: number;
    attackType: string;
    intent: string;
    riskLevel: string;
    explanation: string;
    signals: string[];
    timestamp: string;
}
export declare function searchThreats(messageText: string, limit?: number): Promise<{
    matches: QdrantThreatMatch[];
    source: 'qdrant' | 'unavailable';
}>;
export declare function upsertIncident(eventId: string, messageText: string, attackType: string, intent: string, riskLevel: string, explanation: string, signals: string[]): Promise<boolean>;
export declare function healthCheck(): Promise<{
    status: 'ONLINE' | 'OFFLINE' | 'NOT_CONFIGURED';
    details?: string;
}>;
export declare function getStatus(): {
    configured: boolean;
    healthy: boolean;
};
//# sourceMappingURL=qdrantService.d.ts.map