export type IntentType = 'CLICK_LINK' | 'ENTER_PASSWORD' | 'SEND_OTP' | 'SEND_MONEY' | 'SHARE_DOCUMENT' | 'DOWNLOAD_FILE' | 'REPLY_WITH_INFORMATION' | 'INSTALL_SOFTWARE' | 'NORMAL_COMMUNICATION';
export interface DetermineIntentResult {
    intent: IntentType;
    confidence: number;
    explanation: string;
    secondaryIntents: Array<{
        intent: IntentType;
        confidence: number;
    }>;
}
export declare function determineIntent(subject: string, body: string, links: string[]): DetermineIntentResult;
//# sourceMappingURL=determineIntent.d.ts.map