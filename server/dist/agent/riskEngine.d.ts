import { ManipulationSignal } from './tools/inspectMessage';
import { DetermineIntentResult } from './tools/determineIntent';
import { AnalyzeURLResult } from './tools/analyzeURL';
import { ContextAnalysisResult } from './tools/contextAnalyzer';
import { ThreatMemoryResult } from './tools/threatMemory';
import { PromptInjectionResult } from './tools/promptInjectionDetector';
export interface TrustAdjustment {
    factor: string;
    adjustment: number;
    reason: string;
    runningTotal: number;
}
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface RiskEngineResult {
    startingTrust: number;
    trustLedger: TrustAdjustment[];
    finalTrust: number;
    riskScore: number;
    riskLevel: RiskLevel;
}
export interface QdrantEvidenceInput {
    score: number;
    attackType: string;
    intent: string;
    riskLevel: string;
}
export interface EnkryptEvidenceInput {
    type: string;
    confidence: number;
    detail: string;
}
export declare function calculateRisk(signals: ManipulationSignal[], intent: DetermineIntentResult, urlAnalysis: AnalyzeURLResult, contextAnalysis: ContextAnalysisResult, threatMemory: ThreatMemoryResult, promptInjection: PromptInjectionResult, qdrantMatches?: QdrantEvidenceInput[], // NEW: Qdrant semantic evidence
enkryptFindings?: EnkryptEvidenceInput[]): RiskEngineResult;
//# sourceMappingURL=riskEngine.d.ts.map