"use strict";
// ─── index.ts ────────────────────────────────────────────────────────
// PhishGuard AI Server — Express entry point with all integrations
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const analyze_1 = __importDefault(require("./routes/analyze"));
const auth_1 = __importDefault(require("./routes/auth"));
const system_1 = __importDefault(require("./routes/system"));
const incidents_1 = __importDefault(require("./routes/incidents"));
const events_1 = __importDefault(require("./routes/events"));
const messages_1 = __importDefault(require("./routes/messages"));
const qdrantService = __importStar(require("./services/qdrantService"));
const enkryptService = __importStar(require("./services/enkryptService"));
const lyzrService = __importStar(require("./services/lyzrService"));
dotenv_1.default.config({ path: '../.env' });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '1mb' }));
// Session middleware
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'phishguard-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax',
    },
}));
// Routes
app.use('/api', analyze_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/system', system_1.default);
app.use('/api/incidents', incidents_1.default);
app.use('/api/events', events_1.default);
app.use('/api/messages', messages_1.default);
// Root
app.get('/', (_req, res) => {
    res.json({
        service: 'PhishGuard AI — Security Agent Backend',
        version: '2.0.0',
        status: 'online',
        mode: process.env.ANTHROPIC_API_KEY ? 'AI Mode (Claude)' : 'Demo Mode (Heuristic)',
        endpoints: {
            analyze: 'POST /api/analyze',
            health: 'GET /api/health',
            login: 'POST /api/auth/login',
            systemHealth: 'GET /api/system/health',
            incidents: 'GET /api/incidents',
            events: 'GET /api/events/stream',
            incoming: 'POST /api/messages/incoming',
        },
    });
});
// Initialize services
async function initServices() {
    // Initialize Qdrant
    const qdrantReady = qdrantService.initQdrant();
    if (qdrantReady) {
        await qdrantService.ensureCollection();
    }
    // Initialize Enkrypt
    enkryptService.initEnkrypt();
    // Initialize Lyzr
    lyzrService.initLyzr();
}
// Start server
initServices().then(() => {
    app.listen(PORT, () => {
        const qdrant = qdrantService.getStatus();
        const enkrypt = enkryptService.getStatus();
        const lyzr = lyzrService.getStatus();
        console.log('');
        console.log('╔══════════════════════════════════════════════════╗');
        console.log('║          PHISHGUARD AI — SERVER v2.0             ║');
        console.log('║   Autonomous Defense Against Phishing            ║');
        console.log('╠══════════════════════════════════════════════════╣');
        console.log(`║  Status:  ONLINE                                 ║`);
        console.log(`║  Port:    ${String(PORT).padEnd(39)}║`);
        console.log(`║  Claude:  ${(process.env.ANTHROPIC_API_KEY ? '● ONLINE' : '○ DEMO MODE').padEnd(39)}║`);
        console.log(`║  Lyzr:    ${(lyzr.configured ? '● CONFIGURED' : '○ DEGRADED').padEnd(39)}║`);
        console.log(`║  Qdrant:  ${(qdrant.configured ? '● CONFIGURED' : '○ LOCAL CORPUS').padEnd(39)}║`);
        console.log(`║  Enkrypt: ${(enkrypt.configured ? '● CONFIGURED' : '○ LOCAL FALLBACK').padEnd(39)}║`);
        console.log('╚══════════════════════════════════════════════════╝');
        console.log('');
    });
});
//# sourceMappingURL=index.js.map