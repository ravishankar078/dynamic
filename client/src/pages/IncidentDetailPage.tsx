import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgentTimeline from '../components/AgentTimeline';
import RiskVerdict from '../components/RiskVerdict';
import SignalCard from '../components/SignalCard';
import TrustLedger from '../components/TrustLedger';
import URLAnalysis from '../components/URLAnalysis';
import InterventionPanel from '../components/InterventionPanel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Incident = any;

const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [isFP, setIsFP] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const res = await fetch(`/api/incidents/${id}`);
        if (res.ok) setIncident(await res.json());
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchIncident();
  }, [id]);

  const sendFeedback = async () => {
    try {
      await fetch(`/api/incidents/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFalsePositive: isFP, notes: feedbackNotes }),
      });
      setFeedbackSent(true);
    } catch { /* ignore */ }
  };

  if (loading) return <div className="soc-panel p-12 text-center text-slate-500 text-sm">Loading...</div>;
  if (!incident) return <div className="soc-panel p-12 text-center text-cyber-red text-sm">Incident not found</div>;

  const r = incident.result;
  const riskColor = incident.riskLevel === 'CRITICAL' ? 'text-cyber-red' : incident.riskLevel === 'HIGH' ? 'text-cyber-orange' : incident.riskLevel === 'MEDIUM' ? 'text-cyber-yellow' : 'text-cyber-green';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/incidents')} className="text-[10px] text-cyber-cyan hover:underline tracking-wider mb-1 block">← INCIDENTS</button>
          <h1 className="text-lg font-bold tracking-wider text-white">INCIDENT {incident.incidentId}</h1>
          <p className="text-xs text-slate-500">{new Date(incident.timestamp).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-3xl font-bold font-mono ${riskColor}`}>{incident.riskScore}</span>
          <div>
            <span className={`text-xs font-bold ${riskColor}`}>{incident.riskLevel}</span>
            <span className={`block text-[10px] px-2 py-0.5 rounded mt-0.5 ${
              incident.intervention === 'BLOCK' ? 'bg-cyber-red/10 text-cyber-red' :
              incident.intervention === 'WARN' ? 'bg-cyber-yellow/10 text-cyber-yellow' : 'bg-cyber-green/10 text-cyber-green'
            }`}>{incident.intervention}</span>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="soc-panel p-5">
        <h2 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-semibold">Original Message</h2>
        <div className="space-y-1 text-xs mb-3">
          <p className="text-slate-400">From: <span className="text-slate-300">{incident.sender}</span></p>
          <p className="text-slate-400">Subject: <span className="text-slate-300 font-semibold">{incident.subject}</span></p>
        </div>
        <div className="bg-soc-bg/50 rounded-lg p-4 border border-soc-border/50 max-h-48 overflow-y-auto">
          <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans leading-relaxed">{incident.body}</pre>
        </div>
      </div>

      {/* Agent Investigation Timeline */}
      <div className="soc-panel p-5">
        <h2 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-semibold">Agent Investigation</h2>
        <div className="space-y-2">
          {(r?.agentSteps || []).map((step: { step: number; name: string; status: string; duration: number; result?: string; timestamp: string }) => (
            <div key={step.step} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-soc-accent/20">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step.status === 'completed' ? 'bg-cyber-green/10 text-cyber-green' : 'bg-cyber-red/10 text-cyber-red'
              }`}>
                {step.status === 'completed' ? '✓' : '✗'}
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-300">{step.name}</p>
                {step.result && <p className="text-[10px] text-slate-500">{step.result}</p>}
              </div>
              <span className="text-[10px] text-slate-600 font-mono">{step.duration}ms</span>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence */}
      {r && (
        <>
          <RiskVerdict riskScore={r.riskScore} riskLevel={r.riskLevel} detectedIntent={r.detectedIntent} intentReason={r.intentReason} confidence={r.confidence} reasoning={r.reasoning} adversarialCheck={r.adversarialCheck} />
          <SignalCard signals={r.signals?.signals || []} />
          <TrustLedger startingTrust={r.trustLedger?.startingTrust || 50} trustLedger={r.trustLedger?.trustLedger || []} finalTrust={r.trustLedger?.finalTrust || 50} riskScore={r.riskScore} />
          <URLAnalysis urlAnalysis={r.urlAnalysis} contextAnalysis={r.contextAnalysis} promptInjection={r.promptInjection} />
          <InterventionPanel intervention={r.intervention} safeAlternativeAction={r.safeAlternativeAction} whatWouldHappenIfClicked={r.whatWouldHappenIfClicked} />
        </>
      )}

      {/* Analyst Feedback */}
      <div className="soc-panel p-5">
        <h2 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-semibold">Analyst Feedback</h2>
        {incident.feedback ? (
          <div className="bg-soc-accent/20 rounded-lg p-3">
            <p className="text-xs text-slate-400">Analyst: {incident.feedback.analyst}</p>
            <p className="text-xs text-slate-400">False Positive: <span className={incident.feedback.isFalsePositive ? 'text-cyber-yellow' : 'text-cyber-green'}>{incident.feedback.isFalsePositive ? 'YES' : 'NO'}</span></p>
            {incident.feedback.notes && <p className="text-xs text-slate-400 mt-1">{incident.feedback.notes}</p>}
          </div>
        ) : feedbackSent ? (
          <p className="text-xs text-cyber-green">✓ Feedback submitted</p>
        ) : (
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isFP} onChange={(e) => setIsFP(e.target.checked)} className="rounded border-soc-border" />
              <span className="text-xs text-slate-400">Mark as false positive</span>
            </label>
            <textarea
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="Additional notes..."
              className="w-full bg-soc-bg/80 border border-soc-border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-cyber-cyan/40 focus:outline-none h-20 resize-none"
            />
            <button onClick={sendFeedback} className="btn-cyber text-xs py-2 px-4">SUBMIT FEEDBACK</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentDetailPage;
