import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await fetch('/api/incidents');
        if (res.ok) {
          const data = await res.json();
          setIncidents(data.incidents);
        }
      } catch { /* ignore */ }
    };
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const riskColor = (level: string) => {
    switch (level) { case 'CRITICAL': return 'text-cyber-red'; case 'HIGH': return 'text-cyber-orange'; case 'MEDIUM': return 'text-cyber-yellow'; default: return 'text-cyber-green'; }
  };

  const actionBadge = (action: string) => {
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
          <h1 className="text-lg font-bold tracking-wider text-white">INCIDENTS</h1>
          <p className="text-xs text-slate-500 tracking-wider">{incidents.length} incident(s) recorded</p>
        </div>
        <button onClick={() => navigate('/monitor')} className="btn-cyber text-xs py-2 px-4">+ SIMULATE NEW</button>
      </div>

      {incidents.length === 0 ? (
        <div className="soc-panel p-12 text-center">
          <p className="text-sm text-slate-500 mb-2">No incidents recorded yet.</p>
          <p className="text-xs text-slate-600">Use the Live Monitor to analyze messages and create incidents.</p>
        </div>
      ) : (
        <div className="soc-panel overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-soc-accent/30 border-b border-soc-border">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest py-3 px-4">Incident</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest py-3 px-4">Sender</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest py-3 px-4">Subject</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-widest py-3 px-4">Risk</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest py-3 px-4">Intent</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-widest py-3 px-4">Action</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-widest py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr
                  key={inc.incidentId}
                  onClick={() => navigate(`/incidents/${inc.incidentId}`)}
                  className="border-b border-soc-border/30 hover:bg-soc-accent/20 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 text-xs font-mono text-cyber-cyan">{inc.incidentId}</td>
                  <td className="py-3 px-4 text-xs text-slate-400 max-w-[150px] truncate">{inc.sender}</td>
                  <td className="py-3 px-4 text-xs text-slate-300 max-w-[200px] truncate">{inc.subject}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-sm font-bold font-mono ${riskColor(inc.riskLevel)}`}>{inc.riskScore}</span>
                    <span className={`block text-[9px] ${riskColor(inc.riskLevel)}`}>{inc.riskLevel}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400">{inc.detectedIntent.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-[10px] px-2.5 py-1 rounded border font-semibold ${actionBadge(inc.intervention)}`}>
                      {inc.intervention}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-[10px] text-slate-600">{new Date(inc.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IncidentsPage;
