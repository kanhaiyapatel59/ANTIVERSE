import React, { useState } from 'react'
import Header from '../components/Header'
import { motion } from 'framer-motion'
import { useSidebar } from '../context/SidebarContext'
import { 
  Boxes, 
  Home, 
  Users, 
  Crosshair, 
  Fuel, 
  LifeBuoy, 
  Utensils, 
  HeartPulse, 
  Send, 
  Terminal, 
  Code, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles,
  AlertTriangle
} from 'lucide-react'
import axios from 'axios'
import { generateCivilianSOSQRCode } from '../utils/qrGenerator'
import ResourceInventoryChart from '../components/ResourceInventoryChart'

export default function ResourceAgentPage() {
  const { sidebarOpen } = useSidebar()
  const [location, setLocation] = useState('Mumbai Sector 4')
  const [peopleCount, setPeopleCount] = useState(14)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('visual')

  const locationPresets = [
    { name: 'Mumbai Sector 4', count: 14 },
    { name: 'Wayanad Hillside Settlement', count: 26 },
    { name: 'Guwahati Brahmaputra Bank', count: 8 }
  ]

  React.useEffect(() => {
    try {
      const savedDet = localStorage.getItem('latest_detection')
      const savedLoc = localStorage.getItem('latest_location')
      if (savedDet) {
        const detObj = JSON.parse(savedDet)
        if (detObj.people_detected) {
          setPeopleCount(detObj.people_detected)
          if (savedLoc) setLocation(savedLoc)
          // DO NOT auto-trigger analysis on mount. Only analyze when user explicitly clicks.
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleRunResource = async (loc = location, count = peopleCount) => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.post('/api/v1/agent/resource', {
        people_count: Number(count),
        location: loc
      })
      setResult(response.data)
      try {
        localStorage.setItem('latest_resource', JSON.stringify(response.data))
      } catch (e) {
        console.error(e)
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to connect to Resource Agent API')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 bg-hud-grid pb-12">
      <Header title="Agent 5: Emergency Resource & Shelter Allocation Console" />

      <main className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6 max-w-7xl mx-auto space-y-6`}>
        {/* Agent Metadata Header */}
        <div className="glass-panel p-6 rounded-xl border border-purple-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/40 rounded-xl text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Boxes className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-100 tracking-wide font-mono uppercase">
                  Resource Optimization Agent
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-950 text-purple-400 border border-purple-800 rounded">
                  AGENT 05
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Single Responsibility: Autonomous shelter facility assignment, bed capacity tracking, and emergency logistics supply calculation.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 font-mono text-xs">
            <span className="text-slate-500">ENDPOINT:</span>
            <span className="text-cyan-400 font-bold">POST /api/v1/agent/resource</span>
          </div>
        </div>

        {/* Console Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Logistics Controls & Slider (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Logistics Parameters Input</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </h2>

              {/* Target Location Input */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-mono">Disaster Sector Location:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Target sector..."
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-500 rounded-lg px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {locationPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setLocation(preset.name)
                        setPeopleCount(preset.count)
                        handleRunResource(preset.name, preset.count)
                      }}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded border transition-all ${
                        location === preset.name
                          ? 'bg-purple-950 text-purple-300 border-purple-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {preset.name} ({preset.count} Ppl)
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Victim Slider */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <label className="text-slate-400">Victim Population Requiring Relief:</label>
                  <span className="text-purple-400 font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-800">
                    {peopleCount} People
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="200"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />

                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>1 Victim</span>
                  <span>100 Victims</span>
                  <span>200 Victims</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleRunResource(location, peopleCount)}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                    <span>Allocating Relief Inventories...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Execute Resource Optimization</span>
                  </>
                )}
              </button>

              {error && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs font-mono flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Inventory Allocation HUD (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('visual')}
                  className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center space-x-2 ${
                    activeTab === 'visual'
                      ? 'bg-purple-950/60 text-purple-400 border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Logistics Telemetry HUD</span>
                </button>
                <button
                  onClick={() => setActiveTab('schema')}
                  className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center space-x-2 ${
                    activeTab === 'schema'
                      ? 'bg-purple-950/60 text-purple-400 border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Judge Schema Inspector</span>
                </button>
              </div>

              {result && (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> DB PERSISTED
                </span>
              )}
            </div>

            {/* TAB CONTENT: Visual HUD */}
            {activeTab === 'visual' && (
              <div className="space-y-6">
                {!result && !loading && (
                  <div className="glass-panel p-12 rounded-xl border border-slate-800 text-center space-y-3">
                    <Boxes className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
                    <h3 className="text-sm font-mono text-slate-400 uppercase">Ready for Resource Allocation</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Adjust victim count and click "Execute Resource Optimization" to query emergency shelter inventories.
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="glass-panel p-12 rounded-xl border border-purple-500/30 text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-purple-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    </div>
                    <p className="text-xs font-mono text-purple-400 tracking-widest uppercase">
                      Solving Supply Chain Matrix & Querying Shelter Database...
                    </p>
                  </div>
                )}

                {result && !loading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    {/* Primary Assigned Shelter Card */}
                    <div className="glass-panel p-6 rounded-xl border border-purple-500/40 bg-purple-950/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Home className="w-6 h-6 text-purple-400" />
                          <div>
                            <p className="text-[10px] font-mono text-purple-400 uppercase">Assigned Relief Shelter</p>
                            <h3 className="text-lg font-bold text-slate-100 font-mono">
                              {result.nearest_shelter}
                            </h3>
                          </div>
                        </div>
                        <span className="px-3 py-1 text-xs font-mono bg-purple-900/60 border border-purple-700 text-purple-300 rounded-full">
                          PRIMARY SHELTER
                        </span>
                      </div>

                      {/* Beds Progress Bar */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-400">Shelter Beds Allocated:</span>
                          <span className="text-purple-300 font-bold">{result.beds_available} Beds Assured</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[65%] rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Civilian Evacuation SOS QR Code Card */}
                    <div className="glass-panel p-5 rounded-xl border border-cyan-500/40 bg-slate-950 flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-2 max-w-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold font-mono text-cyan-300 uppercase">
                            📲 Civilian Evacuation SOS Ticket (Offline QR)
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed">
                          Field NDRF personnel can present this scannable QR code to stranded civilians on mobile devices. Contains offline relief shelter address, GPS lat/lon, and emergency helicopter signal instructions.
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-400">
                        <img 
                          src={generateCivilianSOSQRCode(location, result.nearest_shelter)} 
                          alt="Civilian SOS QR Code" 
                          className="w-28 h-28"
                        />
                      </div>
                    </div>

                    {/* Relief Supply Inventory Allocation Bar Chart */}
                    <ResourceInventoryChart peopleCount={peopleCount} />

                    {/* Inventory Allocation Grid (4 Cards) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Food Rations */}
                      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          <Utensils className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">Food Rations</p>
                          <p className="text-xs font-bold text-amber-300 font-mono mt-1">
                            {result.food_rations}
                          </p>
                        </div>
                      </div>

                      {/* Medicine Kits */}
                      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                          <HeartPulse className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">Medical Kits</p>
                          <p className="text-xs font-bold text-rose-300 font-mono mt-1">
                            {result.medicine_kits}
                          </p>
                        </div>
                      </div>

                      {/* Fuel Supply */}
                      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
                        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400">
                          <Fuel className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">Fuel Reserve</p>
                          <p className="text-xs font-bold text-orange-300 font-mono mt-1">
                            {result.fuel_liters}
                          </p>
                        </div>
                      </div>

                      {/* Rescue Boats */}
                      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
                        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                          <LifeBuoy className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">Rescue Boats</p>
                          <p className="text-xs font-bold text-cyan-300 font-mono mt-1">
                            {result.rescue_boats} Motorized Rescue Boats
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* AI Logistics Briefing Terminal */}
                    <div className="glass-panel p-6 rounded-xl border border-purple-500/30 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-xs font-bold font-mono text-purple-300 uppercase">
                          AI Emergency Supply Allocation Briefing
                        </h3>
                        <span className="text-[10px] font-mono text-slate-500">{result.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
                        Allocated {result.nearest_shelter} with {result.beds_available} beds for {peopleCount} victims at {location}. Dispatched {result.food_rations}, {result.medicine_kits}, and {result.rescue_boats} boats.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Schema Inspector */}
            {activeTab === 'schema' && (
              <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold font-mono text-slate-300 uppercase">
                  Pydantic Schema Payload Inspection
                </h3>
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Input Schema (ResourceInput):</span>
                    <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-purple-400 overflow-x-auto">
                      {JSON.stringify({ people_count: peopleCount, location: location }, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Output Schema (ResourceOutput):</span>
                    <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-emerald-400 overflow-x-auto">
                      {result ? JSON.stringify(result, null, 2) : '// Execute allocation to view output payload'}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
