export interface URLFinding {
    type: string;
    severity: 'info' | 'warning' | 'danger';
    detail: string;
}
export interface SingleURLAnalysis {
    originalURL: string;
    protocol: string;
    hostname: string;
    path: string;
    isIPAddress: boolean;
    isShortener: boolean;
    hasHomoglyph: boolean;
    suspiciousKeywords: string[];
    claimedBrand: string | null;
    domainMismatch: boolean;
    findings: URLFinding[];
    riskLevel: 'safe' | 'suspicious' | 'dangerous';
}
export interface AnalyzeURLResult {
    urls: SingleURLAnalysis[];
    overallURLRisk: 'none' | 'safe' | 'suspicious' | 'dangerous';
    hasURLs: boolean;
}
export declare function analyzeURL(urls: string[], messageText: string): AnalyzeURLResult;
//# sourceMappingURL=analyzeURL.d.ts.map