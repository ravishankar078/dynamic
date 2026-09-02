import React, { useEffect, useState } from 'react';

interface AgentStep {
  step: number;
  name: string;
  description: string;
  status: string;
  duration: number;
  timestamp: string;
}

interface AgentTimelineProps {
  steps: AgentStep[];
  isAnalyzing: boolean;
}

const PIPELINE_STAGES = [
  'OBSERVE', 'PROTECT', 'REASON', 'INVESTIGATE', 'CORRELATE', 'SCORE', 'CHALLENGE', 'DECIDE', 'INTERVENE',
];

const STEP_TO_STAGE: Record<string, string> = {
  'Message Received': 'OBSERVE',
  'Prompt Injection Scan': 'PROTECT',
  'Intent Analysis': 'REASON',
  'Manipulation Analysis': 'REASON',
  'URL Investigation': 'INVESTIGATE',
  'Context Analysis': 'INVESTIGATE',
  'Threat Memory Search': 'CORRELATE',
  'Evidence Fusion': 'CORRELATE',
  'Benignity Challenge': 'CHALLENGE',
  'Risk Calculation': 'SCORE',
  'Decision Made': 'DECIDE',
  'Intervention Applied': 'INTERVENE',
};

const AgentTimeline: React.FC<AgentTimelineProps> = ({ steps, isAnalyzing }) => {
  const [visibleSteps, setVisibleSteps] = useState<number>(0);

  useEffect(() => {
    if (steps.length > 0 && visibleSteps < steps.length) {
      const timer = setTimeout(() => {
        setVisibleSteps((prev) => prev + 1);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [steps.length, visibleSteps]);

  useEffect(() => {
    if (steps.length === 0) setVisibleSteps(0);
  }, [steps.length]);

  // Determine which stages are complete
  const completedStages = new Set<string>();
  for (const step of steps.slice(0, visibleSteps)) {
    const stage = STEP_TO_STAGE[step.name];
    if (stage) completedStages.add(stage);
  }

  if (steps.length === 0 && !isAnalyzing) return null;

  return (
    <div className="soc-panel p-6 mb-6 scanline">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-cyber-purple/10 border border-cyber-purple/20 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyber-purple">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-300">Security Agent Investigation</h2>
        {isAnalyzing && (
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-ping" />
            <span className="text-xs text-cyber-cyan tracking-wider">PROCESSING</span>
          </div>
        )}
      </div>

      {/* Pipeline stages */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PIPELINE_STAGES.map((stage) => {
          const isComplete = completedStages.has(stage);
          return (
            <div
              key={stage}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-all duration-500 ${
                isComplete
                  ? 'bg-cyber-green/10 border border-cyber-green/30 text-cyber-green'
                  : 'bg-soc-bg/50 border border-soc-border text-slate-500'
              }`}
            >
              {isComplete ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <div className="w-3 h-3 rounded-full border border-slate-600" />
              )}
              {stage}
            </div>
          );
        })}
      </div>

      {/* Detailed steps */}
      <div className="space-y-2">
        {steps.slice(0, visibleSteps).map((step, i) => (
          <div
            key={i}
            className="step-reveal flex items-start gap-3 px-3 py-2.5 rounded-lg bg-soc-bg/30 border border-soc-border/30"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex-shrink-0 mt-0.5">
              {step.status === 'completed' ? (
                <div className="w-5 h-5 rounded-full bg-cyber-green/20 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyber-green" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-cyber-red/20 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyber-red" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200">{step.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{step.description}</p>
            </div>
            <span className="text-[10px] text-slate-600 font-mono flex-shrink-0">{step.duration}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentTimeline;
