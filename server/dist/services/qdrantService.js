"use strict";
// ─── qdrantService.ts ────────────────────────────────────────────────
// Qdrant vector database integration for semantic threat memory.
// Falls back to local corpus when QDRANT_URL is not configured.
Object.defineProperty(exports, "__esModule", { value: true });
exports.initQdrant = initQdrant;
exports.ensureCollection = ensureCollection;
exports.searchThreats = searchThreats;
exports.upsertIncident = upsertIncident;
exports.healthCheck = healthCheck;
exports.getStatus = getStatus;
const js_client_rest_1 = require("@qdrant/js-client-rest");
const COLLECTION_NAME = 'phishguard_threat_memory';
const VECTOR_SIZE = 384;
let client = null;
let isConfigured = false;
let isHealthy = false;
function initQdrant() {
    const url = process.env.QDRANT_URL;
    const apiKey = process.env.QDRANT_API_KEY;
    if (!url) {
        console.log('[Qdrant] Not configured — using local threat corpus fallback');
        return false;
    }
    try {
        client = new js_client_rest_1.QdrantClient({
            url,
            apiKey: apiKey || undefined,
        });
        isConfigured = true;
        console.log(`[Qdrant] Client initialized: ${url}`);
        return true;
    }
    catch (err) {
        console.error('[Qdrant] Failed to initialize client:', err);
        return false;
    }
}
async function ensureCollection() {
    if (!client)
        return false;
    try {
        const collections = await client.getCollections();
        const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);
        if (!exists) {
            await client.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_SIZE,
                    distance: 'Cosine',
                },
            });
            console.log(`[Qdrant] Created collection: ${COLLECTION_NAME}`);
        }
        isHealthy = true;
        return true;
    }
    catch (err) {
        console.error('[Qdrant] Collection setup failed:', err);
        isHealthy = false;
        return false;
    }
}
// Simple bag-of-words embedding (deterministic, no external API needed)
function createEmbedding(text) {
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    const vector = new Array(VECTOR_SIZE).fill(0);
    for (const word of words) {
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
            hash = ((hash << 5) - hash + word.charCodeAt(i)) | 0;
        }
        const idx = Math.abs(hash) % VECTOR_SIZE;
        vector[idx] += 1;
    }
    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (magnitude > 0) {
        for (let i = 0; i < VECTOR_SIZE; i++) {
            vector[i] /= magnitude;
        }
    }
    return vector;
}
async function searchThreats(messageText, limit = 5) {
    if (!client || !isHealthy) {
        return { matches: [], source: 'unavailable' };
    }
    try {
        const vector = createEmbedding(messageText);
        const results = await client.search(COLLECTION_NAME, {
            vector,
            limit,
            with_payload: true,
        });
        const matches = (results || []).map((r) => ({
            id: String(r.id),
            score: r.score,
            attackType: String(r.payload?.attackType || 'unknown'),
            intent: String(r.payload?.intent || 'unknown'),
            riskLevel: String(r.payload?.riskLevel || 'unknown'),
            explanation: String(r.payload?.explanation || ''),
            signals: Array.isArray(r.payload?.signals) ? r.payload.signals.map(String) : [],
            timestamp: String(r.payload?.timestamp || ''),
        }));
        return { matches, source: 'qdrant' };
    }
    catch (err) {
        console.error('[Qdrant] Search failed:', err);
        isHealthy = false;
        return { matches: [], source: 'unavailable' };
    }
}
async function upsertIncident(eventId, messageText, attackType, intent, riskLevel, explanation, signals) {
    if (!client || !isHealthy)
        return false;
    try {
        const vector = createEmbedding(messageText);
        await client.upsert(COLLECTION_NAME, {
            points: [
                {
                    id: eventId,
                    vector,
                    payload: {
                        attackType,
                        intent,
                        riskLevel,
                        explanation,
                        signals,
                        timestamp: new Date().toISOString(),
                    },
                },
            ],
        });
        return true;
    }
    catch (err) {
        console.error('[Qdrant] Upsert failed:', err);
        return false;
    }
}
async function healthCheck() {
    if (!isConfigured || !client) {
        return { status: 'NOT_CONFIGURED', details: 'QDRANT_URL not set' };
    }
    try {
        const info = await client.getCollections();
        isHealthy = true;
        return {
            status: 'ONLINE',
            details: `${info.collections.length} collection(s)`,
        };
    }
    catch (err) {
        isHealthy = false;
        return {
            status: 'OFFLINE',
            details: err.message,
        };
    }
}
function getStatus() {
    return {
        configured: isConfigured,
        healthy: isHealthy,
    };
}
//# sourceMappingURL=qdrantService.js.map