import React from 'react';
import { Radio, Waves, ShieldAlert, Zap, Navigation } from 'lucide-react';

export default function TacticalTicker() {
  const tickerItems = [
    "🌊 MEENACHIL RIVER BASIN: +1.8m SURGE WATER LEVEL RISE DETECTED",
    "🛸 DRONE AERIAL RECON: 14 HUMAN VICTIMS & 2 LIVESTOCK LOCATED ON ROOFTOPS IN SECTOR 4",
    "🚤 NDRF BATTALION 8 (ALPHA RAPID FORCE): EN ROUTE VIA HIGH-GROUND BYPASS (ETA 14 MINS)",
    "🌧️ MONSOON TELEMETRY: 142mm/hr PRECIPITATION CLOUDBURST ACTIVE",
    "🛰️ SATELLITE MESH NETWORK: 100% OFFLINE FAULT-TOLERANCE OPERATIONAL",
    "📜 CAP V1.2 COMMON ALERTING PROTOCOL: DISPATCH PAYLOAD SYNCED TO DISTRICT MAGISTRATE HQ",
    "🏨 RELIEF CAMP LOGISTICS: ST. XAVIER CAMP (28 BEDS RESERVED, 3 MOTORIZED BOATS DEPLOYED)"
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-cyan-500/30 h-8 flex items-center overflow-hidden font-mono text-[11px] text-cyan-300 shadow-2xl select-none">
      {/* Ticker Title Badge */}
      <div className="flex items-center space-x-1.5 px-3 py-1 bg-cyan-950 border-r border-cyan-500/30 text-cyan-400 font-bold whitespace-nowrap z-10 shadow-md">
        <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
        <span className="uppercase tracking-wider">LIVE TELEMETRY STREAM</span>
      </div>

      {/* Marquee Scrolling Content */}
      <div className="flex-1 overflow-hidden relative">
        <div className="animate-marquee whitespace-nowrap flex space-x-8 items-center py-1">
          {tickerItems.concat(tickerItems).map((item, idx) => (
            <span key={idx} className="flex items-center space-x-2 text-slate-300">
              <span className="text-cyan-400 font-bold">•</span>
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
