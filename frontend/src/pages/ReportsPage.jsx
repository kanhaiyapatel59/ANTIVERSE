import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { motion } from 'framer-motion'
import { FileText, ShieldAlert, Download, Copy, CheckCircle2 } from 'lucide-react'
import { useSidebar } from '../context/SidebarContext'
import axios from 'axios'

export default function ReportsPage() {
  const { sidebarOpen } = useSidebar()
  const [incidents, setIncidents] = useState([])
  const [copied, setCopied] = useState(false)

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

  const copyReport = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 bg-hud-grid pb-16">
      <Header title="Executive Emergency Action Plan Briefings" />

      <main className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6 max-w-7xl mx-auto space-y-6`}>
        {/* Banner */}
        <div className="glass-panel p-6 rounded-xl border border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/40 rounded-xl text-purple-400">
              <FileText className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 font-mono uppercase tracking-wide">
                Executive Action Plan Briefings
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Formal disaster response directives generated for District Collectors, Police Chiefs, and NDRF HQ.
              </p>
            </div>
          </div>
        </div>

        {/* Master Briefings List */}
        <div className="space-y-6">
          {incidents.length === 0 && (
            <div className="glass-panel p-12 rounded-xl text-center space-y-2">
              <p className="text-sm font-mono text-slate-400">No executive briefings recorded yet.</p>
              <p className="text-xs text-slate-500">Run the Day 2 Commander Agent to generate formal response briefings.</p>
            </div>
          )}

          {incidents.map((incident) => (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <ShieldAlert className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="text-[10px] font-mono text-slate-500">EXECUTIVE BRIEFING // {incident.id}</span>
                    <h3 className="text-sm font-bold text-slate-100 font-mono">{incident.location}</h3>
                  </div>
                </div>

                <button
                  onClick={() => copyReport(incident.full_plan)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 hover:border-cyan-500 flex items-center space-x-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY REPORT'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                {incident.full_plan || incident.summary}
              </pre>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
