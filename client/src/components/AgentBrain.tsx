import React, { useEffect, useState } from 'react';

interface AgentBrainProps {
  isAnalyzing: boolean;
  hasResult: boolean;
  activeStage?: string;
}

const AgentBrain: React.FC<AgentBrainProps> = ({ isAnalyzing, hasResult }) => {
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [activeEdges, setActiveEdges] = useState<Set<string>>(new Set());

  const nodeSequence = [
    'agent',
    'intent', 'signals', 'url',
    'evidence',
    'risk',
    'decision',
    'intervention',
  ];

  const edgeSequence = [
    'agent-intent', 'agent-signals', 'agent-url',
    'intent-evidence', 'signals-evidence', 'url-evidence',
    'evidence-risk',
    'risk-decision',
    'decision-intervention',
  ];

  useEffect(() => {
    if (!isAnalyzing && !hasResult) {
      setActiveNodes(new Set());
      setActiveEdges(new Set());
      return;
    }

    if (hasResult) {
      setActiveNodes(new Set(nodeSequence));
      setActiveEdges(new Set(edgeSequence));
      return;
    }

    // Animate sequentially during analysis
    let nodeIdx = 0;
    let edgeIdx = 0;

    const nodeTimer = setInterval(() => {
      if (nodeIdx < nodeSequence.length) {
        setActiveNodes((prev) => new Set([...prev, nodeSequence[nodeIdx]]));
        nodeIdx++;
      } else {
        clearInterval(nodeTimer);
      }
    }, 250);

    const edgeTimer = setInterval(() => {
      if (edgeIdx < edgeSequence.length) {
        setActiveEdges((prev) => new Set([...prev, edgeSequence[edgeIdx]]));
        edgeIdx++;
      } else {
        clearInterval(edgeTimer);
      }
    }, 300);

    return () => {
      clearInterval(nodeTimer);
      clearInterval(edgeTimer);
    };
  }, [isAnalyzing, hasResult]);

  if (!isAnalyzing && !hasResult) return null;

  const nodeColor = (id: string) =>
    activeNodes.has(id) ? '#00f0ff' : '#1a2236';

  const nodeGlow = (id: string) =>
    activeNodes.has(id) ? 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.6))' : 'none';

  const edgeColor = (id: string) =>
    activeEdges.has(id) ? 'rgba(0, 240, 255, 0.5)' : 'rgba(26, 34, 54, 0.5)';

  const textColor = (id: string) =>
    activeNodes.has(id) ? '#e2e8f0' : '#475569';

  return (
    <div className="soc-panel p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyber-cyan">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-300">Agent Brain</h2>
      </div>

      <svg viewBox="0 0 400 320" className="w-full max-w-lg mx-auto">
        {/* Edges */}
        <line x1="200" y1="50" x2="80" y2="120" stroke={edgeColor('agent-intent')} strokeWidth="2" className={activeEdges.has('agent-intent') ? 'flow-line' : ''} />
        <line x1="200" y1="50" x2="200" y2="120" stroke={edgeColor('agent-signals')} strokeWidth="2" className={activeEdges.has('agent-signals') ? 'flow-line' : ''} />
        <line x1="200" y1="50" x2="320" y2="120" stroke={edgeColor('agent-url')} strokeWidth="2" className={activeEdges.has('agent-url') ? 'flow-line' : ''} />

        <line x1="80" y1="140" x2="200" y2="190" stroke={edgeColor('intent-evidence')} strokeWidth="2" className={activeEdges.has('intent-evidence') ? 'flow-line' : ''} />
        <line x1="200" y1="140" x2="200" y2="190" stroke={edgeColor('signals-evidence')} strokeWidth="2" className={activeEdges.has('signals-evidence') ? 'flow-line' : ''} />
        <line x1="320" y1="140" x2="200" y2="190" stroke={edgeColor('url-evidence')} strokeWidth="2" className={activeEdges.has('url-evidence') ? 'flow-line' : ''} />

        <line x1="200" y1="210" x2="200" y2="240" stroke={edgeColor('evidence-risk')} strokeWidth="2" className={activeEdges.has('evidence-risk') ? 'flow-line' : ''} />
        <line x1="200" y1="260" x2="200" y2="278" stroke={edgeColor('risk-decision')} strokeWidth="2" className={activeEdges.has('risk-decision') ? 'flow-line' : ''} />
        <line x1="200" y1="298" x2="200" y2="305" stroke={edgeColor('decision-intervention')} strokeWidth="2" className={activeEdges.has('decision-intervention') ? 'flow-line' : ''} />

        {/* Agent node */}
        <circle cx="200" cy="35" r="18" fill={activeNodes.has('agent') ? 'rgba(0, 240, 255, 0.15)' : 'rgba(15, 21, 32, 0.8)'} stroke={nodeColor('agent')} strokeWidth="2" style={{ filter: nodeGlow('agent') }} />
        <text x="200" y="40" textAnchor="middle" fill={textColor('agent')} fontSize="8" fontWeight="700" fontFamily="Inter">AGENT</text>

        {/* Intent node */}
        <rect x="40" y="110" width="80" height="30" rx="6" fill={activeNodes.has('intent') ? 'rgba(0, 240, 255, 0.1)' : 'rgba(15, 21, 32, 0.8)'} stroke={nodeColor('intent')} strokeWidth="1.5" style={{ filter: nodeGlow('intent') }} />
        <text x="80" y="129" textAnchor="middle" fill={textColor('intent')} fontSize="8" fontWeight="600" fontFamily="Inter">INTENT</text>

        {/* Signals node */}
        <rect x="155" y="110" width="90" height="30" rx="6" fill={activeNodes.has('signals') ? 'rgba(0, 240, 255, 0.1)' : 'rgba(15, 21, 32, 0.8)'} stroke={nodeColor('signals')} strokeWidth="1.5" style={{ filter: nodeGlow('signals') }} />
        <text x="200" y="129" textAnchor="middle" fill={textColor('signals')} fontSize="8" fontWeight="600" fontFamily="Inter">SOCIAL SIGNALS</text>

        {/* URL node */}
        <rect x="280" y="110" width="80" height="30" rx="6" fill={activeNodes.has('url') ? 'rgba(0, 240, 255, 0.1)' : 'rgba(15, 21, 32, 0.8)'} stroke={nodeColor('url')} strokeWidth="1.5" style={{ filter: nodeGlow('url') }} />
        <text x="320" y="129" textAnchor="middle" fill={textColor('url')} fontSize="8" fontWeight="600" fontFamily="Inter">URL</text>

        {/* Evidence node */}
        <rect x="150" y="185" width="100" height="28" rx="6" fill={activeNodes.has('evidence') ? 'rgba(0, 255, 136, 0.1)' : 'rgba(15, 21, 32, 0.8)'} stroke={activeNodes.has('evidence') ? '#00ff88' : '#1a2236'} strokeWidth="1.5" style={{ filter: activeNodes.has('evidence') ? 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.5))' : 'none' }} />
        <text x="200" y="203" textAnchor="middle" fill={activeNodes.has('evidence') ? '#e2e8f0' : '#475569'} fontSize="8" fontWeight="600" fontFamily="Inter">EVIDENCE</text>

        {/* Risk node */}
        <rect x="155" y="238" width="90" height="25" rx="6" fill={activeNodes.has('risk') ? 'rgba(255, 136, 0, 0.1)' : 'rgba(15, 21, 32, 0.8)'} stroke={activeNodes.has('risk') ? '#ff8800' : '#1a2236'} strokeWidth="1.5" style={{ filter: activeNodes.has('risk') ? 'drop-shadow(0 0 8px rgba(255, 136, 0, 0.5))' : 'none' }} />
        <text x="200" y="254" textAnchor="middle" fill={activeNodes.has('risk') ? '#e2e8f0' : '#475569'} fontSize="8" fontWeight="600" fontFamily="Inter">RISK</text>

        {/* Decision node */}
        <rect x="155" y="275" width="90" height="25" rx="6" fill={activeNodes.has('decision') ? 'rgba(168, 85, 247, 0.1)' : 'rgba(15, 21, 32, 0.8)'} stroke={activeNodes.has('decision') ? '#a855f7' : '#1a2236'} strokeWidth="1.5" style={{ filter: activeNodes.has('decision') ? 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))' : 'none' }} />
        <text x="200" y="291" textAnchor="middle" fill={activeNodes.has('decision') ? '#e2e8f0' : '#475569'} fontSize="8" fontWeight="600" fontFamily="Inter">DECISION</text>

        {/* Intervention node */}
        <rect x="140" y="308" width="120" height="28" rx="6" fill={activeNodes.has('intervention') ? 'rgba(255, 51, 85, 0.1)' : 'rgba(15, 21, 32, 0.8)'} stroke={activeNodes.has('intervention') ? '#ff3355' : '#1a2236'} strokeWidth="2" style={{ filter: activeNodes.has('intervention') ? 'drop-shadow(0 0 8px rgba(255, 51, 85, 0.5))' : 'none' }} />
        <text x="200" y="326" textAnchor="middle" fill={activeNodes.has('intervention') ? '#e2e8f0' : '#475569'} fontSize="8" fontWeight="700" fontFamily="Inter">INTERVENTION</text>
      </svg>
    </div>
  );
};

export default AgentBrain;
