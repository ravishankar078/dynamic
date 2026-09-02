import React, { useEffect, useState } from 'react';

interface ThreatPattern {
  category: string;
  description: string;
  severity: string;
  intent: string;
  signals: string[];
  relatedIncidents: number;
}

const ThreatMemoryPage: React.FC = () => {
  const [patterns, setPatterns] = useState<ThreatPattern[]>([]);
  const [qdrantStatus, setQdrantStatus] = useState<string>('CHECKING');

  useEffect(() => {
    // Fetch threat memory data
    const fetchData = async () => {
      try {
        const healthRes = await fetch('/api/system/health');
        if (healthRes.ok) {
          const health = await healthRes.json();
          setQdrantStatus(health.services.qdrant.status);
        }
      } catch { /* ignore */ }

      // Get patterns from incidents
      try {
        const incRes = await fetch('/api/incidents');
        if (incRes.ok) {
          const data = await incRes.json();
          const patternMap = new Map<string, ThreatPattern>();

          for (const inc of data.incidents) {
            const key = inc.detectedIntent;
            const existing = patternMap.get(key);
            if (existing) {
              existing.relatedIncidents++;
            } else {
              patternMap.set(key, {
                category: inc.detectedIntent.replace(/_/g, ' '),
                description: `${inc.riskLevel} threat detected with intent: ${inc.detectedIntent}`,
                severity: inc.riskLevel,
                intent: inc.detectedIntent,
                signals: [],
                relatedIncidents: 1,
              });
            }
          }

          setPatterns(Array.from(patternMap.values()));
        }
      } catch { /* ignore */ }
    };

    fetchData();
  }, []);

  // Built-in threat intelligence library (always available)
  const builtInPatterns = [
    { category: 'Credential Harvesting', description: 'Fake password reset or account verification requesting credentials', severity: 'CRITICAL', intent: 'ENTER_PASSWORD', signals: ['urgency', 'fear', 'credential_request'], relatedIncidents: 12 },
    { category: 'CEO Gift Card Scam', description: 'Executive impersonation requesting purchase of gift cards', severity: 'CRITICAL', intent: 'SEND_MONEY', signals: ['authority_pressure', 'urgency', 'secrecy', 'financial_request'], relatedIncidents: 8 },
    { category: 'Account Suspension', description: 'Fake account suspension notice creating urgency and fear', severity: 'CRITICAL', intent: 'CLICK_LINK', signals: ['urgency', 'fear', 'authority_pressure'], relatedIncidents: 15 },
    { category: 'Login Verification', description: 'Fake login alert requesting verification via suspicious link', severity: 'HIGH', intent: 'CLICK_LINK', signals: ['urgency', 'fear', 'credential_request'], relatedIncidents: 10 },
    { category: 'Prompt Injection', description: 'Message attempting to manipulate AI security analysis', severity: 'CRITICAL', intent: 'PROMPT_INJECTION', signals: ['prompt_injection'], relatedIncidents: 3 },
    { category: 'Fake Invoice', description: 'Fraudulent invoice or payment request from unknown vendor', severity: 'HIGH', intent: 'SEND_MONEY', signals: ['urgency', 'financial_request', 'authority_pressure'], relatedIncidents: 7 },
    { category: 'Domain Impersonation', description: 'Email from lookalike domain impersonating trusted organization', severity: 'CRITICAL', intent: 'ENTER_PASSWORD', signals: ['identity_mismatch', 'credential_request'], relatedIncidents: 9 },
    { category: 'Document Sharing', description: 'Fake shared document link leading to credential harvesting', severity: 'HIGH', intent: 'CLICK_LINK', signals: ['credential_request', 'urgency'], relatedIncidents: 6 },
  ];

  const allPatterns = [...builtInPatterns, ...patterns.filter((p) => !builtInPatterns.some((b) => b.intent === p.intent))];

  const severityColor = (s: string) => {
    switch (s) { case 'CRITICAL': return 'text-cyber-red border-cyber-red/20 bg-cyber-red/5'; case 'HIGH': return 'text-cyber-orange border-cyber-orange/20 bg-cyber-orange/5'; default: return 'text-cyber-yellow border-cyber-yellow/20 bg-cyber-yellow/5'; }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-wider text-white">THREAT MEMORY</h1>
          <p className="text-xs text-slate-500 tracking-wider">Known attack patterns and threat intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${qdrantStatus === 'ONLINE' ? 'bg-cyber-green animate-pulse' : qdrantStatus === 'NOT_CONFIGURED' ? 'bg-cyber-yellow' : 'bg-cyber-red'}`} />
          <span className="text-[10px] text-slate-500 tracking-wider">QDRANT: {qdrantStatus === 'ONLINE' ? 'ONLINE' : qdrantStatus === 'NOT_CONFIGURED' ? 'LOCAL CORPUS' : qdrantStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allPatterns.map((pattern, i) => (
          <div key={i} className={`soc-panel p-5 border-l-4 ${severityColor(pattern.severity)} hover:bg-soc-accent/10 transition-colors`}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-200">{pattern.category}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${severityColor(pattern.severity)}`}>
                {pattern.severity}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">{pattern.description}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Intent</span>
                <span className="text-slate-300 font-mono">{pattern.intent}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Related Incidents</span>
                <span className="text-cyber-cyan font-mono">{pattern.relatedIncidents}</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {pattern.signals.map((s, si) => (
                <span key={si} className="text-[9px] px-1.5 py-0.5 rounded bg-soc-accent/50 text-slate-400">
                  {s.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreatMemoryPage;
