import React, { useState } from 'react';
import { ShieldAlert, Navigation, CheckCircle2, LifeBuoy, Users } from 'lucide-react';

export default function SOSTriageQueue() {
  const [beacons, setBeacons] = useState([
    { id: 'SOS-104', sector: 'Sector 4 Residential Block B', victims: '6 Adults, 2 Infants', priority: 'CRITICAL', status: 'UNASSIGNED', boat: null },
    { id: 'SOS-105', sector: 'St. Mary High School Roof', victims: '12 Stranded Students', priority: 'HIGH', status: 'UNASSIGNED', boat: null },
    { id: 'SOS-106', sector: 'West Highway Overpass', victims: '4 Elderly Persons', priority: 'HIGH', status: 'UNASSIGNED', boat: null },
  ]);

  const handleAssignBoat = (id) => {
    setBeacons(beacons.map(b => {
      if (b.id === id) {
        return { ...b, status: 'DISPATCHED', boat: 'NDRF Motorized Craft #04' };
      }
      return b;
    }));
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 space-y-4 bg-slate-950/80 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-200 uppercase">
            Civilian Emergency SOS Triage Queue
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-bold">
          {beacons.filter(b => b.status === 'UNASSIGNED').length} UNASSIGNED BEACONS
        </span>
      </div>

      <div className="space-y-2.5">
        {beacons.map((b) => (
          <div key={b.id} className="p-3 rounded-xl border border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white">{b.id}</span>
                <span className="font-bold text-slate-100">{b.sector}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Casualties: <strong className="text-rose-300">{b.victims}</strong>
              </p>
            </div>

            <div>
              {b.status === 'UNASSIGNED' ? (
                <button
                  onClick={() => handleAssignBoat(b.id)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-[11px] shadow-md flex items-center space-x-1"
                >
                  <LifeBuoy className="w-3.5 h-3.5" />
                  <span>Assign NDRF Boat</span>
                </button>
              ) : (
                <div className="flex items-center space-x-1 text-emerald-400 font-bold text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{b.boat} DISPATCHED</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
