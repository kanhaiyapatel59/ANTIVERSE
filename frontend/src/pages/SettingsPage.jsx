import React from 'react'
import Header from '../components/Header'
import { useSidebar } from '../context/SidebarContext'
import { useTheme } from '../context/ThemeContext'
import { Palette, CheckCircle2, Sliders, ShieldCheck } from 'lucide-react'

export default function SettingsPage() {
  const { sidebarOpen } = useSidebar()
  const { theme, setTheme, themes } = useTheme()

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] transition-colors duration-300">
      <Header title="System Settings & Visual Theme" />
      <main className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6 max-w-5xl mx-auto space-y-6`}>
        
        {/* THEME PREFERENCES SECTION */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4 shadow-md">
          <div className="flex items-center space-x-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-800">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-main)] font-mono uppercase tracking-wide">
                User Interface Theme & Aesthetics
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Switch between professional cream & white, clean light, or refined dark mode styles.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {themes.map((t) => {
              const isActive = theme === t.id
              return (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`
                    p-5 rounded-2xl border cursor-pointer transition-all space-y-3 relative group
                    ${isActive 
                      ? 'bg-[var(--accent-light)] border-[var(--accent-border)] ring-2 ring-blue-500/50 shadow-md' 
                      : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] hover:border-blue-400/50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{t.icon}</span>
                    {isActive && (
                      <span className="flex items-center text-xs font-bold text-blue-600 font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-blue-200 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-blue-600" /> ACTIVE
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-main)]">{t.name}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{t.desc}</p>
                  </div>

                  {/* Theme Preview Box */}
                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                    <span>Canvas: {t.id === 'cream' ? '#FAF8F5' : t.id === 'light' ? '#F8FAFC' : '#090D16'}</span>
                    <span className="font-bold">Cards: White</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI MODEL CONFIGURATION */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4 shadow-md">
          <div className="flex items-center space-x-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-200 dark:border-purple-800">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-main)] font-mono uppercase tracking-wide">
                AI Model Provider Configuration
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Groq LPU Inference (Primary) and Gemini 1.5 Flash (Fallback) system parameters.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <p className="font-bold text-[var(--text-main)] font-mono">GROQ_API_KEY</p>
                <p className="text-[11px] text-[var(--text-muted)]">Ultra-fast LPU inference engine for autonomous agents</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold font-mono text-[10px] rounded-lg">
                CONFIGURED & ACTIVE
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <p className="font-bold text-[var(--text-main)] font-mono">GEMINI_API_KEY</p>
                <p className="text-[11px] text-[var(--text-muted)]">High-capacity multimodal fallback provider</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-bold font-mono text-[10px] rounded-lg">
                READY
              </span>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
