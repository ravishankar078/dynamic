export interface ManipulationSignal {
    signal: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    evidence: string;
    description: string;
}
export interface InspectMessageResult {
    signals: ManipulationSignal[];
    overallManipulationLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}
export declare function inspectMessage(subject: string, body: string, sender: string): InspectMessageResult;
//# sourceMappingURL=inspectMessage.d.ts.map