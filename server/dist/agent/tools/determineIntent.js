"use strict";
// ─── determineIntent.ts ──────────────────────────────────────────────
// Classifies the sender's intent — what they want the employee to DO.
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineIntent = determineIntent;
const INTENT_PATTERNS = [
    {
        intent: 'ENTER_PASSWORD',
        weight: 10,
        explanationTemplate: 'The message asks the recipient to enter or verify login credentials.',
        patterns: [
            /\b(enter|provide|verify|confirm|update) (your )?(password|credentials|login)\b/i,
            /\b(sign.?in|log.?in) (to )?(verify|confirm|secure)\b/i,
            /\b(password|credentials) (has |have )?(expired?|reset)\b/i,
            /\bverify your (account|identity)\b/i,
        ],
    },
    {
        intent: 'SEND_MONEY',
        weight: 10,
        explanationTemplate: 'The message requests a financial transaction or payment.',
        patterns: [
            /\b(wire transfer|send money|make (a |the )?payment|purchase)\b/i,
            /\b(gift card|itunes|google play|amazon card|steam card)\b/i,
            /\b(invoice|payment due|outstanding balance|remittance)\b/i,
            /\b(buy|purchase|pick up) .{0,30}(gift card|card)\b/i,
            /\b(bitcoin|crypto|western union)\b/i,
        ],
    },
    {
        intent: 'CLICK_LINK',
        weight: 7,
        explanationTemplate: 'The message urges the recipient to click on a link.',
        patterns: [
            /\b(click (here|below|this link|the link|the button))\b/i,
            /\b(visit|go to|navigate to|open) (this |the )?(link|url|page|portal)\b/i,
            /\b(use (this|the) (link|portal|page))\b/i,
            /https?:\/\/\S+/i,
        ],
    },
    {
        intent: 'SEND_OTP',
        weight: 9,
        explanationTemplate: 'The message requests a one-time password or verification code.',
        patterns: [
            /\b(otp|one.?time|verification code|security code|2fa code)\b/i,
            /\b(send|share|provide|forward) (your |the )?(code|otp)\b/i,
            /\b(text (you |your )?a code)\b/i,
        ],
    },
    {
        intent: 'SHARE_DOCUMENT',
        weight: 5,
        explanationTemplate: 'The message requests sharing or uploading a document.',
        patterns: [
            /\b(share|send|upload|attach) (the |your |a )?(document|file|report|spreadsheet)\b/i,
            /\b(need (the |your |a )?(document|file|report|data))\b/i,
        ],
    },
    {
        intent: 'DOWNLOAD_FILE',
        weight: 7,
        explanationTemplate: 'The message instructs the recipient to download a file or attachment.',
        patterns: [
            /\b(download|save|open) (the |this )?(attachment|file|document)\b/i,
            /\b(attached (file|document|invoice))\b/i,
            /\b(see attached|find attached|please download)\b/i,
        ],
    },
    {
        intent: 'REPLY_WITH_INFORMATION',
        weight: 6,
        explanationTemplate: 'The message asks the recipient to reply with sensitive information.',
        patterns: [
            /\b(reply|respond|send|email).{0,20}(with|your|the).{0,20}(information|details|data|number)\b/i,
            /\b(provide|share).{0,20}(your|the).{0,20}(ssn|social|tax|employee|phone|address)\b/i,
        ],
    },
    {
        intent: 'INSTALL_SOFTWARE',
        weight: 8,
        explanationTemplate: 'The message instructs the recipient to install or run software.',
        patterns: [
            /\b(install|run|execute|download and run)\b/i,
            /\b(software|application|program|tool|update|patch)\b/i,
            /\b(enable (macros|content|editing))\b/i,
        ],
    },
];
function determineIntent(subject, body, links) {
    const fullText = `${subject} ${body}`;
    const scores = new Map();
    for (const intentDef of INTENT_PATTERNS) {
        let matchCount = 0;
        for (const pattern of intentDef.patterns) {
            if (pattern.test(fullText)) {
                matchCount++;
            }
        }
        if (matchCount > 0) {
            scores.set(intentDef.intent, matchCount * intentDef.weight);
        }
    }
    // Boost CLICK_LINK if links are present
    if (links.length > 0) {
        scores.set('CLICK_LINK', (scores.get('CLICK_LINK') || 0) + 5);
    }
    // Sort by score descending
    const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
        return {
            intent: 'NORMAL_COMMUNICATION',
            confidence: 0.8,
            explanation: 'No suspicious intent patterns detected. The message appears to be normal communication.',
            secondaryIntents: [],
        };
    }
    const topScore = sorted[0][1];
    const maxPossibleScore = 50; // rough upper bound
    const confidence = Math.min(0.95, 0.5 + (topScore / maxPossibleScore) * 0.5);
    const primaryIntent = sorted[0][0];
    const intentDef = INTENT_PATTERNS.find((p) => p.intent === primaryIntent);
    return {
        intent: primaryIntent,
        confidence: Math.round(confidence * 100) / 100,
        explanation: intentDef?.explanationTemplate || `Detected intent: ${primaryIntent}`,
        secondaryIntents: sorted.slice(1, 3).map(([intent, score]) => ({
            intent,
            confidence: Math.round(Math.min(0.9, 0.3 + (score / maxPossibleScore) * 0.4) * 100) / 100,
        })),
    };
}
//# sourceMappingURL=determineIntent.js.map