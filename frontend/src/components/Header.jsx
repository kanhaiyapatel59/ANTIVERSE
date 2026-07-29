import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  Radio, 
  Zap, 
  PanelLeftOpen, 
  PanelLeftClose, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Palette,
  ShieldAlert,
  ChevronDown
} from 'lucide-react'
import { useSidebar } from '../context/SidebarContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth, ROLES } from '../context/AuthContext'
import { initVoiceRecognition, startVoiceListening, stopVoiceListening } from '../utils/voiceController'

export default function Header({ title = "Disaster Operations Dashboard" }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString())
  const [showAlertsDrawer, setShowAlertsDrawer] = useState(false)
  const [showThemeDropdown, setShowThemeDropdown] = useState(false)
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [isAutonomousActive, setIsAutonomousActive] = useState(false)
  const [autonomousToast, setAutonomousToast] = useState('')
  const { role: currentRole, setRole } = useAuth()
  const { sidebarOpen, toggleSidebar, meshMode, toggleMeshMode } = useSidebar()
  const { theme, setTheme, themes } = useTheme()
  const navigate = useNavigate()
  const themeMenuRef = useRef(null)
  const alertDrawerRef = useRef(null)
  const roleMenuRef = useRef(null)
  const [isListeningVoice, setIsListeningVoice] = useState(false)

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      severity: 'CRITICAL',
      title: 'Flash Flood Warning - Wayanad Sector',
      time: '2 mins ago',
      details: 'Hydro sensors indicate +1.8m water rise in Meenachil river basin. Evacuation advisory level 4 active.',
      read: false
    },
    {
      id: 2,
      severity: 'HIGH',
      title: 'Cyclone Alert Level 3 - Eastern Coast',
      time: '15 mins ago',
      details: 'Wind speeds accelerating to 95 km/h near Chennai perimeter. NDRF Battalion 4 deployed.',
      read: false
    },
    {
      id: 3,
      severity: 'WARNING',
      title: 'Bridge Structural Stress - Mumbai Suburb',
      time: '42 mins ago',
      details: 'Detection Agent flagged 12% alignment shift in Western Highway Overpass.',
      read: false
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) {
        setShowThemeDropdown(false)
      }
      if (alertDrawerRef.current && !alertDrawerRef.current.contains(e.target)) {
        setShowAlertsDrawer(false)
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setShowRoleDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadAlertsCount = alerts.filter(a => !a.read).length

  const markAllAlertsAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })))
  }

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id))
  }

  const currentThemeObj = themes.find(t => t.id === theme)

  return (
    <header className={`
      h-16 bg-[var(--bg-header)] border-b border-[var(--border-subtle)] backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30
      transition-all duration-300 ease-in-out select-none
      ${sidebarOpen ? 'ml-64' : 'ml-0'}
    `}>
      {/* LEFT SECTION: Sidebar Toggle + TOP-LEFT ALERT ICON + Page Title */}
      <div className="flex items-center space-x-3">
        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          title={sidebarOpen ? "Close Sidebar (Ctrl+B)" : "Open Sidebar (Ctrl+B)"}
          className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-main)] hover:border-blue-500/50 hover:bg-[var(--accent-light)] transition-all flex items-center justify-center cursor-pointer shadow-sm"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--accent-primary)]" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-blue-600 animate-pulse" />
          )}
        </button>

        {/* TOP-LEFT ALERT ICON BUTTON */}
        <div className="relative" ref={alertDrawerRef}>
          <button
            onClick={() => setShowAlertsDrawer(!showAlertsDrawer)}
            title="Emergency System Alerts"
            className={`
              relative p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer shadow-sm
              ${unreadAlertsCount > 0 
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 hover:bg-amber-500/20' 
                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }
            `}
          >
            <AlertTriangle className={`w-4 h-4 ${unreadAlertsCount > 0 ? 'animate-bounce text-amber-600' : ''}`} />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[9px] font-bold font-mono bg-rose-600 text-white rounded-full border border-white shadow-md animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* EMERGENCY ALERTS CENTER POPOVER DRAWER */}
          {showAlertsDrawer && (
            <div className="absolute top-12 left-0 w-80 md:w-96 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <h3 className="text-xs font-bold font-mono text-[var(--text-main)] uppercase tracking-wider">
                    Emergency Alert Center
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  {unreadAlertsCount > 0 && (
                    <button
                      onClick={markAllAlertsAsRead}
                      className="text-[10px] text-blue-600 hover:underline font-mono font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowAlertsDrawer(false)}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface-elevated)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Alert Items List */}
              <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[var(--text-muted)] font-mono">
                    No active emergency warnings
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`
                        p-3 rounded-xl border text-xs transition-all space-y-1.5 relative group
                        ${alert.severity === 'CRITICAL' 
                          ? 'bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-200' 
                          : alert.severity === 'HIGH'
                          ? 'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200'
                          : 'bg-blue-50 border-blue-200 text-blue-950 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200'
                        }
                        ${!alert.read ? 'ring-1 ring-amber-400' : 'opacity-85'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`
                          px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase
                          ${alert.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : alert.severity === 'HIGH' ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'}
                        `}>
                          {alert.severity}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">{alert.time}</span>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="text-[var(--text-muted)] hover:text-rose-600"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-xs leading-tight">{alert.title}</h4>
                      <p className="text-[11px] opacity-90 leading-relaxed font-sans">{alert.details}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-1 bg-blue-600 rounded-full"></div>
        <h2 className="text-xs md:text-sm font-bold tracking-wide text-[var(--text-main)] uppercase font-mono truncate">
          {title}
        </h2>
      </div>

      {/* RIGHT SECTION: PROMINENT THEME SWITCHER BUTTON + Satellite Mesh Toggle + Voice Mic + RBAC Badge */}
      <div className="flex items-center space-x-3 text-xs font-mono">
        
        {/* GOVERNMENT RBAC ROLE BADGE SELECTOR */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border bg-purple-950/60 border-purple-500/50 text-purple-300 font-sans text-xs font-bold hover:border-purple-400 cursor-pointer shadow-sm"
            title="Switch Security Role & Clearance Level"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono text-[11px] uppercase">
              {currentRole?.badge || '👑 COLLECTOR'}
            </span>
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 top-11 w-64 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-2 z-50 font-sans animate-in fade-in duration-150">
              <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase text-[var(--text-muted)]">
                Select Operational Role
              </div>
              <div className="space-y-1 mt-1">
                {Object.values(ROLES).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRole(r.id);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl border transition-all text-xs font-mono flex flex-col ${
                      currentRole?.id === r.id
                        ? 'bg-purple-950/80 border-purple-500 text-purple-300'
                        : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <span className="font-bold text-slate-100">{r.badge}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* AUTONOMOUS BACKGROUND AGENT MONITOR BUTTON */}
        <div className="relative">
          <button
            onClick={() => {
              const nextState = !isAutonomousActive
              setIsAutonomousActive(nextState)
              setAutonomousToast(nextState ? '🤖 Autonomous Monitor ACTIVATED' : '⏹️ Autonomous Monitor STOPPED')
              setTimeout(() => setAutonomousToast(''), 3500)
              // Endpoints removed — UI-only demo toggle
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-sans text-xs font-bold ${
              isAutonomousActive 
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:border-rose-800'
            }`}
            title="Toggle Autonomous Event Monitoring & Self-Triggering Loop"
          >
            <Zap className={`w-3.5 h-3.5 ${isAutonomousActive ? 'text-rose-400 animate-spin' : 'text-slate-500'}`} />
            <span className="font-mono text-[11px] uppercase">
              {isAutonomousActive ? '🤖 AUTONOMOUS ACTIVE' : '🤖 START AUTONOMOUS'}
            </span>
          </button>

          {/* Toast Notification */}
          {autonomousToast && (
            <div className="absolute top-12 right-0 z-50 whitespace-nowrap px-3 py-2 rounded-xl border text-[11px] font-mono font-bold shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 bg-slate-900 border-rose-500/60 text-rose-300">
              {autonomousToast}
            </div>
          )}
        </div>

        {/* VOICE COMMAND CONTROLLER MIC BUTTON */}
        <button
          onClick={() => {
            if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
              alert('Web Speech Recognition API is not supported in this browser window.');
              return;
            }
            if (isListeningVoice) {
              stopVoiceListening();
              setIsListeningVoice(false);
            } else {
              initVoiceRecognition((cmd, text) => {
                setVoiceLog(`Command: "${text}"`);
                setTimeout(() => setVoiceLog(''), 4000);
                if (cmd.type === 'NAVIGATE') navigate(cmd.payload);
              });
              startVoiceListening();
              setIsListeningVoice(true);
            }
          }}
          title="Toggle Voice Command Controller (English/Hindi)"
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-sans text-xs font-bold ${
            isListeningVoice
              ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse'
              : 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:border-purple-500'
          }`}
        >
          <span className="text-sm">{isListeningVoice ? '🔴' : '🎙️'}</span>
          <span className="font-mono text-[11px] uppercase">
            {isListeningVoice ? 'LISTENING...' : 'VOICE COMMAND'}
          </span>
        </button>

        {/* SATELLITE MESH OFFLINE MODE TOGGLE BUTTON */}
        <button
          onClick={toggleMeshMode}
          title={meshMode ? "Switch to Cloud Online Mode" : "Switch to Satellite Mesh Offline Mode"}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-sans text-xs font-bold ${
            meshMode
              ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:border-emerald-500'
          }`}
        >
          <Radio className={`w-4 h-4 ${meshMode ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
          <span className="font-mono text-[11px] uppercase">
            {meshMode ? '🛰️ MESH MODE (OFFLINE)' : '🟢 ONLINE CLOUD'}
          </span>
        </button>

        {/* PROMINENT THEME SWITCHER SELECTOR */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 hover:border-blue-500 shadow-sm transition-all cursor-pointer font-sans text-xs font-bold"
            title="Switch UI Theme"
          >
            <Palette className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="flex items-center space-x-1">
              <span>{currentThemeObj?.icon}</span>
              <span className="hidden sm:inline font-mono text-[11px]">{currentThemeObj?.name}</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
          </button>

          {showThemeDropdown && (
            <div className="absolute right-0 top-11 w-64 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-2 z-50 font-sans animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] tracking-wider">
                Select Theme / Visual Style
              </div>
              <div className="space-y-1 mt-1">
                {themes.map((t) => {
                  const isActive = theme === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id)
                        setShowThemeDropdown(false)
                      }}
                      className={`
                        w-full flex items-start space-x-3 p-2.5 rounded-xl text-left transition-all cursor-pointer border
                        ${isActive 
                          ? 'bg-[var(--accent-light)] border-[var(--accent-border)] text-[var(--text-main)] shadow-sm' 
                          : 'bg-transparent border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-main)]'
                        }
                      `}
                    >
                      <span className="text-lg">{t.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{t.name}</span>
                          {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 leading-tight mt-0.5">
                          {t.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Live Clock */}
        <div className="hidden xs:block bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-lg text-[var(--text-main)] font-bold font-mono shadow-sm">
          {time}
        </div>
      </div>
    </header>
  )
}
