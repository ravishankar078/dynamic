import React from 'react';

interface TrustAdjustment {
  factor: string;
  adjustment: number;
  reason: string;
  runningTotal: number;
}

interface TrustLedgerProps {
  startingTrust: number;
  trustLedger: TrustAdjustment[];
  finalTrust: number;
  riskScore: number;
}

const TrustLedger: React.FC<TrustLedgerProps> = ({ startingTrust, trustLedger, finalTrust, riskScore }) => {
  return (
    <div className="soc-panel p-6 mb-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyber-cyan">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-300">Trust Ledger</h2>
      </div>

      <div className="bg-soc-bg/50 rounded-lg border border-soc-border/50 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-soc-border/30 bg-soc-accent/20">
          <div className="col-span-3 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Factor</div>
          <div className="col-span-5 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Reason</div>
          <div className="col-span-2 text-[10px] uppercase tracking-widest text-slate-500 font-semibold text-right">Adjustment</div>
          <div className="col-span-2 text-[10px] uppercase tracking-widest text-slate-500 font-semibold text-right">Running</div>
        </div>

        {/* Starting trust */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-soc-border/20">
          <div className="col-span-3 text-xs font-semibold text-slate-300 font-mono">STARTING TRUST</div>
          <div className="col-span-5 text-xs text-slate-500">Base trust level</div>
          <div className="col-span-2 text-xs font-mono text-right text-cyber-cyan">+{startingTrust}</div>
          <div className="col-span-2 text-xs font-mono text-right text-slate-300">{startingTrust}</div>
        </div>

        {/* Adjustments */}
        {trustLedger.map((entry, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-soc-border/10 hover:bg-soc-accent/10 transition-colors"
          >
            <div className="col-span-3 text-xs font-semibold text-slate-300 font-mono truncate" title={entry.factor}>
              {entry.factor}
            </div>
            <div className="col-span-5 text-xs text-slate-500 truncate" title={entry.reason}>
              {entry.reason}
            </div>
            <div className={`col-span-2 text-xs font-mono text-right font-bold ${entry.adjustment > 0 ? 'ledger-positive' : 'ledger-negative'}`}>
              {entry.adjustment > 0 ? '+' : ''}{entry.adjustment}
            </div>
            <div className="col-span-2 text-xs font-mono text-right text-slate-400">{Math.max(0, Math.min(100, entry.runningTotal))}</div>
          </div>
        ))}

        {/* Divider */}
        <div className="px-4 py-1">
          <div className="border-t-2 border-dashed border-soc-border" />
        </div>

        {/* Finals */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-soc-border/20 bg-soc-accent/10">
          <div className="col-span-3 text-xs font-bold text-slate-200 font-mono">FINAL TRUST</div>
          <div className="col-span-5" />
          <div className="col-span-2" />
          <div className="col-span-2 text-sm font-mono text-right font-bold text-cyber-green">{finalTrust}</div>
        </div>
        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-soc-accent/20">
          <div className="col-span-3 text-xs font-bold text-slate-200 font-mono">FINAL RISK</div>
          <div className="col-span-5 text-xs text-slate-500">100 − trust = risk</div>
          <div className="col-span-2" />
          <div className={`col-span-2 text-sm font-mono text-right font-bold ${
            riskScore >= 81 ? 'text-cyber-red' : riskScore >= 61 ? 'text-cyber-orange' : riskScore >= 31 ? 'text-cyber-yellow' : 'text-cyber-green'
          }`}>
            {riskScore}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustLedger;
