import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoMessages } from '../data/demoMessages';
import AgentTimeline from '../components/AgentTimeline';
import RiskVerdict from '../components/RiskVerdict';
import SignalCard from '../components/SignalCard';
import TrustLedger from '../components/TrustLedger';
import URLAnalysis from '../components/URLAnalysis';
import InterventionPanel from '../components/InterventionPanel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnalysisResult = any;

interface AgentStep {
  step: number;
  name: string;
  description: string;
  status: string;
  duration: number;
  timestamp: string;
  result?: string;
}

type GatewayStatus =
  | 'idle'
  | 'intercepting'
  | 'analyzing'
  | 'decision_reached';

const statusLabel: Record<GatewayStatus, { label: string; color: string; dot: string }> = {
  idle:             { label: 'GATEWAY STANDBY',     color: 'text-slate-500',    dot: 'bg-slate-600'    },
  intercepting:     { label: 'MESSAGE INTERCEPTED', color: 'text-cyber-yellow', dot: 'bg-cyber-yellow animate-pulse' },
  analyzing:        { label: 'SECURITY ANALYSIS',   color: 'text-cyber-cyan',   dot: 'bg-cyber-cyan animate-pulse'   },
  decision_reached: { label: 'DECISION REACHED',    color: 'text-cyber-green',  dot: 'bg-cyber-green'  },
};

