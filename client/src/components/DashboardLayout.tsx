import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AlertToast from './AlertToast';

interface DashboardLayoutProps {
  user: { id: string; email: string; name: string; role: string };
  onLogout: () => void;
}

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

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // SSE listener for global alerts
    const es = new EventSource('/api/events/stream');

    es.addEventListener('alert', (e) => {
      try {
        const data = JSON.parse(e.data);
        const newAlert: Alert = {
          id: Math.random().toString(),
          ...data,
        };
        setAlerts((prev) => [newAlert, ...prev]);
      } catch { /* ignore */ }
    });

    return () => es.close();
  }, []);

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleViewIncident = (incidentId: string) => {
    window.location.href = `/incidents/${incidentId}`;
  };

  return (
    <div className="min-h-screen bg-soc-bg text-slate-100 flex">
      <Sidebar userName={user.name} userRole={user.role} onLogout={onLogout} />
      <TopBar alertCount={alerts.length} />
      <AlertToast alerts={alerts} onDismiss={handleDismissAlert} onView={handleViewIncident} />

      <main className="flex-1 ml-60 mt-12 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
