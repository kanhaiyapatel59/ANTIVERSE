import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const ROLES = {
  COLLECTOR: {
    id: 'COLLECTOR',
    title: 'District Collector / Master Commander',
    badge: '👑 COLLECTOR',
    color: 'bg-purple-950 text-purple-300 border-purple-500',
    desc: 'Full administrative authority over multi-agent orchestration, PDF dispatch, and tactical deployment.'
  },
  CAPTAIN: {
    id: 'CAPTAIN',
    title: 'Field NDRF Battalion Captain',
    badge: '🪖 NDRF CAPTAIN',
    color: 'bg-emerald-950 text-emerald-300 border-emerald-500',
    desc: 'Field tactical navigation, QR SOS civilian ticketing, and rescue boat deployment.'
  },
  PRO: {
    id: 'PRO',
    title: 'Public Relations & Media Officer',
    badge: '📢 PRO OFFICER',
    color: 'bg-rose-950 text-rose-300 border-rose-500',
    desc: 'Public warning broadcasts, multi-channel SMS/WhatsApp alerts, and regional Hindi broadcasts.'
  }
};

export function AuthProvider({ children }) {
  const [role, setRoleState] = useState(() => {
    const saved = localStorage.getItem('user_role');
    return saved && ROLES[saved] ? ROLES[saved] : ROLES.COLLECTOR;
  });

  const setRole = (roleId) => {
    if (ROLES[roleId]) {
      setRoleState(ROLES[roleId]);
      localStorage.setItem('user_role', roleId);
    }
  };

  return (
    <AuthContext.Provider value={{ role, setRole, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