const LiveMonitorPage: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>('idle');
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAnalyze = useCallback(async () => {
    const message = demoMessages[selectedDemo];
    setIsAnalyzing(true);
    setGatewayStatus('intercepting');
    setSteps([]);
    setResult(null);
    setError(null);

    try {
      // POST to streaming SSE endpoint
      const response = await fetch('/api/messages/incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: message.sender,
          subject: message.subject,
          body: message.body,
          links: message.links,
          employeeContext: message.employeeContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      setGatewayStatus('analyzing');

      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (currentEvent === 'step') {
                setSteps((prev) => [...prev, data]);
              } else if (currentEvent === 'result') {
                setResult(data);
                setGatewayStatus('decision_reached');
              } else if (currentEvent === 'error') {
                setError(data.message);
                setGatewayStatus('idle');
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setError((err as Error).message || 'Analysis failed');
      setGatewayStatus('idle');
      // Attempt fallback
      await handleFallbackAnalyze();
      return;
    } finally {
      setIsAnalyzing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDemo]);

  const handleFallbackAnalyze = useCallback(async () => {
    const message = demoMessages[selectedDemo];
    setIsAnalyzing(true);
    setGatewayStatus('analyzing');
    setSteps([]);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: message.sender,
          subject: message.subject,
          body: message.body,
          links: message.links,
          employeeContext: message.employeeContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setSteps(data.agentSteps || []);
      setResult(data);
      setGatewayStatus('decision_reached');
    } catch (err) {
      setError((err as Error).message || 'Analysis failed');
      setGatewayStatus('idle');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedDemo]);

  const currentDemo = demoMessages[selectedDemo];
  const statusInfo = statusLabel[gatewayStatus];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-wider text-white">LIVE MESSAGE GATEWAY</h1>
          <p className="text-xs text-slate-500 tracking-wider">
            Messages intercepted, analyzed and decided in real-time
          </p>
        </div>
        {/* Gateway status indicator */}
        <div className="flex items-center gap-2 soc-panel px-4 py-2">
          <div className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
          <span className={`text-[11px] font-bold tracking-widest ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Incoming Message Panel ── */}
        <div className="space-y-4">
          <div className="soc-panel p-5">
            {/* Gateway framing */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
              <h2 className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                Simulate Incoming Message
              </h2>
            </div>

            {/* Scenario selector */}
            <select
              value={selectedDemo}
              onChange={(e) => {
                setSelectedDemo(Number(e.target.value));
                setSteps([]);
                setResult(null);
                setError(null);
                setGatewayStatus('idle');
              }}
              className="select-cyber w-full mb-3"
              disabled={isAnalyzing}
            >
              {demoMessages.map((msg, i) => (
                <option key={msg.id} value={i}>{msg.label}</option>
              ))}
            </select>

            {/* Message preview */}
            <div className="bg-soc-bg/50 rounded-lg p-3 mb-4 border border-soc-border/50 max-h-44 overflow-y-auto">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1 h-1 rounded-full bg-cyber-red" />
                <p className="text-[10px] text-slate-500">
                  From: <span className="text-slate-400 font-mono">{currentDemo.sender}</span>
                </p>
              </div>
              <p className="text-[10px] text-slate-500 mb-2">
                Subject: <span className="text-slate-300 font-semibold">{currentDemo.subject}</span>
              </p>
              <p className="text-[11px] text-slate-500 whitespace-pre-wrap leading-relaxed border-t border-soc-border/30 pt-2 mt-2">
                {currentDemo.body.substring(0, 280)}
                {currentDemo.body.length > 280 && (
                  <span className="text-slate-600">…</span>
                )}
              </p>
            </div>

            {/* Intercept button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full btn-cyber text-xs py-3 font-bold tracking-widest"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  ANALYZING...
                </span>
              ) : '⚡ INTERCEPT & ANALYZE'}
            </button>
          </div>

          {/* Expected results */}
          <div className="soc-panel p-4">
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-semibold">
              Expected Result
            </h2>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500">Risk Level</span>
                <span className={`text-[10px] font-bold ${
                  currentDemo.expectedRisk === 'LOW' ? 'text-cyber-green' :
                  currentDemo.expectedRisk === 'MEDIUM' ? 'text-cyber-yellow' :
                  'text-cyber-red'
                }`}>{currentDemo.expectedRisk}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500">Intent</span>
                <span className="text-[10px] text-slate-300 font-mono">{currentDemo.expectedIntent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500">Action</span>
                <span className={`text-[10px] font-bold ${
                  currentDemo.expectedAction === 'ALLOW' ? 'text-cyber-green' : 'text-cyber-red'
                }`}>{currentDemo.expectedAction}</span>
              </div>
            </div>
          </div>

          {/* Lyzr tool plan display */}
          {result?.lyzrOrchestration?.tools?.length > 0 && (
            <div className="soc-panel p-4">
              <h2 className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-semibold">
                Lyzr Tool Plan
              </h2>
              <p className="text-[10px] text-slate-600 mb-2 font-mono">
                Source: <span className={result.lyzrOrchestration.source === 'lyzr' ? 'text-cyber-cyan' : 'text-cyber-yellow'}>
                  {result.lyzrOrchestration.source === 'lyzr' ? 'LYZR AGENT' : 'LOCAL FALLBACK'}
                </span>
              </p>
              <div className="space-y-1">
                {result.lyzrOrchestration.tools.map((tool: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="text-cyber-cyan font-mono">{i + 1}.</span>
                    <span className="font-mono">{tool}</span>
                  </div>
                ))}
              </div>
              {result.lyzrOrchestration.reasoning && (
                <p className="text-[10px] text-slate-600 mt-2 italic">
                  {result.lyzrOrchestration.reasoning}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Real-time Investigation Panel ── */}
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="soc-panel p-4 border border-cyber-red/20 bg-cyber-red/5">
              <p className="text-xs text-cyber-red font-mono">{error}</p>
            </div>
          )}

          {/* Agent Investigation Timeline */}
          <AgentTimeline steps={steps} isAnalyzing={isAnalyzing} />

          {/* Decision Results */}
          {result && (
            <>
              {/* Threat intercepted banner */}
              {(result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL') && (
                <div className="soc-panel p-4 border border-cyber-red/30 bg-cyber-red/5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🚨</span>
                    <span className="text-sm font-bold text-cyber-red tracking-wider">
                      THREAT INTERCEPTED
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest">Risk</p>
                      <p className="text-xl font-bold font-mono text-cyber-red">{result.riskScore}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest">Intent</p>
                      <p className="text-[10px] font-bold text-slate-300 font-mono">
                        {result.detectedIntent.replace(/_/g, '_\n')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest">Action</p>
                      <p className="text-sm font-bold text-cyber-red">{result.intervention?.action}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest">Employee</p>
                      <p className="text-[10px] font-bold text-cyber-green">PROTECTED</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Full evidence panels */}
              <RiskVerdict
                riskScore={result.riskScore}
                riskLevel={result.riskLevel}
                detectedIntent={result.detectedIntent}
                intentReason={result.intentReason}
                confidence={result.confidence}
                reasoning={result.reasoning}
                adversarialCheck={result.adversarialCheck}
              />
              <SignalCard signals={result.signals?.signals || []} />
              <TrustLedger
                startingTrust={result.trustLedger?.startingTrust || 50}
                trustLedger={result.trustLedger?.trustLedger || []}
                finalTrust={result.trustLedger?.finalTrust || 50}
                riskScore={result.riskScore}
              />
              <URLAnalysis
                urlAnalysis={result.urlAnalysis}
                contextAnalysis={result.contextAnalysis}
                promptInjection={result.promptInjection}
              />
              <InterventionPanel
                intervention={result.intervention}
                safeAlternativeAction={result.safeAlternativeAction}
                whatWouldHappenIfClicked={result.whatWouldHappenIfClicked}
              />
              {result.incidentId && (
                <div className="soc-panel p-4 text-center">
                  <button
                    onClick={() => navigate(`/incidents/${result.incidentId}`)}
                    className="btn-cyber text-xs py-2 px-6"
                  >
                    VIEW FULL INCIDENT REPORT → {result.incidentId}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Idle state */}
          {!result && !isAnalyzing && !error && (
            <div className="soc-panel p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyber-cyan/50">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-400 mb-1">Gateway Standby</h3>
              <p className="text-xs text-slate-600 max-w-xs">
                Select a demo scenario and click <span className="text-cyber-cyan">"INTERCEPT & ANALYZE"</span> to
                route a message through the security gateway.
              </p>
              <div className="mt-4 flex items-center gap-4 text-[10px] text-slate-700">
                <span>📩 INBOUND MESSAGE</span>
                <span>→</span>
                <span>🛡️ INTERCEPTED</span>
                <span>→</span>
                <span>🤖 ANALYZED</span>
                <span>→</span>
                <span>⚡ DECIDED</span>
              </div>
            </div>
          )}

          {/* Analyzing state */}
          {isAnalyzing && !result && steps.length === 0 && (
            <div className="soc-panel p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyber-yellow/10 border border-cyber-yellow/20 flex items-center justify-center mb-4 animate-pulse">
                <svg className="w-8 h-8 text-cyber-yellow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-cyber-yellow tracking-widest mb-1">
                MESSAGE INTERCEPTED
              </h3>
              <p className="text-xs text-slate-500">Routing through security gateway...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMonitorPage;
