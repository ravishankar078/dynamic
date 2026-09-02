export interface LyzrAgentResponse {
    source: 'lyzr' | 'local_fallback';
    response?: string;
    agentId?: string;
    sessionId?: string;
}
export interface LyzrToolPlan {
    source: 'lyzr' | 'local_fallback';
    tools: string[];
    reasoning: string;
    agentId?: string;
}
export declare function initLyzr(): boolean;
export declare function orchestrateTools(params: {
    sender: string;
    subject: string;
    bodyPreview: string;
    hasURLs: boolean;
    hasEmployeeContext: boolean;
    enkryptFlagged: boolean;
    injectionDetected: boolean;
}): Promise<LyzrToolPlan>;
export declare function invokeAgent(message: string, context?: Record<string, unknown>): Promise<LyzrAgentResponse>;
export declare function healthCheck(): Promise<{
    status: 'ONLINE' | 'OFFLINE' | 'NOT_CONFIGURED';
    details?: string;
}>;
export declare function getStatus(): {
    configured: boolean;
    healthy: boolean;
};
//# sourceMappingURL=lyzrService.d.ts.map