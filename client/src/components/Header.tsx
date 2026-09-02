import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="soc-panel soc-panel-glow mb-6">
      <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyber-cyan/30 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyber-cyan">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-cyber-green rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-glow-cyan">
              PHISHGUARD <span className="text-cyber-cyan">AI</span>
            </h1>
            <p className="text-xs text-slate-500 tracking-widest uppercase">
              Autonomous Defense Against Phishing
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-6">
          <StatusIndicator label="SYSTEM" status="ONLINE" color="green" />
          <StatusIndicator label="AGENT" status="ACTIVE" color="cyan" />
          <StatusIndicator label="MODE" status="SIMULATION" color="yellow" />
        </div>
      </div>
    </header>
  );
};

const StatusIndicator: React.FC<{ label: string; status: string; color: string }> = ({ label, status, color }) => {
  const dotColor = color === 'green' ? 'bg-cyber-green' : color === 'cyan' ? 'bg-cyber-cyan' : 'bg-cyber-yellow';
  const textColor = color === 'green' ? 'text-cyber-green' : color === 'cyan' ? 'text-cyber-cyan' : 'text-cyber-yellow';

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
      <div className="text-right">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{label}</p>
        <p className={`text-xs font-semibold ${textColor} tracking-wider`}>{status}</p>
      </div>
    </div>
  );
};

export default Header;
