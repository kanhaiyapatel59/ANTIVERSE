import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { Boxes, Home } from 'lucide-react';

export default function ResourceInventoryChart({ peopleCount = 14 }) {
  const waterLiters = peopleCount * 12;
  const foodKg = peopleCount * 3.5;
  const medicalKits = Math.ceil(peopleCount / 4);
  const boats = Math.ceil(peopleCount / 5);
  const pumps = 2;

  const data = [
    { name: 'Water (L)', qty: waterLiters, color: '#06b6d4' },
    { name: 'Food (kg)', qty: foodKg, color: '#f59e0b' },
    { name: 'Meds (Kits)', qty: medicalKits * 10, color: '#f43f5e' },
    { name: 'Boats', qty: boats * 20, color: '#10b981' },
    { name: 'Pumps', qty: pumps * 25, color: '#a855f7' }
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-slate-950/80 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Boxes className="w-4 h-4 text-purple-400 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-200 uppercase">
            Relief Supply Inventory Allocation Matrix
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800 font-bold">
          {peopleCount} VICTIMS PROVISIONED
        </span>
      </div>

      <div className="h-48 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} 
            />
            <Bar dataKey="qty" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] pt-1 border-t border-slate-900 text-center">
        <div className="p-1.5 rounded bg-slate-900">
          <span className="text-slate-400 block">Pure Water</span>
          <strong className="text-cyan-400">{waterLiters} Liters</strong>
        </div>
        <div className="p-1.5 rounded bg-slate-900">
          <span className="text-slate-400 block">Food Rations</span>
          <strong className="text-amber-400">{foodKg} kg</strong>
        </div>
        <div className="p-1.5 rounded bg-slate-900">
          <span className="text-slate-400 block">Rescue Craft</span>
          <strong className="text-emerald-400">{boats} Boats</strong>
        </div>
      </div>
    </div>
  );
}
