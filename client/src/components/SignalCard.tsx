import React from 'react';

interface Signal {
  signal: string;
  severity: string;
  evidence: string;
  description: string;
}

interface SignalCardProps {
  signals: Signal[];
}

const SEVERITY_STYLES: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  critical: { border: 'border-cyber-red/30', bg: 'bg-cyber-red/5', text: 'text-cyber-red', dot: 'bg-cyber-red' },
  high: { border: 'border-cyber-orange/30', bg: 'bg-cyber-orange/5', text: 'text-cyber-orange', dot: 'bg-cyber-orange' },
  medium: { border: 'border-cyber-yellow/30', bg: 'bg-cyber-yellow/5', text: 'text-cyber-yellow', dot: 'bg-cyber-yellow' },
  low: { border: 'border-slate-600/30', bg: 'bg-slate-600/5', text: 'text-slate-400', dot: 'bg-slate-400' },
};

const SignalCard: React.FC<SignalCardProps> = ({ signals }) => {
  if (!signals || signals.length === 0) {
    return (
      <div className="soc-panel p-6 mb-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyber-green/10 border border-cyber-green/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyber-green">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-300">Manipulation Signals</h2>
        </div>
        <p className="text-sm text-cyber-green">No manipulation signals detected.</p>
      </div>
    );
  }

  return (
    <div className="soc-panel p-6 mb-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyber-orange/10 border border-cyber-orange/20 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyber-orange">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-300">
          Manipulation Signals <span className="text-cyber-orange">({signals.length})</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {signals.map((signal, i) => {
          const styles = SEVERITY_STYLES[signal.severity] || SEVERITY_STYLES.medium;
          return (
            <div
              key={i}
              className={`${styles.bg} ${styles.border} border rounded-lg p-3.5 animate-fade-in`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${styles.text}`}>
                  {signal.signal.replace(/_/g, ' ')}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${styles.bg} ${styles.text} border ${styles.border} ml-auto`}>
                  {signal.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{signal.description}</p>
              <div className="bg-soc-bg/50 rounded px-2.5 py-1.5">
                <p className="text-[11px] text-slate-500 font-mono leading-relaxed">{signal.evidence}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SignalCard;
