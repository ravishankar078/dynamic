// ─── index.ts ────────────────────────────────────────────────────────
// PhishGuard AI Server — Express entry point with all integrations

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import analyzeRouter from './routes/analyze';
import authRouter from './routes/auth';
import systemRouter from './routes/system';
import incidentsRouter from './routes/incidents';
import eventsRouter from './routes/events';
import messagesRouter from './routes/messages';
import * as qdrantService from './services/qdrantService';
import * as enkryptService from './services/enkryptService';
import * as lyzrService from './services/lyzrService';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Session middleware
app.use(session({
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
app.use('/api', analyzeRouter);
app.use('/api/auth', authRouter);
app.use('/api/system', systemRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/messages', messagesRouter);

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
