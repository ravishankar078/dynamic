export interface EmployeeContext {
    role: string;
    department: string;
    normalCorrespondents: string[];
    routineActions: string[];
}
export interface ContextAnalysisResult {
    senderKnown: boolean;
    senderRelationship: 'known' | 'unknown' | 'inconclusive';
    actionMatchesRole: boolean;
    actionMatchesDepartment: boolean;
    workflowNormal: boolean;
    anomalies: string[];
    contextVerdict: 'NORMAL' | 'SUSPICIOUS' | 'CONTEXT_INCONCLUSIVE';
    explanation: string;
}
export declare function contextAnalyzer(sender: string, subject: string, body: string, detectedIntent: string, employeeContext?: EmployeeContext): ContextAnalysisResult;
//# sourceMappingURL=contextAnalyzer.d.ts.map