import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Target, ShieldAlert, Navigation, Waves, Compass } from 'lucide-react';

// Custom Glowing Victim Marker Icon
const victimIcon = L.divIcon({
  className: 'custom-victim-pin',
  html: `<div style="
    background: #be123c; 
    width: 28px; 
    height: 28px; 
    border-radius: 50%; 
    border: 2px solid #ffffff; 
    box-shadow: 0 0 15px #f43f5e; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    color: white;
    font-size: 11px;
    font-weight: bold;
    animation: pulse 1.5s infinite;
  ">🎯</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Custom Rescue Boat Marker Icon
const boatIcon = L.divIcon({
  className: 'custom-boat-pin',
  html: `<div style="
    background: #0284c7; 
    width: 30px; 
    height: 30px; 
    border-radius: 50%; 
    border: 2px solid #38bdf8; 
    box-shadow: 0 0 15px #0284c7; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    color: white;
    font-size: 13px;
  ">🛥️</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

export default function GISMap({ 
  center = [19.0760, 72.8777], 
  zoom = 14, 
  locationName = "Mumbai Sector 4 Coastal Zone",
  peopleCount = 14,
  floodAreaPct = 82.5,
  rescueTeam = "NDRF Battalion 8 - Alpha Force"
}) {
  const [dronePos, setDronePos] = useState(center);
  const [showRadarLayer, setShowRadarLayer] = useState(false);

  // Drone Trajectory Vector Waypoints around center
  const droneTrajectory = [
    [center[0] - 0.012, center[1] - 0.015],
    [center[0] - 0.006, center[1] - 0.008],
    [center[0], center[1]],
    [center[0] + 0.005, center[1] + 0.007],
    [center[0] + 0.010, center[1] + 0.012]
  ];

  // Flood Inundation Polygon Overlay
  const floodPolygon = [
    [center[0] + 0.008, center[1] - 0.010],
    [center[0] + 0.009, center[1] + 0.008],
    [center[0] - 0.007, center[1] + 0.012],
    [center[0] - 0.010, center[1] - 0.006]
  ];

  // Simulate animated drone flying along trajectory
  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % droneTrajectory.length;
      setDronePos(droneTrajectory[step]);
    }, 2500);
    return () => clearInterval(interval);
  }, [center]);

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
      {/* Map Container */}
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        style={{ background: '#090d16' }}
      >
        {/* ESRI World Satellite Tile Layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="&copy; Esri GIS User Community"
        />

        {/* Live Doppler Radar Storm Layer (Optional Tile Overlay) */}
        {showRadarLayer && (
          <TileLayer
            url="https://mesonet.agron.iastate.edu/cache/tile/1.0.0/nexrad-n0q-900913/{z}/{y}/{x}.png"
            opacity={0.65}
          />
        )}

        {/* Flood Inundation Polygon Overlay (Glowing Cyan/Blue) */}
        <Polygon 
          positions={floodPolygon} 
          pathOptions={{ 
            color: '#06b6d4', 
            fillColor: '#0284c7', 
            fillOpacity: 0.45, 
            weight: 2, 
            dashArray: '4 4' 
          }} 
        />

        {/* Animated Drone Flight Vector Line */}
        <Polyline 
          positions={droneTrajectory} 
          pathOptions={{ 
            color: '#f59e0b', 
            weight: 3, 
            dashArray: '6 6',
            opacity: 0.85
          }} 
        />

        {/* Stranded Victims Marker Pin */}
        <Marker position={center} icon={victimIcon}>
          <Popup className="custom-leaflet-popup">
            <div className="p-2 font-mono text-xs text-slate-900">
              <div className="font-bold text-rose-700 uppercase flex items-center space-x-1">
                <span>🎯 VICTIM CLUSTER DETECTED</span>
              </div>
              <p className="mt-1 text-[11px] leading-tight">
                <strong>{peopleCount} Stranded Civilians</strong> on rooftops in {locationName}.
              </p>
              <div className="mt-1 text-[10px] text-cyan-800 font-bold">
                Inundation Area: {floodAreaPct}%
              </div>
            </div>
          </Popup>
        </Marker>

        {/* NDRF Rescue Boat Unit Marker */}
        <Marker position={[center[0] - 0.005, center[1] - 0.006]} icon={boatIcon}>
          <Popup>
            <div className="p-2 font-mono text-xs text-slate-900">
              <div className="font-bold text-sky-700 uppercase">🛥️ RESCUE UNIT DISPATCH</div>
              <p className="mt-1 text-[11px]">{rescueTeam}</p>
              <span className="text-[10px] text-emerald-700 font-bold">ETA: 14 mins</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* GIS HUD Overlay Telemetry Card */}
      <div className="absolute top-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 p-2.5 rounded-xl font-mono text-[10px] text-cyan-300 space-y-1 shadow-lg">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-1.5 font-bold">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>SATELLITE RECON // LAT: {center[0].toFixed(4)}</span>
          </div>
          <button
            onClick={() => setShowRadarLayer(!showRadarLayer)}
            className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer ${
              showRadarLayer ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse' : 'bg-slate-900 text-slate-300 border-slate-700'
            }`}
          >
            {showRadarLayer ? '🛰️ RADAR ON' : '🛰️ DOPPLER RADAR'}
          </button>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Target Sector: <strong className="text-slate-200">{locationName}</strong></span>
          <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800 ml-2">
            FLOOD: {floodAreaPct}%
          </span>
        </div>
      </div>
    </div>
  );
}
