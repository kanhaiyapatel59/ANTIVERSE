import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { CloudRain, Activity } from 'lucide-react';

export default function WeatherForecastChart({ rainfallMm = 142 }) {
  // Generate 24-hour simulation data based on peak rainfall
  const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '24:00'];
  const baseRain = Math.round(rainfallMm);

  const data = hours.map((h, i) => {
    let multiplier = 0.3;
    if (i === 4) multiplier = 0.85;
    if (i === 5) multiplier = 1.0; // Peak storm
    if (i === 6) multiplier = 0.75;
    if (i === 7) multiplier = 0.4;
    return {
      time: h,
      rainfall: Math.round(baseRain * multiplier),
      wind: Math.round(25 + (multiplier * 30))
    };
  });

  return (
    <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-slate-950/80 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <CloudRain className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-200 uppercase">
            24-Hour Hydro-Meteorological Precipitation & Wind Trend
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
          STORM PEAK AT 15:00
        </span>
      </div>

      <div className="h-52 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} 
            />
            <Area type="monotone" dataKey="rainfall" name="Rainfall (mm/hr)" stroke="#06b6d4" fillOpacity={1} fill="url(#rainGradient)" />
            <Area type="monotone" dataKey="wind" name="Wind Speed (km/h)" stroke="#f59e0b" fillOpacity={1} fill="url(#windGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-900">
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Rainfall Intensity (mm/hr)</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Wind Velocity (km/h)</span>
        </span>
      </div>
    </div>
  );
}
