import React, { useEffect, useState } from 'react';

interface Alert {
  id: string;
  incidentId: string;
  riskScore: number;
  riskLevel: string;
  detectedIntent: string;
  intervention: string;
  sender: string;
  subject: string;
  timestamp: string;
}

interface AlertToastProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
  onView: (incidentId: string) => void;
}

const AlertToast: React.FC<AlertToastProps> = ({ alerts, onDismiss, onView }) => {
  return (
    <div className="fixed top-14 right-4 z-50 space-y-2 max-w-md">
      {alerts.slice(0, 5).map((alert) => (
        <AlertItem key={alert.id} alert={alert} onDismiss={onDismiss} onView={onView} />
      ))}
    </div>
  );
};

const AlertItem: React.FC<{ alert: Alert; onDismiss: (id: string) => void; onView: (id: string) => void }> = ({ alert, onDismiss, onView }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(alert.id), 300);
    }, 10000);
    return () => clearTimeout(timer);
  }, [alert.id, onDismiss]);

  const isCritical = alert.riskLevel === 'CRITICAL';

  return (
    <div
      className={`transition-all duration-300 ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div className={`soc-panel p-4 border-l-4 ${isCritical ? 'border-l-cyber-red glow-red' : 'border-l-cyber-orange glow-orange'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{isCritical ? '🚨' : '⚠️'}</span>
              <span className={`text-xs font-bold tracking-wider ${isCritical ? 'text-cyber-red' : 'text-cyber-orange'}`}>
                {alert.riskLevel} THREAT
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${isCritical ? 'bg-cyber-red/10 text-cyber-red' : 'bg-cyber-orange/10 text-cyber-orange'}`}>
                {alert.intervention}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-1 truncate">{alert.subject}</p>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span>Intent: <span className="text-slate-400">{alert.detectedIntent.replace(/_/g, ' ')}</span></span>
              <span>Risk: <span className={isCritical ? 'text-cyber-red' : 'text-cyber-orange'}>{alert.riskScore}</span></span>
            </div>
          </div>
          <button onClick={() => onDismiss(alert.id)} className="text-slate-600 hover:text-slate-400 text-xs">✕</button>
        </div>
        <button
          onClick={() => onView(alert.incidentId)}
          className="mt-2 text-[10px] text-cyber-cyan hover:text-cyber-cyan/80 tracking-wider font-semibold"
        >
          VIEW INCIDENT →
        </button>
      </div>
    </div>
  );
};

export default AlertToast;
