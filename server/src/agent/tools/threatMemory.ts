// ─── threatMemory.ts ─────────────────────────────────────────────────
// Checks message against known threat patterns from local JSON corpus.
// Falls back gracefully if Qdrant is unavailable.

import threatCorpus from '../../data/threatCorpus.json';

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

interface ThreatEntry {
  id: string;
  category: string;
  description: string;
  keywords: string[];
  signals: string[];
  exampleSubject: string;
  severity: string;
  intent: string;
}

function calculateSimilarity(messageText: string, keywords: string[]): { score: number; matched: string[] } {
  const textLower = messageText.toLowerCase();
  const matched: string[] = [];

  for (const keyword of keywords) {
    if (textLower.includes(keyword.toLowerCase())) {
      matched.push(keyword);
    }
  }

  if (keywords.length === 0) return { score: 0, matched: [] };

  // Weighted score: more matched keywords = higher similarity
  const rawScore = matched.length / keywords.length;
  // Boost if more than 2 matches
  const boostedScore = matched.length >= 3 ? Math.min(1, rawScore * 1.3) : rawScore;

  return { score: Math.round(boostedScore * 100) / 100, matched };
}

export function threatMemory(
  subject: string,
  body: string,
  sender: string
): ThreatMemoryResult {
  const fullText = `${subject} ${body} ${sender}`;
  const matches: ThreatMatch[] = [];

  const corpus = threatCorpus as ThreatEntry[];

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
  let highestThreatLevel: ThreatMemoryResult['highestThreatLevel'] = 'none';
  if (matches.length > 0) {
    const topMatch = matches[0];
    if (topMatch.similarity >= 0.5 && topMatch.severity === 'critical') {
      highestThreatLevel = 'critical';
    } else if (topMatch.similarity >= 0.4 && (topMatch.severity === 'critical' || topMatch.severity === 'high')) {
      highestThreatLevel = 'high';
    } else if (topMatch.similarity >= 0.2) {
      highestThreatLevel = 'medium';
    } else {
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
