import React from 'react';

interface URLFinding {
  type: string;
  severity: string;
  detail: string;
}

interface SingleURL {
  originalURL: string;
  hostname: string;
  isIPAddress: boolean;
  isShortener: boolean;
  hasHomoglyph: boolean;
  domainMismatch: boolean;
  claimedBrand: string | null;
  suspiciousKeywords: string[];
  findings: URLFinding[];
  riskLevel: string;
}

interface URLAnalysisProps {
  urlAnalysis: {
    urls: SingleURL[];
    overallURLRisk: string;
    hasURLs: boolean;
  };
  contextAnalysis: {
    senderKnown: boolean;
    senderRelationship: string;
    anomalies: string[];
    contextVerdict: string;
    explanation: string;
  };
  promptInjection: {
    detected: boolean;
    severity: string;
    matchedPatterns: string[];
    explanation: string;
  };
}

const URLAnalysis: React.FC<URLAnalysisProps> = ({ urlAnalysis, contextAnalysis, promptInjection }) => {
  return (
    <div className="soc-panel p-6 mb-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyber-purple/10 border border-cyber-purple/20 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyber-purple">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-300">Investigation Details</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* URL Analysis */}
        <div className="bg-soc-bg/50 rounded-lg p-4 border border-soc-border/50">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">URL / Link Analysis</p>
          {!urlAnalysis.hasURLs ? (
            <p className="text-sm text-slate-500">No URLs found in the message.</p>
          ) : (
            <div className="space-y-3">
              {urlAnalysis.urls.map((url, i) => (
                <div key={i} className="border border-soc-border/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${
                      url.riskLevel === 'dangerous' ? 'bg-cyber-red' : url.riskLevel === 'suspicious' ? 'bg-cyber-orange' : 'bg-cyber-green'
                    }`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      url.riskLevel === 'dangerous' ? 'text-cyber-red' : url.riskLevel === 'suspicious' ? 'text-cyber-orange' : 'text-cyber-green'
                    }`}>
                      {url.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400 break-all mb-2">{url.originalURL}</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-soc-accent/50 text-slate-400">
                      Host: <span className="text-cyber-cyan">{url.hostname}</span>
                    </span>
                    {url.isIPAddress && <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-red/10 text-cyber-red">IP Address</span>}
                    {url.isShortener && <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-orange/10 text-cyber-orange">Shortener</span>}
                    {url.hasHomoglyph && <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-red/10 text-cyber-red">Homoglyph</span>}
                    {url.domainMismatch && <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-red/10 text-cyber-red">Domain Mismatch</span>}
                    {url.claimedBrand && <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-yellow/10 text-cyber-yellow">Claims: {url.claimedBrand}</span>}
                  </div>
                  {url.findings.length > 0 && (
                    <div className="space-y-1">
                      {url.findings.map((finding, fi) => (
                        <p key={fi} className={`text-[11px] ${
                          finding.severity === 'danger' ? 'text-cyber-red' : finding.severity === 'warning' ? 'text-cyber-orange' : 'text-slate-500'
                        }`}>
                          {finding.severity === 'danger' ? '⚠ ' : finding.severity === 'warning' ? '⚡ ' : 'ℹ '}
                          {finding.detail}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Context & Prompt Injection */}
        <div className="space-y-4">
          {/* Context Analysis */}
          <div className="bg-soc-bg/50 rounded-lg p-4 border border-soc-border/50">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">Sender / Context Analysis</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  contextAnalysis.senderKnown ? 'bg-cyber-green' : 'bg-cyber-orange'
                }`} />
                <span className="text-xs text-slate-400">
                  Sender: <span className={contextAnalysis.senderKnown ? 'text-cyber-green' : 'text-cyber-orange'}>
                    {contextAnalysis.senderRelationship.toUpperCase()}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  contextAnalysis.contextVerdict === 'NORMAL' ? 'bg-cyber-green' :
                  contextAnalysis.contextVerdict === 'SUSPICIOUS' ? 'bg-cyber-red' : 'bg-cyber-yellow'
                }`} />
                <span className="text-xs text-slate-400">
                  Verdict: <span className={
                    contextAnalysis.contextVerdict === 'NORMAL' ? 'text-cyber-green' :
                    contextAnalysis.contextVerdict === 'SUSPICIOUS' ? 'text-cyber-red' : 'text-cyber-yellow'
                  }>
                    {contextAnalysis.contextVerdict}
                  </span>
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{contextAnalysis.explanation}</p>
            {contextAnalysis.anomalies.length > 0 && (
              <div className="mt-2 space-y-1">
                {contextAnalysis.anomalies.map((a, i) => (
                  <p key={i} className="text-[11px] text-cyber-orange">⚠ {a}</p>
                ))}
              </div>
            )}
          </div>

          {/* Prompt Injection */}
          {promptInjection.detected && (
            <div className="bg-cyber-red/5 rounded-lg p-4 border border-cyber-red/30 glow-red">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyber-red">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span className="text-xs font-bold text-cyber-red tracking-wider uppercase">
                  AI Security Attack Detected
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                The message attempted to manipulate PhishGuard's AI analysis. The attack was detected and had NO effect.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {promptInjection.matchedPatterns.map((pattern, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-cyber-red/10 text-cyber-red border border-cyber-red/20 font-mono">
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default URLAnalysis;
