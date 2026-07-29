import React from 'react';
import { Navigation, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

export default function RouteFlowChart({ 
  rescueTeam = "NDRF Battalion 8 - Alpha Rapid Force",
  eta = "14 mins",
  corridor = "High-Ground Bypass Corridor",
  feasibilityScore = 98.1
}) {
  const waypoints = [
    { title: "HQ Staging Base", sub: "Disaster Deployment Hub", status: "DEPARTED", time: "T+0m" },
    { title: "Sector 2 Bypass", sub: "Elevated Ridge Expressway", status: "TRANSIT", time: "T+6m" },
    { title: "Bridge Crossing B", sub: "Reinforced Concrete Span", status: "SAFE", time: "T+10m" },
    { title: "Target Roof Sector 4", sub: "Victim Cluster Extraction Point", status: "DESTINATION", time: `ETA ${eta}` }
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-slate-950/80 space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-200 uppercase">
            Tactical Evacuation Transit Flow & Waypoint Matrix
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
          FEASIBILITY: {feasibilityScore}% SAFE
        </span>
      </div>

      {/* Rescue Team Assignment Badge */}
      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Assigned Rescue Unit</span>
          <strong className="text-xs text-emerald-300 font-bold">{rescueTeam}</strong>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase block">Corridor Status</span>
          <span className="text-xs font-bold text-cyan-300">{corridor}</span>
        </div>
      </div>

      {/* Horizontal Waypoint Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
        {waypoints.map((w, idx) => (
          <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 relative">
            <div className="flex items-center justify-between text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold">{w.time}</span>
              <span className="text-slate-500 font-bold">NODE {idx + 1}</span>
            </div>
            <strong className="text-xs text-slate-100 block truncate">{w.title}</strong>
            <span className="text-[9px] text-slate-400 block truncate">{w.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
