"use strict";
// ─── system.ts ───────────────────────────────────────────────────────
// System health route — real status checks for all services
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const qdrantService = __importStar(require("../services/qdrantService"));
const enkryptService = __importStar(require("../services/enkryptService"));
const lyzrService = __importStar(require("../services/lyzrService"));
const router = (0, express_1.Router)();
// GET /api/system/health
router.get('/health', async (_req, res) => {
    const [qdrant, enkrypt, lyzr] = await Promise.all([
        qdrantService.healthCheck(),
        enkryptService.healthCheck(),
        lyzrService.healthCheck(),
    ]);
    const claude = process.env.ANTHROPIC_API_KEY
        ? { status: 'ONLINE' }
        : { status: 'NOT_CONFIGURED', details: 'ANTHROPIC_API_KEY not set' };
    res.json({
        timestamp: new Date().toISOString(),
        services: {
            lyzr,
            qdrant,
            enkrypt,
            claude,
        },
        overall: lyzr.status === 'ONLINE' && qdrant.status === 'ONLINE' && enkrypt.status === 'ONLINE' && claude.status === 'ONLINE'
            ? 'ALL_SYSTEMS_ONLINE'
            : 'DEGRADED',
    });
});
exports.default = router;
//# sourceMappingURL=system.js.map