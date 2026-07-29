import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { motion, AnimatePresence } from 'framer-motion'
import { useSidebar } from '../context/SidebarContext'
import { 
  History, 
  Search, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  X, 
  CheckCircle2, 
  Database,
  ChevronRight
} from 'lucide-react'
import axios from 'axios'

export default function HistoryPage() {
  const { sidebarOpen } = useSidebar()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIncident, setSelectedIncident] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const resp = await axios.get('/api/v1/incidents')
        if (resp.data.status === 'success') {
          setIncidents(resp.data.incidents)
        }
      } catch (err) {
        console.error("Error fetching history:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const filteredIncidents = incidents.filter(inc => 
    inc.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 bg-hud-grid pb-16">
      <Header title="Historical Incident Audit Log & Database Archive" />

      <main className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6 max-w-7xl mx-auto space-y-6`}>
        {/* Banner Header */}
        <div className="glass-panel p-6 rounded-xl border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/40 rounded-xl text-cyan-400">
              <History className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 font-mono uppercase tracking-wide">
                Incident Audit Database Archive
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Persistent storage of past multi-agent disaster response plans (MongoDB & SQLite).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-xs text-cyan-400">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>COLLECTIONS: 8 ACTIVE</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Incident ID or Location (e.g. Mumbai, INC-)..."
              className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-500 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-100 font-mono"
            />
          </div>
          <span className="text-xs font-mono text-slate-400">
            Showing {filteredIncidents.length} Records
          </span>
        </div>

        {/* Incident Record Cards */}
        {loading && (
          <div className="glass-panel p-12 rounded-xl text-center font-mono text-xs text-slate-400">
            Loading Incident Audit Records...
          </div>
        )}

        {!loading && filteredIncidents.length === 0 && (
          <div className="glass-panel p-12 rounded-xl text-center space-y-2">
            <p className="text-sm font-mono text-slate-400">No past incident records found.</p>
            <p className="text-xs text-slate-500">Run the Commander Agent on Day 2 to generate new master incident records.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredIncidents.map((incident) => (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-mono font-bold text-cyan-400">{incident.id}</span>
                  <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                    {incident.status || 'COMPLETED'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-sm font-bold text-slate-100 font-mono">
                    <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">{incident.location}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans line-clamp-2">
                    {incident.summary || 'Multi-agent disaster response plan executed across all 6 specialized agents.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs">
                <span className="text-[10px] text-slate-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {incident.timestamp ? new Date(incident.timestamp).toLocaleString() : 'N/A'}
                </span>

                <button
                  onClick={() => setSelectedIncident(incident)}
                  className="inline-flex items-center text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Inspect Plan <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal Inspector for Selected Incident */}
        <AnimatePresence>
          {selectedIncident && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel p-6 rounded-xl border border-cyan-500/40 max-w-3xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400">HISTORICAL RECORD</span>
                    <h3 className="text-base font-bold text-slate-100 font-mono">{selectedIncident.id}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>Location: <strong className="text-slate-100">{selectedIncident.location}</strong></span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block">Full Master Disaster Response Plan:</span>
                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 whitespace-pre-wrap leading-relaxed">
                      {selectedIncident.full_plan || selectedIncident.summary}
                    </pre>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
