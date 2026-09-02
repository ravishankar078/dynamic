import { RiskLevel } from './riskEngine';
export type InterventionType = 'ALLOW' | 'WARN' | 'QUARANTINE' | 'BLOCK';
export interface InterventionResult {
    action: InterventionType;
    severity: 'info' | 'warning' | 'danger' | 'critical';
    title: string;
    description: string;
    safeAlternativeAction: string;
    whatWouldHappenIfClicked: string;
    recommendedSteps: string[];
}
export declare function determineIntervention(riskLevel: RiskLevel, riskScore: number, detectedIntent: string, signals: string[], hasURLs: boolean, promptInjectionDetected: boolean): InterventionResult;
//# sourceMappingURL=interventionEngine.d.ts.map