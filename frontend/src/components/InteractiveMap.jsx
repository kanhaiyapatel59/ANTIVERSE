import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Search, Globe, Layers, Upload, ZoomIn, ZoomOut, Maximize2, ShieldAlert, Sparkles } from 'lucide-react'
import axios from 'axios'

// Custom Glowing Marker Icons
const createCustomIcon = (colorHex, iconSymbol) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${colorHex};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 20px ${colorHex};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 13px;
        font-family: monospace;
        animation: pulse 2s infinite;
      ">
        ${iconSymbol}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })
}

const incidentIcon = createCustomIcon('#f43f5e', '🚨')
const customUploadIcon = createCustomIcon('#a855f7', '🚁')
const teamIcon = createCustomIcon('#10b981', '⚡')

// Helper Component to control Map View programmatically (flyTo & zoom)
function MapFlyController({ targetPos, zoomLevel }) {
  const map = useMap()
  useEffect(() => {
    if (targetPos) {
      map.flyTo(targetPos, zoomLevel || 10, {
        duration: 1.8,
        easeLinearity: 0.25
      })
    }
  }, [targetPos, zoomLevel, map])
  return null
}

export default function InteractiveMap() {
  const [isClient, setIsClient] = useState(false)
  const [tileMode, setTileMode] = useState('satellite') // 'satellite' | 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777])
  const [mapZoom, setMapZoom] = useState(5)
  const [uploading, setUploading] = useState(false)

  // Dynamic Disaster Locations List
  const [locations, setLocations] = useState([
    {
      id: 1,
      name: "Mumbai Sector 4 Coastal Zone",
      lat: 19.0760,
      lng: 72.8777,
      risk: "EXTREME",
      people: 14,
      rain: "142mm/hr Heavy Cloudburst",
      team: "NDRF Battalion 8 - Alpha Force",
      shelter: "St. Xavier Relief Camp",
      radius: 3000
    },
    {
      id: 2,
      name: "Wayanad Hillside Settlement",
      lat: 11.6854,
      lng: 76.1320,
      risk: "EXTREME",
      people: 26,
      rain: "185mm/hr Monsoon Downpour",
      team: "Mountain Rescue Division",
      shelter: "District Stadium Camp",
      radius: 4000
    },
    {
      id: 3,
      name: "Guwahati Brahmaputra Bank",
      lat: 26.1445,
      lng: 91.7362,
      risk: "HIGH",
      people: 8,
      rain: "110mm/hr Heavy Rainfall",
      team: "Riverbank Rescue Unit 2",
      shelter: "High School Relief Hub",
      radius: 2500
    },
    {
      id: 4,
      name: "Chennai Cyclonic Coastal Zone",
      lat: 13.0827,
      lng: 80.2707,
      risk: "HIGH",
      people: 18,
      rain: "95mm/hr Coastal Storm",
      team: "Coast Guard Marine Unit",
      shelter: "Adyar Community Center",
      radius: 3200
    }
  ])

  // Dictionary for city search lookup
  const cityCoordinates = {
    'mumbai': [19.0760, 72.8777],
    'wayanad': [11.6854, 76.1320],
    'guwahati': [26.1445, 91.7362],
    'chennai': [13.0827, 80.2707],
    'delhi': [28.6139, 77.2090],
    'kolkata': [22.5726, 88.3639],
    'kerala': [10.8505, 76.2711],
    'assam': [26.2006, 92.9376],
    'patna': [25.5941, 85.1376],
    'bengaluru': [12.9716, 77.5946]
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle City Search & Map FlyTo
  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    const key = searchQuery.trim().toLowerCase()
    
    // Check if city exists in predefined coords or create dynamic entry
    let targetCoords = cityCoordinates[key]
    if (!targetCoords) {
      // Default to offsets if unknown city
      targetCoords = [20.5937 + (Math.random() - 0.5) * 5, 78.9629 + (Math.random() - 0.5) * 5]
    }

    setMapCenter(targetCoords)
    setMapZoom(11)

    // Add new location dynamically to map markers
    const newLoc = {
      id: Date.now(),
      name: `${searchQuery.toUpperCase()} Disaster Sector`,
      lat: targetCoords[0],
      lng: targetCoords[1],
      risk: "EXTREME",
      people: Math.floor(Math.random() * 25) + 10,
      rain: "165mm/hr Flash Torrent",
      team: `NDRF Rapid Squad ${Math.floor(Math.random() * 9) + 1}`,
      shelter: `${searchQuery} Emergency Relief Center`,
      radius: 3500,
      isCustom: true
    }

    setLocations(prev => [newLoc, ...prev])
  }

  // Handle Local Photo Upload directly on Map
  const handleMapFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axios.post('/api/v1/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data.url) {
        // Drop new uploaded incident marker at current center
        const uploadLoc = {
          id: Date.now(),
          name: "CUSTOM UPLOADED DRONE SCAN",
          lat: mapCenter[0] + 0.01,
          lng: mapCenter[1] + 0.01,
          risk: "EXTREME",
          people: 19,
          rain: "155mm/hr Torrential Downpour",
          team: "Special Drone Strike Unit",
          shelter: "Regional Central Emergency Base",
          radius: 3800,
          isCustom: true,
          imageUrl: res.data.url
        }

        setLocations(prev => [uploadLoc, ...prev])
        setMapCenter([uploadLoc.lat, uploadLoc.lng])
        setMapZoom(12)

        try {
          localStorage.setItem('latest_location', uploadLoc.name)
          localStorage.setItem('latest_image_url', res.data.url)
        } catch (err) {
          console.error(err)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  if (!isClient) return (
    <div className="h-[460px] w-full bg-slate-950 flex items-center justify-center text-xs font-mono text-cyan-400">
      Initializing Tactical Satellite Engine...
    </div>
  )

  return (
    <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-cyan-500/40 relative shadow-[0_0_35px_rgba(6,182,212,0.25)] bg-[#060911]">
      
      {/* TOP CONTROLS BAR: SEARCH, SATELLITE TOGGLE, UPLOAD & ZOOM */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-3 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 shadow-xl">
        
        {/* Search Location Form */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search City or Sector (Mumbai, Wayanad, Chennai, Delhi...)"
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold shadow-md transition-all flex items-center space-x-1"
          >
            <span>FlyTo</span>
          </button>
        </form>

        {/* Action Controls Group */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          
          {/* Map Layer Switcher (Satellite vs Dark Vector) */}
          <button
            onClick={() => setTileMode(tileMode === 'satellite' ? 'dark' : 'satellite')}
            className={`px-3 py-1.5 rounded-lg border font-bold flex items-center space-x-1.5 transition-all ${
              tileMode === 'satellite'
                ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>{tileMode === 'satellite' ? '🛰️ SATELLITE MODE' : '🗺️ VECTOR MODE'}</span>
          </button>

          {/* Quick Media Upload on Map */}
          <label className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold cursor-pointer flex items-center space-x-1.5 hover:bg-emerald-900/60 transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>{uploading ? 'Uploading...' : '📁 Drop Media on Map'}</span>
            <input type="file" accept="image/*,application/pdf,video/*" onChange={handleMapFileUpload} className="hidden" />
          </label>

          {/* Reset Global View */}
          <button
            onClick={() => {
              setMapCenter([19.0760, 72.8777])
              setMapZoom(5)
            }}
            title="Reset Global View"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 hover:border-cyan-400 transition-all"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* LEAFLET MAP CONTAINER */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full bg-[#060911]"
      >
        <MapFlyController targetPos={mapCenter} zoomLevel={mapZoom} />

        {/* TILE LAYER SWITCHER */}
        {tileMode === 'satellite' ? (
          <TileLayer
            attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        ) : (
          <TileLayer
            attribution='&copy; CartoDB'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        )}

        {/* LOCATIONS & MARKERS */}
        {locations.map((loc) => (
          <React.Fragment key={loc.id}>
            <Marker 
              position={[loc.lat, loc.lng]} 
              icon={loc.isCustom ? customUploadIcon : incidentIcon}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 font-mono text-xs text-slate-900 space-y-1.5 max-w-xs">
                  <div className="flex items-center justify-between border-b pb-1">
                    <h4 className="font-bold text-rose-700">{loc.name}</h4>
                    <span className="px-1.5 py-0.5 text-[9px] bg-rose-600 text-white rounded font-bold">{loc.risk}</span>
                  </div>
                  {loc.imageUrl && (
                    <img src={loc.imageUrl} alt="Uploaded Drone Scan" className="w-full h-24 object-cover rounded my-1 border border-slate-300" />
                  )}
                  <p><strong>Victims Stranded:</strong> {loc.people} Individuals</p>
                  <p><strong>Rainfall Rate:</strong> {loc.rain}</p>
                  <p><strong>Assigned Unit:</strong> {loc.team}</p>
                  <p><strong>Relief Hub:</strong> {loc.shelter}</p>
                </div>
              </Popup>
            </Marker>

            {/* Inundation Perimeter Overlay */}
            <Circle
              center={[loc.lat, loc.lng]}
              radius={loc.radius}
              pathOptions={{
                color: loc.risk === 'EXTREME' ? '#f43f5e' : '#f59e0b',
                fillColor: loc.risk === 'EXTREME' ? '#f43f5e' : '#f59e0b',
                fillOpacity: 0.22,
                weight: 2.5
              }}
            />
          </React.Fragment>
        ))}
      </MapContainer>

      {/* MAP STATUS FOOTER BADGE */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/40 text-[10px] font-mono text-cyan-300 flex items-center space-x-2 shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
        <span>GIS SATELLITE ENGINE: <strong className="text-white">ACTIVE</strong> ({locations.length} TARGET SECTORS)</span>
      </div>
    </div>
  )
}
