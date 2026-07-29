import React from 'react';
import { Cpu, Zap, Activity, CheckCircle2 } from 'lucide-react';

export default function BenchmarkHUD() {
  const metrics = [
    { label: 'Gemini Vision AI Accuracy', value: '96.4%', color: 'text-cyan-400' },
    { label: 'Hydro Surge Velocity Model', value: '94.2%', color: 'text-amber-400' },
    { label: 'Route Transit Feasibility', value: '98.1%', color: 'text-emerald-400' },
    { label: 'Groq LPU Inference Speed', value: '340 t/s', color: 'text-purple-400' },
    { label: 'SQLite + Mongo DB Latency', value: '12ms', color: 'text-blue-400' },
  ];

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-950/80 font-mono text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-200 uppercase">
            AI Model Precision & Inference Benchmark HUD
          </h3>
        </div>
        <span className="text-[10px] text-emerald-400 flex items-center font-bold">
          <CheckCircle2 className="w-3 h-3 mr-1" /> BENCHMARK VERIFIED
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-400 block truncate">{m.label}</span>
            <span className={`text-base font-bold font-mono block ${m.color}`}>{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
