import React, { useState } from 'react';
import { demoMessages, DemoMessage } from '../data/demoMessages';

interface MessagePanelProps {
  onAnalyze: (message: DemoMessage) => void;
  isAnalyzing: boolean;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ onAnalyze, isAnalyzing }) => {
  const [selectedDemo, setSelectedDemo] = useState<string>(demoMessages[0].id);
  const [customMode, setCustomMode] = useState(false);
  const [customSender, setCustomSender] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [customLinks, setCustomLinks] = useState('');

  const selectedMessage = demoMessages.find((m) => m.id === selectedDemo);

  const handleAnalyze = () => {
    if (customMode) {
      const custom: DemoMessage = {
        id: 'custom',
        label: 'Custom Message',
        expectedRisk: '?',
        expectedIntent: '?',
        expectedAction: '?',
        sender: customSender || 'unknown@unknown.test',
        subject: customSubject,
        body: customBody,
        links: customLinks.split('\n').filter((l) => l.trim()),
        employeeContext: {
          role: 'Employee',
          department: 'General',
          normalCorrespondents: [],
          routineActions: [],
        },
      };
      onAnalyze(custom);
    } else if (selectedMessage) {
      onAnalyze(selectedMessage);
    }
  };

  const displayMessage = customMode ? null : selectedMessage;

  return (
    <div className="soc-panel p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyber-cyan">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-300">Incoming Message</h2>
        </div>
        <button
          onClick={() => setCustomMode(!customMode)}
          className="text-xs px-3 py-1.5 rounded-md border border-soc-border text-slate-400 hover:text-cyber-cyan hover:border-cyber-cyan/30 transition-all"
        >
          {customMode ? '← Demo Scenarios' : 'Custom Message'}
        </button>
      </div>

      {!customMode ? (
        <>
          {/* Demo selector */}
          <select
            value={selectedDemo}
            onChange={(e) => setSelectedDemo(e.target.value)}
            className="select-cyber w-full mb-4"
            id="demo-scenario-selector"
          >
            {demoMessages.map((msg) => (
              <option key={msg.id} value={msg.id}>
                {msg.label}
              </option>
            ))}
          </select>

          {/* Preview */}
          {displayMessage && (
            <div className="bg-soc-bg/50 rounded-lg p-4 mb-4 border border-soc-border/50">
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 w-16">From</span>
                  <span className="text-sm font-mono text-cyber-orange">{displayMessage.sender}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 w-16">Subject</span>
                  <span className="text-sm font-semibold text-slate-200">{displayMessage.subject}</span>
                </div>
                {displayMessage.links.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 w-16 mt-0.5">Links</span>
                    <div className="flex flex-col gap-1">
                      {displayMessage.links.map((link, i) => (
                        <span key={i} className="text-xs font-mono text-cyber-red break-all">{link}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-soc-border/50 pt-3">
                <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {displayMessage.body}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-soc-border/30 flex gap-4">
                <span className="text-[10px] uppercase tracking-widest text-slate-500">
                  Expected: <span className="text-cyber-cyan">{displayMessage.expectedRisk}</span> / <span className="text-cyber-cyan">{displayMessage.expectedIntent}</span> / <span className="text-cyber-cyan">{displayMessage.expectedAction}</span>
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Custom message form */
        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="Sender (e.g., suspicious@evil.test)"
            value={customSender}
            onChange={(e) => setCustomSender(e.target.value)}
            className="w-full bg-soc-bg/50 border border-soc-border rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-cyber-cyan/30 focus:outline-none transition-colors"
          />
          <input
            type="text"
            placeholder="Subject"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            className="w-full bg-soc-bg/50 border border-soc-border rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-cyber-cyan/30 focus:outline-none transition-colors"
          />
          <textarea
            placeholder="Email body..."
            value={customBody}
            onChange={(e) => setCustomBody(e.target.value)}
            rows={6}
            className="w-full bg-soc-bg/50 border border-soc-border rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-cyber-cyan/30 focus:outline-none transition-colors resize-none"
          />
          <input
            type="text"
            placeholder="Links (one per line)"
            value={customLinks}
            onChange={(e) => setCustomLinks(e.target.value)}
            className="w-full bg-soc-bg/50 border border-soc-border rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-cyber-cyan/30 focus:outline-none transition-colors"
          />
        </div>
      )}

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="btn-cyber w-full flex items-center justify-center gap-3 py-3"
        id="analyze-button"
      >
        {isAnalyzing ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="tracking-wider">ANALYZING MESSAGE...</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="tracking-wider">ANALYZE MESSAGE</span>
          </>
        )}
      </button>
    </div>
  );
};

export default MessagePanel;
