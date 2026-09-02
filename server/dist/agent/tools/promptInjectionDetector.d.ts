export interface PromptInjectionResult {
    detected: boolean;
    severity: 'none' | 'warning' | 'critical';
    matchedPatterns: string[];
    explanation: string;
}
export declare function promptInjectionDetector(subject: string, body: string): PromptInjectionResult;
//# sourceMappingURL=promptInjectionDetector.d.ts.map