import React, { useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import { SidebarProvider } from './context/SidebarContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import WeatherAgentPage from './pages/WeatherAgentPage'
import DetectionAgentPage from './pages/DetectionAgentPage'
import PredictionAgentPage from './pages/PredictionAgentPage'
import RouteAgentPage from './pages/RouteAgentPage'
import ResourceAgentPage from './pages/ResourceAgentPage'
import CommunicationAgentPage from './pages/CommunicationAgentPage'
import CommanderPage from './pages/CommanderPage'
import HistoryPage from './pages/HistoryPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import AIAssistantWidget from './components/AIAssistantWidget'
import TacticalTicker from './components/TacticalTicker'

import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:8000'

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';

  // Redirect to Landing Page ('/') ONLY when browser refresh (F5 / Cmd+R) occurs
  useEffect(() => {
    const isRefresh = sessionStorage.getItem('is_browser_refresh') === 'true';

    if (isRefresh) {
      sessionStorage.removeItem('is_browser_refresh');
      if (window.location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }

    const handleBeforeUnload = () => {
      sessionStorage.setItem('is_browser_refresh', 'true');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] flex font-sans relative overflow-x-hidden transition-colors duration-300 pb-8">
            {!isLandingPage && <Sidebar />}
            <div className="flex-1 w-full min-w-0">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/weather" element={<WeatherAgentPage />} />
                <Route path="/detection" element={<DetectionAgentPage />} />
                <Route path="/prediction" element={<PredictionAgentPage />} />
                <Route path="/route" element={<RouteAgentPage />} />
                <Route path="/resource" element={<ResourceAgentPage />} />
                <Route path="/communication" element={<CommunicationAgentPage />} />
                <Route path="/commander" element={<CommanderPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </div>
            <AIAssistantWidget />
            {!isLandingPage && <TacticalTicker />}
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
