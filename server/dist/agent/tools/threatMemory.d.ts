export interface ThreatMatch {
    threatId: string;
    category: string;
    description: string;
    matchedKeywords: string[];
    similarity: number;
    severity: string;
    relatedIntent: string;
}
export interface ThreatMemoryResult {
    matches: ThreatMatch[];
    highestThreatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    source: 'local_corpus' | 'qdrant';
    matchCount: number;
}
export declare function threatMemory(subject: string, body: string, sender: string): ThreatMemoryResult;
//# sourceMappingURL=threatMemory.d.ts.map