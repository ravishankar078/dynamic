export interface EnkryptResult {
    safe: boolean;
    source: 'enkrypt' | 'local_fallback';
    findings: EnkryptFinding[];
    severity: 'none' | 'warning' | 'critical';
}
export interface EnkryptFinding {
    type: string;
    confidence: number;
    detail: string;
}
export declare function initEnkrypt(): boolean;
export declare function checkInputSafety(subject: string, body: string): Promise<EnkryptResult>;
export declare function healthCheck(): Promise<{
    status: 'ONLINE' | 'OFFLINE' | 'NOT_CONFIGURED';
    details?: string;
}>;
export declare function getStatus(): {
    configured: boolean;
    healthy: boolean;
};
//# sourceMappingURL=enkryptService.d.ts.map