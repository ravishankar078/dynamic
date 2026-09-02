import React from 'react';

interface InterventionPanelProps {
  intervention: {
    action: string;
    severity: string;
    title: string;
    description: string;
    recommendedSteps: string[];
  };
  safeAlternativeAction: string;
  whatWouldHappenIfClicked: string;
}

const ACTION_STYLES: Record<string, { bg: string; border: string; text: string; glow: string; icon: string }> = {
  ALLOW: {
    bg: 'bg-cyber-green/5',
    border: 'border-cyber-green/30',
    text: 'text-cyber-green',
    glow: 'glow-green',
    icon: '✓',
  },
  WARN: {
    bg: 'bg-cyber-yellow/5',
    border: 'border-cyber-yellow/30',
    text: 'text-cyber-yellow',
    glow: 'glow-yellow',
    icon: '⚡',
  },
  QUARANTINE: {
    bg: 'bg-cyber-orange/5',
    border: 'border-cyber-orange/30',
    text: 'text-cyber-orange',
    glow: 'glow-orange',
    icon: '🔒',
  },
  BLOCK: {
    bg: 'bg-cyber-red/5',
    border: 'border-cyber-red/30',
    text: 'text-cyber-red',
    glow: 'glow-red',
    icon: '🛑',
  },
};

const InterventionPanel: React.FC<InterventionPanelProps> = ({
  intervention,
  safeAlternativeAction,
  whatWouldHappenIfClicked,
}) => {
  const styles = ACTION_STYLES[intervention.action] || ACTION_STYLES.WARN;

  return (
    <div className="space-y-6 mb-6 animate-slide-up">
      {/* Main intervention */}
      <div className={`soc-panel p-6 ${styles.bg} ${styles.border} border-2 ${styles.glow}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{styles.icon}</span>
          <div>
            <h2 className={`text-lg font-bold tracking-wider ${styles.text}`}>
              {intervention.action}
            </h2>
            <p className="text-xs text-slate-400">{intervention.title}</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">{intervention.description}</p>

        {/* Recommended steps */}
        {intervention.recommendedSteps.length > 0 && (
          <div className="bg-soc-bg/30 rounded-lg p-3 border border-soc-border/30">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Recommended Steps</p>
            <ul className="space-y-1.5">
              {intervention.recommendedSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`text-xs mt-0.5 ${styles.text}`}>▸</span>
                  <span className="text-xs text-slate-400">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What would happen */}
        <div className="soc-panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyber-orange">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
            <p className="text-[10px] uppercase tracking-widest text-cyber-orange font-semibold">What Would Happen if I Comply?</p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{whatWouldHappenIfClicked}</p>
        </div>

        {/* Safe alternative */}
        <div className="soc-panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyber-green">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <p className="text-[10px] uppercase tracking-widest text-cyber-green font-semibold">Safe Alternative Action</p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{safeAlternativeAction}</p>
        </div>
      </div>
    </div>
  );
};

export default InterventionPanel;
