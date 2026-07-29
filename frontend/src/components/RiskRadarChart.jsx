import React from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { ShieldAlert, Activity } from 'lucide-react';

export default function RiskRadarChart({ 
  floodPct = 82.5,
  peopleCount = 14,
  windSpeed = 48.5,
  urgency = "IMMEDIATE_EVACUATION",
  roadStatus = "BLOCKED"
}) {
  const casualtyScore = Math.min(100, Math.round((peopleCount / 30) * 100));
  const floodScore = Math.round(floodPct);
  const windScore = Math.min(100, Math.round((windSpeed / 90) * 100));
  const roadScore = roadStatus === 'BLOCKED' ? 95 : 45;
  const supplyScore = 80;
  const structuralScore = 85;

  const data = [
    { subject: 'Flood Inundation', score: floodScore, fullMark: 100 },
    { subject: 'Casualty Density', score: casualtyScore, fullMark: 100 },
    { subject: 'Wind Shear', score: windScore, fullMark: 100 },
    { subject: 'Road Blockage', score: roadScore, fullMark: 100 },
    { subject: 'Supply Scarcity', score: supplyScore, fullMark: 100 },
    { subject: 'Structural Loss', score: structuralScore, fullMark: 100 },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 space-y-3 bg-slate-950/60">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-mono">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-200 uppercase">
            Multi-Vector Risk Analytics Radar Matrix
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
          PRIORITY: P1 CRITICAL
        </span>
      </div>

      <div className="h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} fontFamily="monospace" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
            <Radar 
              name="Threat Level" 
              dataKey="score" 
              stroke="#f43f5e" 
              fill="#be123c" 
              fillOpacity={0.5} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-[10px] pt-1">
        <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
          <span className="text-slate-400 block">Surge Index</span>
          <strong className="text-rose-400 text-xs">{floodScore}%</strong>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
          <span className="text-slate-400 block">Victims Threat</span>
          <strong className="text-amber-400 text-xs">{peopleCount} Stranded</strong>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
          <span className="text-slate-400 block">Transit Feasibility</span>
          <strong className="text-cyan-400 text-xs">{roadStatus}</strong>
        </div>
      </div>
    </div>
  );
}
