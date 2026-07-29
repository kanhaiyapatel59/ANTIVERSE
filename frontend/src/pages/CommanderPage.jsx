import React, { useState } from 'react'
import Header from '../components/Header'
import { motion, AnimatePresence } from 'framer-motion'
import { useSidebar } from '../context/SidebarContext'
import { 
  Cpu, 
  CloudRain, 
  Eye, 
  TrendingUp, 
  Navigation, 
  Boxes, 
  Radio, 
  Send, 
  Terminal, 
  Code, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles,
  ShieldAlert,
  Zap,
  Activity,
  Layers,
  Upload
} from 'lucide-react'
import axios from 'axios'
import { exportIncidentPDF } from '../utils/pdfExporter'
import { exportNDMADebriefPDF } from '../utils/ndmaPdfExporter'
import GISMap from '../components/GISMap'
import RiskRadarChart from '../components/RiskRadarChart'
import BenchmarkHUD from '../components/BenchmarkHUD'
import IncidentReplayModal from '../components/IncidentReplayModal'
import FinancialDamageCard from '../components/FinancialDamageCard'

export default function CommanderPage() {
  const { sidebarOpen } = useSidebar()
  const [location, setLocation] = useState('Mumbai Sector 4 Coastal Zone')
  const [imageUrl, setImageUrl] = useState('rooftop_flooding')
  const [peopleCount, setPeopleCount] = useState(14)
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeNodeIndex, setActiveNodeIndex] = useState(-1) // 0: Weather, 1: Detection, 2: Prediction, 3: Route, 4: Resource, 5: Comm, 6: Complete
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('plan') // 'plan' | 'telemetry' | 'schema'
  const [showReplayModal, setShowReplayModal] = useState(false)

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axios.post('/api/v1/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data.url) {
        setImageUrl(res.data.url)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to upload image file to backend server')
    } finally {
      setUploading(false)
    }
  }

  const locationPresets = [
    { name: 'Mumbai Sector 4 Coastal Zone', img: 'rooftop_flooding', count: 14 },
    { name: 'Wayanad Hillside Settlement', img: 'urban_inundation', count: 26 },
    { name: 'Bridge River Crossing Breach', img: 'bridge_collapse', count: 18 },
    { name: 'Embankment Flood Overflow', img: 'riverbank_breach', count: 32 }
  ]

  const agentCards = [
    { id: 'weather', name: 'Agent 01: Weather', icon: CloudRain, color: 'text-blue-400 border-blue-500/40 bg-blue-950/30' },
    { id: 'detection', name: 'Agent 02: Detection', icon: Eye, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30' },
    { id: 'prediction', name: 'Agent 03: Prediction', icon: TrendingUp, color: 'text-amber-400 border-amber-500/40 bg-amber-950/30' },
    { id: 'route', name: 'Agent 04: Route', icon: Navigation, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' },
    { id: 'resources', name: 'Agent 05: Resource', icon: Boxes, color: 'text-purple-400 border-purple-500/40 bg-purple-950/30' },
    { id: 'communication', name: 'Agent 06: Communication', icon: Radio, color: 'text-rose-400 border-rose-500/40 bg-rose-950/30' },
  ]

  const handleOrchestrate = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    setActiveNodeIndex(0)

    // Simulate step-by-step glowing node transitions while API call executes
    const timerInterval = setInterval(() => {
      setActiveNodeIndex((prev) => {
        if (prev < 5) return prev + 1
        return prev
      })
    }, 600)

    try {
      const response = await axios.post('/api/v1/commander/orchestrate', {
        location: location,
        image_url: imageUrl,
        people_count: Number(peopleCount)
      })
      
      clearInterval(timerInterval)
      setActiveNodeIndex(6) // Finished synthesis
      setResult(response.data)
    } catch (err) {
      console.error(err)
      clearInterval(timerInterval)
      setError(err.response?.data?.detail || 'Failed to execute Commander Agent LangGraph pipeline')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 bg-hud-grid pb-16">
      <Header title="Commander Agent (LangGraph Multi-Agent Orchestrator)" />

      <main className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6 max-w-7xl mx-auto space-y-6`}>
        {/* Day 2 Commander Banner */}
        <div className="glass-panel p-6 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-cyan-950/40 flex flex-wrap items-center justify-between gap-4 shadow-[0_0_30px_rgba(147,51,234,0.2)]">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/20 border border-purple-500/50 rounded-xl text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <Cpu className="w-8 h-8 animate-pulse text-purple-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-100 tracking-wide font-mono uppercase">
                  LangGraph Master Orchestrator
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full font-bold">
                  DAY 2 COMMANDER
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Orchestrates all 6 specialized AI agents through a state graph state machine into one authoritative Master Disaster Response Plan.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/90 px-3.5 py-2 rounded-lg border border-slate-800 font-mono text-xs">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-slate-400">ENGINE:</span>
            <span className="text-purple-300 font-bold">LangGraph + Groq LPU</span>
          </div>
        </div>

        {/* Console Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Disaster Emergency Inputs (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Emergency Incident Trigger</span>
                <ShieldAlert className="w-4 h-4 text-purple-400" />
              </h2>

              {/* Presets */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-mono">Disaster Scenario Presets:</label>
                <div className="space-y-2">
                  {locationPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setLocation(preset.name)
                        setImageUrl(preset.img)
                        setPeopleCount(preset.count)
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-all text-xs font-mono flex flex-col justify-between ${
                        location === preset.name
                          ? 'bg-purple-950/50 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <span className="font-bold text-slate-200">{preset.name}</span>
                      <span className="text-[10px] text-slate-500">{preset.count} Victims | Drone Stream Attached</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Input */}
              <div className="space-y-1 pt-1">
                <label className="text-xs text-slate-400 font-mono">Incident Target Sector:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-purple-500 rounded-lg px-4 py-2.5 text-xs text-slate-100 font-mono"
                />
              </div>

              {/* Local Image/PDF/Video File Upload */}
              <div className="pt-1">
                <label className="text-xs text-slate-400 font-mono block mb-1">Upload Media (Image, PDF Report, or Video Feed):</label>
                <label className="w-full py-2.5 px-4 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-500 text-purple-300 font-mono text-xs cursor-pointer flex items-center justify-center space-x-2 transition-all">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>{uploading ? 'Uploading Media File...' : '📁 Upload Image, PDF or Video'}</span>
                  <input type="file" accept="image/*,application/pdf,video/*" onChange={handleFileUpload} className="hidden" />
                </label>
                {imageUrl.startsWith('http') && (
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block truncate">
                    ✓ Uploaded Media: {imageUrl.split('/').pop()}
                  </span>
                )}
              </div>

              {/* Victim Slider */}
              <div className="space-y-2 pt-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Victim Population:</span>
                  <span className="text-purple-300 font-bold">{peopleCount} People</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="150"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Master Execute Button */}
              <button
                onClick={handleOrchestrate}
                disabled={loading}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all flex items-center justify-center space-x-2.5 disabled:opacity-50 transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-purple-200" />
                    <span className="tracking-wider uppercase">Orchestrating Graph Nodes...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-5 h-5" />
                    <span className="tracking-wider uppercase">ORCHESTRATE MULTI-AGENT PLAN</span>
                  </>
                )}
              </button>

              {error && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs font-mono flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Real-Time Node Lighting Matrix & Response Plan (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 6 Agent Sequence Matrix Cards (Lighting Up in Sequence) */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
                  <h3 className="text-xs font-bold font-mono text-slate-200 uppercase">
                    LangGraph Multi-Agent Execution Pipeline
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {loading ? `EXECUTING NODE 0${activeNodeIndex + 1} OF 06` : result ? 'GRAPH EXECUTION COMPLETE' : 'STANDBY'}
                </span>
              </div>

              {/* 6 Agent Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {agentCards.map((agent, idx) => {
                  const Icon = agent.icon
                  const isActive = loading && activeNodeIndex === idx
                  const isDone = (loading && activeNodeIndex > idx) || result !== null
                  const agentOutputKey = agent.id === 'resources' ? 'resources' : agent.id
                  const outputData = result?.incident_state?.[agentOutputKey]

                  return (
                    <div
                      key={agent.id}
                      className={`p-3 rounded-xl border transition-all duration-500 relative flex flex-col justify-between h-24 ${
                        isActive
                          ? 'bg-purple-950/80 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.6)] scale-[1.03] z-10'
                          : isDone
                            ? 'bg-slate-900/90 border-slate-700/80 text-slate-200'
                            : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-purple-300 animate-bounce' : isDone ? 'text-cyan-400' : 'text-slate-600'}`} />
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                        )}
                        {isDone && !isActive && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold font-mono truncate">{agent.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                          {isActive
                            ? 'ANALYZING...'
                            : isDone && outputData
                              ? 'OUTPUT POPULATED'
                              : 'IDLE'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* TAB CONTENT SWITCHER */}
            {result && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('plan')}
                      className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center space-x-2 ${
                        activeTab === 'plan'
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Master Response Plan</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('telemetry')}
                      className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center space-x-2 ${
                        activeTab === 'telemetry'
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>All 6 Agent Telemetries</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('schema')}
                      className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center space-x-2 ${
                        activeTab === 'schema'
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>State Payload</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <button
                      onClick={() => setShowReplayModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-purple-950 border border-purple-500 text-purple-300 hover:bg-purple-900 font-mono text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all"
                    >
                      <span>📼 Open Black Box Replay</span>
                    </button>
                    <button
                      onClick={() => exportNDMADebriefPDF(result?.incident_state || {}, result?.master_plan)}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center space-x-1.5 transition-all"
                    >
                      <span>📜 Export Official NDMA Debrief PDF</span>
                    </button>
                    <button
                      onClick={() => exportIncidentPDF(result?.incident_state, result?.master_plan)}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center space-x-1.5 transition-all"
                    >
                      <span>📥 Export Official NDRF PDF</span>
                    </button>
                  </div>
                </div>

                {/* MASTER DISASTER RESPONSE PLAN TAB */}
                {activeTab === 'plan' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Financial Damage Assessment & Relief Fund Allocator Card */}
                    <FinancialDamageCard peopleCount={peopleCount} floodAreaPct={82.5} />
                    {/* Real-time AI Model Precision Benchmark HUD */}
                    <BenchmarkHUD />

                    {/* Live Satellite GIS Map + Risk Radar Matrix */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <GISMap 
                        locationName={location} 
                        peopleCount={peopleCount} 
                        rescueTeam={result.incident_state?.route?.best_rescue_team || "NDRF Battalion 8"}
                      />
                      <RiskRadarChart 
                        peopleCount={peopleCount} 
                        floodPct={result.incident_state?.detection?.flood_percentage || 82.5}
                        windSpeed={result.incident_state?.weather?.wind_speed_kmh || 48.5}
                        roadStatus={result.incident_state?.prediction?.road_accessibility || "BLOCKED"}
                      />
                    </div>

                    <div className="glass-panel p-6 rounded-xl border border-purple-500/40 space-y-4 bg-purple-950/10 shadow-[0_0_25px_rgba(147,51,234,0.15)]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <h3 className="text-xs font-bold font-mono text-purple-300 uppercase">
                            Final Synthesized Master Response Directive
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">INCIDENT ID: {result.incident_id}</span>
                      </div>

                      <pre className="bg-slate-950/90 p-5 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-100 whitespace-pre-wrap leading-relaxed shadow-inner">
                        {result.master_plan}
                      </pre>
                    </div>
                  </motion.div>
                )}

                {/* ALL 6 AGENT TELEMETRIES TAB */}
                {activeTab === 'telemetry' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
                      <span className="text-blue-400 font-bold block">1. WEATHER TELEMETRY</span>
                      <p className="text-slate-300 text-[11px]">Risk: {result.incident_state?.weather?.flood_risk}</p>
                      <p className="text-slate-400 text-[10px]">{result.incident_state?.weather?.rainfall}</p>
                    </div>

                    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
                      <span className="text-cyan-400 font-bold block">2. AERIAL DETECTION</span>
                      <p className="text-slate-300 text-[11px]">Victims: {result.incident_state?.detection?.people_detected} Stranded</p>
                      <p className="text-slate-400 text-[10px]">Flood Coverage: {result.incident_state?.detection?.flood_percentage}%</p>
                    </div>

                    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
                      <span className="text-amber-400 font-bold block">3. HYDRO PREDICTION</span>
                      <p className="text-slate-300 text-[11px]">Rise: {result.incident_state?.prediction?.water_rise_estimate}</p>
                      <p className="text-slate-400 text-[10px]">Urgency: {result.incident_state?.prediction?.urgency}</p>
                    </div>

                    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
                      <span className="text-emerald-400 font-bold block">4. TACTICAL ROUTE</span>
                      <p className="text-slate-300 text-[11px]">Team: {result.incident_state?.route?.best_rescue_team}</p>
                      <p className="text-slate-400 text-[10px]">ETA: {result.incident_state?.route?.eta}</p>
                    </div>

                    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
                      <span className="text-purple-400 font-bold block">5. RESOURCE LOGISTICS</span>
                      <p className="text-slate-300 text-[11px]">Shelter: {result.incident_state?.resources?.nearest_shelter}</p>
                      <p className="text-slate-400 text-[10px]">Boats: {result.incident_state?.resources?.rescue_boats} Deployed</p>
                    </div>

                    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
                      <span className="text-rose-400 font-bold block">6. COMMUNICATIONS</span>
                      <p className="text-slate-300 text-[11px]">SMS & Broadcast Alerts Ready</p>
                      <p className="text-slate-400 text-[10px]">NDRF HQ Briefing Generated</p>
                    </div>
                  </motion.div>
                )}

                {/* SCHEMA TAB */}
                {activeTab === 'schema' && (
                  <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4 font-mono text-xs">
                    <h3 className="text-xs font-bold text-purple-300 uppercase">LangGraph Shared IncidentState Payload</h3>
                    <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-purple-300 overflow-x-auto max-h-96">
                      {JSON.stringify(result.incident_state, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <IncidentReplayModal
        isOpen={showReplayModal}
        onClose={() => setShowReplayModal(false)}
        incidentData={result}
      />
    </div>
  )
}
