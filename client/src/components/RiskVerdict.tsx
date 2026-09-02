import React, { useEffect, useState } from 'react';

interface RiskVerdictProps {
  riskScore: number;
  riskLevel: string;
  detectedIntent: string;
  intentReason: string;
  confidence: number;
  reasoning: string;
  adversarialCheck: {
    strongestBenignExplanation: string;
    changesAssessment: boolean;
    reasoning: string;
  };
}

const RISK_COLORS: Record<string, { text: string; bg: string; glow: string; ring: string }> = {
  LOW: { text: 'text-cyber-green', bg: 'bg-cyber-green/10', glow: 'glow-green', ring: '#00ff88' },
  MEDIUM: { text: 'text-cyber-yellow', bg: 'bg-cyber-yellow/10', glow: 'glow-yellow', ring: '#ffcc00' },
  HIGH: { text: 'text-cyber-orange', bg: 'bg-cyber-orange/10', glow: 'glow-orange', ring: '#ff8800' },
  CRITICAL: { text: 'text-cyber-red', bg: 'bg-cyber-red/10', glow: 'glow-red', ring: '#ff3355' },
};

const RiskVerdict: React.FC<RiskVerdictProps> = ({
  riskScore,
  riskLevel,
  detectedIntent,
  intentReason,
  confidence,
  reasoning,
  adversarialCheck,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const colors = RISK_COLORS[riskLevel] || RISK_COLORS.MEDIUM;

  useEffect(() => {
    let start = 0;
    const end = riskScore;
    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * end);
      setAnimatedScore(start);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [riskScore]);

  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="soc-panel p-6 mb-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-8 h-8 rounded-lg ${colors.bg} border border-current flex items-center justify-center ${colors.text}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-300">Security Verdict</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Risk Score Ring */}
        <div className="flex flex-col items-center">
          <div className="risk-ring mb-3">
            <svg width="140" height="140">
              <circle cx="70" cy="70" r="56" fill="none" stroke="#1a2236" strokeWidth="8" />
              <circle
                cx="70" cy="70" r="56"
                fill="none"
                stroke={colors.ring}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="risk-ring-circle"
                style={{ filter: `drop-shadow(0 0 6px ${colors.ring}40)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold font-mono ${colors.text}`}>{animatedScore}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Risk Score</span>
            </div>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest ${colors.bg} ${colors.text} border border-current/20 ${colors.glow}`}>
            {riskLevel}
          </div>
        </div>

        {/* Intent */}
        <div className="flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Detected Intent</p>
          <p className="text-lg font-bold font-mono text-cyber-cyan mb-2">{detectedIntent.replace(/_/g, ' ')}</p>
          <p className="text-xs text-slate-400 leading-relaxed">{intentReason}</p>
        </div>

        {/* Confidence */}
        <div className="flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Confidence</p>
          <p className="text-2xl font-bold font-mono text-slate-200 mb-2">{Math.round(confidence * 100)}%</p>
          <div className="w-full bg-soc-border rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyber-cyan to-cyber-green transition-all duration-1000"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="bg-soc-bg/50 rounded-lg p-4 mb-4 border border-soc-border/50">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Why PhishGuard Thinks This</p>
        <p className="text-sm text-slate-300 leading-relaxed">{reasoning}</p>
      </div>

      {/* Benignity Check */}
      <div className="bg-soc-bg/50 rounded-lg p-4 border border-soc-border/50">
        <p className="text-[10px] uppercase tracking-widest text-cyber-yellow mb-2">⚖ Benignity Challenge</p>
        <p className="text-sm text-slate-400 leading-relaxed mb-2">{adversarialCheck.strongestBenignExplanation}</p>
        <p className="text-xs text-slate-500 italic">{adversarialCheck.reasoning}</p>
      </div>
    </div>
  );
};

export default RiskVerdict;
