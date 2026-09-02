"use strict";
// ─── contextAnalyzer.ts ──────────────────────────────────────────────
// Compares the message against the employee's known context to detect anomalies.
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextAnalyzer = contextAnalyzer;
function contextAnalyzer(sender, subject, body, detectedIntent, employeeContext) {
    // If no context provided, return inconclusive
    if (!employeeContext || (!employeeContext.role && !employeeContext.department)) {
        return {
            senderKnown: false,
            senderRelationship: 'inconclusive',
            actionMatchesRole: false,
            actionMatchesDepartment: false,
            workflowNormal: false,
            anomalies: ['No employee context available for comparison'],
            contextVerdict: 'CONTEXT_INCONCLUSIVE',
            explanation: 'CONTEXT INCONCLUSIVE — No employee context was provided to validate this message against.',
        };
    }
    const anomalies = [];
    const senderLower = sender.toLowerCase();
    const fullText = `${subject} ${body}`.toLowerCase();
    // Check if sender is known
    const knownCorrespondents = (employeeContext.normalCorrespondents || []).map((c) => c.toLowerCase());
    const senderKnown = knownCorrespondents.some((c) => senderLower.includes(c) || c.includes(senderLower.split('@')[0]));
    const senderRelationship = senderKnown
        ? 'known'
        : knownCorrespondents.length === 0
            ? 'inconclusive'
            : 'unknown';
    if (!senderKnown && knownCorrespondents.length > 0) {
        anomalies.push(`Sender "${sender}" is not in the employee's known correspondents list`);
    }
    // Check if action matches role
    const roleLower = (employeeContext.role || '').toLowerCase();
    const deptLower = (employeeContext.department || '').toLowerCase();
    const routineActions = (employeeContext.routineActions || []).map((a) => a.toLowerCase());
    // Determine if the requested action is normal for this role
    const financialIntents = ['SEND_MONEY'];
    const credentialIntents = ['ENTER_PASSWORD', 'SEND_OTP'];
    let actionMatchesRole = true;
    let actionMatchesDepartment = true;
    // Financial requests are unusual unless you're in finance
    if (financialIntents.includes(detectedIntent) && !['finance', 'accounting', 'procurement'].includes(deptLower)) {
        actionMatchesRole = false;
        actionMatchesDepartment = false;
        anomalies.push(`Financial request sent to ${employeeContext.department} department employee, which is unusual`);
    }
    // Credential requests are unusual for anyone
    if (credentialIntents.includes(detectedIntent)) {
        anomalies.push('Credential requests via email are not standard procedure in any department');
        actionMatchesRole = false;
    }
    // Check if action matches routine
    const workflowNormal = routineActions.some((action) => {
        return fullText.includes(action) || action.includes(detectedIntent.toLowerCase().replace(/_/g, ' '));
    });
    if (!workflowNormal && routineActions.length > 0) {
        anomalies.push(`Requested action does not match employee's routine workflows: ${routineActions.join(', ')}`);
    }
    // Determine context verdict
    let contextVerdict = 'NORMAL';
    if (anomalies.length >= 2) {
        contextVerdict = 'SUSPICIOUS';
    }
    else if (anomalies.length === 1 && !senderKnown) {
        contextVerdict = 'SUSPICIOUS';
    }
    else if (anomalies.length === 0 && senderKnown) {
        contextVerdict = 'NORMAL';
    }
    else {
        contextVerdict = 'CONTEXT_INCONCLUSIVE';
    }
    const explanation = contextVerdict === 'NORMAL'
        ? `Message is consistent with employee's role (${employeeContext.role}) and department (${employeeContext.department}). Sender is a known correspondent.`
        : contextVerdict === 'SUSPICIOUS'
            ? `Message contains ${anomalies.length} contextual anomaly(ies) relative to the employee's normal workflow.`
            : 'Insufficient context to fully validate this message against employee norms.';
    return {
        senderKnown,
        senderRelationship,
        actionMatchesRole,
        actionMatchesDepartment,
        workflowNormal,
        anomalies,
        contextVerdict,
        explanation,
    };
}
//# sourceMappingURL=contextAnalyzer.js.map