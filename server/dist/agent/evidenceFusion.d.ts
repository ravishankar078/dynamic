import { ManipulationSignal } from './tools/inspectMessage';
import { DetermineIntentResult } from './tools/determineIntent';
import { AnalyzeURLResult } from './tools/analyzeURL';
import { ContextAnalysisResult } from './tools/contextAnalyzer';
import { ThreatMemoryResult } from './tools/threatMemory';
import { PromptInjectionResult } from './tools/promptInjectionDetector';
export interface EvidenceItem {
    source: string;
    type: 'risk' | 'legitimacy' | 'contradictory';
    description: string;
    weight: number;
}
export interface EvidenceFusionResult {
    positiveRiskEvidence: EvidenceItem[];
    legitimacyEvidence: EvidenceItem[];
    contradictoryEvidence: EvidenceItem[];
    confidence: number;
}
export interface EnkryptFinding {
    type: string;
    confidence: number;
    detail: string;
}
export interface QdrantMatch {
    score: number;
    attackType: string;
    intent: string;
    riskLevel: string;
}
export declare function evidenceFusion(signals: ManipulationSignal[], intent: DetermineIntentResult, urlAnalysis: AnalyzeURLResult, contextAnalysis: ContextAnalysisResult, threatMemory: ThreatMemoryResult, promptInjection: PromptInjectionResult, enkryptFindings?: EnkryptFinding[], // NEW: Enkrypt AI security evidence
qdrantMatches?: QdrantMatch[]): EvidenceFusionResult;
//# sourceMappingURL=evidenceFusion.d.ts.map