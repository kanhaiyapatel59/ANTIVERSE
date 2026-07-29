import React, { useState } from 'react'
import Header from '../components/Header'
import { motion } from 'framer-motion'
import { useSidebar } from '../context/SidebarContext'
import { 
  Radio, 
  MessageSquare, 
  Mail, 
  Megaphone, 
  FileText, 
  Building2, 
  Send, 
  Terminal, 
  Code, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles,
  AlertTriangle,
  Copy
} from 'lucide-react'
import axios from 'axios'

import { playEmergencySiren, speakAlertText, stopAllAudio } from '../utils/audioSynthesizer'
import { exportCAPXmlFile } from '../utils/capExporter'

export default function CommunicationAgentPage() {
  const { sidebarOpen } = useSidebar()
  const [location, setLocation] = useState('Mumbai Sector 4')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [channelTab, setChannelTab] = useState('sms') // 'sms' | 'email' | 'broadcast' | 'authority' | 'report' | 'hindi' | 'pa' | 'cap' | 'schema'
  const [targetWhatsappGroup, setTargetWhatsappGroup] = useState('NDRF')
  const [copied, setCopied] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const handlePlayLiveBroadcast = (textToSpeak, isHindi = false) => {
    if (isPlayingAudio) {
      stopAllAudio()
      setIsPlayingAudio(false)
    } else {
      setIsPlayingAudio(true)
      playEmergencySiren(2500)
      setTimeout(() => {
        speakAlertText(textToSpeak, { lang: isHindi ? 'hi-IN' : 'en-US' })
      }, 2600)
    }
  }

  const handleWhatsAppShare = (text) => {
    const waMsg = `🚨 *GROUP: NDRF EMERGENCY DISPATCH FORCE* 🚨\n\n${text || 'NDRF Emergency Dispatch Active'}\n\n📍 Target Sector: ${location}\n⚠️ Status: CRITICAL DISPATCH ACTIVE\n[Sent via NDRF AI Disaster Command Center]`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`
    window.open(url, '_blank')
  }

  const handleEmailShare = (emailText) => {
    const targetEmail = 'patelkanhaiya916@gmail.com'
    const mailSubject = `🚨 NDRF EMERGENCY DISPATCH BRIEFING: ${location.toUpperCase()} [CRITICAL]`
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(emailText || '')}`
    window.open(gmailUrl, '_blank')
  }

  const handleTelegramShare = (text) => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  // Combined Upstream Outputs from Agents 1 to 5
  const mockUpstreamData = {
    location: 'Mumbai Sector 4',
    weather: {
      city: 'Mumbai',
      temperature: 27.5,
      rainfall: '142mm/hr Heavy Cloudburst',
      flood_risk: 'EXTREME',
      weather_forecast: 'Continuous torrential precipitation active.'
    },
    detection: {
      people_detected: 14,
      flood_percentage: 82.5,
      severity: 'CRITICAL',
      building_damage: 'SEVERE',
      location_summary: '14 victims stranded on residential rooftops in Sector 4.',
      confidence: 0.94
    },
    prediction: {
      water_rise_estimate: '+3.4 meters in 3 hours',
      road_accessibility: 'BLOCKED',
      urgency: 'IMMEDIATE_EVACUATION',
      recommended_action: 'Execute immediate airborne & amphibious evacuation.'
    },
    route: {
      best_rescue_team: 'NDRF Battalion 8 - Alpha Rapid Force',
      best_route: 'Highway 44 Bypass -> High-Ground Sector 4 Assembly',
      eta: '17 mins (Safe Corridor)'
    },
    resource: {
      nearest_shelter: 'St. Xavier Emergency Relief Camp - Sector 4',
      beds_available: 28,
      food_rations: '70 MRE Emergency Rations Allocated',
      medicine_kits: '21 Trauma & IV First-Aid Kits Deployed',
      fuel_liters: '490 Liters Diesel Fuel',
      rescue_boats: 3
    }
  }

  const [upstreamData, setUpstreamData] = useState(mockUpstreamData)

  React.useEffect(() => {
    try {
      const savedLoc = localStorage.getItem('latest_location')
      const savedWea = localStorage.getItem('latest_weather')
      const savedDet = localStorage.getItem('latest_detection')
      const savedPred = localStorage.getItem('latest_prediction')
      const savedRoute = localStorage.getItem('latest_route')
      const savedRes = localStorage.getItem('latest_resource')

      if (savedLoc || savedDet) {
        const customData = {
          location: savedLoc || location,
          weather: savedWea ? JSON.parse(savedWea) : mockUpstreamData.weather,
          detection: savedDet ? JSON.parse(savedDet) : mockUpstreamData.detection,
          prediction: savedPred ? JSON.parse(savedPred) : mockUpstreamData.prediction,
          route: savedRoute ? JSON.parse(savedRoute) : mockUpstreamData.route,
          resource: savedRes ? JSON.parse(savedRes) : mockUpstreamData.resource
        }
        if (savedLoc) setLocation(savedLoc)
        setUpstreamData(customData)
        // DO NOT auto-trigger popup on page load. Only dispatch when user clicks "Synthesize & Dispatch All Channels"
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleRunCommunication = async (payloadData = upstreamData) => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.post('/api/v1/agent/communication', {
        location: payloadData.location || location,
        weather: payloadData.weather,
        detection: payloadData.detection,
        prediction: payloadData.prediction,
        route: payloadData.route,
        resource: payloadData.resource
      })
      setResult(response.data)

      const locName = payloadData.location || location
      const waMsg = `🚨 *GROUP: ${(targetWhatsappGroup || 'NDRF').toUpperCase()} DISPATCH FORCE* 🚨\n\n${response.data.whatsapp_alert || response.data.sms_alert}\n\n📍 Target Sector: ${locName}\n⚠️ Status: CRITICAL DISPATCH ACTIVE\n[Sent via NDRF AI Disaster Command Center]`
      
      // DISPATCH 1: Call Backend WhatsApp Automated Dispatcher Endpoint
      try {
        await axios.post('/api/v1/whatsapp/auto-send', {
          group_name: targetWhatsappGroup || 'NDRF',
          message: response.data.whatsapp_alert || response.data.sms_alert
        })
      } catch (e) {
        console.warn('Backend WhatsApp auto-send endpoint notice:', e)
      }

      // DISPATCH 2: Launch WhatsApp Web with pre-loaded message
      setTimeout(() => {
        let targetUrl = `https://wa.me/?text=${encodeURIComponent(waMsg)}`
        if (targetWhatsappGroup.startsWith('http')) {
          targetUrl = targetWhatsappGroup
        } else if (targetWhatsappGroup.startsWith('+') || /^\d+$/.test(targetWhatsappGroup)) {
          const cleanNum = targetWhatsappGroup.replace(/[^\d]/g, '')
          targetUrl = `https://wa.me/${cleanNum}?text=${encodeURIComponent(waMsg)}`
        }
        window.open(targetUrl, '_blank')
      }, 300)

      // DISPATCH 3: Launch Gmail Web Composer to patelkanhaiya916@gmail.com
      setTimeout(() => {
        const targetEmail = response.data.target_email || 'patelkanhaiya916@gmail.com'
        const mailSubject = `🚨 NDRF EMERGENCY DISPATCH BRIEFING: ${locName.toUpperCase()} [CRITICAL]`
        const mailBody = response.data.email_alert || response.data.incident_report
        
        // Open Gmail composer directly for patelkanhaiya916@gmail.com
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`
        window.open(gmailUrl, '_blank')
      }, 1000)

    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to connect to Communication Agent API')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 bg-hud-grid pb-12">
      <Header title="Agent 6: Multi-Channel Emergency Dispatch Engine" />

      <main className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6 max-w-7xl mx-auto space-y-6`}>
        {/* Agent Metadata Header */}
        <div className="glass-panel p-6 rounded-xl border border-rose-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-100 tracking-wide font-mono uppercase">
                  Communication Dispatch Agent
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-rose-950 text-rose-400 border border-rose-800 rounded">
                  AGENT 06
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Single Responsibility: Synthesizes telemetry from Agents 1–5 to generate targeted SMS, Email, Public Broadcasts, and Executive Reports.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 font-mono text-xs">
            <span className="text-slate-500">ENDPOINT:</span>
            <span className="text-cyan-400 font-bold">POST /api/v1/agent/communication</span>
          </div>
        </div>

        {/* Console Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Aggregated Agent Telemetry Matrix (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Multi-Agent Upstream Telemetry</span>
                <Sparkles className="w-4 h-4 text-rose-400" />
              </h2>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-mono">Incident Target Sector:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Target location..."
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-500 rounded-lg px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                />
              </div>

              {/* Upstream Agent Status Grid */}
              <div className="space-y-2 pt-1 font-mono text-xs">
                <span className="text-slate-400 block text-[11px]">Consuming Outputs From:</span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-blue-400">Agent 01 (Weather):</span>
                    <span className="text-slate-300">142mm/hr (EXTREME)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-cyan-400">Agent 02 (Detection):</span>
                    <span className="text-slate-300">14 Victims (CRITICAL)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-amber-400">Agent 03 (Prediction):</span>
                    <span className="text-slate-300">+3.4m Rise (BLOCKED)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-emerald-400">Agent 04 (Route):</span>
                    <span className="text-slate-300">NDRF Alpha (17m ETA)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-purple-400">Agent 05 (Resource):</span>
                    <span className="text-slate-300">St. Xavier Camp (3 Boats)</span>
                  </div>
                </div>
              </div>

              {/* Target Channels Config Inputs */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-mono text-slate-400">
                      Target WhatsApp Group Name / Invite Link:
                    </label>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold">⚡ 0-CLICK AUTO DISPATCH</span>
                  </div>
                  <input
                    type="text"
                    value={targetWhatsappGroup}
                    onChange={(e) => setTargetWhatsappGroup(e.target.value)}
                    placeholder="NDRF (or paste Group Invite Link e.g. https://chat.whatsapp.com/...)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    💡 Paste your <strong>NDRF Group Invite Link</strong> (e.g. <code>https://chat.whatsapp.com/...</code>) to enable 0-click direct group delivery!
                  </p>
                </div>
              </div>

              {/* Dispatch Action Button */}
              <button
                onClick={handleRunCommunication}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-rose-200" />
                    <span>Synthesizing Multi-Channel Messages...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Synthesize & Dispatch All Channels</span>
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

          {/* Right Column: Multi-Channel Output Consoles (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Multi-Channel Format Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto">
              <div className="flex space-x-1.5">
                <button
                  onClick={() => setChannelTab('sms')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                    channelTab === 'sms'
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>SMS Alert</span>
                </button>

                <button
                  onClick={() => setChannelTab('email')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                    channelTab === 'email'
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>NDRF Email</span>
                </button>

                <button
                  onClick={() => setChannelTab('broadcast')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                    channelTab === 'broadcast'
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Broadcast</span>
                </button>

                <button
                  onClick={() => setChannelTab('hindi')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                    channelTab === 'hindi'
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🇮🇳 Hindi Alert</span>
                </button>

                <button
                  onClick={() => setChannelTab('pa')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                    channelTab === 'pa'
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🔊 Ground PA</span>
                </button>

                <button
                  onClick={() => setChannelTab('cap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                    channelTab === 'cap'
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>📜 CAP Standard</span>
                </button>

                <button
                  onClick={() => setChannelTab('authority')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                    channelTab === 'authority'
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Authority Briefing</span>
                </button>

                <button
                  onClick={() => setChannelTab('report')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                    channelTab === 'report'
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Master Report</span>
                </button>

                <button
                  onClick={() => setChannelTab('schema')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                    channelTab === 'schema'
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Schema</span>
                </button>
              </div>

              {result && (
                <div className="flex items-center space-x-2">
                  {/* LIVE SIREN + VOICE BROADCAST BUTTON */}
                  <button
                    onClick={() => handlePlayLiveBroadcast(result.pa_audio_script || result.emergency_broadcast)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs flex items-center space-x-1.5 transition-all shadow-md ${
                      isPlayingAudio
                        ? 'bg-rose-900 text-rose-200 border border-rose-500 animate-pulse'
                        : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold'
                    }`}
                  >
                    <span>{isPlayingAudio ? '⏹ Stop Siren & Audio' : '▶ Play Live Siren & PA Audio'}</span>
                  </button>

                  {/* WHATSAPP SHARE */}
                  <button
                    onClick={() => handleWhatsAppShare(result.sms_alert || result.emergency_broadcast)}
                    className="px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-mono transition-all font-bold"
                    title="Dispatch via WhatsApp (NDRF Group)"
                  >
                    📲 WhatsApp (NDRF Group)
                  </button>

                  {/* DIRECT EMAIL SHARE */}
                  <button
                    onClick={() => handleEmailShare(result.email_alert || result.incident_report)}
                    className="px-2.5 py-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 rounded-lg text-xs font-mono transition-all font-bold"
                    title="Send Email to patelkanhaiya916@gmail.com"
                  >
                    ✉ Email (patelkanhaiya916@gmail.com)
                  </button>

                  {/* TELEGRAM SHARE */}
                  <button
                    onClick={() => handleTelegramShare(result.sms_alert || result.emergency_broadcast)}
                    className="px-2.5 py-1.5 bg-sky-950/80 hover:bg-sky-900 border border-sky-500/50 text-sky-300 rounded-lg text-xs font-mono transition-all"
                    title="Post to Telegram Channel"
                  >
                    📢 Telegram
                  </button>
                </div>
              )}
            </div>

            {/* TAB CONTENT AREAS */}
            <div className="space-y-6">
              {result && (
                <div className="glass-panel p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 flex items-center justify-between text-xs font-mono text-emerald-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                    <span>
                      AUTOMATIC DISPATCH COMPLETED: Sent to <strong>WhatsApp (NDRF Group)</strong> & <strong>Email (patelkanhaiya916@gmail.com)</strong>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-900/80 border border-emerald-500 text-[10px] text-emerald-200 font-bold">
                    DISPATCH VERIFIED
                  </span>
                </div>
              )}

              {!result && !loading && (
                <div className="glass-panel p-12 rounded-xl border border-slate-800 text-center space-y-3">
                  <Radio className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                  <h3 className="text-sm font-mono text-slate-400 uppercase">Ready for Multi-Channel Synthesis</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Click "Synthesize & Dispatch All Channels" to transform Agents 1–5 telemetries into targeted SMS, Email, Broadcast, and Executive Briefings.
                  </p>
                </div>
              )}

              {loading && (
                <div className="glass-panel p-12 rounded-xl border border-rose-500/30 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-rose-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                  </div>
                  <p className="text-xs font-mono text-rose-400 tracking-widest uppercase">
                    Generating Tailored SMS, Formal Email & Public Warning Broadcasts via Groq...
                  </p>
                </div>
              )}

              {result && !loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* SMS TAB */}
                  {channelTab === 'sms' && (
                    <div className="glass-panel p-6 rounded-xl border border-rose-500/30 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-rose-400" />
                          <h3 className="text-xs font-bold font-mono text-rose-300 uppercase">
                            Field Tactical Team SMS Alert (&lt; 160 chars)
                          </h3>
                        </div>
                        <button
                          onClick={() => copyToClipboard(result.sms_alert)}
                          className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-400 hover:border-cyan-500 flex items-center space-x-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copied ? 'COPIED!' : 'COPY SMS'}</span>
                        </button>
                      </div>

                      {/* Phone UI Frame */}
                      <div className="max-w-md mx-auto bg-slate-950 p-4 rounded-2xl border-2 border-slate-800 shadow-2xl font-sans text-xs space-y-2">
                        <div className="text-[10px] font-mono text-slate-500 flex justify-between border-b border-slate-900 pb-1">
                          <span>SATELLITE SMS GATEWAY</span>
                          <span>NDRF DISPATCH</span>
                        </div>
                        <div className="bg-rose-950/80 border border-rose-800 text-rose-100 p-3.5 rounded-xl font-mono text-xs leading-relaxed shadow-lg">
                          {result.sms_alert}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EMAIL TAB */}
                  {channelTab === 'email' && (
                    <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-cyan-400" />
                          <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase">
                            Formal Email Briefing for District Collector & NDRF HQ
                          </h3>
                        </div>
                        <button
                          onClick={() => copyToClipboard(result.email_alert)}
                          className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-400 hover:border-cyan-500 flex items-center space-x-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copied ? 'COPIED!' : 'COPY EMAIL'}</span>
                        </button>
                      </div>

                      <pre className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {result.email_alert}
                      </pre>
                    </div>
                  )}

                  {/* PUBLIC BROADCAST TAB */}
                  {channelTab === 'broadcast' && (
                    <div className="glass-panel p-6 rounded-xl border border-amber-500/40 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <Megaphone className="w-4 h-4 text-amber-400 animate-bounce" />
                          <h3 className="text-xs font-bold font-mono text-amber-300 uppercase">
                            Emergency Public Broadcast Notice (TV / Radio / Cell Alert)
                          </h3>
                        </div>
                        <button
                          onClick={() => copyToClipboard(result.emergency_broadcast)}
                          className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-400 hover:border-cyan-500 flex items-center space-x-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copied ? 'COPIED!' : 'COPY BROADCAST'}</span>
                        </button>
                      </div>

                      <div className="p-5 rounded-xl bg-amber-950/40 border border-amber-500/60 text-amber-200 font-mono text-sm leading-relaxed shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        {result.emergency_broadcast}
                      </div>
                    </div>
                  )}

                  {/* HINDI ALERT TAB */}
                  {channelTab === 'hindi' && (
                    <div className="glass-panel p-6 rounded-xl border border-rose-500/40 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-xs font-bold font-mono text-rose-300 uppercase">
                          🇮🇳 Regional Language Public Alert (Hindi Broadcast)
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePlayLiveBroadcast(result.hindi_alert || result.emergency_broadcast, true)}
                            className="text-[10px] font-mono px-2.5 py-1 rounded bg-rose-950 border border-rose-500 text-rose-300 hover:bg-rose-900"
                          >
                            ▶ Speak Hindi Audio
                          </button>
                          <button
                            onClick={() => copyToClipboard(result.hindi_alert)}
                            className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-400 hover:border-cyan-500"
                          >
                            COPY HINDI
                          </button>
                        </div>
                      </div>
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-sans text-base leading-relaxed">
                        {result.hindi_alert || result.emergency_broadcast}
                      </div>
                    </div>
                  )}

                  {/* PA AUDIO SCRIPT TAB */}
                  {channelTab === 'pa' && (
                    <div className="glass-panel p-6 rounded-xl border border-amber-500/40 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-xs font-bold font-mono text-amber-300 uppercase">
                          🔊 Loudspeaker Announcement Script for Ground Teams
                        </h3>
                        <button
                          onClick={() => handlePlayLiveBroadcast(result.pa_audio_script || result.emergency_broadcast)}
                          className="text-[10px] font-mono px-3 py-1 rounded bg-amber-950 border border-amber-500 text-amber-300 hover:bg-amber-900 font-bold"
                        >
                          ▶ Play Siren + PA Announcement
                        </button>
                      </div>
                      <div className="p-5 rounded-xl bg-amber-950/30 border border-amber-500/50 text-amber-200 font-mono text-xs leading-relaxed">
                        {result.pa_audio_script || result.emergency_broadcast}
                      </div>
                    </div>
                  )}

                  {/* CAP STANDARD JSON TAB */}
                  {channelTab === 'cap' && (
                    <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase">
                          📜 Common Alerting Protocol (CAP v1.2 Standard JSON)
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => exportCAPXmlFile(result.cap_json_payload)}
                            className="text-[10px] font-mono px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 hover:bg-cyan-900 font-bold"
                          >
                            📥 EXPORT CAP v1.2 XML
                          </button>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(result.cap_json_payload || {}, null, 2))}
                            className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-400 hover:border-cyan-500"
                          >
                            COPY CAP JSON
                          </button>
                        </div>
                      </div>
                      <pre className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs font-mono text-cyan-400 overflow-x-auto">
                        {JSON.stringify(result.cap_json_payload || {}, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* AUTHORITY BRIEFING TAB */}
                  {channelTab === 'authority' && (
                    <div className="glass-panel p-6 rounded-xl border border-purple-500/30 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-purple-400" />
                          <h3 className="text-xs font-bold font-mono text-purple-300 uppercase">
                            High-Level Control Room Executive Briefing
                          </h3>
                        </div>
                      </div>

                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-sans text-sm text-slate-200 leading-relaxed">
                        {result.authority_report}
                      </div>
                    </div>
                  )}

                  {/* MASTER INCIDENT REPORT TAB */}
                  {channelTab === 'report' && (
                    <div className="glass-panel p-6 rounded-xl border border-cyan-500/30 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase">
                            Master 6-Agent Comprehensive Response Plan
                          </h3>
                        </div>
                      </div>

                      <pre className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 whitespace-pre-wrap leading-relaxed">
                        {result.incident_report}
                      </pre>
                    </div>
                  )}

                  {/* SCHEMA TAB */}
                  {channelTab === 'schema' && (
                    <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
                      <h3 className="text-xs font-bold font-mono text-slate-300 uppercase">
                        Pydantic Schema Payload Inspection
                      </h3>
                      <div className="space-y-4 font-mono text-xs">
                        <div>
                          <span className="text-slate-400 block mb-1">Input Schema (CommunicationInput):</span>
                          <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-rose-400 overflow-x-auto">
                            {JSON.stringify({ location: location, weather: mockUpstreamData.weather, detection: mockUpstreamData.detection, prediction: mockUpstreamData.prediction, route: mockUpstreamData.route, resource: mockUpstreamData.resource }, null, 2)}
                          </pre>
                        </div>

                        <div>
                          <span className="text-slate-400 block mb-1">Output Schema (CommunicationOutput):</span>
                          <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-emerald-400 overflow-x-auto">
                            {result ? JSON.stringify(result, null, 2) : '// Execute dispatch to view output payload'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
