import React, { useEffect, useState } from 'react'
import { Activity, Clock, CheckCircle2 } from 'lucide-react'
import axios from 'axios'

export default function ActivityFeed() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    try {
      const resp = await axios.get('/api/v1/activities?limit=15')
      if (resp.data.status === 'success') {
        setActivities(resp.data.activities)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    const timer = setInterval(fetchLogs, 4000)
    return () => clearInterval(timer)
  }, [])

  const getAgentBadgeColor = (name) => {
    switch (name) {
      case 'WeatherAgent': return 'text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40'
      case 'DetectionAgent': return 'text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40'
      case 'PredictionAgent': return 'text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40'
      case 'RouteAgent': return 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40'
      case 'ResourceAgent': return 'text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40'
      case 'CommunicationAgent': return 'text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40'
      case 'CommanderAgent': return 'text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-600 bg-purple-100 dark:bg-purple-950/80 font-bold'
      default: return 'text-[var(--text-muted)] border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]'
    }
  }

  return (
    <div className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4 shadow-md">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
          <h3 className="text-xs font-bold font-mono text-[var(--text-main)] uppercase">
            Live Multi-Agent Activity Audit Feed
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)] font-medium">AUTO-SYNC (4s)</span>
      </div>

      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 font-mono text-xs">
        {loading && (
          <p className="text-[var(--text-muted)] text-xs py-4 text-center">Loading audit telemetry...</p>
        )}

        {!loading && activities.length === 0 && (
          <p className="text-[var(--text-muted)] text-xs py-4 text-center">No activity logs recorded yet.</p>
        )}

        {activities.map((log) => (
          <div
            key={log.id}
            className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-start justify-between gap-3 hover:border-blue-400/40 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${getAgentBadgeColor(log.agent_name)}`}>
                    {log.agent_name}
                  </span>
                  <span className="text-[var(--text-main)] font-bold text-[11px]">{log.action}</span>
                </div>
                {log.details && (
                  <p className="text-[11px] text-[var(--text-muted)] mt-1 font-sans leading-relaxed">{log.details}</p>
                )}
              </div>
            </div>

            <span className="text-[9px] text-[var(--text-subtle)] flex-shrink-0 flex items-center mt-0.5 font-bold">
              <Clock className="w-3 h-3 mr-1" />
              {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'NOW'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
