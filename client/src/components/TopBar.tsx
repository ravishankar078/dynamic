import React, { useEffect, useState } from 'react';

interface ServiceStatus {
  status: 'ONLINE' | 'OFFLINE' | 'NOT_CONFIGURED';
  details?: string;
}

interface SystemHealth {
  services: {
    lyzr: ServiceStatus;
    qdrant: ServiceStatus;
    enkrypt: ServiceStatus;
    claude: ServiceStatus;
  };
}

interface TopBarProps {
  alertCount: number;
}

const TopBar: React.FC<TopBarProps> = ({ alertCount }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/system/health');
        if (res.ok) setHealth(await res.json());
      } catch { /* ignore */ }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ONLINE': return 'bg-cyber-green';
      case 'NOT_CONFIGURED': return 'bg-cyber-yellow';
      default: return 'bg-cyber-red';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'ONLINE': return 'ONLINE';
      case 'NOT_CONFIGURED': return 'DEGRADED';
      default: return 'OFFLINE';
    }
  };

  const services = [
    { name: 'LYZR', status: health?.services.lyzr?.status },
    { name: 'QDRANT', status: health?.services.qdrant?.status },
    { name: 'ENKRYPT', status: health?.services.enkrypt?.status },
    { name: 'CLAUDE', status: health?.services.claude?.status },
  ];

  return (
    <header className="h-12 bg-[#080c14] border-b border-soc-border flex items-center justify-between px-6 fixed top-0 left-60 right-0 z-40">
      {/* Service status badges */}
      <div className="flex items-center gap-4">
        {services.map((svc) => (
          <div key={svc.name} className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(svc.status)} ${svc.status === 'ONLINE' ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-semibold text-slate-500 tracking-wider">{svc.name}</span>
            <span className={`text-[10px] tracking-wider ${
              svc.status === 'ONLINE' ? 'text-cyber-green' : svc.status === 'NOT_CONFIGURED' ? 'text-cyber-yellow' : 'text-cyber-red'
            }`}>
              {getStatusLabel(svc.status)}
            </span>
          </div>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Alert badge */}
        <div className="relative">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {alertCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-cyber-red rounded-full flex items-center justify-center text-[9px] font-bold text-white animate-pulse">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </div>

        <div className="text-[10px] text-slate-600 tracking-widest">
          SIMULATION MODE
        </div>
      </div>
    </header>
  );
};

export default TopBar;
