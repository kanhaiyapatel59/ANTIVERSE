import React, { useState } from 'react'
import Header from '../components/Header'
import { motion } from 'framer-motion'
import { useSidebar } from '../context/SidebarContext'
import { 
  Navigation, 
  Shield, 
  Clock, 
  CheckSquare, 
  Square, 
  Send, 
  Terminal, 
  Code, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Truck
} from 'lucide-react'
import axios from 'axios'

export default function RouteAgentPage() {
  const { sidebarOpen } = useSidebar()
  const [location, setLocation] = useState('Mumbai Sector 4 Coastal Zone')
  const [selectedTeams, setSelectedTeams] = useState([
    'NDRF Team Alpha', 
    'Fire Battalion 4', 
    'District Rescue Squad 2'
  ])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('visual')

  const availableUnitOptions = [
    { id: 'NDRF Team Alpha', name: 'NDRF Battalion 8 - Alpha Rapid Force', type: 'Heavy Amphibious' },
    { id: 'Fire Battalion 4', name: 'District Fire & Rescue Battalion 4', type: 'Dewatering & Cutters' },
    { id: 'District Rescue Squad 2', name: 'District Disaster Taskforce 2', type: 'Evacuation ATVs' },
    { id: 'Coast Guard Marine Unit', name: 'Coast Guard Marine Division', type: 'Coastal RIB Boats' }
  ]

  const locationPresets = [
    { name: 'Mumbai Sector 4 Coastal Zone', desc: 'Submerged Residential Corridor' },
    { name: 'Wayanad Hillside Settlement', desc: 'Saturated Mountain Ridge' },
    { name: 'Guwahati Brahmaputra Bank', desc: 'Riverbank Breach Zone' }
  ]

  const toggleTeam = (teamId) => {
    if (selectedTeams.includes(teamId)) {
      if (selectedTeams.length > 1) {
        setSelectedTeams(selectedTeams.filter(t => t !== teamId))
      }
    } else {
      setSelectedTeams([...selectedTeams, teamId])
    }
  }

  const handleRunRoute = async (targetLoc = location) => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.post('/api/v1/agent/route', {
        incident_location: targetLoc,
        available_teams: selectedTeams
      })
      setResult(response.data)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to connect to Route Agent API')
    } finally {
      setLoading(false)
    }
  }

  // Parse waypoints string into visual step array
  const getWaypoints = (routeStr) => {
    if (!routeStr) return []
    return routeStr.split('->').map(s => s.trim())
  }

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 bg-hud-grid pb-12">
      <Header title="Agent 4: Tactical Navigation & Rescue Routing Console" />

      <main className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6 max-w-7xl mx-auto space-y-6`}>
        {/* Agent Metadata Header */}
        <div className="glass-panel p-6 rounded-xl border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Navigation className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-100 tracking-wide font-mono uppercase">
                  Tactical Route Agent
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                  AGENT 04
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Single Responsibility: Evaluates available rescue forces and calculates safe, obstacle-free transit corridors bypassing flooded blockages.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 font-mono text-xs">
            <span className="text-slate-500">ENDPOINT:</span>
            <span className="text-cyan-400 font-bold">POST /api/v1/agent/route</span>
          </div>
        </div>

        {/* Console Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Dispatch Controls & Available Units (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Dispatch Setup Controls</span>
                <Truck className="w-4 h-4 text-emerald-400" />
              </h2>

              {/* Target Location Input & Presets */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-mono">Incident Target Location:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Target location..."
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-500 rounded-lg px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {locationPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setLocation(preset.name)
                        handleRunRoute(preset.name)
                      }}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded border transition-all ${
                        location === preset.name
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {preset.name.split(' ')[0]} {preset.name.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Rescue Units Checklist */}
              <div className="space-y-2 pt-2">
                <label className="text-xs text-slate-400 font-mono">Available Forces Checklist:</label>
                <div className="space-y-2">
                  {availableUnitOptions.map((unit) => {
                    const isSelected = selectedTeams.includes(unit.id)
                    return (
                      <div
                        key={unit.id}
                        onClick={() => toggleTeam(unit.id)}
                        className={`p-3 rounded-lg border transition-all text-xs font-mono cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                            : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          )}
                          <div>
                            <span className="font-bold text-slate-200 block">{unit.name}</span>
                            <span className="text-[10px] text-slate-500">{unit.type}</span>
                          </div>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                          READY
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleRunRoute(location)}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Calculating Transit Waypoints...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch Tactical Rescue Unit</span>
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

          {/* Right Column: Routing HUD & Waypoint Steps (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('visual')}
                  className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center space-x-2 ${
                    activeTab === 'visual'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Navigation HUD</span>
                </button>
                <button
                  onClick={() => setActiveTab('schema')}
                  className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center space-x-2 ${
                    activeTab === 'schema'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
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
                    <Navigation className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
                    <h3 className="text-sm font-mono text-slate-400 uppercase">Ready for Unit Dispatch</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Click "Dispatch Tactical Rescue Unit" to evaluate available forces and solve obstacle-free routes.
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="glass-panel p-12 rounded-xl border border-emerald-500/30 text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    </div>
                    <p className="text-xs font-mono text-emerald-400 tracking-widest uppercase">
                      Computing Satellite Road Safety Corridor & Unit Selection...
                    </p>
                  </div>
                )}

                {result && !loading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    {/* Top Assigned Unit & ETA Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Assigned Unit */}
                      <div className="glass-panel p-5 rounded-xl border border-emerald-500/40 bg-emerald-950/20">
                        <p className="text-[10px] font-mono text-emerald-400 uppercase">Assigned Unit Force</p>
                        <p className="text-sm font-bold text-slate-100 font-mono mt-1">
                          {result.best_rescue_team}
                        </p>
                        <span className="mt-2 inline-block px-2 py-0.5 text-[9px] font-mono bg-emerald-900/60 border border-emerald-700 text-emerald-300 rounded">
                          OPTIMAL MATCH
                        </span>
                      </div>

                      {/* Calculated ETA */}
                      <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">Estimated Time of Arrival</p>
                          <p className="text-lg font-bold text-cyan-300 font-mono mt-1">
                            {result.eta}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                          <Clock className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Waypoint Transit Corridor Visualizer */}
                    <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold font-mono text-slate-300 uppercase flex items-center space-x-2">
                        <Navigation className="w-4 h-4 text-emerald-400" />
                        <span>Tactical Transit Corridor Waypoints</span>
                      </h4>

                      <div className="space-y-3 pt-1">
                        {getWaypoints(result.best_route).map((step, idx) => (
                          <div key={idx} className="flex items-center space-x-3 text-xs font-mono">
                            <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </div>
                            <div className="flex-1 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200">
                              {step}
                            </div>
                            {idx < getWaypoints(result.best_route).length - 1 && (
                              <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Tactical Route Briefing Box */}
                    <div className="glass-panel p-6 rounded-xl border border-emerald-500/30 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-xs font-bold font-mono text-emerald-300 uppercase">
                          AI Tactical Unit Dispatch Briefing
                        </h3>
                        <span className="text-[10px] font-mono text-slate-500">{result.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
                        Dispatched {result.best_rescue_team} via safe corridor: {result.best_route}. Expected arrival window: {result.eta}.
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
                    <span className="text-slate-400 block mb-1">Input Schema (RouteInput):</span>
                    <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-emerald-400 overflow-x-auto">
                      {JSON.stringify({ incident_location: location, available_teams: selectedTeams }, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Output Schema (RouteOutput):</span>
                    <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-cyan-400 overflow-x-auto">
                      {result ? JSON.stringify(result, null, 2) : '// Execute dispatch to view output payload'}
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
