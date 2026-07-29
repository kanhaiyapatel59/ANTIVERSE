import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Target, Users } from 'lucide-react';

export default function DetectionDonutChart({ humans = 14, animals = 2, floodPct = 82.5 }) {
  const data = [
    { name: 'Stranded Humans', value: humans, color: '#f43f5e' },
    { name: 'Livestock / Animals', value: animals, color: '#f59e0b' },
    { name: 'Submerged Vehicles', value: 3, color: '#06b6d4' },
    { name: 'Damaged Structures', value: 4, color: '#a855f7' }
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-slate-950/80 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-200 uppercase">
            Computer Vision Object Classification Matrix
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
          CONFIDENCE: 96.4%
        </span>
      </div>

      <div className="h-48 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} 
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
        <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
          <span className="text-slate-400 block">Total Targets</span>
          <strong className="text-rose-400 text-xs">{humans + animals + 7} Detected</strong>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
          <span className="text-slate-400 block">Flood Surface</span>
          <strong className="text-cyan-400 text-xs">{floodPct}% Inundated</strong>
        </div>
      </div>
    </div>
  );
}
