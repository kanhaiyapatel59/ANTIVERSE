import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Target, ShieldAlert, Navigation, Waves, Compass, Loader2 } from 'lucide-react';

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

// Helper component to smoothly animate & recenter Leaflet camera
function MapFlyToController({ targetCenter, targetZoom }) {
  const map = useMap();
  useEffect(() => {
    if (targetCenter && targetCenter[0] && targetCenter[1]) {
      map.flyTo(targetCenter, targetZoom || 13, {
        duration: 1.6,
        easeLinearity: 0.25
      });
    }
  }, [targetCenter, targetZoom, map]);
  return null;
}

export default function GISMap({ 
  center = [19.0760, 72.8777], 
  zoom = 13, 
  locationName = "Mumbai Sector 4 Coastal Zone",
  peopleCount = 14,
  floodAreaPct = 82.5,
  rescueTeam = "NDRF Battalion 8 - Alpha Force"
}) {
  const [mapCenter, setMapCenter] = useState(center);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [resolvedLocation, setResolvedLocation] = useState(locationName);
  const [showRadarLayer, setShowRadarLayer] = useState(false);

  // Perform dynamic real geocoding whenever locationName prop changes
  useEffect(() => {
    if (!locationName) return;
    let isMounted = true;
    setIsGeocoding(true);

    const geocode = async () => {
      const q = locationName.trim();
      let coords = null;
      let name = q;

      // 1. OpenStreetMap Nominatim Geocoding API
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0 && isMounted) {
            coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            name = data[0].display_name;
          }
        }
      } catch (e) {
        console.warn('Nominatim geocode error:', e);
      }

      // 2. Open-Meteo Geocoding API Fallback
      if (!coords) {
        try {
          const res2 = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`);
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2.results && data2.results.length > 0 && isMounted) {
              const item = data2.results[0];
              coords = [item.latitude, item.longitude];
              name = `${item.name}${item.admin1 ? ', ' + item.admin1 : ''}${item.country ? ', ' + item.country : ''}`;
            }
          }
        } catch (e2) {
          console.warn('Open-Meteo geocode error:', e2);
        }
      }

      // 3. Fallback common city dictionary
      if (!coords) {
        const lower = q.toLowerCase();
        if (lower.includes('mumbai')) coords = [19.0760, 72.8777];
        else if (lower.includes('wayanad')) coords = [11.6854, 76.1320];
        else if (lower.includes('chennai')) coords = [13.0827, 80.2707];
        else if (lower.includes('guwahati')) coords = [26.1445, 91.7362];
        else if (lower.includes('patna')) coords = [25.5941, 85.1376];
        else if (lower.includes('tokyo')) coords = [35.6762, 139.6503];
        else if (lower.includes('new york')) coords = [40.7128, -74.0060];
        else if (lower.includes('london')) coords = [51.5074, -0.1278];
        else if (lower.includes('delhi')) coords = [28.6139, 77.2090];
        else if (lower.includes('kolkata')) coords = [22.5726, 88.3639];
        else if (lower.includes('kerala')) coords = [10.8505, 76.2711];
      }

      if (coords && isMounted) {
        setMapCenter(coords);
        setResolvedLocation(name);
      }
      if (isMounted) setIsGeocoding(false);
    };

    const timer = setTimeout(geocode, 400);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [locationName]);

  // Dynamic Drone Trajectory Vector Waypoints around real mapCenter
  const droneTrajectory = [
    [mapCenter[0] - 0.012, mapCenter[1] - 0.015],
    [mapCenter[0] - 0.006, mapCenter[1] - 0.008],
    [mapCenter[0], mapCenter[1]],
    [mapCenter[0] + 0.005, mapCenter[1] + 0.007],
    [mapCenter[0] + 0.010, mapCenter[1] + 0.012]
  ];

  // Dynamic Flood Inundation Polygon Overlay
  const floodPolygon = [
    [mapCenter[0] + 0.008, mapCenter[1] - 0.010],
    [mapCenter[0] + 0.009, mapCenter[1] + 0.008],
    [mapCenter[0] - 0.007, mapCenter[1] + 0.012],
    [mapCenter[0] - 0.010, mapCenter[1] - 0.006]
  ];

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
      {/* Map Container */}
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        style={{ background: '#090d16' }}
      >
        <MapFlyToController targetCenter={mapCenter} targetZoom={zoom} />

        {/* ESRI World Satellite Tile Layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="&copy; Esri GIS User Community"
        />

        {/* Live Doppler Radar Storm Layer */}
        {showRadarLayer && (
          <TileLayer
            url="https://mesonet.agron.iastate.edu/cache/tile/1.0.0/nexrad-n0q-900913/{z}/{y}/{x}.png"
            opacity={0.65}
          />
        )}

        {/* Flood Inundation Polygon Overlay */}
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
        <Marker position={mapCenter} icon={victimIcon}>
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
        <Marker position={[mapCenter[0] - 0.005, mapCenter[1] - 0.006]} icon={boatIcon}>
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
      <div className="absolute top-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 p-2.5 rounded-xl font-mono text-[10px] text-cyan-300 space-y-1 shadow-lg max-w-sm">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-1.5 font-bold">
            {isGeocoding ? (
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            ) : (
              <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            )}
            <span>
              {isGeocoding ? 'GEOCODING REAL MAP...' : `LAT: ${mapCenter[0].toFixed(4)} | LNG: ${mapCenter[1].toFixed(4)}`}
            </span>
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
        <div className="flex items-center justify-between text-slate-400 truncate">
          <span className="truncate pr-2">
            Target Sector: <strong className="text-slate-200">{resolvedLocation.length > 30 ? resolvedLocation.substring(0, 30) + '...' : resolvedLocation}</strong>
          </span>
          <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800 shrink-0">
            FLOOD: {floodAreaPct}%
          </span>
        </div>
      </div>
    </div>
  );
}
