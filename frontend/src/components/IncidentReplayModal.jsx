import React, { useState } from 'react';
import { ShieldAlert, Play, Download, X, Cpu, CheckCircle2, ChevronRight } from 'lucide-react';

export default function IncidentReplayModal({ isOpen, onClose, incidentData }) {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    { title: "Node 1: Weather Telemetry", detail: "Met scan: 142mm/hr Rainfall | Threat: EXTREME | Surge: +1.8m" },
    { title: "Node 2: Detection Recon", detail: "Drone Multimodal Scan: 14 Victims & 2 Animals on rooftop | Flood 82.5%" },
    { title: "Node 3: Hydro Prediction", detail: "Surge modeling: Velocity 3.81m/s | Water Rise +3.4m | Urgency: IMMEDIATE" },
    { title: "Node 4: Tactical Routing", detail: "Assigned NDRF Battalion 8 - Alpha Rapid Force via High-Ground Bypass (ETA 17 mins)" },
    { title: "Node 5: Resource Logistics", detail: "Allocated St. Xavier Relief Camp (28 beds, 70 MRE Rations, 3 Motorized Boats)" },
    { title: "Node 6: Multi-Channel Dispatch", detail: "Formatted SMS, Formal Email, Public Broadcast, Hindi Alert & CAP JSON" },
    { title: "Node 7: Commander Synthesis", detail: "Master Disaster Directive compiled & persisted to Dual DB (SQLite + Mongo)" }
  ];

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(incidentData || steps, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ndrf_blackbox_audit_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl font-mono text-xs text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300">
              📼 Incident "Black Box" Flight Recorder & Regulatory Replay
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Selector Timeline */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Agent Execution Step: <strong>{activeStep + 1} of 7</strong></span>
            <span className="text-cyan-400 font-bold">{steps[activeStep].title}</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === activeStep 
                    ? 'bg-purple-400 shadow-[0_0_10px_#a855f7]' 
                    : idx < activeStep 
                    ? 'bg-purple-900' 
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Active Step Details Panel */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-300 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{steps[activeStep].title}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">STATE SYNC VERIFIED</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed pl-5">
            {steps[activeStep].detail}
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveStep(prev => (prev > 0 ? prev - 1 : 0))}
              disabled={activeStep === 0}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              onClick={() => setActiveStep(prev => (prev < steps.length - 1 ? prev + 1 : steps.length - 1))}
              disabled={activeStep === steps.length - 1}
              className="px-3 py-1.5 bg-purple-950 border border-purple-600 rounded-lg text-purple-200 hover:bg-purple-900 disabled:opacity-40"
            >
              Next Step →
            </button>
          </div>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-1.5 bg-cyan-950 border border-cyan-500 text-cyan-300 rounded-lg font-bold hover:bg-cyan-900 flex items-center space-x-1.5 shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Black Box JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
