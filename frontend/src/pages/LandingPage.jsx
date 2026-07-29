import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CloudRain, 
  Eye, 
  TrendingUp, 
  Navigation, 
  Boxes, 
  Radio, 
  ShieldAlert, 
  Zap, 
  Cpu, 
  ChevronRight,
  Activity,
  Volume2,
  VolumeX,
  Globe,
  RadioTower,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import CinematicCanvas from '../components/CinematicCanvas'
import { spaceAudio } from '../utils/SpaceAudio'

export default function LandingPage() {
  const [isMuted, setIsMuted] = useState(false)
  const [replayKey, setReplayKey] = useState(0)

  const agents = [
    {
      id: 1,
      name: 'Weather Agent',
      icon: CloudRain,
      color: 'from-blue-500 to-cyan-400',
      borderColor: 'border-blue-500/40',
      shadowColor: 'shadow-blue-500/20',
      description: 'Real-time meteorological risk telemetry, rainfall gauge analysis, and flood threat forecasting.',
      endpoint: '/api/v1/agent/weather',
      route: '/weather'
    },
    {
      id: 2,
      name: 'Detection Agent',
      icon: Eye,
      color: 'from-cyan-500 to-emerald-400',
      borderColor: 'border-cyan-500/40',
      shadowColor: 'shadow-cyan-500/20',
      description: 'Computer vision analysis on drone feeds to estimate victim counts, flood perimeter, and structural damage.',
      endpoint: '/api/v1/agent/detection',
      route: '/detection'
    },
    {
      id: 3,
      name: 'Prediction Agent',
      icon: TrendingUp,
      color: 'from-amber-500 to-rose-400',
      borderColor: 'border-amber-500/40',
      shadowColor: 'shadow-amber-500/20',
      description: 'Predictive hydro-dynamics projecting water level surges, road impassability, and evacuation urgency.',
      endpoint: '/api/v1/agent/prediction',
      route: '/prediction'
    },
    {
      id: 4,
      name: 'Route Agent',
      icon: Navigation,
      color: 'from-emerald-500 to-teal-400',
      borderColor: 'border-emerald-500/40',
      shadowColor: 'shadow-emerald-500/20',
      description: 'Tactical routing algorithms for NDRF & Fire units identifying obstacle-free transit corridors.',
      endpoint: '/api/v1/agent/route',
      route: '/route'
    },
    {
      id: 5,
      name: 'Resource Agent',
      icon: Boxes,
      color: 'from-purple-500 to-indigo-400',
      borderColor: 'border-purple-500/40',
      shadowColor: 'shadow-purple-500/20',
      description: 'Automated logistics optimizer assigning shelters, bed capacity, medical kits, boats, and fuel.',
      endpoint: '/api/v1/agent/resource',
      route: '/resource'
    },
    {
      id: 6,
      name: 'Communication Agent',
      icon: Radio,
      color: 'from-rose-500 to-purple-400',
      borderColor: 'border-rose-500/40',
      shadowColor: 'shadow-rose-500/20',
      description: 'Automated dispatch matrix generating SMS alerts, executive briefs, broadcast notices, and authority reports.',
      endpoint: '/api/v1/agent/communication',
      route: '/communication'
    }
  ]

  // Trigger space audio on home page
  useEffect(() => {
    spaceAudio.startCinematicAudio();
  }, [replayKey]);

  const handleToggleMute = () => {
    const muted = spaceAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleResetOrbit = () => {
    setReplayKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#030611] text-slate-100 relative overflow-x-hidden font-sans select-none pb-20">
      {/* 3D Full Screen Dark Earth Canvas moving continuously */}
      <CinematicCanvas isReplaying={replayKey > 0} />

      {/* Subtle Semitransparent Glass Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#030611]/40 via-[#050c1e]/50 to-[#030611]/80 z-10 pointer-events-none"></div>

      {/* Ambient Neon Blobs */}
      <div className="fixed top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none animate-pulse-slow z-10"></div>
      <div className="fixed bottom-1/4 right-1/4 w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none z-10"></div>

      {/* Top HUD Controls Header */}
      <header className="relative z-30 max-w-7xl mx-auto px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/40 rounded-xl text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-200 uppercase block">
              AI DISASTER RESPONSE COMMAND CENTER
            </span>
            <span className="text-[10px] font-mono text-cyan-400 tracking-wider">
              3D EARTH GRID: ACTIVE & ROTATING
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          {/* Audio Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-pointer shadow-md backdrop-blur-md"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />}
            <span>{isMuted ? 'SOUND: OFF' : 'SOUND: ON'}</span>
          </button>

          {/* Reset Orbit View */}
          <button
            onClick={handleResetOrbit}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-pointer shadow-md backdrop-blur-md"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>RESET ORBIT</span>
          </button>
        </div>
      </header>

      {/* Main Glassmorphic Hero Section */}
      <main className="relative z-20 max-w-7xl mx-auto px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 text-xs font-mono mb-6 shadow-[0_0_20px_rgba(6,182,212,0.25)] backdrop-blur-md">
            <RadioTower className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>GLOBAL INTELLIGENCE & SATELLITE DISASTER COORDINATION</span>
          </div>

          {/* Large Hero Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-cyan-200 to-purple-400">
              AI Disaster Response
            </span>
            <br />
            <span className="text-cyan-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]">
              Command Center
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-md">
            Real-time intelligence. Predictive analytics. Global emergency coordination.
          </p>

          {/* Primary CTA Buttons with glowing hover effects */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <Link
              to="/dashboard"
              onClick={() => spaceAudio.playHudBeep()}
              className="group flex items-center space-x-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-base shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_45px_rgba(6,182,212,0.8)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <Activity className="w-5 h-5 text-slate-950" />
              <span>Launch Dashboard</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/dashboard"
              onClick={() => spaceAudio.playHudBeep()}
              className="flex items-center space-x-3 px-8 py-4 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-cyan-300 font-bold text-base hover:bg-cyan-950/50 hover:border-cyan-400 shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <Globe className="w-5 h-5 text-cyan-400" />
              <span>View Live Map</span>
            </Link>

            <Link
              to="/commander"
              onClick={() => spaceAudio.playHudBeep()}
              className="flex items-center space-x-3 px-8 py-4 rounded-xl bg-purple-950/60 border border-purple-500/50 text-purple-200 font-bold text-base hover:bg-purple-900/60 hover:border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)] backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <Cpu className="w-5 h-5 text-purple-400" />
              <span>Commander Agent</span>
            </Link>
          </div>
        </motion.div>

        {/* 6 Modular Autonomous Agent Matrix Section */}
        <section className="mt-20">
          <div className="flex items-center justify-between mb-8 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>Autonomous Agent Matrix</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                6 specialized AI micro-engines monitoring satellite telemetry, aerial CV feeds, and tactical routing.
              </p>
            </div>
            <span className="text-xs font-mono px-3.5 py-1.5 bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 rounded-lg shadow-[0_0_12px_rgba(6,182,212,0.2)] backdrop-blur-md">
              6 ACTIVE ENGINES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, index) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className={`
                    glass-panel rounded-2xl p-6 border ${agent.borderColor} 
                    bg-slate-950/60 backdrop-blur-xl hover:${agent.shadowColor} 
                    hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group
                  `}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${agent.color} text-slate-950 font-bold shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 rounded-md">
                        AGENT 0{agent.id}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                      {agent.name}
                    </h3>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed font-light">
                      {agent.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">{agent.endpoint}</span>
                    <Link
                      to={agent.route}
                      onClick={() => spaceAudio.playHudBeep()}
                      className="inline-flex items-center text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Open Agent <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
