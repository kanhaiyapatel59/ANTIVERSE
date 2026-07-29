import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  CloudRain, 
  Eye, 
  TrendingUp, 
  Navigation, 
  Boxes, 
  Radio, 
  Cpu, 
  LayoutDashboard, 
  History, 
  FileText, 
  Settings, 
  ShieldAlert,
  Home,
  PanelLeftClose,
  Palette
} from 'lucide-react'
import { useSidebar } from '../context/SidebarContext'
import { useTheme } from '../context/ThemeContext'

export default function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { theme, setTheme, themes } = useTheme();

  const primaryNav = [
    { name: 'Overview Landing', path: '/', icon: Home },
    { name: 'Command Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Commander Agent', path: '/commander', icon: Cpu, highlight: true },
  ];

  const agentNav = [
    { name: 'Weather Agent', path: '/weather', icon: CloudRain, badge: 'Agent 1' },
    { name: 'Detection Agent', path: '/detection', icon: Eye, badge: 'Agent 2' },
    { name: 'Prediction Agent', path: '/prediction', icon: TrendingUp, badge: 'Agent 3' },
    { name: 'Route Agent', path: '/route', icon: Navigation, badge: 'Agent 4' },
    { name: 'Resource Agent', path: '/resource', icon: Boxes, badge: 'Agent 5' },
    { name: 'Communication Agent', path: '/communication', icon: Radio, badge: 'Agent 6' },
  ];

  const systemNav = [
    { name: 'Incident History', path: '/history', icon: History },
    { name: 'Executive Reports', path: '/reports', icon: FileText },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className={`
      w-64 h-screen bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col justify-between select-none fixed left-0 top-0 z-40
      transition-transform duration-300 ease-in-out shadow-xl text-[var(--text-main)]
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-4 space-y-5 overflow-y-auto">
        {/* Header Logo / Branding + Sidebar Close Toggle */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[var(--accent-light)] border border-[var(--accent-border)] rounded-xl text-blue-600 shadow-sm">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-wider uppercase text-[var(--text-main)] font-mono">
                AI Command Center
              </h1>
              <p className="text-[9px] font-mono text-blue-600 font-semibold tracking-widest uppercase">
                Multi-Agent System
              </p>
            </div>
          </div>
          
          {/* Close Sidebar Button */}
          <button
            onClick={toggleSidebar}
            title="Close Sidebar (Ctrl+B)"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-elevated)] border border-transparent transition-all cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* INTERACTIVE SIDEBAR THEME SWITCHER WIDGET */}
        <div className="p-2.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-[var(--text-muted)]">
            <span className="flex items-center space-x-1">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              <span>UI Theme Switcher</span>
            </span>
            <span className="text-[9px] text-blue-600 font-semibold capitalize">{theme}</span>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-0.5">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={`Switch to ${t.name}`}
                className={`
                  py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold flex flex-col items-center justify-center transition-all cursor-pointer border
                  ${theme === t.id 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-main)] hover:border-blue-400'
                  }
                `}
              >
                <span className="text-xs">{t.icon}</span>
                <span className="truncate max-w-full text-[9px] mt-0.5">{t.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Command Navigation */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-mono font-bold uppercase text-[var(--text-subtle)] tracking-widest">
            Core Operations
          </div>
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  relative flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200
                  ${isActive 
                    ? 'text-blue-700 dark:text-blue-400 bg-[var(--accent-light)] border border-[var(--accent-border)] shadow-sm' 
                    : item.highlight 
                      ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 hover:bg-purple-100'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-elevated)]'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : item.highlight ? 'text-purple-600' : 'text-[var(--text-muted)]'}`} />
                <span className="flex-1 font-medium">{item.name}</span>
                {item.highlight && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded font-bold">
                    Day 2
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Independent Agent Navigation */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-mono font-bold uppercase text-[var(--text-subtle)] tracking-widest flex justify-between items-center">
            <span>Specialized Agents</span>
            <span className="text-blue-600 text-[9px]">6 Active</span>
          </div>
          {agentNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200
                  ${isActive 
                    ? 'text-blue-700 dark:text-blue-400 bg-[var(--accent-light)] border border-[var(--accent-border)] shadow-sm' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-elevated)]'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-[var(--text-muted)]'}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-medium">
                  {item.badge}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* System Administration */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-mono font-bold uppercase text-[var(--text-subtle)] tracking-widest">
            Audit & System
          </div>
          {systemNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200
                  ${isActive 
                    ? 'text-blue-700 dark:text-blue-400 bg-[var(--accent-light)] border border-[var(--accent-border)] shadow-sm' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-elevated)]'
                  }
                `}
              >
                <Icon className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer Profile / Command Room Tag */}
      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs font-mono text-[var(--text-muted)] flex items-center justify-between">
        <span className="text-[10px]">AUTH: LEVEL_0</span>
        <span className="text-[10px] text-blue-600 font-bold">NDRF HQ</span>
      </div>
    </aside>
  )
}
