import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import InteractiveMap from '../components/InteractiveMap'
import ActivityFeed from '../components/ActivityFeed'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSidebar } from '../context/SidebarContext'
import { useTheme } from '../context/ThemeContext'
import { 
  ShieldAlert, 
  Users, 
  CloudRain, 
  Home, 
  Truck, 
  Cpu, 
  Activity, 
  ChevronRight, 
  CheckCircle2,
  BarChart3,
  Zap
} from 'lucide-react'
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell 
} from 'recharts'
import axios from 'axios'
import SOSTriageQueue from '../components/SOSTriageQueue'

export default function DashboardPage() {
  const [incidents, setIncidents] = useState([])
  const { sidebarOpen } = useSidebar()
  const { theme } = useTheme()

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const resp = await axios.get('/api/v1/incidents')
        if (resp.data.status === 'success') {
          setIncidents(resp.data.incidents)
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchIncidents()
  }, [])

  const agentStatuses = [
    { id: 1, name: 'Agent 01: Weather', status: 'ONLINE', path: '/weather', color: 'border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20' },
    { id: 2, name: 'Agent 02: Detection', status: 'ONLINE', path: '/detection', color: 'border-teal-500/30 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20' },
    { id: 3, name: 'Agent 03: Prediction', status: 'ONLINE', path: '/prediction', color: 'border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20' },
    { id: 4, name: 'Agent 04: Route', status: 'ONLINE', path: '/route', color: 'border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20' },
    { id: 5, name: 'Agent 05: Resource', status: 'ONLINE', path: '/resource', color: 'border-purple-500/30 text-purple-700 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20' },
    { id: 6, name: 'Agent 06: Communication', status: 'ONLINE', path: '/communication', color: 'border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20' },
  ]

  // Derive live KPI metrics from fetched incidents
  const totalVictims = incidents.reduce((sum, inc) => sum + (inc.people_affected || 0), 0)
  const activeSectors = incidents.length || 0
  const rescueSquads = Math.max(1, Math.ceil(activeSectors * 1.2)) // 1 squad per ~0.8 sectors

  const analyticsData = incidents.length > 0
    ? incidents.slice(0, 4).map((inc, i) => ({
        sector: inc.location?.split(' ')[0] || `Sector ${i + 1}`,
        victims: inc.people_affected || 0,
        color: ['#2563EB', '#7C3AED', '#D97706', '#0284C7'][i % 4]
      }))
    : [
        { sector: 'Mumbai', victims: 14, color: '#2563EB' },
        { sector: 'Wayanad', victims: 26, color: '#7C3AED' },
        { sector: 'Guwahati', victims: 8, color: '#D97706' },
        { sector: 'Chennai', victims: 18, color: '#0284C7' },
      ]

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] bg-hud-grid pb-16 transition-colors duration-300">
      <Header title="National Disaster Operations Command Center" />

      <main className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6 max-w-7xl mx-auto space-y-6`}>
        
        {/* EXECUTIVE KPI STATISTICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Affected Sectors */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-panel p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[10px] font-mono text-blue-700 dark:text-blue-400 uppercase font-bold tracking-wider">Disaster Sectors</p>
              <p className="text-2xl font-black font-mono text-[var(--text-main)] mt-1">{activeSectors > 0 ? `${activeSectors} Active` : '0 Active'}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 shadow-sm">
              <CloudRain className="w-5 h-5 animate-pulse" />
            </div>
          </motion.div>

          {/* Card 2: People Affected */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-panel p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[10px] font-mono text-teal-700 dark:text-teal-400 uppercase font-bold tracking-wider">Victims Affected</p>
              <p className="text-2xl font-black font-mono text-[var(--text-main)] mt-1">{totalVictims > 0 ? `${totalVictims} People` : '—'}</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-600 shadow-sm">
              <Users className="w-5 h-5 animate-bounce" />
            </div>
          </motion.div>

          {/* Card 3: Peak Risk */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-panel p-4 rounded-2xl border border-rose-300 dark:border-rose-800 bg-[var(--bg-surface)] flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[10px] font-mono text-rose-700 dark:text-rose-400 uppercase font-bold tracking-wider">Peak Flood Risk</p>
              <p className="text-xl font-black font-mono text-rose-600 dark:text-rose-300 mt-1 tracking-widest">EXTREME</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 shadow-sm">
              <ShieldAlert className="w-5 h-5 animate-ping" />
            </div>
          </motion.div>

          {/* Card 4: Shelters */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-panel p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[10px] font-mono text-purple-700 dark:text-purple-400 uppercase font-bold tracking-wider">Shelter Capacity</p>
              <p className="text-sm font-black font-mono text-[var(--text-main)] mt-1">12 Shelters / 540 Beds</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-600 shadow-sm">
              <Home className="w-5 h-5" />
            </div>
          </motion.div>

          {/* Card 5: Rescue Teams */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-panel p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-bold tracking-wider">Rescue Forces</p>
              <p className="text-sm font-black font-mono text-[var(--text-main)] mt-1">{rescueSquads} NDRF Squads</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
          </motion.div>
        </div>

        {/* CENTER SECTION: MAP & AGENT MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: GIS Satellite Map (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="glass-panel p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <h3 className="text-xs font-bold font-mono text-[var(--text-main)] uppercase flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span className="tracking-wide">Real-Time GIS Tactical Satellite Map</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> SATELLITE ONLINE
                </span>
              </div>
              <InteractiveMap />
            </div>

            {/* Civilian Emergency SOS Triage Queue Component */}
            <SOSTriageQueue />
          </div>

          {/* Right Panel: Day 2 Commander & Specialized Agents Launcher (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Day 2 Commander Launcher */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="glass-panel p-5 rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-[var(--bg-surface)] space-y-3 shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950/50 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 shadow-sm">
                  <Cpu className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-[var(--text-main)] font-mono tracking-wide">Day 2 Commander</h4>
                    <span className="px-2 py-0.5 text-[9px] font-mono bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 rounded-full font-bold">
                      LANGGRAPH
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">Multi-Agent StateGraph Orchestrator</p>
                </div>
              </div>

              <Link
                to="/commander"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 hover:from-blue-600 hover:to-purple-600 text-white text-xs font-bold font-mono tracking-wider flex items-center justify-center space-x-2 shadow-md transition-all uppercase"
              >
                <Zap className="w-4 h-4 text-purple-200" />
                <span>Launch Day 2 Commander</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Specialized Agents Grid */}
            <div className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                <h3 className="text-xs font-bold font-mono text-[var(--text-main)] uppercase tracking-wide">
                  Specialized Agent Matrix
                </h3>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">6 ONLINE</span>
              </div>

              <div className="space-y-2">
                {agentStatuses.map((agent) => (
                  <Link
                    key={agent.id}
                    to={agent.path}
                    className={`p-2.5 rounded-xl border flex items-center justify-between hover:scale-[1.01] transition-all group ${agent.color}`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-xs font-mono font-bold text-[var(--text-main)] group-hover:text-blue-600 transition-colors">
                        {agent.name}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-emerald-600">
                      {agent.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: ACTIVITY AUDIT FEED & ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Live Activity Feed (7 cols) */}
          <div className="lg:col-span-7">
            <ActivityFeed />
          </div>

          {/* Right: Disaster Analytics Chart (5 cols) */}
          <div className="lg:col-span-5">
            <div className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold font-mono text-[var(--text-main)] uppercase">
                    Victims Distribution by Disaster Sector
                  </h3>
                </div>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <XAxis dataKey="sector" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                    <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#111827' : '#FFFFFF', 
                        borderColor: theme === 'dark' ? '#374151' : '#E6E1D8', 
                        borderRadius: '12px', 
                        fontSize: '11px',
                        color: theme === 'dark' ? '#F8FAFC' : '#1E293B'
                      }}
                    />
                    <Bar dataKey="victims" radius={[6, 6, 0, 0]}>
                      {analyticsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
