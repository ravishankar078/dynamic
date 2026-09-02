"use strict";
// ─── interventionEngine.ts ───────────────────────────────────────────
// Maps risk level to intervention action. Never uses an LLM to decide.
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineIntervention = determineIntervention;
function determineIntervention(riskLevel, riskScore, detectedIntent, signals, hasURLs, promptInjectionDetected) {
    // Map risk level to intervention
    let action;
    switch (riskLevel) {
        case 'LOW':
            action = 'ALLOW';
            break;
        case 'MEDIUM':
            action = 'WARN';
            break;
        case 'HIGH':
            action = 'QUARANTINE';
            break;
        case 'CRITICAL':
            action = 'BLOCK';
            break;
    }
    // Force BLOCK for prompt injection regardless
    if (promptInjectionDetected) {
        action = 'BLOCK';
    }
    // Generate contextual descriptions
    const descriptions = {
        ALLOW: 'This message appears safe and has been delivered to your inbox. No suspicious patterns or threats were detected.',
        WARN: 'This message contains some suspicious elements. Exercise caution before taking any action. Verify the sender through a separate channel before responding.',
        QUARANTINE: 'This message has been quarantined due to multiple high-risk indicators. It requires security review before any action is taken. Do NOT click any links or follow instructions.',
        BLOCK: promptInjectionDetected
            ? 'BLOCKED — AI SECURITY ATTACK DETECTED. This message attempted to manipulate the PhishGuard AI system itself. The attack was neutralized and the message has been blocked.'
            : 'BLOCKED — This message has been identified as a high-confidence phishing or social engineering attack. All links and actions have been disabled.',
    };
    const titles = {
        ALLOW: 'Message Delivered Safely',
        WARN: 'Proceed with Caution',
        QUARANTINE: 'Message Quarantined',
        BLOCK: promptInjectionDetected ? 'AI Attack Blocked' : 'Message Blocked',
    };
    const severities = {
        ALLOW: 'info',
        WARN: 'warning',
        QUARANTINE: 'danger',
        BLOCK: 'critical',
    };
    // Generate safe alternative action
    const safeAlternativeAction = generateSafeAlternative(detectedIntent, signals);
    // Generate what-would-happen explanation
    const whatWouldHappenIfClicked = generateConsequences(detectedIntent, signals, hasURLs);
    // Generate recommended steps
    const recommendedSteps = generateRecommendedSteps(action, detectedIntent, signals);
    return {
        action,
        severity: severities[action],
        title: titles[action],
        description: descriptions[action],
        safeAlternativeAction,
        whatWouldHappenIfClicked,
        recommendedSteps,
    };
}
function generateSafeAlternative(intent, signals) {
    switch (intent) {
        case 'ENTER_PASSWORD':
            return 'Navigate directly to the official website by typing the URL in your browser. Never click links in emails to enter credentials. Contact IT support if you believe your account needs verification.';
        case 'SEND_MONEY':
            return 'Verify the request by calling the person directly using a known phone number (not from the email). Follow your organization\'s standard payment approval process.';
        case 'CLICK_LINK':
            return 'Instead of clicking the link, navigate directly to the service\'s official website. If the email claims to be from a specific service, look up their official URL independently.';
        case 'SEND_OTP':
            return 'Never share verification codes received via SMS or email. Legitimate services will never ask you to forward these codes. Contact IT security immediately.';
        case 'DOWNLOAD_FILE':
            return 'Do not download attachments from unknown or suspicious senders. If you need a file from a colleague, contact them through a verified channel to confirm.';
        case 'SHARE_DOCUMENT':
            return 'Verify the request through an alternative communication channel before sharing any documents. Ensure the requester is who they claim to be.';
        case 'INSTALL_SOFTWARE':
            return 'Contact your IT department before installing any software. Only install applications from approved sources through your organization\'s software management system.';
        case 'REPLY_WITH_INFORMATION':
            return 'Do not reply with personal or sensitive information via email. Contact the sender through a verified phone number or in-person to verify the request.';
        default:
            return 'No specific action required. If the message seems unusual, verify with the sender through a separate communication channel.';
    }
}
function generateConsequences(intent, signals, hasURLs) {
    switch (intent) {
        case 'ENTER_PASSWORD':
            return 'If you entered your credentials on the linked page, attackers would capture your username and password. They could then access your email, corporate systems, and any accounts using the same credentials. This often leads to data breaches, financial theft, and further phishing attacks using your compromised account.';
        case 'SEND_MONEY':
            return 'If you completed the financial transaction, the money would be sent to an attacker-controlled account. Wire transfers and gift card purchases are nearly impossible to reverse once completed. The attacker would likely disappear with the funds.';
        case 'CLICK_LINK':
            return hasURLs
                ? 'Clicking the link could redirect you to a fake login page designed to steal your credentials, or download malware onto your device. The malware could capture keystrokes, access files, or give attackers remote control of your computer.'
                : 'Following the instructions could lead to credential compromise or unauthorized access to your accounts and systems.';
        case 'SEND_OTP':
            return 'Sharing your one-time password would give attackers the ability to bypass two-factor authentication on your accounts. Combined with a stolen password, they would have complete access to your accounts.';
        case 'DOWNLOAD_FILE':
            return 'Opening the attachment could install malware (ransomware, trojans, keyloggers) on your device. This could encrypt your files for ransom, steal sensitive data, or give attackers persistent access to your system.';
        case 'INSTALL_SOFTWARE':
            return 'Installing the software could give attackers a backdoor into your system. This could lead to data theft, ransomware deployment, or your device becoming part of a botnet.';
        default:
            return 'No significant risk from normal interaction. However, always verify unexpected requests through alternative channels.';
    }
}
function generateRecommendedSteps(action, intent, signals) {
    const steps = [];
    switch (action) {
        case 'ALLOW':
            steps.push('Message has been delivered normally');
            steps.push('No action required from you');
            break;
        case 'WARN':
            steps.push('Verify the sender\'s identity through a separate channel');
            steps.push('Do not click any links or download attachments until verified');
            steps.push('Report to IT security if the message seems suspicious');
            break;
        case 'QUARANTINE':
            steps.push('DO NOT interact with this message');
            steps.push('Contact your IT security team for review');
            steps.push('If you already clicked a link, change your passwords immediately');
            steps.push('Report this message using your organization\'s phishing report button');
            break;
        case 'BLOCK':
            steps.push('This message has been blocked — no action needed');
            steps.push('The message has been reported to security operations');
            steps.push('If you received similar messages, report them to IT security');
            if (signals.includes('prompt_injection')) {
                steps.push('AI attack attempt has been logged for security analysis');
            }
            break;
    }
    return steps;
}
//# sourceMappingURL=interventionEngine.js.map