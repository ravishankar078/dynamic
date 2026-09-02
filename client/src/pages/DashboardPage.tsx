import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Stats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  blocked: number;
  warned: number;
  allowed: number;
  quarantined: number;
  falsePositives: number;
}

interface IncidentSummary {
  incidentId: string;
  timestamp: string;
  sender: string;
  subject: string;
  riskScore: number;
  riskLevel: string;
  detectedIntent: string;
  intervention: string;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/incidents');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setIncidents(data.incidents.slice(0, 10));
        }
      } catch { /* ignore */ }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const riskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-cyber-red';
      case 'HIGH': return 'text-cyber-orange';
      case 'MEDIUM': return 'text-cyber-yellow';
      default: return 'text-cyber-green';
    }
  };

  const actionColor = (action: string) => {
    switch (action) {
      case 'BLOCK': return 'bg-cyber-red/10 text-cyber-red border-cyber-red/20';
      case 'QUARANTINE': return 'bg-cyber-orange/10 text-cyber-orange border-cyber-orange/20';
      case 'WARN': return 'bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/20';
      default: return 'bg-cyber-green/10 text-cyber-green border-cyber-green/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-wider text-white">SECURITY DASHBOARD</h1>
          <p className="text-xs text-slate-500 tracking-wider">Threat overview and system status</p>
        </div>
        <button onClick={() => navigate('/monitor')} className="btn-cyber text-xs py-2 px-4">
          OPEN LIVE MONITOR →
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <StatCard label="Total Analyzed" value={stats?.total || 0} color="text-cyber-cyan" />
        <StatCard label="Critical" value={stats?.critical || 0} color="text-cyber-red" />
        <StatCard label="Blocked" value={stats?.blocked || 0} color="text-cyber-red" />
        <StatCard label="Warnings" value={stats?.warned || 0} color="text-cyber-yellow" />
        <StatCard label="Allowed" value={stats?.allowed || 0} color="text-cyber-green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Distribution */}
        <div className="soc-panel p-5">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 font-semibold">Threat Distribution</h2>
          <div className="space-y-3">
            <DistBar label="CRITICAL" count={stats?.critical || 0} total={stats?.total || 1} color="bg-cyber-red" />
            <DistBar label="HIGH" count={stats?.high || 0} total={stats?.total || 1} color="bg-cyber-orange" />
            <DistBar label="MEDIUM" count={stats?.medium || 0} total={stats?.total || 1} color="bg-cyber-yellow" />
            <DistBar label="LOW" count={stats?.low || 0} total={stats?.total || 1} color="bg-cyber-green" />
          </div>
        </div>

        {/* System Health */}
        <div className="soc-panel p-5">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 font-semibold">System Health</h2>
          <SystemHealthCards />
        </div>

        {/* Quick Actions */}
        <div className="soc-panel p-5">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <button onClick={() => navigate('/monitor')} className="w-full text-left px-3 py-2.5 rounded-lg bg-soc-accent/30 hover:bg-soc-accent/60 transition-colors text-xs text-slate-300 flex items-center gap-2">
              <span className="text-cyber-cyan">▶</span> Simulate Incoming Message
            </button>
            <button onClick={() => navigate('/incidents')} className="w-full text-left px-3 py-2.5 rounded-lg bg-soc-accent/30 hover:bg-soc-accent/60 transition-colors text-xs text-slate-300 flex items-center gap-2">
              <span className="text-cyber-orange">📋</span> View All Incidents
            </button>
            <button onClick={() => navigate('/threat-memory')} className="w-full text-left px-3 py-2.5 rounded-lg bg-soc-accent/30 hover:bg-soc-accent/60 transition-colors text-xs text-slate-300 flex items-center gap-2">
              <span className="text-cyber-purple">🧠</span> Browse Threat Memory
            </button>
            <button onClick={() => navigate('/architecture')} className="w-full text-left px-3 py-2.5 rounded-lg bg-soc-accent/30 hover:bg-soc-accent/60 transition-colors text-xs text-slate-300 flex items-center gap-2">
              <span className="text-cyber-green">📐</span> View Architecture
            </button>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="soc-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Recent Incidents</h2>
          <button onClick={() => navigate('/incidents')} className="text-[10px] text-cyber-cyan hover:underline tracking-wider">VIEW ALL →</button>
        </div>

        {incidents.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-8">No incidents yet. Use the Live Monitor to simulate incoming messages.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-soc-border">
                  <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest py-2 px-2">ID</th>
                  <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest py-2 px-2">Subject</th>
                  <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest py-2 px-2">Risk</th>
                  <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest py-2 px-2">Intent</th>
                  <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest py-2 px-2">Action</th>
                  <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest py-2 px-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr
                    key={inc.incidentId}
                    onClick={() => navigate(`/incidents/${inc.incidentId}`)}
                    className="border-b border-soc-border/30 hover:bg-soc-accent/20 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-2 text-xs font-mono text-cyber-cyan">{inc.incidentId}</td>
                    <td className="py-2.5 px-2 text-xs text-slate-300 max-w-[200px] truncate">{inc.subject}</td>
                    <td className="py-2.5 px-2">
                      <span className={`text-xs font-bold ${riskColor(inc.riskLevel)}`}>{inc.riskScore}</span>
                    </td>
                    <td className="py-2.5 px-2 text-xs text-slate-400">{inc.detectedIntent.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 px-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${actionColor(inc.intervention)}`}>
                        {inc.intervention}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-[10px] text-slate-600">{new Date(inc.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="soc-panel p-4">
    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{label}</p>
    <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
  </div>
);

const DistBar: React.FC<{ label: string; count: number; total: number; color: string }> = ({ label, count, total, color }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] text-slate-400 tracking-wider">{label}</span>
        <span className="text-[10px] text-slate-500">{count}</span>
      </div>
      <div className="h-1.5 bg-soc-accent rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const SystemHealthCards: React.FC = () => {
  const [health, setHealth] = useState<Record<string, { status: string }> | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/system/health');
        if (res.ok) {
          const data = await res.json();
          setHealth(data.services);
        }
      } catch { /* ignore */ }
    };
    fetchHealth();
  }, []);

  const services = [
    { key: 'lyzr', label: 'LYZR', desc: 'Agent Orchestration' },
    { key: 'qdrant', label: 'QDRANT', desc: 'Threat Memory' },
    { key: 'enkrypt', label: 'ENKRYPT', desc: 'AI Security Gate' },
    { key: 'claude', label: 'CLAUDE', desc: 'Semantic Reasoning' },
  ];

  return (
    <div className="space-y-2">
      {services.map((svc) => {
        const status = health?.[svc.key]?.status || 'LOADING';
        const isOnline = status === 'ONLINE';
        const isDegraded = status === 'NOT_CONFIGURED';
        return (
          <div key={svc.key} className="flex items-center justify-between px-3 py-2 rounded-lg bg-soc-accent/20">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-cyber-green animate-pulse' : isDegraded ? 'bg-cyber-yellow' : 'bg-cyber-red'}`} />
              <span className="text-xs font-semibold text-slate-300">{svc.label}</span>
            </div>
            <span className={`text-[10px] tracking-wider ${isOnline ? 'text-cyber-green' : isDegraded ? 'text-cyber-yellow' : 'text-cyber-red'}`}>
              {isOnline ? 'ONLINE' : isDegraded ? 'DEGRADED' : status}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardPage;
