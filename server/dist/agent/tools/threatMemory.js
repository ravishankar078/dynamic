"use strict";
// ─── threatMemory.ts ─────────────────────────────────────────────────
// Checks message against known threat patterns from local JSON corpus.
// Falls back gracefully if Qdrant is unavailable.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.threatMemory = threatMemory;
const threatCorpus_json_1 = __importDefault(require("../../data/threatCorpus.json"));
function calculateSimilarity(messageText, keywords) {
    const textLower = messageText.toLowerCase();
    const matched = [];
    for (const keyword of keywords) {
        if (textLower.includes(keyword.toLowerCase())) {
            matched.push(keyword);
        }
    }
    if (keywords.length === 0)
        return { score: 0, matched: [] };
    // Weighted score: more matched keywords = higher similarity
    const rawScore = matched.length / keywords.length;
    // Boost if more than 2 matches
    const boostedScore = matched.length >= 3 ? Math.min(1, rawScore * 1.3) : rawScore;
    return { score: Math.round(boostedScore * 100) / 100, matched };
}
function threatMemory(subject, body, sender) {
    const fullText = `${subject} ${body} ${sender}`;
    const matches = [];
    const corpus = threatCorpus_json_1.default;
    for (const threat of corpus) {
        const { score, matched } = calculateSimilarity(fullText, threat.keywords);
        // Only include if at least some keywords matched
        if (matched.length >= 1 && score >= 0.1) {
            matches.push({
                threatId: threat.id,
                category: threat.category,
                description: threat.description,
                matchedKeywords: matched,
                similarity: score,
                severity: threat.severity,
                relatedIntent: threat.intent,
            });
        }
    }
    // Sort by similarity descending
    matches.sort((a, b) => b.similarity - a.similarity);
    // Determine highest threat level
    let highestThreatLevel = 'none';
    if (matches.length > 0) {
        const topMatch = matches[0];
        if (topMatch.similarity >= 0.5 && topMatch.severity === 'critical') {
            highestThreatLevel = 'critical';
        }
        else if (topMatch.similarity >= 0.4 && (topMatch.severity === 'critical' || topMatch.severity === 'high')) {
            highestThreatLevel = 'high';
        }
        else if (topMatch.similarity >= 0.2) {
            highestThreatLevel = 'medium';
        }
        else {
            highestThreatLevel = 'low';
        }
    }
    return {
        matches: matches.slice(0, 5), // top 5 matches
        highestThreatLevel,
        source: 'local_corpus',
        matchCount: matches.length,
    };
}
//# sourceMappingURL=threatMemory.js.map